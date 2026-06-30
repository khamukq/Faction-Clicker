import { S } from '../core/state.js';
import { CONFIG } from '../core/config.js';

export const ENEMIES = [
    { name: 'Гоблин', emoji: '👹', hp: 40, damage: 2, armor: 0, gold: 2, exp: 3 },
    { name: 'Орк', emoji: '👺', hp: 80, damage: 5, armor: 1, gold: 4, exp: 5 },
    { name: 'Тролль', emoji: '🧌', hp: 150, damage: 8, armor: 2, gold: 8, exp: 10 },
    { name: 'Рыцарь', emoji: '⚔️', hp: 250, damage: 12, armor: 3, gold: 18, exp: 18 },
    { name: 'Демон', emoji: '👿', hp: 400, damage: 18, armor: 5, gold: 35, exp: 28 }
];

export const BOSSES = [
    { name: 'Гоблин-вожак', emoji: '👹', hp: 150, damage: 5, armor: 1, gold: 25, exp: 20 },
    { name: 'Орк-командир', emoji: '👺', hp: 300, damage: 10, armor: 2, gold: 50, exp: 40 },
    { name: 'Тролль-старейшина', emoji: '🧌', hp: 500, damage: 15, armor: 3, gold: 100, exp: 70 },
    { name: 'Рыцарь-теней', emoji: '⚔️', hp: 800, damage: 20, armor: 5, gold: 150, exp: 100 },
    { name: 'Демон-инквизитор', emoji: '👿', hp: 1200, damage: 28, armor: 7, gold: 250, exp: 150 },
    { name: 'Король демонов', emoji: '👾', hp: 2000, damage: 40, armor: 12, gold: 400, exp: 250 },
    { name: 'Древний дракон', emoji: '🐉', hp: 3500, damage: 55, armor: 18, gold: 600, exp: 350 },
    { name: 'Повелитель тьмы', emoji: '💀', hp: 5000, damage: 70, armor: 25, gold: 900, exp: 500 }
];

export const SUPER_BOSSES = [
    { name: 'Хранитель этажа 500', emoji: '👾', hp: 10000, damage: 100, armor: 20, gold: 5000, exp: 2000 },
    { name: 'Повелитель 1000', emoji: '👾', hp: 50000, damage: 250, armor: 40, gold: 20000, exp: 8000 },
    { name: 'Император 1500', emoji: '👾', hp: 200000, damage: 500, armor: 80, gold: 80000, exp: 30000 },
    { name: 'Король 2000', emoji: '👾', hp: 1000000, damage: 1000, armor: 150, gold: 300000, exp: 120000 },
    { name: 'Бог 2500', emoji: '👾', hp: 5000000, damage: 2500, armor: 300, gold: 1000000, exp: 500000 }
];

/** Линейный рост HP — предсказуемый и сбалансированный */
export const enemyScale = (base, lvl) => {
    const growth = CONFIG.difficulty.hpGrowth;
    const value = base * (1 + (Math.max(1, lvl) - 1) * growth);
    return Math.min(Math.floor(value), CONFIG.limits.maxEnemyHp);
};

export const getEnemy = () => {
    if (S.isBoss && S.isSuperBoss) {
        const sbIndex = Math.min(Math.floor(S.floor / CONFIG.floors.superBossInterval) - 1, SUPER_BOSSES.length - 1);
        return SUPER_BOSSES[Math.max(0, sbIndex)] || SUPER_BOSSES[0];
    }
    if (S.isBoss) {
        const bossIdx = Math.min((S.floor || 1) - 1, BOSSES.length - 1);
        return BOSSES[Math.max(0, bossIdx)];
    }
    const idx = S.enemyIndex % ENEMIES.length;
    return ENEMIES[idx] || ENEMIES[0];
};

export const getEnemyStats = () => {
    const enemy = getEnemy();
    let lvl = S.floor || 1;
    if (S.isBoss && S.isSuperBoss) {
        lvl = S.floor;
    } else if (S.isBoss) {
        lvl = S.floor || 1;
    }

    if (S.isBoss && S.isSuperBoss) {
        const sbIndex = Math.min(Math.floor(S.floor / CONFIG.floors.superBossInterval) - 1, SUPER_BOSSES.length - 1);
        const sb = SUPER_BOSSES[Math.max(0, sbIndex)] || SUPER_BOSSES[0];
        const floorMult = 1 + Math.max(0, S.floor - 500) * 0.005;
        return {
            name: `${sb.name} (Супер-босс ${S.floor} этажа)`,
            emoji: sb.emoji,
            hp: Math.floor(sb.hp * floorMult * CONFIG.floors.superBossMultiplier),
            damage: Math.floor(sb.damage * floorMult * CONFIG.floors.superBossMultiplier * 0.5),
            armor: sb.armor || 20,
            gold: Math.floor(sb.gold * floorMult * CONFIG.floors.superBossGoldMult),
            exp: Math.floor(sb.exp * floorMult * CONFIG.floors.superBossExpMult),
            level: S.floor,
            isBoss: true,
            isSuperBoss: true
        };
    }

    if (S.isBoss) {
        const bossIndex = Math.min((S.floor || 1) - 1, BOSSES.length - 1);
        const boss = BOSSES[Math.max(0, bossIndex)];
        const floorBonus = 1 + (S.floor - 1) * 0.05;
        const playerLevelBonus = 1 + (S.level - 1) * 0.03;
        const scale = floorBonus * playerLevelBonus;
        return {
            name: `${boss.name} (этаж ${S.floor})`,
            emoji: boss.emoji,
            hp: Math.floor(boss.hp * scale * CONFIG.difficulty.bossHealthMult),
            damage: Math.floor(boss.damage * scale * CONFIG.difficulty.bossDamageMult),
            armor: boss.armor || 1,
            gold: Math.floor(boss.gold * scale * CONFIG.difficulty.bossGoldMult),
            exp: Math.floor(boss.exp * scale * CONFIG.difficulty.bossExpMult),
            level: S.floor || 1,
            isBoss: true,
            isSuperBoss: false
        };
    }

    const scaledHp = enemyScale(enemy.hp, lvl);
    const scaledDamage = Math.max(1, Math.floor(enemy.damage * (1 + (lvl - 1) * 0.04)));
    const rewardMult = 1 + (lvl - 1) * CONFIG.difficulty.rewardGrowth;
    const scaledGold = Math.floor(enemy.gold * rewardMult * CONFIG.difficulty.enemyGoldMult);
    const scaledExp = Math.floor(enemy.exp * rewardMult * CONFIG.difficulty.enemyExpMult);

    return {
        name: enemy.name,
        emoji: enemy.emoji,
        hp: scaledHp,
        damage: scaledDamage,
        armor: enemy.armor || 0,
        gold: Math.max(1, scaledGold),
        exp: Math.max(1, scaledExp),
        level: lvl,
        isBoss: false,
        isSuperBoss: false
    };
};
