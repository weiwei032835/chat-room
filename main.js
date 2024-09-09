import "./style.css";
import { createRoom, requireAuth } from "./scripts/firebase";

function setupEventListeners() {
  const btn = document.getElementById("create-room-btn");
  btn.addEventListener("click", async () => {
    const roomId = await createRoom();
    window.location.href = `room.html?roomId=${roomId}`;
  });
}
requireAuth().then(setupEventListeners);
