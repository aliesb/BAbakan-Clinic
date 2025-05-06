const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "babakan-clinic.firebaseapp.com",
    projectId: "babakan-clinic",
    storageBucket: "babakan-clinic.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();