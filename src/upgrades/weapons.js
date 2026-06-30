export const WEAPONS = [
    { id: 'weapon_001', name: 'Каменный меч', icon: '🪨', tier: 1, description: 'Простой меч из камня' },
    { id: 'weapon_002', name: 'Каменный топор', icon: '🪨', tier: 2, description: 'Топор из кремня' },
    { id: 'weapon_003', name: 'Каменное копьё', icon: '🔱', tier: 3, description: 'Копьё с каменным наконечником' },
    { id: 'weapon_004', name: 'Каменная секира', icon: '🪓', tier: 4, description: 'Тяжёлая каменная секира' },
    { id: 'weapon_005', name: 'Каменный молот', icon: '🔨', tier: 5, description: 'Молот из твёрдого камня' },
    { id: 'weapon_006', name: 'Медный меч', icon: '🟠', tier: 6, description: 'Короткий меч из меди' },
    { id: 'weapon_007', name: 'Медный топор', icon: '🟠', tier: 7, description: 'Топор из литой меди' },
    { id: 'weapon_008', name: 'Медное копьё', icon: '🔱', tier: 8, description: 'Копьё с медным наконечником' },
    { id: 'weapon_009', name: 'Медная секира', icon: '🪓', tier: 9, description: 'Боевая секира из меди' },
    { id: 'weapon_010', name: 'Медный молот', icon: '🔨', tier: 10, description: 'Молот из меди' },
    { id: 'weapon_011', name: 'Железный меч', icon: '⚙️', tier: 11, description: 'Кованый железный меч' },
    { id: 'weapon_012', name: 'Железный топор', icon: '⚙️', tier: 12, description: 'Тяжёлый железный топор' },
    { id: 'weapon_013', name: 'Железное копьё', icon: '🔱', tier: 13, description: 'Копьё с железным наконечником' },
    { id: 'weapon_014', name: 'Железная секира', icon: '⚙️', tier: 14, description: 'Большая железная секира' },
    { id: 'weapon_015', name: 'Железный молот', icon: '🔨', tier: 15, description: 'Боевой молот из железа' },
    { id: 'weapon_016', name: 'Валирийский меч', icon: '🗡️', tier: 16, description: 'Клинок из валирийской стали' },
    { id: 'weapon_017', name: 'Драконоборец', icon: '🐉', tier: 17, description: 'Меч, убивший тысячи драконов' },
    { id: 'weapon_018', name: 'Экскалибур', icon: '⚔️', tier: 18, description: 'Легендарный меч короля Артура' },
    { id: 'weapon_019', name: 'Клинок Вечности', icon: '♾️', tier: 19, description: 'Оружие, существующее вне времени' },
    { id: 'weapon_020', name: 'Меч Судьбы', icon: '♠️', tier: 20, description: 'Клинок, изменяющий предначертанное' },
    { id: 'weapon_021', name: 'Громовой меч', icon: '⚡', tier: 21, description: 'Меч с молниями внутри' },
    { id: 'weapon_022', name: 'Клинок Хаоса', icon: '🌀', tier: 22, description: 'Оружие, несущее хаос мироздания' },
    { id: 'weapon_023', name: 'Божественный меч', icon: '👼', tier: 23, description: 'Оружие, созданное самими богами' },
    { id: 'weapon_024', name: 'Космический меч', icon: '🚀', tier: 24, description: 'Клинок из звёздной пыли' },
    { id: 'weapon_025', name: 'Абсолютный клинок', icon: '💠', tier: 25, description: 'Клинок, превосходящий всё' },
];

export const ERA_NAMES = [
    'Каменное', 'Медное', 'Железное', 'Валирийское', 'Эпическое'
];

for (const wp of WEAPONS) {
    const t = wp.tier;
    const eraIdx = Math.floor((t - 1) / 5);
    const posInEra = (t - 1) % 5;
    wp.eraIndex = eraIdx;
    wp.era = ERA_NAMES[eraIdx] || '';
    const dmgPow = Math.pow(100, eraIdx);          // ×100 урона между эпохами
    const costPow = Math.pow(10, eraIdx);           // ×10 стоимости апгрейда
    const unlockPow = Math.pow(100, eraIdx);        // ×100 стоимости анлока
    wp.baseDamage = Math.floor(dmgPow + dmgPow * posInEra * 2);
    wp.damagePerLevel = +(wp.baseDamage * 0.1).toFixed(1);
    // апгрейд растёт ×10/эпоха, анлок ×100/эпоха — полный апгрейд эпохи
    // всегда дешевле, чем первый анлок следующей
    wp.baseCost = Math.floor(costPow * 20 + costPow * posInEra * 5);
    wp.costGrowth = 1.07;
    wp.unlockCost = t === 1 ? 0 : Math.floor(unlockPow * 2000 + unlockPow * posInEra * 500);
    wp.maxLevel = 50;
}

export const getWeaponEra = (wp) => ERA_NAMES[Math.floor((wp.tier - 1) / 5)] || '';
export const getWeaponEraIndex = (wp) => Math.floor((wp.tier - 1) / 5);

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
    return wp.baseDamage + wp.damagePerLevel * Math.pow(ws.level, 1.15);
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
    return count * 0.05;
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
    return 50;
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

export const upgradeWeaponN = (state, weaponId, n) => {
    let upgraded = 0;
    for (let i = 0; i < n; i++) {
        const cost = getWeaponUpgradeCost(state, weaponId);
        if (state.gold < cost) break;
        const ws = getWeaponState(state, weaponId);
        if (ws.level >= getMaxLevelForWeapon(state, weaponId)) break;
        state.gold -= cost;
        ws.level++;
        upgraded++;
    }
    return upgraded;
};

export const upgradeWeaponMax = (state, weaponId) => {
    let upgraded = 0;
    const maxLvl = getMaxLevelForWeapon(state, weaponId);
    while (true) {
        const ws = getWeaponState(state, weaponId);
        if (ws.level >= maxLvl) break;
        const cost = getWeaponUpgradeCost(state, weaponId);
        if (state.gold < cost) break;
        state.gold -= cost;
        ws.level++;
        upgraded++;
    }
    return upgraded;
};

export const getCurrentWeapon = (state) => {
    const id = state.weapon || 'weapon_001';
    return WEAPONS.find(w => w.id === id) || WEAPONS[0];
};
