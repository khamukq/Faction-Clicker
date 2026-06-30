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
    for (const id of S.perks) {
        const perk = PERKS[id];
        if (perk?.apply) perk.apply(S);
    }
};

export const recalculateStats = () => {
    S.b = defaultBonuses();

    if (S.f) {
        const faction = getF();
        for (const u of getUs()) {
            const lv = getU(u.id);
            if (!lv) continue;
            const val = u.e.v * lv;
            switch (u.e.t) {
                case 'passive': S.b.passive += val; break;
                case 'gold': S.b.gold += val; break;
                case 'damage': S.b.damage += val; break;
                case 'critChance': S.b.critChance = Math.min(CONFIG.limits.maxCritChance, S.b.critChance + val); break;
                case 'critMultiplier': S.b.critMultiplier = 1.5 + lv * 0.3; break;
                case 'armyPassive': S.b.armyPassive += val; break;
                case 'armyDamage': S.b.armyDamage += val; break;
                case 'hireDiscount': S.b.hireDiscount = Math.min(0.5, val); break;
                case 'healRegen': S.b.healRegen += val; break;
                case 'hpBonus': S.b.hpBonus += val; break;
                case 'defense': S.b.defense += val; break;
                case 'boost':
                    S.b.boostMul = u.e.v || 2;
                    S.b.boostDur = u.e.dur || 15;
                    S.b.boostCD = u.e.cd || 120;
                    break;
            }
        }
        if (faction?.multiplier) {
            S.b.damage = Math.floor(S.b.damage * faction.multiplier);
            S.b.gold = Math.floor(S.b.gold * faction.multiplier);
        }
        applyFactionPassives();
    }

    applyPerks();

    S.maxHp = 100 + (S.levelStats.hpBonus || 0) + (S.b.hpBonus || 0);
    if (S.hp > S.maxHp) S.hp = S.maxHp;
    updateUI();
};
