﻿
import {
  requireAuth,
  sendMessageToRoom,
  subscribeToRoom,
  getRoom,
  updateRoomName
} from "./scripts/firebase";
import "./style.css";

// 顯示訊息
function appendMessage(message) {
  const messageContainer = document.getElementById("messages");
  const messageElement = document.createElement("div");
  messageElement.classList.add("message");
  //顯示使用者
  const user = document.createElement("div");
  user.innerText = message.senderName;
  const messageText = document.createElement("div");

  //判斷是否為自己發送的訊息
  if (message.isSelf) {
    user.classList.add("message__user--self");
    messageText.classList.add("message__text--self");
  } else {
    user.classList.add("message__user");
    messageText.classList.add("message__text");
  }

  //將訊息設置為 DOM 元素
  messageText.innerText = message.content;
  //將使用者和訊息添加到訊息元素
  messageElement.appendChild(user);
  messageElement.appendChild(messageText);
  messageContainer.appendChild(messageElement);
}


// 送出訊息
function sendMessage(roomId) {
  const messageInput = document.getElementById("message-input");
  const message = messageInput.value;
  if (message === "") return;

  sendMessageToRoom(roomId, message);
  messageInput.value = ""; //清空輸入框
}

//跳到最後訊息
function goToBottom() {
  const messages = document.getElementById("messages");
  // 滾動條
  messages.scrollTop = messages.scrollHeight - messages.clientHeight;
}


// 發送訊息
function addSendMessageListener(roomId) {
  const sendMessageButton = document.getElementById("send-message");
  sendMessageButton.addEventListener("click", () => {
    sendMessage(roomId);
  });

  // DOM 元素
  const input = document.getElementById("message-input");
  // Enter 鍵時觸發
  input.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      sendMessageButton.click();
    }
  });
}

// 設置邀請連結
function setInviteUrl() {
  const currentUser = window.location.href
  const inviteUrl = document.getElementById("invite-link");
  inviteUrl.value = currentUser;
}


// 複製邀請連結
function addInviteButtonListener() {
  const inviteButton = document.getElementById("invite-button");
  const inviteModal = document.getElementById("invite-modal");
  setInviteUrl();
  //打開邀請連結
  inviteButton.addEventListener("click", () => {
    inviteModal.classList.add("open");
  });
}

// 複製邀請連結
function addCopyButtonListener() {
  const copyButton = document.getElementById("copy-link-btn");
  copyButton.addEventListener("click", () => {
    navigator.clipboard.writeText(window.location.href);
    //變成已複製
    copyButton.innerText = "已複製";
    setTimeout(() => {
      copyButton.innerText = "複製連結";
    }, 2000)
  });
}

// input 編輯
function createTitleEditInput(value) {
  const input = document.createElement("input");
  input.type = "text";
  input.value = value;
  input.classList.add("editable-input");
  return input;
}

// 取得房間名稱  
function addEditIconListener(roomId) {
  const editIcon = document.getElementById("edit-icon");
  editIcon.addEventListener("click", () => {
    const title = document.getElementById("chat-room-name");
    const input = createTitleEditInput(title.textContent);// 現在標題
    title.parentNode.replaceChild(input, title); //replaceChild()替換節點
    input.focus();
    editIcon.style.display = "none";

    // 儲存標題
    function saveTitle() {
      updateRoomName(input.value, roomId)
        .then(() => {
          title.textContent = input.value;
        })
        .finally(() => {
          input.parentNode.replaceChild(title, input);
          editIcon.style.display = "block";
        })
    }

    input.addEventListener("blur", saveTitle);
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        input.blur();
      }
    })
  });
}




// 更新房間名稱
async function loadRoomName(roomId) {
  const title = document.getElementById("chat-room-name");
  const room = await getRoom(roomId);
  title.textContent = room.name;
}

// 關閉邀請連結視窗
function addCloseInviteModalListener() {
  const closeModalButton = document.getElementById("close-invite-modal");
  const inviteModal = document.getElementById("invite-modal");
  closeModalButton.addEventListener("click", () => {
    inviteModal.classList.remove("open");
  });
}

// 設定 複製 跳出事件 
function setupEventListeners(roomId) {
  addSendMessageListener(roomId);
  addInviteButtonListener();
  addCloseInviteModalListener();
  addCopyButtonListener();
  addEditIconListener(roomId);
}

const messageIds = new Set();
// 訊息更新
function messageUpdateHandler(messages) {
  messages.forEach(message => {
    if (!messageIds.has(message.id)) {
      messageIds.add(message.id);
      appendMessage(message);
    }
  });
  goToBottom();
}

// 確保使用者已經通過身份驗證
requireAuth().then((user) => {
  // 從 URL 查詢參數中獲取房間 ID
  const roomId = new URLSearchParams(window.location.search).get("roomId");
  // 更新房間名
  loadRoomName(roomId)
  // 設置與房間相關的事件監聽器
  setupEventListeners(roomId);
  // 訂閱房間的訊息更新
  subscribeToRoom(messageUpdateHandler, roomId);
});