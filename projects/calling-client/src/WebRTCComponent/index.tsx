import React, { useEffect, useRef, useState } from "react";
import { Button, Input, message } from "antd";
import io from "socket.io-client";

const WebRTCComponent = () => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [room, setRoom] = useState("");
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io("http://localhost:3000");

    socketRef.current.on("user-joined", handleUserJoined);
    socketRef.current.on("offer", handleOffer);
    socketRef.current.on("answer", handleAnswer);
    socketRef.current.on("ice-candidate", handleIceCandidate);

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const handleUserJoined = async ({ id }) => {
    const offer = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offer);
    socketRef.current.emit("offer", { offer, room });
  };

  const handleOffer = async ({ offer, id }) => {
    peerConnectionRef.current.setRemoteDescription(
      new RTCSessionDescription(offer)
    );
    const answer = await peerConnectionRef.current.createAnswer();
    await peerConnectionRef.current.setLocalDescription(answer);
    socketRef.current.emit("answer", { answer, room });
  };

  const handleAnswer = ({ answer }) => {
    peerConnectionRef.current.setRemoteDescription(
      new RTCSessionDescription(answer)
    );
  };

  const handleIceCandidate = ({ candidate }) => {
    peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
  };

  const joinRoom = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      localVideoRef.current.srcObject = stream;

      peerConnectionRef.current = new RTCPeerConnection();

      stream.getTracks().forEach((track) => {
        peerConnectionRef.current.addTrack(track, stream);
      });

      peerConnectionRef.current.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        remoteVideoRef.current.srcObject = event.streams[0];
      };

      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit("ice-candidate", {
            candidate: event.candidate,
            room,
          });
        }
      };

      socketRef.current.emit("join", room);
    } catch (error) {
      message.error("Failed to access media devices");
    }
  };

  return (
    <div className="p-4">
      <Input
        placeholder="Enter room name"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
        className="mb-4"
      />
      <Button onClick={joinRoom} className="mb-4">
        Join Room
      </Button>
      <div className="flex">
        <video ref={localVideoRef} autoPlay muted className="w-1/2" />
        <video ref={remoteVideoRef} autoPlay className="w-1/2" />
      </div>
    </div>
  );
};

export default WebRTCComponent;
