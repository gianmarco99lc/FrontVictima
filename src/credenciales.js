// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBcVP__otz3wxYvWgx_LUJp0DOJSDKhDV4",
  authDomain: "attackervictim-408116.firebaseapp.com",
  projectId: "attackervictim-408116",
  storageBucket: "attackervictim-408116.appspot.com",
  messagingSenderId: "319087309435",
  appId: "1:319087309435:web:dbefdd0f826e04a85628de",
  measurementId: "G-GJT4L91J6N"
};

// Initialize Firebase
const appFirebase = initializeApp(firebaseConfig);
export default appFirebase;