// firebase-init.js

// IMPORTANT: You will need to get your own Firebase config object.
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project (or use an existing one).
// 3. In your project, go to Project Settings (the gear icon).
// 4. Under "Your apps", click the web icon (</>) to create a new web app.
// 5. Firebase will give you a 'firebaseConfig' object. Copy it and paste it here.
const firebaseConfig = {
  apiKey: "AIzaSyCFDYDSsOswmf2xn8-Z6LNw4Qu-kiph2X4",
  authDomain: "scoreboard-control.firebaseapp.com",
  projectId: "scoreboard-control",
  storageBucket: "scoreboard-control.firebasestorage.app",
  messagingSenderId: "438021450087",
  appId: "YOUR_A1:438021450087:web:cb4eb72e0858b4b2f627c2PP_ID"
  //measurementId: "G-VW3MBBQ79M"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// This line allows Firestore to work even when the tab is in the background.
db.enablePersistence()
  .catch(function(err) {
      if (err.code == 'failed-precondition') {
          // Multiple tabs open, persistence can only be enabled in one.
      } else if (err.code == 'unimplemented') {
          // The browser does not support all of the features required to enable persistence.
      }
  });

console.log("Firebase Initialized.");
