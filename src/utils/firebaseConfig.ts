// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
// import { getAnalytics } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyBs9L1nIrGJmXnPoNdyDmOwJthAr2ZMT3Q',
  authDomain: 'securip-dev.firebaseapp.com',
  projectId: 'securip-dev',
  storageBucket: 'securip-dev.appspot.com',
  messagingSenderId: '739456003806',
  appId: '1:739456003806:web:bf3d39e18c9e2c0f541c4f',
  measurementId: 'G-7ENM7D027J',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
