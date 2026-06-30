import { ICONS } from '../core/icons.js';

export const COMMON_UPGRADES = [
    { id: 'army_up', name: 'Наёмники', icon: '[S]', iconSvg: ICONS.swords, desc: '+1 урон за отряд', base: 30, mul: 1.5, e: { t: 'armyDamage', v: 1 } }
];