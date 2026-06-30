import { S } from '../core/state.js';
import { CONFIG } from '../core/config.js';
import { getF, getU, getUs } from '../core/utils.js';
import { PERKS } from '../perks/perks.js';
import { updateUI } from './hud.js';

const defaultBonuses = () => ({
    passive: 0, gold: 0, damage: 0, critChance: 0, critMultiplier: 1.5,
    armyPassive: 0, armyDamage: 0, hireDiscount: 0, boost: false,
    boostMul: 2, boostDur: 15, boostCD: 120, healRegen: 0, hpBonus: 0,
    defense: 0, factionBonus: {}
});

const applyFactionPassives = () => {
    const faction = getF();
    if (!faction?.unique?.passives) return;
    for (const passive of faction.unique.passives) {
        if (passive.apply) passive.apply(S);
    }
};

const applyPerks = () => {
    for (const id of S.faction.perks) {
        const perk = PERKS[id];
        if (perk?.apply) perk.apply(S);
    }
};

export const recalculateStats = () => {
    S.faction.bonuses = defaultBonuses();

    if (S.faction.id) {
        const faction = getF();
        for (const u of getUs()) {
            const lv = getU(u.id);
            if (!lv) continue;
            const val = u.e.v * lv;
            switch (u.e.t) {
                case 'passive': S.faction.bonuses.passive += val; break;
                case 'gold': S.faction.bonuses.gold += val; break;
                case 'damage': S.faction.bonuses.damage += val; break;
                case 'critChance': S.faction.bonuses.critChance = Math.min(CONFIG.limits.maxCritChance, S.faction.bonuses.critChance + val); break;
                case 'critMultiplier': S.faction.bonuses.critMultiplier = 1.5 + lv * 0.3; break;
                case 'armyPassive': S.faction.bonuses.armyPassive += val; break;
                case 'armyDamage': S.faction.bonuses.armyDamage += val; break;
                case 'hireDiscount': S.faction.bonuses.hireDiscount = Math.min(0.5, val); break;
                case 'healRegen': S.faction.bonuses.healRegen += val; break;
                case 'hpBonus': S.faction.bonuses.hpBonus += val; break;
                case 'defense': S.faction.bonuses.defense += val; break;
                case 'boost':
                    S.faction.bonuses.boostMul = u.e.v || 2;
                    S.faction.bonuses.boostDur = u.e.dur || 15;
                    S.faction.bonuses.boostCD = u.e.cd || 120;
                    break;
            }
        }
        if (faction?.multiplier) {
            S.faction.bonuses.damage = Math.floor(S.faction.bonuses.damage * faction.multiplier);
            S.faction.bonuses.gold = Math.floor(S.faction.bonuses.gold * faction.multiplier);
        }
        applyFactionPassives();
    }

    applyPerks();

    S.player.maxHp = 100 + (S.player.levelStats.hpBonus || 0) + (S.faction.bonuses.hpBonus || 0);
    if (S.player.hp > S.player.maxHp) S.player.hp = S.player.maxHp;
    updateUI();
};
