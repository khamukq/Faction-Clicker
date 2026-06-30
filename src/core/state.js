import { EventBus } from './eventBus.js';
import { defaultBonuses, CONFIG } from './config.js';

/* ───────────────── դոմены состояния ───────────────── */
const defaultState = {
    player: {
        level: 1, exp: 0, expToNext: 50, totalExp: 0,
        hp: 100, maxHp: 100,
        gold: 10, totalGold: 0,
        totalDamage: 0, crits: 0, hits: 0,
        nickname: '',
        rebirths: 0, rebirthMultiplier: 1,
        lastSave: Date.now(),
        boostTimer: null, boostCooldown: null,
        levelStats: { damageBonus: 0, hpBonus: 0, healBonus: 0, goldBonus: 0 },
        levelMilestones: [],
        a: 0, u: {}
    },
    combat: {
        enemyHp: 100, enemyMaxHp: 100,
        isBoss: false, isSuperBoss: false,
        combo: 0, maxCombo: 0,
        enemyIndex: 0,
        bossCount: 0, totalBossDefeated: 0,
        bossSkipped: false, bossAttempts: 0,
        bossMaxAttempts: CONFIG.difficulty.bossMaxAttempts
    },
    progression: {
        floor: 1, floorKills: 0,
        kills: 0, totalKills: 0,
        superBossCount: 0
    },
    meta: {
        prestigePoints: 0, totalPrestigePoints: 0,
        permanentMultiplier: 1,
        ascension: 0, ascensionPoints: 0
    },
    faction: {
        id: null, bonuses: defaultBonuses(),
        perks: [], achievements: [],
        activeSkills: {},
        clan: null, clanName: ''
    },
    auto: {
        enabled: false, level: 0,
        timer: null, interval: CONFIG.autoClicker.interval
    },
    weapons: {
        current: 'weapon_001',
        inventory: {}
    }
};

/* Карта старых плоских ключей → доменные пути */
const flatToDomain = {
    level: 'player.level', exp: 'player.exp',
    expToNext: 'player.expToNext', totalExp: 'player.totalExp',
    hp: 'player.hp', maxHp: 'player.maxHp',
    gold: 'player.gold', totalGold: 'player.totalGold',
    totalDamage: 'player.totalDamage',
    crits: 'player.crits', hits: 'player.hits',
    nickname: 'player.nickname',
    rebirths: 'player.rebirths',
    rebirthMultiplier: 'player.rebirthMultiplier',
    lastSave: 'player.lastSave',
    boostTimer: 'player.boostTimer',
    boostCooldown: 'player.boostCooldown',
    levelStats: 'player.levelStats',
    levelMilestones: 'player.levelMilestones',
    a: 'player.a', u: 'player.u',
    enemyHp: 'combat.enemyHp', enemyMaxHp: 'combat.enemyMaxHp',
    isBoss: 'combat.isBoss', isSuperBoss: 'combat.isSuperBoss',
    combo: 'combat.combo', maxCombo: 'combat.maxCombo',
    enemyIndex: 'combat.enemyIndex',
    bossCount: 'combat.bossCount',
    totalBossDefeated: 'combat.totalBossDefeated',
    bossSkipped: 'combat.bossSkipped',
    bossAttempts: 'combat.bossAttempts',
    bossMaxAttempts: 'combat.bossMaxAttempts',
    floor: 'progression.floor',
    floorKills: 'progression.floorKills',
    kills: 'progression.kills',
    totalKills: 'progression.totalKills',
    superBossCount: 'progression.superBossCount',
    prestigePoints: 'meta.prestigePoints',
    totalPrestigePoints: 'meta.totalPrestigePoints',
    permanentMultiplier: 'meta.permanentMultiplier',
    ascension: 'meta.ascension',
    ascensionPoints: 'meta.ascensionPoints',
    f: 'faction.id', b: 'faction.bonuses',
    perks: 'faction.perks', achievements: 'faction.achievements',
    activeSkills: 'faction.activeSkills',
    clan: 'faction.clan', clanName: 'faction.clanName',
    autoClicker: 'auto',
    weapon: 'weapons.current',
    weapons: 'weapons.inventory'
};

const DOMAIN_NAMES = ['player','combat','progression','meta','faction','auto','weapons'];

/* обратная карта: 'player.gold' → 'gold' */
const domainToFlat = {};
for (const [flat, domain] of Object.entries(flatToDomain)) {
    domainToFlat[domain] = flat;
}

let state = JSON.parse(JSON.stringify(defaultState));

function resolvePath(obj, path) {
    const parts = path.split('.');
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
    return { parent: cur, key: parts[parts.length - 1] };
}

/* доменные прокси — ловят S.player.gold = 5 */
function emitDomainChange(domain, key, value) {
    const fullPath = `${domain}.${key}`;
    const flatKey = domainToFlat[fullPath] || `${domain}.${key}`;
    EventBus.emit('state:changed', { key: flatKey, value, domain, subKey: key });
}

const domainHandler = (d) => ({
    set(target, key, value) {
        target[key] = value;
        emitDomainChange(d, key, value);
        return true;
    }
});

const domainProxies = {};
for (const d of DOMAIN_NAMES) {
    domainProxies[d] = new Proxy(state[d], domainHandler(d));
}

export const S = new Proxy(state, {
    get(target, key) {
        if (key in target) {
            if (DOMAIN_NAMES.includes(key)) return domainProxies[key];
            return target[key];
        }
        const path = flatToDomain[key];
        if (path) return resolvePath(target, path).parent[resolvePath(target, path).key];
        return undefined;
    },
    set(target, key, value) {
        if (key in target) {
            target[key] = value;
        } else {
            const path = flatToDomain[key];
            if (path) {
                const { parent, key: k } = resolvePath(target, path);
                parent[k] = value;
            } else {
                target[key] = value;
            }
        }
        EventBus.emit('state:changed', { key, value });
        return true;
    }
});

export function setNested(obj, path, value) {
    const keys = path.split('.');
    let cur = obj;
    for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
    cur[keys[keys.length - 1]] = value;
}

export function loadState(newState) {
    if (DOMAIN_NAMES.some(d => d in newState)) {
        for (const d of DOMAIN_NAMES) {
            if (newState[d]) Object.assign(S[d], newState[d]);
        }
    } else {
        for (const key of Object.keys(newState)) {
            S[key] = newState[key];
        }
    }
    EventBus.emit('state:loaded', state);
}

export function resetState() {
    const fresh = JSON.parse(JSON.stringify(defaultState));
    for (const d of DOMAIN_NAMES) {
        Object.assign(state[d], fresh[d]);
        domainProxies[d] = new Proxy(state[d], domainHandler(d));
    }
    EventBus.emit('state:reset');
}

/* для сохранения: экспортируем чистые данные без циклических ссылок */
export function getStateSnapshot() {
    return {
        player: { ...S.player },
        combat: { ...S.combat },
        progression: { ...S.progression },
        meta: { ...S.meta },
        faction: { ...S.faction, bonuses: { ...S.faction.bonuses } },
        auto: { enabled: S.auto.enabled, level: S.auto.level, interval: S.auto.interval },
        weapons: { current: S.weapons.current, inventory: { ...S.weapons.inventory } },
        version: CONFIG.VERSION,
        lastSave: Date.now()
    };
}