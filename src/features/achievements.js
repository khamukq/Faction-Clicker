import { S } from '../core/state.js';
import { EventBus } from '../core/eventBus.js';
import { CONFIG } from '../core/config.js';

export const ACHIEVEMENTS = {
    first_click: { id: 'first_click', name: 'Первый шаг', icon: '👆', desc: 'Нанести первый удар', check: () => S.totalDamage >= 1, reward: { gold: 5 } },
    kill_10: { id: 'kill_10', name: 'Охотник', icon: '🎯', desc: 'Убить 10 врагов', check: () => S.totalKills >= 10, reward: { gold: 20 } },
    kill_100: { id: 'kill_100', name: 'Мастер охоты', icon: '🏹', desc: 'Убить 100 врагов', check: () => S.totalKills >= 100, reward: { gold: 100 } },
    kill_1000: { id: 'kill_1000', name: 'Легенда', icon: '👑', desc: 'Убить 1000 врагов', check: () => S.totalKills >= 1000, reward: { gold: 500 } },
    combo_10: { id: 'combo_10', name: 'Комбо-мастер', icon: '🔥', desc: 'Набрать комбо 10', check: () => S.maxCombo >= 10, reward: { gold: 50 } },
    combo_50: { id: 'combo_50', name: 'Комбо-легенда', icon: '💥', desc: 'Набрать комбо 50', check: () => S.maxCombo >= 50, reward: { gold: 200 } },
    level_10: { id: 'level_10', name: 'Воин', icon: '⚔️', desc: 'Достичь 10 уровня', check: () => S.level >= 10, reward: { gold: 50 } },
    level_50: { id: 'level_50', name: 'Герой', icon: '🛡️', desc: 'Достичь 50 уровня', check: () => S.level >= 50, reward: { gold: 500 } },
    boss_5: { id: 'boss_5', name: 'Истребитель', icon: '👾', desc: 'Убить 5 боссов', check: () => S.totalBossDefeated >= 5, reward: { gold: 200 } },
    prestige_1: { id: 'prestige_1', name: 'Вечность', icon: '🌟', desc: 'Совершить престиж', check: () => S.prestigePoints >= 1, reward: { prestigeBonus: 0.1 } },
    ascension_1: { id: 'ascension_1', name: 'Вознесение', icon: '✨', desc: 'Совершить вознесение', check: () => S.ascension >= 1, reward: { ascensionBonus: 1 } }
};

export const checkAchievements = () => {
    if (!S.f) return;
    for (const [key, ach] of Object.entries(ACHIEVEMENTS)) {
        if (!S.achievements.includes(key) && ach.check()) {
            S.achievements.push(key);
            let rewardText = '';
            if (ach.reward.gold) {
                S.gold += ach.reward.gold;
                rewardText = `+${ach.reward.gold} золота`;
            }
            if (ach.reward.prestigeBonus) {
                S.permanentMultiplier = Math.min(
                    S.permanentMultiplier + ach.reward.prestigeBonus,
                    CONFIG.limits.maxPrestigeMultiplier
                );
                rewardText = `+${ach.reward.prestigeBonus*100}% к множителю`;
            }
            if (ach.reward.ascensionBonus) {
                S.ascension += ach.reward.ascensionBonus;
                rewardText = `+${ach.reward.ascensionBonus} уровень вознесения`;
            }
            EventBus.emit('log:add', { msg: `🏆 ${ach.icon} ${ach.name} - ${rewardText}`, cls: 'log-gold' });
            EventBus.emit('achievement:unlocked', { key });
        }
    }
};