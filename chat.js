// Your imports (same as yours)
import { auth, db, storage } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import {
  collection, addDoc, doc, setDoc, getDoc,
  query, orderBy, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import {
  ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";

// DOM Elements
const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const fileInput = document.getElementById("fileInput");
const voiceBtn = document.getElementById("voiceBtn");
const recordingIndicator = document.getElementById("recordingIndicator");

// Setup
let currentUserId = null;
let currentUserDisplayName = null;
const groupCode = sessionStorage.getItem("groupCode");
if (!groupCode) {
  alert("Group code missing. Redirecting...");
  window.location.href = "index.html";
}
const cityNames = [
  "Tokyo", "Berlin", "Helsinki", "Oslo", "Denver", "Nairobi", "Rio", "Stockholm", "Lisbon", "Marseille",
  "Caracas", "Palermo", "Bogotá", "Manila", "Bangkok", "Jakarta", "Buenos Aires", "Santiago", "Valencia",
  "Cairo", "Lagos", "Cape Town", "Moscow", "Toronto", "Montreal", "Edinburgh", "Dublin", "Manchester",
  "Birmingham", "Istanbul", "Athens", "Rome", "Milan", "Naples", "Madrid", "Barcelona", "Seville",
  "Lisbon", "Porto", "Zurich", "Geneva", "Brussels", "Amsterdam", "Rotterdam", "Munich", "Frankfurt",
  "Hamburg", "Vienna", "Prague", "Warsaw", "Budapest", "Bucharest", "Sofia", "Belgrade", "Sarajevo",
  "Skopje", "Tirana", "Zagreb", "Ljubljana", "Vilnius", "Riga", "Tallinn", "Hanoi", "Seoul", "Busan",
  "Taipei", "Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu", "Wuhan", "Hong Kong", "Macau",
  "Kuala Lumpur", "Singapore", "Manila", "Colombo", "Dhaka", "Karachi", "Islamabad", "Mumbai", "Delhi",
  "Bangalore", "Chennai", "Hyderabad", "Jakarta", "Surabaya", "Medan", "Bandung", "Guatemala City",
  "San Salvador", "Panama City", "Quito", "La Paz", "Lima", "Asunción"
];
function getRandomCityName() {
  return cityNames[Math.floor(Math.random() * cityNames.length)];
}
async function assignDisplayName(userId) {
  const userRef = doc(db, "groups", groupCode, "members", userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    const displayName = getRandomCityName();
    await setDoc(userRef, { displayName });
    return displayName;
  } else {
    return userSnap.data().displayName;
  }
}

// Auth
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("You must be logged in!");
    window.location.href = "index.html";
    return;
  }

  currentUserId = user.uid;
  currentUserDisplayName = await assignDisplayName(currentUserId);
  document.getElementById("chatHeader").innerText = `GroupTalk - ${groupCode}`;

  const q = query(collection(db, "groups", groupCode, "messages"), orderBy("timestamp"));
  onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        displayMessage(change.doc.data());
      }
    });
  });
});

// Display message
function displayMessage(data) {
  const msgDiv = document.createElement("div");
  msgDiv.className = "message";
  if (data.userId === currentUserId) msgDiv.classList.add("own-message");

  let content = `<strong>${data.displayName || "Unknown"}:</strong><br>`;
  switch (data.type) {
    case "text":
  content += `<span class="message-text">${data.text}</span>`;
  break;

    case "image":
      content += `<img src="${data.url}" class="chat-image" style="max-width:200px; border-radius:12px; cursor:pointer;" />`;


      break;
    case "video":
      content += `<video controls style="max-width:200px; border-radius:12px;" preload="auto"><source src="${data.url}" type="video/mp4"></video>`;
      break;
    case "audio":
    case "voice":
      content += `<audio controls style="max-width:200px; border-radius:12px;" src="${data.url}" preload="auto"></audio>`;
      break;
    default:
      content += `<a href="${data.url}" target="_blank">View File</a>`;
  }

  msgDiv.innerHTML = content;

  // Right click allow for images
const img = msgDiv.querySelector("img");
if (img) {
  img.addEventListener("contextmenu", (e) => e.stopPropagation());
}

// Right click allow for videos
const vid = msgDiv.querySelector("video");
if (vid) {
  vid.addEventListener("contextmenu", (e) => e.stopPropagation());
}

// Right click allow for audio
const aud = msgDiv.querySelector("audio");
if (aud) {
  aud.addEventListener("contextmenu", (e) => e.stopPropagation());
}


  // Audio handling
  const audioEl = msgDiv.querySelector("audio");
  if (audioEl) {
    audioEl.addEventListener("loadedmetadata", () => {
      if (audioEl.duration === Infinity || audioEl.duration === 0) {
        audioEl.currentTime = 1e101;
        audioEl.ontimeupdate = () => {
          audioEl.ontimeupdate = null;
          audioEl.currentTime = 0;
        };
      }
    });
  }

  // Handle image click event to prevent fullscreen
  const imageEl = msgDiv.querySelector("img.chat-image");
  if (imageEl) {
    imageEl.addEventListener("click", (e) => {
      e.preventDefault(); // Prevent fullscreen open
    });
  }

  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}




