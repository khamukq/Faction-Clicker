import { S } from '../core/state.js';
import { CONFIG } from '../core/config.js';
import { RNG, getF } from '../core/utils.js';
import { EventBus } from '../core/eventBus.js';
import { getTotalWeaponDamage, getSynergyBonus, getWeaponCount } from '../upgrades/weapons.js';

const computeRawDamage = () => {
    const lvl = S.player.level;
    const faction = getF();
    const b = S.faction.bonuses;

    let base = 4;
    let levelMult = Math.pow(1.15, lvl);
    let armyBase = (S.player.a || 0) * 2;
    let armyBonus = (S.player.a || 0) * (b.armyDamage || 0);
    let totalArmyDamage = armyBase + armyBonus;
    let bonusDamage = b.damage || 0;
    let factionMult = faction?.multiplier || 1;

    let prestigeMult = 1 + Math.pow(S.meta.prestigePoints, 0.3) * 0.05;

    let ascensionMult = 1 + Math.log10(1 + S.meta.ascension) * 0.1;

    let weaponDamage = getTotalWeaponDamage(S) * (1 + getSynergyBonus(S));

    let dmg = (base + totalArmyDamage + bonusDamage + weaponDamage) * levelMult * factionMult * prestigeMult * ascensionMult;

    if (b.factionBonus?.imperial_order?.active) {
        dmg *= b.factionBonus.imperial_order.damageMult;
    }

    dmg *= (1 + Math.min(S.combat.combo * 0.002, 0.15));
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

    const b = S.faction.bonuses;
    const critChance = Math.min(b.critChance, CONFIG.limits.maxCritChance);
    if (RNG.chance(critChance)) {
        let critMult = b.critMultiplier || 1.5;
        if (b.factionBonus?.dark_ritual?.active) {
            critMult *= b.factionBonus.dark_ritual.critMult;
        }
        dmg *= critMult;
        S.player.crits++;
        EventBus.emit('log:add', { msg: `[Crit] КРИТ! x${critMult.toFixed(1)}`, cls: 'log-damage' });
    }

    dmg = Math.floor(dmg);
    dmg = Math.min(dmg, CONFIG.limits.maxDamage);

    return dmg;
};

export const computeIncome = () => {
    const lvl = S.player.level;
    const faction = getF();
    const b = S.faction.bonuses;

    let levelBonus = S.player.levelStats.goldBonus || 0;
    let income = (b.passive || 0) + (b.gold || 0) + levelBonus + (S.player.a || 0) * (b.armyPassive || 0);
    income *= (1 + Math.pow(lvl, 0.3) * 0.02);
    income *= (1 + Math.log10(1 + S.meta.prestigePoints) * 0.05);
    if (faction) income *= faction.multiplier;
    income *= (1 + S.meta.ascension * 0.1);
    if (b.boost) income *= b.boostMul || 2;

    income = Math.floor(income);
    income = Math.min(income, CONFIG.limits.maxIncome);

    return income;
};