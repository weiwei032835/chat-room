// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAm9UoBBQWqspyCLrLqaODHqxbw24pXxpQ",
    authDomain: "chat-room-d7109.firebaseapp.com",
    projectId: "chat-room-d7109",
    storageBucket: "chat-room-d7109.appspot.com",
    messagingSenderId: "239719760333",
    appId: "1:239719760333:web:ff51b98cd73e8858560484"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const provider = new GoogleAuthProvider();

export function login() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
        if (user) {
            //已經登入
            console.log("已經登入");

        } else {
            //未登入
            signInWithPopup(auth, provider);
        }
    })

    signInWithPopup(auth, provider);
    console.log(auth);
}