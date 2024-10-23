import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDerAS1DqQxTPljWaffoZz4qBXpiRB5b6w",
    authDomain: "love-letter-52de8.firebaseapp.com",
    projectId: "love-letter-52de8",
    storageBucket: "love-letter-52de8.appspot.com",
    messagingSenderId: "699448410697",
    appId: "1:699448410697:web:2cb7feae9bbadf3cb67598"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
