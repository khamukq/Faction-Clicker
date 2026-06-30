import { S, loadState } from './state.js';
import { CONFIG, defaultBonuses } from './config.js';
import { EventBus } from './eventBus.js';
import { fmt } from './utils.js';
import { getCurrentUser } from '../firebase/auth.js';
import { saveGameToFirebase as fbSave, loadGameFromFirebase as fbLoad } from '../firebase/db.js';

const getSaveData = () => ({
    version: CONFIG.VERSION,
    savedUid: getCurrentUser()?.uid || null,
    f: S.f, clan: S.clan, clanName: S.clanName,
    gold: S.gold, maxHp: S.maxHp, hp: S.hp,
    level: S.level, exp: S.exp, expToNext: S.expToNext,
    totalExp: S.totalExp,
    kills: S.kills, combo: S.combo, maxCombo: S.maxCombo,
    totalKills: S.totalKills, totalDamage: S.totalDamage,
    totalGold: S.totalGold,
    rebirths: S.rebirths, rebirthMultiplier: S.rebirthMultiplier,
    prestigePoints: S.prestigePoints, totalPrestigePoints: S.totalPrestigePoints,
    permanentMultiplier: S.permanentMultiplier,
    ascension: S.ascension, ascensionPoints: S.ascensionPoints,
    nickname: S.nickname, crits: S.crits, hits: S.hits,
    enemyIndex: S.enemyIndex, enemyHp: S.enemyHp,
    enemyMaxHp: S.enemyMaxHp, isBoss: S.isBoss,
    isSuperBoss: S.isSuperBoss,
    bossCount: S.bossCount, bossSkipped: S.bossSkipped,
    bossAttempts: S.bossAttempts,
    a: S.a, u: S.u,
    b: S.b, perks: S.perks,
    achievements: S.achievements,
    boostCooldown: S.boostCooldown,
    activeSkills: S.activeSkills,
    levelStats: S.levelStats,
    levelMilestones: S.levelMilestones,
    floor: S.floor,
    floorKills: S.floorKills,
    superBossCount: S.superBossCount,
    autoClicker: {
        enabled: S.autoClicker.enabled,
        level: S.autoClicker.level,
        interval: S.autoClicker.interval
    },
    weapon: S.weapon,
    weapons: S.weapons,
    lastSave: Date.now()
});

export const saveGame = () => {
    try {
        const saveData = getSaveData();
        localStorage.setItem('factionGameSave', JSON.stringify(saveData));
        S.lastSave = Date.now();
        EventBus.emit('save:done');
    } catch (e) {
        console.warn('Save failed:', e);
    }
};

export const saveGameToFirebase = async () => {
    const user = getCurrentUser();
    if (!user) return false;
    const saveData = getSaveData();
    return fbSave(user.uid, saveData);
};

export const loadGameFromFirebase = async () => {
    const user = getCurrentUser();
    if (!user) return false;
    const data = await fbLoad(user.uid);
    if (data) {
        const migrated = migrateSave(data);
        loadState(migrated);
        if (S.autoClicker.enabled && S.f) {
            if (S.autoClicker.timer) clearInterval(S.autoClicker.timer);
            S.autoClicker.timer = setInterval(() => {
                if (S.f && S.hp > 0) {
                    import('../combat/battle.js').then(({ attack }) => attack());
                }
            }, S.autoClicker.interval);
        }
        return true;
    }
    return false;
};

// ... остальные функции migrateSave, loadGame, etc.
export const migrateSave = (data) => {
    if (!data.version || data.version < CONFIG.VERSION) {
        if (!data.b) data.b = defaultBonuses();
        const defaultB = defaultBonuses();
        for (const key in defaultB) {
            if (!(key in data.b)) data.b[key] = defaultB[key];
        }
        if (!data.perks) data.perks = [];
        if (!data.ascension) data.ascension = 0;
        if (!data.ascensionPoints) data.ascensionPoints = 0;
        if (!data.achievements) data.achievements = [];
        if (!data.boostCooldown) data.boostCooldown = null;
        if (!data.activeSkills) data.activeSkills = {};
        if (!data.levelStats) {
            data.levelStats = { damageBonus: 0, hpBonus: 0, healBonus: 0, goldBonus: 0 };
        }
        if (!data.totalExp) data.totalExp = 0;
        if (!data.levelMilestones) data.levelMilestones = [];
        if (!data.bossSkipped) data.bossSkipped = false;
        if (!data.bossAttempts) data.bossAttempts = 0;
        if (!data.bossMaxAttempts) data.bossMaxAttempts = CONFIG.difficulty.bossMaxAttempts;
        if (!data.floor) data.floor = 1;
        if (!data.floorKills) data.floorKills = 0;
        if (!data.superBossCount) data.superBossCount = 0;
        if (!data.autoClicker) {
            data.autoClicker = {
                enabled: false,
                level: 0,
                interval: CONFIG.autoClicker.interval
            };
        }
        if (!data.isSuperBoss) data.isSuperBoss = false;
        if (!data.weapon) data.weapon = 'weapon_001';
        if (!data.weapons) {
            data.weapons = {};
            data.weapons.weapon_001 = { level: 1, unlocked: true };
        }
        data.version = CONFIG.VERSION;
    }
    return data;
};

export const clearLocalSave = () => {
    try { localStorage.removeItem('factionGameSave'); } catch (e) {}
};

export const loadGame = () => {
    try {
        const raw = localStorage.getItem('factionGameSave');
        if (!raw) return false;
        const data = JSON.parse(raw);
        const uid = getCurrentUser()?.uid;
        if (uid && data.savedUid && data.savedUid !== uid) {
            clearLocalSave();
            return false;
        }
        const migrated = migrateSave(data);
        loadState(migrated);
        if (S.autoClicker.enabled && S.f) {
            if (S.autoClicker.timer) clearInterval(S.autoClicker.timer);
            S.autoClicker.timer = setInterval(() => {
                if (S.f && S.hp > 0) {
                    import('../combat/battle.js').then(({ attack }) => attack());
                }
            }, S.autoClicker.interval);
        }
        return true;
    } catch (e) { return false; }
};