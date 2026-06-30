import { S } from '../core/state.js';
import { CONFIG } from '../core/config.js';
import { EventBus } from '../core/eventBus.js';
import { resetGame } from './reset.js';
import { spawnEnemy } from './floor.js';
import { recalculateStats, updateUI } from '../ui/renderer.js';
import { saveGame } from '../core/storage.js';
import { addToLeaderboard } from '../features/leaderboard.js';

export const calculatePrestigePoints = () => CONFIG.prestigeFormula(S.totalGold);

export const performPrestige = () => {
    const potential = calculatePrestigePoints();
    if (S.totalGold < 100000 || potential <= S.prestigePoints) return;

    const gained = potential - S.prestigePoints;
    const newMultiplier = 1 + Math.log1p(S.totalPrestigePoints + gained) * 0.12;

    if (confirm(`[Prestige] ПРЕСТИЖ!\n\nВы получите ${gained} очков престижа.\nПостоянный множитель станет x${Math.min(newMultiplier, CONFIG.limits.maxPrestigeMultiplier).toFixed(2)}\n\nВСЁ будет сброшено!\n\nПродолжить?`)) {
        S.prestigePoints += gained;
        S.totalPrestigePoints += gained;
        S.permanentMultiplier = Math.min(newMultiplier, CONFIG.limits.maxPrestigeMultiplier);

        resetGame();
        spawnEnemy();
        recalculateStats();
        updateUI();
        saveGame();
        addToLeaderboard();
        EventBus.emit('log:add', { msg: `[Prestige] ПРЕСТИЖ! +${gained} очков! x${S.permanentMultiplier.toFixed(2)}`, cls: 'log-boss' });
        EventBus.emit('prestige:done');
    }
};