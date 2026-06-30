    import { S } from '../core/state.js';
import { F } from '../factions/index.js';
import { fmt } from '../core/utils.js';
import { saveLeaderboardToFirebase, loadLeaderboardFromFirebase } from '../firebase/db.js';

const LB_KEY = 'factionLeaderboard';

export const getLeaderboard = () => {
    try {
        const data = localStorage.getItem(LB_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) { return []; }
};

export const saveLeaderboard = (entries) => {
    try {
        localStorage.setItem(LB_KEY, JSON.stringify(entries));
    } catch (e) { console.warn('Leaderboard save failed:', e); }
};

export const syncLeaderboardFromFirebase = async () => {
    const fbEntries = await loadLeaderboardFromFirebase();
    if (fbEntries.length > 0) {
        saveLeaderboard(fbEntries);
    }
    return fbEntries;
};

export const addToLeaderboard = () => {
    if (!S.f || !S.nickname) {
        console.warn('addToLeaderboard: фракция или никнейм не заданы');
        return;
    }
    const entries = getLeaderboard();
    const factionName = F[S.f]?.name || S.f;
    const newEntry = {
        id: Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        nickname: S.nickname,
        gold: S.gold,
        totalGold: S.totalGold,
        kills: S.totalKills,
        upgrades: Object.values(S.u).reduce((sum, lv) => sum + lv, 0),
        prestige: S.prestigePoints,
        permanent: S.permanentMultiplier,
        ascension: S.ascension,
        level: S.level,
        floor: S.floor,
        faction: factionName,
        factionId: S.f,
        clan: S.clanName || 'Нет клана',
        date: new Date().toISOString()
    };
    const filtered = entries.filter(e => e.nickname !== S.nickname);
    filtered.push(newEntry);
    filtered.sort((a, b) => b.prestige - a.prestige);
    if (filtered.length > 50) filtered.length = 50;
    saveLeaderboard(filtered);
    saveLeaderboardToFirebase(newEntry);
};