// Send text
window.sendMessage = async function () {
  const text = messageInput.value.trim();
  if (!text) return;
  try {
    await addDoc(collection(db, "groups", groupCode, "messages"), {
      type: "text",
      text,
      userId: currentUserId,
      displayName: currentUserDisplayName,
      timestamp: serverTimestamp()
    });
    messageInput.value = "";
    messageInput.focus();
  } catch (err) {
    console.error("Send text error:", err);
    alert("Failed to send message.");
  }
};
document.getElementById("sendBtn").addEventListener("click", sendMessage);
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
// Auto-grow message input
messageInput.setAttribute("rows", 1);
messageInput.style.overflow = "hidden";

messageInput.addEventListener("input", () => {
  messageInput.style.height = "auto";
  messageInput.style.height = (messageInput.scrollHeight) + "px";
});


// Upload file (image/video/audio)
fileInput.addEventListener("change", async () => {
  const file = fileInput.files[0];
  if (!file) return;
  let messageType = "file";
  if (file.type.startsWith("image/")) messageType = "image";
  else if (file.type.startsWith("video/")) messageType = "video";
  else if (file.type.startsWith("audio/")) messageType = "audio";

  const fileRef = ref(storage, `chat_uploads/${groupCode}/${messageType}/${Date.now()}_${file.name}`);
  try {
    await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(fileRef);
    await addDoc(collection(db, "groups", groupCode, "messages"), {
      type: messageType,
      url: downloadURL,
      userId: currentUserId,
      displayName: currentUserDisplayName,
      timestamp: serverTimestamp()
    });
  } catch (err) {
    console.error("Upload failed:", err);
    alert("Failed to upload file.");
  }
  fileInput.value = "";
});

// 🎙️ Voice Recording (toggle style)
let mediaRecorder, audioChunks = [], stream = null, isRecording = false;

voiceBtn.addEventListener("click", async () => {
  if (!isRecording) {
    await startRecording();
  } else {
    await stopRecording();
  }
});

async function stopRecording() {
  if (!mediaRecorder || isRecording === false) return;

  try {
    isRecording = false;
    voiceBtn.disabled = true;
    voiceBtn.textContent = "Processing...";
    recordingIndicator.style.display = "none";

    return new Promise((resolve) => {
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm;codecs=opus' });

        if (audioBlob.size === 0) {
          alert("Recording failed: empty audio.");
          cleanupStream();
          voiceBtn.disabled = false;
          voiceBtn.textContent = "Start Recording";
          return resolve();
        }

        const filename = `voice-${Date.now()}.webm`;
        const voiceRef = ref(storage, `chat_uploads/${groupCode}/voice/${filename}`);

        try {
          await uploadBytes(voiceRef, audioBlob);
          const url = await getDownloadURL(voiceRef);

          await addDoc(collection(db, "groups", groupCode, "messages"), {
            type: "voice",
            url,
            userId: currentUserId,
            displayName: currentUserDisplayName,
            timestamp: serverTimestamp()
          });

          console.log("Voice message uploaded.");
        } catch (err) {
          console.error("Upload error:", err);
          alert("Failed to upload voice.");
        }

        cleanupStream();
        voiceBtn.disabled = false;
        voiceBtn.textContent = "Start Recording";
        resolve();
      };

      // Safety: if already inactive, skip .stop() to avoid errors
      if (mediaRecorder.state === "recording") {
        mediaRecorder.stop(); // This triggers onstop
      } else {
        // Force manual trigger if onstop isn't called
        mediaRecorder.onstop();
      }
    });
  } catch (err) {
    console.error("Stop recording error:", err);
    cleanupStream();
    voiceBtn.disabled = false;
    voiceBtn.textContent = "Start Recording";
  }
}

async function startRecording() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) audioChunks.push(event.data);
    };

    mediaRecorder.start();
    isRecording = true;
    voiceBtn.textContent = "Stop Recording";
    recordingIndicator.style.display = "inline";
    console.log("Recording started");
  } catch (err) {
    console.error("Microphone access denied or error:", err);
    alert("Failed to access microphone.");
  }
}



function cleanupStream() {
  if (stream) {
    stream.getTracks().forEach((t) => t.stop());
    stream = null;
  }
}


let audioElement = null;

function playAudio(url) {
  if (audioElement) {
    audioElement.pause(); // Pause any existing audio
  }

  audioElement = new Audio(url);
  audioElement.play().catch((error) => {
    console.error("Error playing audio:", error);
    alert("Audio playback failed.");
  });
}


window.openImageInNewTab = function (url) {
  const win = window.open();
  win.document.write(`<img src="${url}" style="width: 100%;" />`);
};


