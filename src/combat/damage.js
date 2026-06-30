import { S } from '../core/state.js';
import { CONFIG } from '../core/config.js';
import { RNG, getF } from '../core/utils.js';
import { EventBus } from '../core/eventBus.js';

const computeRawDamage = () => {
    const lvl = S.level;
    const faction = getF();

    let base = 4 + lvl * 0.8;
    let levelBonus = S.levelStats.damageBonus || 0;
    let armyBase = (S.a || 0) * 2;
    let armyBonus = (S.a || 0) * (S.b.armyDamage || 0);
    let totalArmyDamage = armyBase + armyBonus;
    let bonusDamage = S.b.damage || 0;
    let factionMult = faction?.multiplier || 1;

    let prestigeMult = 1 + Math.log10(1 + S.prestigePoints) * 0.15;
    prestigeMult = Math.min(prestigeMult, CONFIG.limits.maxPrestigeMultiplier);

    let ascensionMult = 1 + S.ascension * 0.1;

    let dmg = (base + levelBonus + totalArmyDamage + bonusDamage) * factionMult * prestigeMult * ascensionMult;

    if (S.b.factionBonus?.imperial_order?.active) {
        dmg *= S.b.factionBonus.imperial_order.damageMult;
    }

    dmg *= (1 + Math.min(S.combo * 0.002, 0.15));
    return dmg;
};

/** Базовый урон без случайного крита — для отображения в HUD */
export const computeBaseDamage = () => {
    let dmg = Math.floor(computeRawDamage());
    return Math.min(dmg, CONFIG.limits.maxDamage);
};

/** Урон по текущему врагу с учётом брони (без крита) */
export const computeEffectiveDamage = (enemyStats) => {
    const armor = enemyStats?.armor || 0;
    const armorReduction = armor * CONFIG.difficulty.armorReduction;
    return Math.max(1, Math.floor(computeBaseDamage() - armorReduction));
};

export const computeDamage = () => {
    let dmg = computeRawDamage();

    const critChance = Math.min(S.b.critChance, CONFIG.limits.maxCritChance);
    if (RNG.chance(critChance)) {
        let critMult = S.b.critMultiplier || 1.5;
        if (S.b.factionBonus?.dark_ritual?.active) {
            critMult *= S.b.factionBonus.dark_ritual.critMult;
        }
        dmg *= critMult;
        S.crits++;
        EventBus.emit('log:add', { msg: `💥 КРИТ! x${critMult.toFixed(1)}`, cls: 'log-damage' });
    }

    dmg = Math.floor(dmg);
    dmg = Math.min(dmg, CONFIG.limits.maxDamage);

    return dmg;
};

export const computeIncome = () => {
    const lvl = S.level;
    const faction = getF();

    let levelBonus = S.levelStats.goldBonus || 0;
    let income = (S.b.passive || 0) + (S.b.gold || 0) + levelBonus + (S.a || 0) * (S.b.armyPassive || 0);
    income *= (1 + Math.log10(1 + lvl) * 0.15);
    income *= (1 + Math.log10(1 + S.prestigePoints) * 0.2);
    if (faction) income *= faction.multiplier;
    income *= (1 + S.ascension * 0.1);
    if (S.b.boost) income *= S.b.boostMul || 2;

    income = Math.floor(income);
    income = Math.min(income, CONFIG.limits.maxIncome);

    return income;
};