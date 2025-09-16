import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

window.generateGroup = function () {
  const groupNameInput = document.getElementById('groupName');
  const groupCodeEl = document.getElementById('groupCode');
  const codeBox = document.getElementById('codeBox');
  const inviteLinkEl = document.getElementById('inviteLink');

  const groupName = groupNameInput.value.trim();
  if (!groupName) {
    alert("Please enter a group name.");
    return;
  }

  const groupCode = `${groupName.toLowerCase().replace(/\s+/g, '-')}-${Math.floor(1000 + Math.random() * 9000)}`;

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        await addDoc(collection(db, "groups"), {
          name: groupName,
          code: groupCode,
          hostId: user.uid,
          createdAt: serverTimestamp()
        });

        // Show code
        groupCodeEl.innerText = groupCode;
        codeBox.style.display = 'block';

        // Generate and show link
        const baseURL = window.location.origin;
        inviteLinkEl.innerText = `${baseURL}/member.html?code=${groupCode}`;

        // Save in session
        sessionStorage.setItem("groupCode", groupCode);

      } catch (error) {
        console.error("Error creating group:", error);
        alert("Something went wrong while creating the group.");
      }
    } else {
      alert("User not logged in.");
      window.location.href = "public/chat.html";


    }
  });
};


