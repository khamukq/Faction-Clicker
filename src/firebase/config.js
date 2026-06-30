import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyC6DKNf42INbuvtj338hEHg4Zlvsb-UX3o',
    authDomain: 'faction-clc.firebaseapp.com',
    projectId: 'faction-clc',
    storageBucket: 'faction-clc.firebasestorage.app',
    messagingSenderId: '672967178516',
    appId: '1:672967178516:web:76fb1bea536d05a1bd6a01',
    measurementId: 'G-YZEGD23GPM'
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
