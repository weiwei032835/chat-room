// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,//第三方驗證
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
} from "firebase/auth";
import {
  getFirestore,
  addDoc,
  collection,
  onSnapshot,
  doc,
  getDoc
} from "firebase/firestore";

// Firebase 服務網頁 SDK
// https://firebase.google.com/docs/web/setup#available-libraries

// Firebase 配置
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY, //金鑰
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, //認證域名
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID, //專案ID
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,//儲存
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,//發送ID
  appId: import.meta.env.VITE_FIREBASE_APP_ID //應用程式ID
};

const COLLECTIONS = {
  ROOM: "room",
  MESSAGE: "message"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const provider = new GoogleAuthProvider();

// Google第三方認證
export function requireAuth() {
  return new Promise((resolve, reject) => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(user);
        unsubscribe();
      } else {
        signInWithPopup(auth, provider);
      }
    });
  });
}

// 建立房間
export async function createRoom() {
  // 獲取資料
  const db = getFirestore();
  const room = await addDoc(collection(db, COLLECTIONS.ROOM), {
    name: "Chat Room",
    createdAt: new Date()
  });
  return room.id;
}

// 送出訊息資料 辨識資料
export async function sendMessageToRoom(roomId, content) {
  const db = getFirestore();
  // 建立一個指向 Firestore 中特定房間訊息集合的引用
  const messageRef = collection(
    db, // Firestore 資料庫實例
    COLLECTIONS.ROOM, // 房間集合的名稱
    roomId, // 特定房間的 ID
    COLLECTIONS.MESSAGE // 訊息集合的名稱
  );
  // 取得使用者
  const auth = getAuth();
  // 向 Firestore 中的訊息集合新增一個新訊息文件
  const message = await addDoc(messageRef, {
    senderEmail: auth.currentUser.email, // 發送者的電子郵件
    senderName: auth.currentUser.displayName, // 發送者的顯示名稱
    content, // 訊息內容
    timestamp: new Date() // 訊息的時間戳記
  });
  return message;
}

// 訂閱訊息
export async function subscribeToRoom(fn, roomId) {
  const db = getFirestore();
  const messageRef = collection(
    db,
    COLLECTIONS.ROOM,
    roomId,
    COLLECTIONS.MESSAGE
  );

  // 訂閱訊息集合 陣列
  const unsubscribe = onSnapshot(messageRef, (messages) => {
    // 取得使用者 
    const auth = getAuth();
    // 處理 訊息
    const transformedMessages = messages.docs.map(doc => {
      const data = doc.data();
      const id = doc.id;
      return { id, isSelf: auth.currentUser.email === data.senderEmail, ...data };
    });

    fn(transformedMessages);
  });

  return unsubscribe;
}
// 取得房間
export function getRoom(roomId) {
  const db = getFirestore();
  // 取得房間文件
  const roomRef = doc(db, COLLECTIONS.ROOM, roomId);
  return getDoc(roomRef).then(doc => doc.data());
}