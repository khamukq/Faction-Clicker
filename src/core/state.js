import { EventBus } from './eventBus.js';
import { defaultBonuses, CONFIG } from './config.js';

const defaultState = {
    f: null,
    gold: 10,
    maxHp: 100,
    hp: 100,
    level: 1,
    exp: 0,
    expToNext: 50,
    totalExp: 0,
    kills: 0,
    combo: 0,
    maxCombo: 0,
    totalKills: 0,
    totalDamage: 0,
    totalGold: 0,
    crits: 0,
    hits: 0,
    enemyIndex: 0,
    enemyHp: 100,
    enemyMaxHp: 100,
    isBoss: false,
    isSuperBoss: false,
    bossCount: 0,
    totalBossDefeated: 0,
    bossSkipped: false,
    bossAttempts: 0,
    bossMaxAttempts: CONFIG.difficulty.bossMaxAttempts,
    a: 0,
    rebirths: 0,
    rebirthMultiplier: 1,
    prestigePoints: 0,
    totalPrestigePoints: 0,
    permanentMultiplier: 1,
    ascension: 0,
    ascensionPoints: 0,
    nickname: '',
    clan: null,
    clanName: '',
    u: {},
    b: defaultBonuses(),
    perks: [],
    achievements: [],
    boostTimer: null,
    boostCooldown: null,
    lastSave: Date.now(),
    activeSkills: {},
    levelStats: { damageBonus: 0, hpBonus: 0, healBonus: 0, goldBonus: 0 },
    levelMilestones: [],
    floor: 1,
    floorKills: 0,
    superBossCount: 0,
    autoClicker: {
        enabled: false,
        level: 0,
        timer: null,
        interval: CONFIG.autoClicker.interval
    }
};

let state = JSON.parse(JSON.stringify(defaultState));

export const S = new Proxy(state, {
    set(target, key, value) {
        target[key] = value;
        EventBus.emit('state:changed', { key, value });
        return true;
    }
});

export function setNested(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
}

export function loadState(newState) {
    for (const key of Object.keys(newState)) {
        S[key] = newState[key];
    }
    EventBus.emit('state:loaded', state);
}

export function resetState() {
    state = JSON.parse(JSON.stringify(defaultState));
    EventBus.emit('state:reset');
}