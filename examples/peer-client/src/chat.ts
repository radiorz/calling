import "./style.css";
import Peer, { MediaConnection } from "peerjs";

export class VideoChat {
  private peer: Peer | null = null;
  private currentCall: MediaConnection | null = null;
  private localStream: MediaStream | null = null;

  // Web Audio API 相关
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private audioSource: MediaStreamAudioSourceNode | null = null;
  private audioDestination: MediaStreamAudioDestinationNode | null = null;

  private readonly localVideo: HTMLVideoElement;
  private readonly remoteVideo: HTMLVideoElement;
  private readonly remoteIdInput: HTMLInputElement;
  private readonly myIdSpan: HTMLSpanElement;
  private readonly startCallButton: HTMLButtonElement;
  private readonly endCallButton: HTMLButtonElement;
  private readonly toggleVideoButton: HTMLButtonElement;
  private readonly toggleAudioButton: HTMLButtonElement;
  private readonly volumeSlider: HTMLInputElement;
  private readonly volumeValue: HTMLInputElement;
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
    this.toggleVideoButton = document.getElementById(
      "toggle-video"
    ) as HTMLButtonElement;
    this.toggleAudioButton = document.getElementById(
      "toggle-audio"
    ) as HTMLButtonElement;
    this.volumeSlider = document.getElementById(
      "volume-control"
    ) as HTMLInputElement;
    this.volumeValue = document.getElementById(
      "volume-value"
    ) as HTMLInputElement;

    // 初始化音量控制
    this.volumeSlider.addEventListener("input", () => this.adjustVolume());
    this.toggleVideoButton.addEventListener("click", () => this.toggleVideo());
    this.toggleAudioButton.addEventListener("click", () => this.toggleAudio());
    // Initialize
    this.initAudioContext();
    this.initPeer();
    this.initStreamControls();
    // Cleanup on page unload
    window.addEventListener("beforeunload", () => {
      this.cleanup();
    });
  }
  private initAudioContext(): void {
    this.audioContext = new AudioContext();
    this.gainNode = this.audioContext.createGain();
    // 设置初始音量
    this.gainNode.gain.value = 1.0;
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

  public toggleVideo(): void {
    if (this.localStream) {
      const videoTracks = this.localStream.getVideoTracks();
      const currentState = videoTracks[0]?.enabled ?? false;

      videoTracks.forEach((track) => {
        track.enabled = !currentState;
      });

      this.updateControlButtons();
    }
  }
  private async initStreamControls() {
    // 初始化控制按钮状态
    this.updateControlButtons();
  }
  private updateControlButtons(): void {
    if (this.localStream) {
      const videoEnabled = this.localStream
        .getVideoTracks()
        .some((track) => track.enabled);
      const audioEnabled = this.localStream
        .getAudioTracks()
        .some((track) => track.enabled);

      this.toggleVideoButton.textContent = videoEnabled
        ? "关闭视频"
        : "开启视频";
      this.toggleAudioButton.textContent = audioEnabled
        ? "关闭音频"
        : "开启音频";
    }
  }
  public toggleAudio(): void {
    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks();
      const currentState = audioTracks[0]?.enabled ?? false;

      audioTracks.forEach((track) => {
        track.enabled = !currentState;
      });

      this.updateControlButtons();
    }
  }

  // 完全停止视频轨道
  public stopVideo(): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.stop(); // 完全停止摄像头
      });
    }
  }

  // 完全停止音频轨道
  public stopAudio(): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.stop(); // 完全停止麦克风
      });
    }
  }
  private async getLocalStream(): Promise<MediaStream> {
    if (!this.localStream) {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // 处理音频流
      if (this.audioContext && this.gainNode) {
        // 创建音频源
        this.audioSource = this.audioContext.createMediaStreamSource(stream);
        // 创建音频目标
        this.audioDestination =
          this.audioContext.createMediaStreamDestination();

        // 连接音频处理链
        this.audioSource.connect(this.gainNode);
        this.gainNode.connect(this.audioDestination);

        // 获取视频轨道
        const videoTrack = stream.getVideoTracks()[0];

        // 创建新的 MediaStream，包含处理后的音频和原始视频
        this.localStream = new MediaStream([
          videoTrack,
          ...this.audioDestination.stream.getAudioTracks(),
        ]);
      } else {
        this.localStream = stream;
      }
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
  private adjustVolume(): void {
    if (this.gainNode) {
      // 将滑块的值（0-100）转换为增益值（0.0-2.0）
      const volume = parseFloat(this.volumeSlider.value) / 50;
      this.gainNode.gain.value = volume;
      this.volumeValue.innerText = "" + volume;
    }
  }
  private cleanup(): void {
    if (this.audioSource) {
      this.audioSource.disconnect();
      this.audioSource = null;
    }

    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    if (this.currentCall) {
      this.currentCall.close();
      this.currentCall = null;
    }
    this.endCall();
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }
}

// Initialize the application
