export const WEAPONS = [
    { id: 'weapon_001', name: 'Деревянный меч', tier: 1, baseDamage: 1, damagePerLevel: 0.5, baseCost: 5, costGrowth: 1.12, unlockCost: 0, desc: 'Простейший меч из дерева' },
    { id: 'weapon_002', name: 'Деревянный топор', tier: 2, baseDamage: 2, damagePerLevel: 0.8, baseCost: 10, costGrowth: 1.12, unlockCost: 25, desc: 'Топор для рубки дров и врагов' },
    { id: 'weapon_003', name: 'Деревянное копьё', tier: 3, baseDamage: 3, damagePerLevel: 1.0, baseCost: 15, costGrowth: 1.12, unlockCost: 50, desc: 'Острое копьё с деревянным древком' },
    { id: 'weapon_004', name: 'Деревянная дубина', tier: 4, baseDamage: 4, damagePerLevel: 1.2, baseCost: 20, costGrowth: 1.12, unlockCost: 100, desc: 'Тяжёлая дубина, дробит кости' },
    { id: 'weapon_005', name: 'Деревянный молот', tier: 5, baseDamage: 5, damagePerLevel: 1.5, baseCost: 25, costGrowth: 1.12, unlockCost: 150, desc: 'Увесистый молот для сокрушительных ударов' },
    { id: 'weapon_006', name: 'Деревянный щит', tier: 6, baseDamage: 2, damagePerLevel: 0.6, baseCost: 30, costGrowth: 1.12, unlockCost: 200, desc: 'Щит, которым можно не только защищаться' },
    { id: 'weapon_007', name: 'Деревянная алебарда', tier: 7, baseDamage: 6, damagePerLevel: 1.8, baseCost: 35, costGrowth: 1.12, unlockCost: 300, desc: 'Древковое оружие с широким лезвием' },
    { id: 'weapon_008', name: 'Деревянная коса', tier: 8, baseDamage: 4, damagePerLevel: 1.3, baseCost: 40, costGrowth: 1.12, unlockCost: 400, desc: 'Смертоносная коса с деревянной рукоятью' },
    { id: 'weapon_009', name: 'Деревянный цеп', tier: 9, baseDamage: 5, damagePerLevel: 1.6, baseCost: 45, costGrowth: 1.12, unlockCost: 500, desc: 'Цеп с шипами на конце' },
    { id: 'weapon_010', name: 'Деревянный посох', tier: 10, baseDamage: 3, damagePerLevel: 1.0, baseCost: 50, costGrowth: 1.12, unlockCost: 750, desc: 'Посох странника, скрывающий остриё' }
];

for (let i = 11; i <= 200; i++) {
    const eraIdx = Math.floor((i - 1) / 10);
    const posIdx = (i - 1) % 10;
    const ERA_NAMES = [
        'Деревянное', 'Каменное', 'Медное', 'Бронзовое', 'Железное',
        'Стальное', 'Мифриловое', 'Адамантиновое', 'Орихалковое', 'Магическое',
        'Легендарное', 'Мифическое', 'Божественное', 'Демоническое', 'Космическое',
        'Галактическое', 'Астральное', 'Вселенское', 'Изначальное', 'Абсолютное'
    ];
    const TYPES = [
        'меч', 'топор', 'копьё', 'дубина', 'молот',
        'щит', 'алебарда', 'коса', 'цеп', 'посох'
    ];
    const DMG_BASE = [1, 8, 25, 60, 150, 350, 800, 1800, 4000, 9000, 20000, 50000, 120000, 250000, 600000, 1200000, 2500000, 6000000, 12000000, 30000000];
    const DMG_PER_LVL = [0.5, 0.8, 1.0, 1.2, 1.5, 1.8, 2.0, 2.2, 2.5, 2.8, 3.0, 3.2, 3.5, 3.8, 4.0, 4.2, 4.5, 4.8, 5.0, 5.5];
    const COST_BASE = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 85, 100, 120, 150, 180, 220, 270, 330];

    const eraName = ERA_NAMES[eraIdx];
    const type = TYPES[posIdx];
    const name = `${eraName} ${type}`;
    const baseDamage = DMG_BASE[eraIdx];
    const dmgPerLvl = DMG_PER_LVL[eraIdx];
    const baseCost = COST_BASE[eraIdx];
    const unlockCost = Math.floor(10 * Math.pow(1.35, i - 2));

    WEAPONS.push({
        id: `weapon_${String(i).padStart(3, '0')}`,
        name,
        tier: i,
        baseDamage,
        damagePerLevel: dmgPerLvl,
        baseCost,
        costGrowth: 1.12,
        unlockCost,
        desc: `${eraName} оружие эпохи ${eraName.toLowerCase()}`
    });
}

