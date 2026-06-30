import { S } from '../core/state.js';
import { EventBus } from '../core/eventBus.js';
import { resetGame } from './reset.js';
import { spawnEnemy } from './floor.js';
import { recalculateStats, updateUI } from '../ui/renderer.js';
import { saveGame } from '../core/storage.js';
import { addToLeaderboard } from '../features/leaderboard.js';

export const getAscensionGain = () => Math.floor(Math.log1p(S.prestigePoints) * 0.5);

export const performAscension = () => {
    const gain = getAscensionGain();
    if (gain <= 0 || S.prestigePoints < 5) {
        EventBus.emit('log:add', { msg: '❌ Нужно больше очков престижа для вознесения!', cls: 'log-damage' });
        return;
    }

    if (confirm(`🌟 ВОЗНЕСЕНИЕ!\n\nВы получите ${gain} очков вознесения.\nСила умножится на ${(1 + (S.ascension + 1) * 0.1).toFixed(2)}x\n\nПродолжить?`)) {
        S.ascensionPoints += gain;
        S.ascension++;
        S.prestigePoints = 0;
        S.permanentMultiplier = 1;

        resetGame();
        spawnEnemy();
        recalculateStats();
        updateUI();
        saveGame();
        addToLeaderboard();
        EventBus.emit('log:add', { msg: `🌟 ВОЗНЕСЕНИЕ! Уровень ${S.ascension}!`, cls: 'log-boss' });
        EventBus.emit('ascension:done');
    }
};