import "./style.css";
import Peer, { MediaConnection } from "peerjs";
// 使用内置的音频数据 URL（这是一段简单的提示音）
const audioDataUrl = `data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1HOTgzLygnJSMiIiIiIyQlKi81PU1di5istLGknpeRjYuKiouMjY+Sl5yiqK62v8bM0tbZ2tjT0c7MysrLzM3P0dPV19na29vb2tjW1dPT0tLS0tPU1dbY2drc3d7f3+Dg4ODg4ODg4ODg4ODf39/e3t3d3Nza2djX1tXU1NPT0tLS0tPT1NXX2Nnb3N7f4eLk5ebm5ubl5OPi4eDf3t3c29ra2drb29ze3+Hi5OXn6Onq6+vr6urp6Ofm5eTj4uHg397d3Nzb29vc3d7f4OHj5OXm5+jp6erq6urp6ejn5uXk4+Lh4N/e3dzc29vb3N3e3+Dh4+Tl5ufn6Ojp6enp6Ofn5uXk4+Lh4N/e3dzc29vc3N3e3+Dh4uPk5ebn5+jo6Ojo6Ofn5ubl5OPi4eDf3t3c3Nzc3N3e3t/g4eLj5OXm5ufn5+fn5+fm5uXl5OPi4eHg397d3d3c3d3e3t/g4eLj4+Tl5ebm5ubm5ubl5eTk4+Pi4eHg397e3d3d3d7e3+Dg4eLj4+Tk5eXl5eXl5eTk5OPj4uLh4ODf3t7e3t7e3t/f4ODh4eLi4+Pk5OTk5OTk5OPj4+Li4eHg4N/f3t7e3t7e39/f4ODh4eHi4uPj4+Pj4+Pi4uLi4eHh4ODf39/e3t7e3t/f3+Dg4ODh4eHi4uLi4uLi4uLi4eHh4eHg4ODf39/f39/f3+Dg4ODg4eHh4eHh4eHh4eHh4eHh4eHg4ODg4ODf39/f39/g4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4N/f39/f3+Dg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODgAAA`;
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
  private readonly ringtone: HTMLAudioElement;
  private isRinging: boolean = false;
  // 定义可选的分辨率预设
  private readonly resolutions = {
    qvga: { width: 320, height: 240 },
    vga: { width: 640, height: 480 },
    hd: { width: 1280, height: 720 },
    fullHd: { width: 1920, height: 1080 },
    "4k": { width: 3840, height: 2160 },
  };
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
    this.ringtone = new Audio();
    // Initialize
    this.initRingtone();
    this.initAudioContext();
    this.initResolutionControl();
    this.initPeer();
    this.initStreamControls();
    // Cleanup on page unload
    window.addEventListener("beforeunload", () => {
      this.cleanup();
    });
  }
  private initRingtone() {
    this.ringtone.src = audioDataUrl;
    this.ringtone.loop = true; // 循环播放
  }
  // 自定义铃声
  public setCustomRingtone(audioUrl: string): void {
    this.ringtone.src = audioUrl;
  }

  // 设置铃声音量
  public setRingtoneVolume(volume: number): void {
    this.ringtone.volume = Math.max(0, Math.min(1, volume));
  } // 静音设置
  private muted: boolean = false;
  public toggleMute(): void {
    this.muted = !this.muted;
    this.ringtone.muted = this.muted;
  }
  private startRinging(): void {
    if (!this.isRinging) {
      this.isRinging = true;
      this.ringtone.play().catch((err) => console.error("播放铃声失败:", err));
    }
  }

  private stopRinging(): void {
    if (this.isRinging) {
      this.isRinging = false;
      this.ringtone.pause();
      this.ringtone.currentTime = 0;
    }
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
  private initResolutionControl(): void {
    const resolutionSelect = document.getElementById(
      "resolution-select"
    ) as HTMLSelectElement;
    resolutionSelect.addEventListener("change", () =>
      this.changeResolution(resolutionSelect.value)
    );
  }

  private async changeResolution(quality: string): Promise<void> {
    const resolution =
      this.resolutions[quality as keyof typeof this.resolutions];

    try {
      // 停止当前的视频轨道
      if (this.localStream) {
        this.localStream.getVideoTracks().forEach((track) => track.stop());
      }

      // 获取新的媒体流
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: resolution.width },
          height: { ideal: resolution.height },
        },
        audio: this.localStream ? true : false, // 保持音频状态不变
      });

      // 如果存在音频轨道，保留原来的音频轨道
      if (this.localStream) {
        const audioTracks = this.localStream.getAudioTracks();
        audioTracks.forEach((track) => {
          newStream.addTrack(track);
        });
      }

      // 更新本地流
      this.localStream = newStream;
      this.localVideo.srcObject = this.localStream;

      // 如果在通话中，需要更新远程端的视频轨道
      if (this.currentCall) {
        const videoTrack = newStream.getVideoTracks()[0];
        const sender = this.currentCall.peerConnection
          .getSenders()
          .find((s) => s.track?.kind === "video");
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
      }

      // 显示当前实际的分辨率
      this.showCurrentResolution();
    } catch (error) {
      console.error("更改分辨率失败:", error);
      alert("更改分辨率失败，可能是因为设备不支持该分辨率");
    }
  }

  // 获取并显示当前实际的分辨率
  private showCurrentResolution(): void {
    const videoTrack = this.localStream?.getVideoTracks()[0];
    if (videoTrack) {
      const settings = videoTrack.getSettings();
      const currentResolution = document.getElementById("current-resolution");
      if (currentResolution) {
        currentResolution.textContent = `当前分辨率: ${settings.width}x${settings.height}`;
      }
    }
  }

  // 获取设备支持的能力
  // private async getDeviceCapabilities(): Promise<void> {
  //   const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  //   const videoTrack = stream.getVideoTracks()[0];
  //   const capabilities = videoTrack.getCapabilities();

  //   console.log("支持的分辨率范围:", {
  //     width: {
  //       min: capabilities.width?.min,
  //       max: capabilities.width?.max,
  //     },
  //     height: {
  //       min: capabilities.height?.min,
  //       max: capabilities.height?.max,
  //     },
  //   });

  //   // 清理临时流
  //   stream.getTracks().forEach((track) => track.stop());
  // }
}

// Initialize the application
