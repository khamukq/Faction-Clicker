/** Точка входа UI — реэкспорт модулей для обратной совместимости */

export { updateUI, updateHealthUI, updateEnemyUI, updateFloorUI, updateSuperBossIndicator, updateBossUI } from './hud.js';
export { addBattleLog } from './battleLog.js';
export { recalculateStats } from './stats.js';

export { renderUpgrades, buyUpgrade, activateBoost } from './tabs/upgrades.js';
export { renderFactions } from './tabs/factions.js';
export { renderActiveSkills, activateSkill } from './tabs/skills.js';
export { renderPerks, buyPerk } from './tabs/perks.js';
export { renderPrestige } from './tabs/prestige.js';
export { renderAscension } from './tabs/ascension.js';
export { renderAutoClickerUI } from './tabs/autoclickerTab.js';
export { renderClans } from './tabs/clans.js';
export { renderLevelStats } from './tabs/levelStats.js';
export { renderProfile } from './tabs/profile.js';
export { renderLeaderboard, showPlayerProfile } from './tabs/leaderboard.js';
export { renderAchievements } from './tabs/achievements.js';