// Image Modal Logic
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("chat-image")) {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    modalImg.src = e.target.src;
    modal.style.display = "flex";
  } else if (e.target.id === "modalImage" || e.target.id === "imageModal") {
    document.getElementById("imageModal").style.display = "none";
  }
});

//  Emoji, Dark Mode, Auto-link, No Msg Logic

let isHost = false;

// DOMContentLoaded setup
document.addEventListener('DOMContentLoaded', async () => {
  const emojiBtn = document.getElementById('emojiBtn');
  const emojiPicker = document.getElementById('emojiPicker');
  const messageInput = document.getElementById('messageInput');
  const chatBox = document.getElementById('chatBox');
  const noMessages = document.getElementById('noMessages');
  const darkModeOption = document.getElementById('darkModeOption');

  // 😊 Emoji Picker Toggle
  emojiBtn.addEventListener('click', () => {
    emojiPicker.style.display = (emojiPicker.style.display === 'block') ? 'none' : 'block';
  });

  // 👆 Add emoji to input
  emojiPicker.addEventListener('emoji-click', event => {
    messageInput.value += event.detail.unicode;
    emojiPicker.style.display = 'none';
  });

  // Hide emoji picker on outside click
  document.addEventListener('click', event => {
    if (!emojiPicker.contains(event.target) && event.target !== emojiBtn) {
      emojiPicker.style.display = 'none';
    }
  });

  // 🧠 Auto-link & No Msg Observer
  const observer = new MutationObserver(() => {
    const messages = chatBox.querySelectorAll('.message');
    noMessages.style.display = messages.length === 0 ? 'block' : 'none';

    messages.forEach(msg => {
      const textEl = msg.querySelector('.message-text');
      if (textEl && !textEl.dataset.linked) {
        textEl.innerHTML = linkify(textEl.textContent);
        textEl.dataset.linked = true;
      }
    });
  });

  observer.observe(chatBox, { childList: true, subtree: true });

  // 🔗 Linkify URLs
  function linkify(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
  }

  // 🌙 Dark Mode Preference
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
    darkModeOption.textContent = '☀️';
  }

  // 🧠 Host Check
  groupCode = sessionStorage.getItem("groupCode");
  currentUserId = auth.currentUser?.uid;

  if (groupCode && currentUserId) {
    try {
      const memberRef = doc(db, "groups", groupCode, "members", currentUserId);
      const memberSnap = await getDoc(memberRef);

      if (memberSnap.exists() && memberSnap.data().role === "host") {
        isHost = true;
        document.getElementById("endLeaveGroupOption").textContent = '🚪 End Group';
      }
    } catch (err) {
      console.error("Failed to fetch member role:", err);
    }
  }
});

// Menu toggle logic
const menuBtn = document.getElementById('menuBtn');
const menuOptions = document.getElementById('menuOptions');

menuBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  menuOptions.classList.toggle('show');
});

// Hide menu on outside click
document.addEventListener('click', (e) => {
  if (!e.target.closest('.menu')) {
    menuOptions.classList.remove('show');
  }
});

// Dark Mode toggle button
const darkModeOption = document.getElementById('darkModeOption');
darkModeOption.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', isDark);
  darkModeOption.textContent = isDark ? '☀️' : '🌙';
});

document.addEventListener("DOMContentLoaded", () => {
    const exitBtn = document.getElementById("exitBtn");
    const hostLeavePopup = document.getElementById("hostLeavePopup");
    const cancelLeaveBtn = document.getElementById("cancelLeaveBtn");

    // Exit button click → show popup
    exitBtn.addEventListener("click", () => {
        hostLeavePopup.style.display = "flex"; // flex so it centers
    });

    // Cancel button click → hide popup
    cancelLeaveBtn.addEventListener("click", () => {
        hostLeavePopup.style.display = "none";
    });
});

firebase.firestore().collection('groups').doc(groupId).get().then(doc => {
    if (doc.exists) {
        const data = doc.data();
        if (data.hostId === firebase.auth().currentUser.uid) {
            isHost = true;
        } else {
            isHost = false;
        }

        // Role ke hisaab se buttons dikhao
        if (isHost) {
            document.getElementById('exitBtn').innerText = "Options"; // ya Host Exit
        } else {
            document.getElementById('hostLeavePopup').style.display = 'none'; // popup hide
        }
    }
});

document.getElementById('exitBtn').addEventListener('click', () => {
    if (isHost) {
        // Host ka popup
        document.getElementById('hostLeavePopup').style.display = 'flex';
    } else {
        // Member direct leave kare
        leaveGroup();
    }
});

function leaveGroup() {
    const userId = firebase.auth().currentUser.uid;

    firebase.firestore().collection('groups').doc(groupId).update({
        members: firebase.firestore.FieldValue.arrayRemove(userId)
    }).then(() => {
        alert('You have left the group.');
        window.location.href = 'member.html';
    });
}
