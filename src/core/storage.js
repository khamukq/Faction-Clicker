import { S, loadState, getStateSnapshot } from './state.js';
import { CONFIG, defaultBonuses } from './config.js';
import { EventBus } from './eventBus.js';
import { fmt } from './utils.js';
import { getCurrentUser } from '../firebase/auth.js';
import { saveGameToFirebase as fbSave, loadGameFromFirebase as fbLoad } from '../firebase/db.js';

const getSaveData = () => {
    const snap = getStateSnapshot();
    snap.savedUid = getCurrentUser()?.uid || null;
    return snap;
};

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
        if (S.auto.enabled && S.faction.id) {
            if (S.auto.timer) clearInterval(S.auto.timer);
            S.auto.timer = setInterval(() => {
                if (S.faction.id && S.player.hp > 0) {
                    import('../combat/battle.js').then(({ attack }) => attack());
                }
            }, S.auto.interval);
        }
        return true;
    }
    return false;
};

// ... остальные функции migrateSave, loadGame, etc.
const flatToDomainKeys = {
    f: 'faction.id', b: 'faction.bonuses',
    clan: 'faction.clan', clanName: 'faction.clanName',
    perks: 'faction.perks', achievements: 'faction.achievements',
    activeSkills: 'faction.activeSkills',
    gold: 'player.gold', hp: 'player.hp', maxHp: 'player.maxHp',
    level: 'player.level', exp: 'player.exp', expToNext: 'player.expToNext',
    totalExp: 'player.totalExp',
    kills: 'progression.kills', totalKills: 'progression.totalKills',
    combo: 'combat.combo', maxCombo: 'combat.maxCombo',
    totalDamage: 'player.totalDamage', totalGold: 'player.totalGold',
    rebirths: 'player.rebirths', rebirthMultiplier: 'player.rebirthMultiplier',
    prestigePoints: 'meta.prestigePoints', totalPrestigePoints: 'meta.totalPrestigePoints',
    permanentMultiplier: 'meta.permanentMultiplier',
    ascension: 'meta.ascension', ascensionPoints: 'meta.ascensionPoints',
    nickname: 'player.nickname', crits: 'player.crits', hits: 'player.hits',
    enemyIndex: 'combat.enemyIndex', enemyHp: 'combat.enemyHp',
    enemyMaxHp: 'combat.enemyMaxHp', isBoss: 'combat.isBoss',
    isSuperBoss: 'combat.isSuperBoss',
    bossCount: 'combat.bossCount', bossSkipped: 'combat.bossSkipped',
    bossAttempts: 'combat.bossAttempts', bossMaxAttempts: 'combat.bossMaxAttempts',
    a: 'player.a', u: 'player.u',
    boostCooldown: 'player.boostCooldown',
    levelStats: 'player.levelStats', levelMilestones: 'player.levelMilestones',
    floor: 'progression.floor', floorKills: 'progression.floorKills',
    superBossCount: 'progression.superBossCount',
    weapon: 'weapons.current', weapons: 'weapons.inventory'
};

function setNestedPath(obj, path, value) {
    const parts = path.split('.');
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        if (!cur[parts[i]]) cur[parts[i]] = {};
        cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = value;
}

export const migrateSave = (data) => {
    if (!data.version || data.version < CONFIG.VERSION) {
        // Переводим плоский формат в доменный
        if (data.f !== undefined || data.weapon !== undefined) {
            const domain = {
                player: { levelStats: { damageBonus: 0, hpBonus: 0, healBonus: 0, goldBonus: 0 } },
                combat: {},
                progression: {},
                meta: {},
                faction: { bonuses: defaultBonuses(), perks: [], achievements: [], activeSkills: {}, clan: null, clanName: '' },
                auto: { enabled: false, level: 0, interval: CONFIG.autoClicker.interval },
                weapons: { current: 'weapon_001', inventory: {} }
            };
            for (const key of Object.keys(data)) {
                const path = flatToDomainKeys[key];
                if (path) setNestedPath(domain, path, data[key]);
            }
            if (!domain.weapons.inventory.weapon_001) {
                domain.weapons.inventory.weapon_001 = { level: 1, unlocked: true };
            }
            data = domain;
        } else {
            // уже доменный — доводим до актуальной структуры
            if (!data.faction) data.faction = { bonuses: defaultBonuses(), perks: [], achievements: [], activeSkills: {}, clan: null, clanName: '' };
            if (!data.player) data.player = {};
            if (!data.combat) data.combat = {};
            if (!data.progression) data.progression = {};
            if (!data.meta) data.meta = {};
            if (!data.auto) data.auto = { enabled: false, level: 0, interval: CONFIG.autoClicker.interval };
            if (!data.weapons) data.weapons = { current: 'weapon_001', inventory: {} };
            const defaultB = defaultBonuses();
            for (const key in defaultB) {
                if (!(key in data.faction.bonuses)) data.faction.bonuses[key] = defaultB[key];
            }
            if (!data.weapons.inventory.weapon_001) {
                data.weapons.inventory.weapon_001 = { level: 1, unlocked: true };
            }
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
        if (S.auto.enabled && S.faction.id) {
            if (S.auto.timer) clearInterval(S.auto.timer);
            S.auto.timer = setInterval(() => {
                if (S.faction.id && S.player.hp > 0) {
                    import('../combat/battle.js').then(({ attack }) => attack());
                }
            }, S.auto.interval);
        }
        return true;
    } catch (e) { return false; }
};