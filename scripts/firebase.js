// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup
} from "firebase/auth";
import {
  getFirestore,
  addDoc,
  collection,
  onSnapshot,
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const COLLECTIONS = {
  ROOM: "room",
  MESSAGE: "message"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const provider = new GoogleAuthProvider();

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

export async function createRoom() {
  const db = getFirestore();
  const room = await addDoc(collection(db, COLLECTIONS.ROOM), {
    name: "Chat Room",
    createdAt: new Date()
  });

  return room.id;
}

export async function sendMessageToRoom(roomId, content) {
  const db = getFirestore();
  const messageRef = collection(
    db,
    COLLECTIONS.ROOM,
    roomId,
    COLLECTIONS.MESSAGE
  );
  const auth = getAuth();
  const message = await addDoc(messageRef, {
    senderEmail: auth.currentUser.email,
    senderName: auth.currentUser.displayName,
    content,
    timestamp: new Date()
  });
  return message;
}

export async function subscribeToRoom(fn, roomId) {
  const db = getFirestore();
  const messageRef = collection(
    db,
    COLLECTIONS.ROOM,
    roomId,
    COLLECTIONS.MESSAGE
  );

  const unsubscribe = onSnapshot(messageRef, (messages) => {
    const auth = getAuth();
    const transformedMessages = messages.docs.map((doc) => {
      const data = doc.data();
      const id = doc.id;
      return {
        id,
        isSelf: auth.currentUser.email === data.senderEmail,
        ...data
      };
    });

    fn(transformedMessages);
  });

  return unsubscribe;
}

export function getRoom(roomId) {
  const db = getFirestore();
  const roomRef = doc(db, COLLECTIONS.ROOM, roomId);
  return getDoc(roomRef).then((doc) => doc.data());
}

export async function updateRoomName(name, roomId) {
  const db = getFirestore();
  const roomRef = doc(db, COLLECTIONS.ROOM, roomId);
  await setDoc(roomRef, { name: name }, { merge: true });
}
