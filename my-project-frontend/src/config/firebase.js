import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC4sZvCiTxDlgbJqiCadq-8ZKEJhFcvCmU",
  authDomain: "arp-website-d8e84.firebaseapp.com",
  projectId: "arp-website-d8e84",
  storageBucket: "arp-website-d8e84.firebasestorage.app",
  messagingSenderId: "867315197913",
  appId: "1:867315197913:web:7f2da3bffb25d5ac809bc8",
  measurementId: "G-VB3HVY5YZK"
};
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();