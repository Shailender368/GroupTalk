// Firebase CDN setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBZC4VwXVJvvb45Yl2KmbIqw_f-XDJ-_xY",
  authDomain: "grouptalk-c13bd.firebaseapp.com",
  projectId: "grouptalk-c13bd",
  storageBucket: "grouptalk-c13bd.firebasestorage.app",
  messagingSenderId: "756756686074",
  appId: "1:756756686074:web:34fc9708b8e91f62ddd543",
  measurementId: "G-1R7YB84QX3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Spinner control
const spinner = document.getElementById("spinner");

function showSpinner() {
  if (spinner) spinner.style.display = "flex";
}

function hideSpinner() {
  if (spinner) spinner.style.display = "none";
}

// Signup Function
window.signupUser = async function () {
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  showSpinner();

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Signup successful!");
    window.location.href = "front.html"; // go to role selection page
  } catch (error) {
    alert("Signup failed: " + error.message);
  } finally {
    hideSpinner();
  }
};

// Login Function
window.loginUser = async function () {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  showSpinner();

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "front.html"; // go to role selection page
  } catch (error) {
    alert("Login failed: " + error.message);
  } finally {
    hideSpinner();
  }
};

// Google Login Function
window.googleLogin = async function () {
  const googleBtn = document.querySelector('#googleBtn');
  googleBtn.disabled = true;
  showSpinner();

  try {
    await signInWithPopup(auth, provider);
    window.location.href = "front.html"; // go to role selection page
  } catch (error) {
    alert("Google login failed:\n" + error.message);
  } finally {
    googleBtn.disabled = false;
    hideSpinner();
  }
};


