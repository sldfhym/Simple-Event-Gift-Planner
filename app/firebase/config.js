import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCw9j0DQ0u8ib7f1csSPmR-d97M0BO2cIU",
  authDomain: "giftplanner-e1bd5.firebaseapp.com",
  projectId: "giftplanner-e1bd5",
  storageBucket: "giftplanner-e1bd5.firebasestorage.app",
  messagingSenderId: "49674380488",
  appId: "1:49674380488:web:db1d5968b1d7f3637ff1fd"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);