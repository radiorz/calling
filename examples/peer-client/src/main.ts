import "./style.css";
import { VideoChat } from "./chat";
document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
    <h1>视频通信</h1>
    <div id="peer-id">你的ID: <span id="my-id"></span></div>
    
    <div class="controls">
        <input type="text" id="remote-id" placeholder="输入对方的ID">
        <button id="start-call">开始通话</button>
        <button id="end-call">结束通话</button>
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
