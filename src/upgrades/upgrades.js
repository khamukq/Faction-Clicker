export const COMMON_UPGRADES = [
    { id: 'damage_up', name: 'Сила удара', icon: '[X]', iconSvg: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#f5c842" stroke-width="2" stroke-linecap="round"><path d="M6 18L18 6M10 4L6 8M14 20L18 16"/></svg>', desc: '+10 урона', base: 1, mul: 1.3, e: { t: 'damage', v: 10 } },
    { id: 'crit_up', name: 'Меткость', icon: '🎯', desc: '+2% шанс крита', base: 50, mul: 1.4, e: { t: 'critChance', v: 0.02 } },
    { id: 'income_up', name: 'Налоги', icon: '💰', desc: '+3 золота/сек', base: 100, mul: 1.3, e: { t: 'gold', v: 3 } },
    { id: 'army_up', name: 'Наёмники', icon: '⚔️', desc: '+1 урон за отряд', base: 30, mul: 1.5, e: { t: 'armyDamage', v: 1 } },
    { id: 'heal_up', name: 'Лекарь', icon: '💚', desc: '+2 регенерации HP/сек', base: 1000, mul: 1.4, e: { t: 'healRegen', v: 2 } },
    { id: 'defense_up', name: 'Броня', icon: '🛡️', desc: '+1 защита', base: 3000, mul: 1.45, e: { t: 'defense', v: 1 } }
];