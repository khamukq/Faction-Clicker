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
    if (!S.faction.id || !S.player.nickname) {
        console.warn('addToLeaderboard: фракция или никнейм не заданы');
        return;
    }
    const entries = getLeaderboard();
    const factionName = F[S.faction.id]?.name || S.faction.id;
    const newEntry = {
        id: Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        nickname: S.player.nickname,
        gold: S.player.gold,
        totalGold: S.player.totalGold,
        kills: S.progression.totalKills,
        upgrades: Object.values(S.player.u).reduce((sum, lv) => sum + lv, 0),
        prestige: S.meta.prestigePoints,
        permanent: S.meta.permanentMultiplier,
        ascension: S.meta.ascension,
        level: S.player.level,
        floor: S.progression.floor,
        faction: factionName,
        factionId: S.faction.id,
        clan: S.faction.clanName || 'Нет клана',
        date: new Date().toISOString()
    };
    const filtered = entries.filter(e => e.nickname !== S.player.nickname);
    filtered.push(newEntry);
    filtered.sort((a, b) => b.prestige - a.prestige);
    if (filtered.length > 50) filtered.length = 50;
    saveLeaderboard(filtered);
    saveLeaderboardToFirebase(newEntry);
};