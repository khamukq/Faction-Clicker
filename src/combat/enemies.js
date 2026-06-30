import { S } from '../core/state.js';
import { CONFIG } from '../core/config.js';
import { ICONS } from '../core/icons.js';

export const ENEMIES = [
    { name: 'Гоблин', emoji: 'G', iconSvg: ICONS.goblin, hp: 40, damage: 2, armor: 0, gold: 15, exp: 3 },
    { name: 'Орк', emoji: 'O', iconSvg: ICONS.orc, hp: 80, damage: 2, armor: 1, gold: 15, exp: 5 },
    { name: 'Тролль', emoji: 'T', iconSvg: ICONS.troll, hp: 150, damage: 2, armor: 2, gold: 30, exp: 10 },
    { name: 'Рыцарь', emoji: '[K]', iconSvg: ICONS.knight_face, hp: 250, damage: 7, armor: 3, gold: 54, exp: 18 },
    { name: 'Демон', emoji: '[D]', iconSvg: ICONS.demon, hp: 400, damage: 12, armor: 5, gold: 90, exp: 28 }
];

export const BOSSES = [
    { name: 'Гоблин-вожак', emoji: 'G!', iconSvg: ICONS.goblin, hp: 150, damage: 5, armor: 1, gold: 25, exp: 20 },
    { name: 'Орк-командир', emoji: 'O!', iconSvg: ICONS.orc, hp: 300, damage: 10, armor: 2, gold: 50, exp: 40 },
    { name: 'Тролль-старейшина', emoji: 'T!', iconSvg: ICONS.troll, hp: 500, damage: 15, armor: 3, gold: 100, exp: 70 },
    { name: 'Рыцарь-теней', emoji: '[K!]', iconSvg: ICONS.knight_face, hp: 800, damage: 20, armor: 5, gold: 150, exp: 100 },
    { name: 'Демон-инквизитор', emoji: '[D!]', iconSvg: ICONS.demon, hp: 1200, damage: 28, armor: 7, gold: 250, exp: 150 },
    { name: 'Король демонов', emoji: '[M]', iconSvg: ICONS.monster, hp: 2000, damage: 40, armor: 12, gold: 400, exp: 250 },
    { name: 'Древний дракон', emoji: '[Dr]', iconSvg: ICONS.dragon, hp: 3500, damage: 55, armor: 18, gold: 600, exp: 350 },
    { name: 'Повелитель тьмы', emoji: '[Sk]', iconSvg: ICONS.skull, hp: 5000, damage: 70, armor: 25, gold: 900, exp: 500 }
];

export const SUPER_BOSSES = [
    { name: 'Хранитель этажа 500', emoji: '[SB]', iconSvg: ICONS.superboss, hp: 10000, damage: 100, armor: 20, gold: 5000, exp: 2000 },
    { name: 'Повелитель 1000', emoji: '[SB]', iconSvg: ICONS.superboss, hp: 50000, damage: 250, armor: 40, gold: 20000, exp: 8000 },
    { name: 'Император 1500', emoji: '[SB]', iconSvg: ICONS.superboss, hp: 200000, damage: 500, armor: 80, gold: 80000, exp: 30000 },
    { name: 'Король 2000', emoji: '[SB]', iconSvg: ICONS.superboss, hp: 1000000, damage: 1000, armor: 150, gold: 300000, exp: 120000 },
    { name: 'Бог 2500', emoji: '[SB]', iconSvg: ICONS.superboss, hp: 5000000, damage: 2500, armor: 300, gold: 1000000, exp: 500000 }
];

/** Экспоненциальный рост HP — ×1.15 за уровень (как в Clicker Heroes) */
export const enemyScale = (base, lvl) => {
    const value = base * Math.pow(1.15, Math.max(0, lvl - 1));
    return Math.floor(value);
};

export const getEnemy = () => {
    const c = S.combat;
    const p = S.progression;
    if (c.isBoss && c.isSuperBoss) {
        const sbIndex = Math.min(Math.floor(p.floor / CONFIG.floors.superBossInterval) - 1, SUPER_BOSSES.length - 1);
        return SUPER_BOSSES[Math.max(0, sbIndex)] || SUPER_BOSSES[0];
    }
    if (c.isBoss) {
        const bossIdx = Math.min((p.floor || 1) - 1, BOSSES.length - 1);
        return BOSSES[Math.max(0, bossIdx)];
    }
    const idx = c.enemyIndex % ENEMIES.length;
    return ENEMIES[idx] || ENEMIES[0];
};

export const getEnemyStats = () => {
    const enemy = getEnemy();
    const c = S.combat;
    const p = S.progression;
    const pl = S.player;
    let lvl = p.floor || 1;
    if (c.isBoss && c.isSuperBoss) {
        lvl = p.floor;
    } else if (c.isBoss) {
        lvl = p.floor || 1;
    }

    if (c.isBoss && c.isSuperBoss) {
        const sbIndex = Math.min(Math.floor(p.floor / CONFIG.floors.superBossInterval) - 1, SUPER_BOSSES.length - 1);
        const sb = SUPER_BOSSES[Math.max(0, sbIndex)] || SUPER_BOSSES[0];
        const floorMult = 1 + Math.max(0, p.floor - 500) * 0.005;
        return {
            name: `${sb.name} (Супер-босс ${p.floor} этажа)`,
            emoji: sb.emoji,
            iconSvg: sb.iconSvg,
            hp: Math.floor(sb.hp * floorMult * CONFIG.floors.superBossMultiplier),
            damage: Math.floor(sb.damage * floorMult * CONFIG.floors.superBossMultiplier * 0.5),
            armor: sb.armor || 20,
            gold: Math.floor(sb.gold * floorMult * CONFIG.floors.superBossGoldMult),
            exp: Math.floor(sb.exp * floorMult * CONFIG.floors.superBossExpMult),
            level: p.floor,
            isBoss: true,
            isSuperBoss: true
        };
    }

    if (c.isBoss) {
        const bossIndex = Math.min((p.floor || 1) - 1, BOSSES.length - 1);
        const boss = BOSSES[Math.max(0, bossIndex)];
        const floorBonus = 1 + (p.floor - 1) * 0.05;
        const playerLevelBonus = 1 + (pl.level - 1) * 0.03;
        const scale = floorBonus * playerLevelBonus;
        return {
            name: `${boss.name} (этаж ${p.floor})`,
            emoji: boss.emoji,
            iconSvg: boss.iconSvg,
            hp: Math.floor(boss.hp * scale * CONFIG.difficulty.bossHealthMult),
            damage: Math.floor(boss.damage * scale * CONFIG.difficulty.bossDamageMult),
            armor: boss.armor || 1,
            gold: Math.floor(boss.gold * scale * CONFIG.difficulty.bossGoldMult),
            exp: Math.floor(boss.exp * scale * CONFIG.difficulty.bossExpMult),
            level: p.floor || 1,
            isBoss: true,
            isSuperBoss: false
        };
    }

    const scaledHp = enemyScale(enemy.hp, lvl);
    const scaledDamage = Math.max(1, Math.floor(enemy.damage * (1 + (lvl - 1) * 0.04)));
    // награда пропорциональна HP врага — как в Clicker Heroes
    const scaledGold = Math.max(1, Math.floor(scaledHp * 0.1 * CONFIG.difficulty.enemyGoldMult));
    const scaledExp = Math.max(1, Math.floor(scaledHp * 0.02 * CONFIG.difficulty.enemyExpMult));

    return {
        name: enemy.name,
        emoji: enemy.emoji,
        iconSvg: enemy.iconSvg,
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
