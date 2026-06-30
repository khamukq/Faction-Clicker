import { ICONS } from '../core/icons.js';

export const COMMON_UPGRADES = [
    { id: 'damage_up', name: 'Сила удара', icon: '[X]', iconSvg: ICONS.cross, desc: '+10 урона', base: 1, mul: 1.3, e: { t: 'damage', v: 10 } },
    { id: 'crit_up', name: 'Меткость', icon: '[T]', iconSvg: ICONS.target, desc: '+2% шанс крита', base: 50, mul: 1.4, e: { t: 'critChance', v: 0.02 } },
    { id: 'income_up', name: 'Налоги', icon: '[G]', iconSvg: ICONS.coin, desc: '+3 золота/сек', base: 100, mul: 1.3, e: { t: 'gold', v: 3 } },
    { id: 'army_up', name: 'Наёмники', icon: '[S]', iconSvg: ICONS.swords, desc: '+1 урон за отряд', base: 30, mul: 1.5, e: { t: 'armyDamage', v: 1 } },
    { id: 'heal_up', name: 'Лекарь', icon: '[H]', iconSvg: ICONS.healing, desc: '+2 регенерации HP/сек', base: 1000, mul: 1.4, e: { t: 'healRegen', v: 2 } },
    { id: 'defense_up', name: 'Броня', icon: '[D]', iconSvg: ICONS.shield, desc: '+1 защита', base: 3000, mul: 1.45, e: { t: 'defense', v: 1 } }
];