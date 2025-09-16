// member.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBZC4VwXVJvvb45Yl2KmbIqw_f-XDJ-_xY",
  authDomain: "grouptalk-c13bd.firebaseapp.com",
  projectId: "grouptalk-c13bd",
  storageBucket: "grouptalk-c13bd.appspot.com",
  messagingSenderId: "756756686074",
  appId: "1:756756686074:web:34fc9708b8e91f62ddd543",
  measurementId: "G-1R7YB84QX3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.onload = () => {
  document.getElementById('groupCodeInput').focus();
};

window.joinGroup = async function () {
  const codeInput = document.getElementById('groupCodeInput');
  const errorMessage = document.getElementById('errorMessage');
  errorMessage.textContent = "";

  let rawInput = codeInput.value.trim();

  if (!rawInput) {
    errorMessage.textContent = "Please enter a valid group code or link.";
    return;
  }

  // Extract code from URL if possible
  let groupCode = rawInput;
  try {
    const parsedUrl = new URL(rawInput);
    const params = new URLSearchParams(parsedUrl.search);
    if (params.has("code")) {
      groupCode = params.get("code");
    }
  } catch {
    // not a URL, use input as-is
  }

  const joinBtn = document.querySelector('.join-btn');
  joinBtn.disabled = true;
  joinBtn.textContent = "Joining...";

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const q = query(collection(db, "groups"), where("code", "==", groupCode));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          sessionStorage.setItem("groupCode", groupCode);
          window.location.href = "public/chat.html";
        } else {
          errorMessage.textContent = "❌ Group not found. Please check the code.";
        }
      } catch (error) {
        console.error("Error checking group:", error);
        errorMessage.textContent = "Something went wrong. Please try again.";
      } finally {
        joinBtn.disabled = false;
        joinBtn.textContent = "Join Group";
      }
    } else {
      alert("You must be logged in to join a group.");
      window.location.href = "index.html";
    }
  });
};
