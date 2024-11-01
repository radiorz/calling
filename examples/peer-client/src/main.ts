import "./style.css";
import { VideoChat } from "./chat";
document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
    <h1>视频通信</h1>
    <div id="peer-id">你的ID: <span id="my-id"></span></div>
    
    <div class="controls">
        <input type="text" id="remote-id" placeholder="输入对方的ID">
        <button id="start-call">开始通话</button>
        <button id="end-call">结束通话</button>
        <button id="toggle-video">关闭视频</button>
        <button id="toggle-audio">关闭音频</button>
        <div class="volume-control">
            <label for="volume-control">音量控制:</label>
            <input type="range" id="volume-control" min="0" max="100" value="50">
            <span id="volume-value">1</span>
        </div>
         <div class="resolution-control">
            <label for="resolution-select">视频质量:</label>
            <select id="resolution-select">
                <option value="qvga">QVGA (320x240)</option>
                <option value="vga">VGA (640x480)</option>
                <option value="hd" selected>HD (1280x720)</option>
                <option value="fullHd">Full HD (1920x1080)</option>
                <option value="4k">4K (3840x2160)</option>
            </select>
            <span id="current-resolution"></span>
        </div>
    </div>

    <div class="video-container">
        <div>
            <h3>本地视频</h3>
            <video id="local-video" autoplay muted></video>
        </div>
        <div>
            <h3>远程视频</h3>
            <video id="remote-video" autoplay></video>
        </div>
    </div>
`;
new VideoChat();
