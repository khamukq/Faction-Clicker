import { CONFIG } from '../core/config.js';
import { ICONS } from '../core/icons.js';

export const PERKS = {
    bloodlust: { id: 'bloodlust', name: 'Кровожадность', icon: ICONS.blood, iconText: '[Bld]', desc: '+5 урона', cost: 1, apply: (state) => { state.b.damage += 5; } },
    greed: { id: 'greed', name: 'Жадность', icon: ICONS.coin, iconText: '[G]', desc: '+5 золота/сек', cost: 1, apply: (state) => { state.b.gold += 5; } },
    titan: { id: 'titan', name: 'Титан', icon: ICONS.muscle, iconText: '[T]', desc: '+100 к макс HP', cost: 2, apply: (state) => { state.maxHp += 100; state.hp += 100; } },
    fortune: { id: 'fortune', name: 'Фортуна', icon: ICONS.clover, iconText: '[F]', desc: '+3% шанс крита', cost: 2, apply: (state) => { state.b.critChance = Math.min(CONFIG.limits.maxCritChance, state.b.critChance + 0.03); } },
    army: { id: 'army', name: 'Армия', icon: ICONS.swords, iconText: '[S]', desc: '+2 урона за наёмника', cost: 2, apply: (state) => { state.b.armyDamage += 2; } }
};