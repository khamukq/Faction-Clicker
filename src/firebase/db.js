import { doc, getDoc, setDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from './config.js';

const getGameRef = (uid) => doc(db, 'games', uid);
const getLeaderboardRef = () => collection(db, 'leaderboard');
const getNicknameRef = (nickname) => doc(db, 'nicknames', nickname.toLowerCase());

export const saveNicknameMapping = async (nickname, email, uid) => {
    try {
        await setDoc(getNicknameRef(nickname), { email, uid });
    } catch (e) {
        console.warn('Nickname mapping save failed:', e);
    }
};

export const getEmailByNickname = async (nickname) => {
    try {
        const snap = await getDoc(getNicknameRef(nickname));
        return snap.exists() ? snap.data().email : null;
    } catch (e) {
        console.warn('Nickname lookup failed:', e);
        return null;
    }
};

export const checkNicknameTaken = async (nickname) => {
    try {
        const snap = await getDoc(getNicknameRef(nickname));
        return snap.exists();
    } catch (e) {
        console.warn('Nickname check failed:', e);
        return false;
    }
};

export const saveGameToFirebase = async (uid, gameData) => {
    try {
        await setDoc(getGameRef(uid), { ...gameData, updatedAt: Date.now() });
        return true;
    } catch (e) {
        console.warn('Firebase save failed:', e);
        return false;
    }
};

export const loadGameFromFirebase = async (uid) => {
    try {
        const snap = await getDoc(getGameRef(uid));
        return snap.exists() ? snap.data() : null;
    } catch (e) {
        console.warn('Firebase load failed:', e);
        return null;
    }
};

export const saveLeaderboardToFirebase = async (entry) => {
    try {
        await setDoc(doc(db, 'leaderboard', entry.nickname), entry);
        return true;
    } catch (e) {
        console.warn('Firebase leaderboard save failed:', e);
        return false;
    }
};

export const saveClansToFirebase = async (clans) => {
    try {
        await setDoc(doc(db, 'clans', 'registry'), { clans, updatedAt: Date.now() });
    } catch (e) {
        console.warn('Clans Firebase save failed:', e);
    }
};

export const loadClansFromFirebase = async () => {
    try {
        const snap = await getDoc(doc(db, 'clans', 'registry'));
        return snap.exists() ? snap.data().clans : null;
    } catch (e) {
        console.warn('Clans Firebase load failed:', e);
        return null;
    }
};

export const loadLeaderboardFromFirebase = async () => {
    try {
        const q = query(getLeaderboardRef(), orderBy('prestige', 'desc'), limit(50));
        const snap = await getDocs(q);
        return snap.docs.map(d => d.data());
    } catch (e) {
        console.warn('Firebase leaderboard load failed:', e);
        return [];
    }
};