export const getWeaponState = (state, weaponId) => {
    return state.weapons[weaponId] || { level: 0, unlocked: false };
};

export const getWeaponLevel = (state, weaponId) => {
    return getWeaponState(state, weaponId).level || 0;
};

export const getWeaponUnlocked = (state, weaponId) => {
    return getWeaponState(state, weaponId).unlocked || false;
};

export const getWeaponDamage = (state, weaponId) => {
    const wp = WEAPONS.find(w => w.id === weaponId);
    if (!wp) return 0;
    const ws = getWeaponState(state, weaponId);
    if (!ws.unlocked) return 0;
    return wp.baseDamage + wp.damagePerLevel * ws.level;
};

export const getTotalWeaponDamage = (state) => {
    let total = 0;
    for (const wp of WEAPONS) {
        total += getWeaponDamage(state, wp.id);
    }
    return total;
};

export const getActiveWeapons = (state) => {
    return WEAPONS.filter(w => getWeaponUnlocked(state, w.id));
};

export const getWeaponCount = (state) => {
    let count = 0;
    for (const wp of WEAPONS) {
        if (getWeaponUnlocked(state, wp.id)) count++;
    }
    return count;
};

export const getSynergyBonus = (state) => {
    const count = getWeaponCount(state);
    return count * 0.02;
};

export const getWeaponUpgradeCost = (state, weaponId) => {
    const wp = WEAPONS.find(w => w.id === weaponId);
    if (!wp) return Infinity;
    const level = getWeaponLevel(state, weaponId);
    return Math.floor(wp.baseCost * Math.pow(wp.costGrowth, level));
};

export const getWeaponUnlockCost = (weaponId) => {
    const wp = WEAPONS.find(w => w.id === weaponId);
    return wp ? wp.unlockCost : Infinity;
};

export const getMaxLevelForWeapon = (state, weaponId) => {
    return 100;
};

export const buyWeapon = (state, weaponId) => {
    const wp = WEAPONS.find(w => w.id === weaponId);
    if (!wp) return false;
    const ws = getWeaponState(state, weaponId);
    if (ws.unlocked) return false;
    const cost = wp.unlockCost;
    if (state.gold < cost) return false;
    state.gold -= cost;
    state.weapons[weaponId] = { level: 1, unlocked: true };
    return true;
};

export const upgradeWeapon = (state, weaponId) => {
    const wp = WEAPONS.find(w => w.id === weaponId);
    if (!wp) return false;
    const ws = getWeaponState(state, weaponId);
    if (!ws.unlocked) return false;
    const maxLvl = getMaxLevelForWeapon(state, weaponId);
    if (ws.level >= maxLvl) return false;
    const cost = getWeaponUpgradeCost(state, weaponId);
    if (state.gold < cost) return false;
    state.gold -= cost;
    ws.level++;
    return true;
};

export const getCurrentWeapon = (state) => {
    const id = state.weapon || 'weapon_001';
    return WEAPONS.find(w => w.id === id) || WEAPONS[0];
};
