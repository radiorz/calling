import "./style.css";
import Peer, { MediaConnection } from "peerjs";

export class VideoChat {
  private peer: Peer | null = null;
  private currentCall: MediaConnection | null = null;
  private localStream: MediaStream | null = null;

  private readonly localVideo: HTMLVideoElement;
  private readonly remoteVideo: HTMLVideoElement;
  private readonly remoteIdInput: HTMLInputElement;
  private readonly myIdSpan: HTMLSpanElement;
  private readonly startCallButton: HTMLButtonElement;
  private readonly endCallButton: HTMLButtonElement;

  constructor() {
    // DOM elements
    this.localVideo = document.getElementById(
      "local-video"
    ) as HTMLVideoElement;
    this.remoteVideo = document.getElementById(
      "remote-video"
    ) as HTMLVideoElement;
    this.remoteIdInput = document.getElementById(
      "remote-id"
    ) as HTMLInputElement;
    this.myIdSpan = document.getElementById("my-id") as HTMLSpanElement;
    this.startCallButton = document.getElementById(
      "start-call"
    ) as HTMLButtonElement;
    this.endCallButton = document.getElementById(
      "end-call"
    ) as HTMLButtonElement;

    // Event listeners
    this.startCallButton.addEventListener("click", () => this.startCall());
    this.endCallButton.addEventListener("click", () => this.endCall());

    // Initialize
    this.initPeer();

    // Cleanup on page unload
    window.addEventListener("beforeunload", () => {
      this.cleanup();
    });
  }

  private initPeer(): void {
    const randomId = Math.random().toString(36).substring(7);

    this.peer = new Peer(randomId, {
      host: "192.168.1.101",
      port: 9000,
      path: "/",
    });

    this.peer.on("open", (id: string) => {
      this.myIdSpan.textContent = id;
    });

    this.peer.on("call", async (call: MediaConnection) => {
      console.log(`call`, call);
      if (confirm("接收来电？")) {
        try {
          const stream = await this.getLocalStream();
          call.answer(stream);
          this.handleCall(call);
          this.currentCall = call;
        } catch (err) {
          console.error("获取媒体设备失败:", err);
          alert("无法访问摄像头或麦克风");
        }
      }
    });

    this.peer.on("error", (err: Error) => {
      console.error("Peer 错误:", err);
      alert("连接错误: " + err.message);
    });
  }

  private async getLocalStream(): Promise<MediaStream> {
    if (!this.localStream) {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      this.localVideo.srcObject = this.localStream;
    }
    return this.localStream;
  }

  private handleCall(call: MediaConnection): void {
    call.on("stream", (remoteStream: MediaStream) => {
      this.remoteVideo.srcObject = remoteStream;
    });

    call.on("close", () => {
      this.remoteVideo.srcObject = null;
    });
  }

  private async startCall(): Promise<void> {
    const remoteId = this.remoteIdInput.value;
    if (!remoteId || !this.peer) {
      alert("请输入对方ID");
      return;
    }

    try {
      const stream = await this.getLocalStream();
      const call = this.peer.call(remoteId, stream);
      this.handleCall(call);
      this.currentCall = call;
    } catch (err) {
      console.error("获取媒体设备失败:", err);
      alert("无法访问摄像头或麦克风");
    }
  }

  private endCall(): void {
    if (this.currentCall) {
      this.currentCall.close();
      this.currentCall = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    this.localVideo.srcObject = null;
    this.remoteVideo.srcObject = null;
  }

  private cleanup(): void {
    this.endCall();
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }
}

// Initialize the application
