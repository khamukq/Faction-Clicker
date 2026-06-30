export const CONFIG = {
VERSION: 12,
prestigeFormula: (totalGold) => {
    if (totalGold < 100000) return 0;
    let p = Math.log1p(totalGold / 50000);
    p = Math.pow(p, 1.2);
    return Math.floor(p);
},
limits: {
maxPrestigeMultiplier: 3.0,
maxIncome: 200000,
maxCritChance: 0.7,
maxDamage: Infinity,
maxPower: 150,
maxHealth: 20000,
maxEnemyHp: Infinity
},
difficulty: {
enemyGoldMult: 1.0,
enemyExpMult: 1.0,
hpGrowth: 0.12,
rewardGrowth: 0.08,
armorReduction: 0.15,
upgradeBaseMult: 1.35,
hireBaseMult: 1.2,
comboDecaySeconds: 3,
bossInterval: 25,
offlineMaxSeconds: 3600,
prestigeGrowth: 1.1,
enemyAttackInterval: 2000,
bossSkipCost: 0,
bossMaxAttempts: 5,
bossHealthMult: 1.25,
bossDamageMult: 0.85,
bossGoldMult: 5,
bossExpMult: 4
},
autoClicker: {
enabled: false,
interval: 1000,
cost: 100,
upgradeCost: 150,
maxLevel: 10,
speedPerLevel: 50
},
levelSystem: {
expFormula: (level) => Math.floor(50 * Math.pow(1.25, level - 1)),
bonuses: {
damagePerLevel: 1.5,
hpPerLevel: 8,
healPerLevel: 0.2,
goldPerLevel: 0.5
},
maxLevel: 100,
milestones: {
5: { gold: 50, desc: 'Новичок' },
10: { gold: 100, desc: 'Воин' },
25: { gold: 300, desc: 'Ветеран' },
50: { gold: 800, desc: 'Герой' },
75: { gold: 1500, desc: 'Легенда' },
100: { gold: 3000, desc: 'Миф' }
}
},
floors: {
enemiesPerFloor: 10,
superBossInterval: 500,
superBossMultiplier: 10,
superBossGoldMult: 20,
superBossExpMult: 15,
floorBonus: 1.1
}
};

export const defaultBonuses = () => ({
passive: 0,
gold: 0,
damage: 0,
critChance: 0,
critMultiplier: 1.5,
armyPassive: 0,
armyDamage: 0,
hireDiscount: 0,
boost: false,
boostMul: 2,
boostDur: 15,
boostCD: 120,
healRegen: 0,
hpBonus: 0,
defense: 0,
factionBonus: {}
});