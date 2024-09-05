import { createRoom, requireAuth } from "./scripts/firebase.js";
import "./style.css";

function setupEventListeners() {
    const btn = document.getElementById("create-room-btn");
    btn.addEventListener("click", async () => {
        const roomId = await createRoom(); //建立房間
        window.location.href = `room.html?roomId=${roomId}`;
    });
}

requireAuth().then(setupEventListeners);
