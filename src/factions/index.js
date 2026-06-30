import { COMMON_UPGRADES } from '../upgrades/upgrades.js';
import { CONFIG } from '../core/config.js';
import { ICONS } from '../core/icons.js';

export const F = {
    imp: {
        id: 'imp',
        name: 'Империя',
        emoji: '🏛️', iconSvg: ICONS.castle,
        color: '#c89b3c',
        style: 'Тактический. Власть через силу.',
        multiplier: 1.0,
        unique: {
            passives: [
                { id: 'imperial_will', desc: 'Урон +10% за 5 уровней', apply: (state) => { const bonus = Math.floor(state.level / 5) * 0.1; state.b.damage = Math.floor(state.b.damage * (1 + bonus)); } },
                { id: 'state_treasury', desc: 'Доход +3% за 1000 золота', apply: (state) => { const bonus = Math.min(Math.floor(state.totalGold / 1000) * 0.03, 0.5); state.b.gold = Math.floor(state.b.gold * (1 + bonus)); } }
            ],
            actives: [
                { id: 'imperial_order', name: 'Имперский приказ', icon: ICONS.lightning, iconText: '[B]', desc: '+50% урона на 10 сек', cooldown: 60, duration: 10,
                  effect: (state) => { state.b.factionBonus.imperial_order = { damageMult: 1.5, active: true }; },
                  deactivate: (state) => { delete state.b.factionBonus.imperial_order; } }
            ]
        },
        u: COMMON_UPGRADES
    },
    syn: {
        id: 'syn',
        name: 'Синдикат',
        emoji: '🥷', iconSvg: ICONS.shuriken,
        color: '#6b4c9a',
        style: 'Агрессивный. Сила в тени.',
        multiplier: 1.0,
        unique: {
            passives: [
                { id: 'shadow_strike', desc: 'Шанс крита +0.5% за уровень', apply: (state) => { const bonus = Math.min(state.level * 0.005, 0.25); state.b.critChance = Math.min(CONFIG.limits.maxCritChance, state.b.critChance + bonus); } },
                { id: 'blood_harvest', desc: '+2 урона за убийство (до 200)', apply: (state) => { const bonus = Math.min(state.totalKills * 0.5, 200); state.b.damage += bonus; } }
            ],
            actives: [
                { id: 'dark_ritual', name: 'Тёмный ритуал', icon: ICONS.crystal, iconText: '[R]', desc: 'x3 крит урон на 20 сек', cooldown: 90, duration: 20,
                  effect: (state) => { state.b.factionBonus.dark_ritual = { critMult: 3, active: true }; },
                  deactivate: (state) => { delete state.b.factionBonus.dark_ritual; } }
            ]
        },
        u: COMMON_UPGRADES
    },
    all: {
        id: 'all',
        name: 'Альянс',
        emoji: '🛡️', iconSvg: ICONS.shieldGreen,
        color: '#3c9b6b',
        style: 'Стабильный. Сила в единстве.',
        multiplier: 1.0,
        unique: {
            passives: [
                { id: 'alliance_shield', desc: '+5 HP за наёмника', apply: (state) => { state.b.hpBonus += (state.a || 0) * 5; } },
                { id: 'common_purse', desc: '+1% дохода за наёмника', apply: (state) => { state.b.gold += Math.floor(state.b.gold * (state.a || 0) * 0.01); } }
            ],
            actives: [
                { id: 'alliance_bond', name: 'Связь Альянса', icon: ICONS.healing, iconText: '[Heal]', desc: 'x5 регенерация на 15 сек', cooldown: 45, duration: 15,
                  effect: (state) => { state.b.factionBonus.alliance_bond = { healMult: 5, active: true }; },
                  deactivate: (state) => { delete state.b.factionBonus.alliance_bond; } }
            ]
        },
        u: COMMON_UPGRADES
    }
};