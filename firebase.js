import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getStorage, connectStorageEmulator } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBZC4VwXVJvvb45Yl2KmbIqw_f-XDJ-_xY",
  authDomain: "grouptalk-c13bd.firebaseapp.com",
  projectId: "grouptalk-c13bd",
  storageBucket: "grouptalk-c13bd.firebasestorage.app",
  messagingSenderId: "756756686074",
  appId: "1:756756686074:web:34fc9708b8e91f62ddd543",
  measurementId: "G-1R7YB84QX3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ✅ Emulator sirf localhost pe hi active karein
if (location.hostname === "localhost") {
  // connectStorageEmulator(storage, "127.0.0.1", 9199);
}

export { app, auth, db, storage };


