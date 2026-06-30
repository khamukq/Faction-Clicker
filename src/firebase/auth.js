import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from './config.js';

export const register = async (email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    return cred.user;
};

export const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
};

export const logout = async () => {
    await signOut(auth);
};

export const onAuthChange = (cb) => {
    return onAuthStateChanged(auth, cb);
};

export const getCurrentUser = () => auth.currentUser;