import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDeFRcVdbTS1V-w5GI2r8En5Rv9dhOhixk',
  authDomain: 'woman-up-19e86.firebaseapp.com',
  projectId: 'woman-up-19e86',
  storageBucket: 'woman-up-19e86.appspot.com',
  messagingSenderId: '508630235281',
  appId: '1:508630235281:web:0f9d5d863d6b178f75a730',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

