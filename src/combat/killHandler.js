import { S } from '../core/state.js';
import { EventBus } from '../core/eventBus.js';
import { CONFIG } from '../core/config.js';
import { addExp, levelUp } from '../progression/level.js';
import { spawnEnemy, updateFloor } from '../progression/floor.js';
import { saveGame } from '../core/storage.js';
import { showFloatingText } from '../ui/floatingText.js';

export const handleEnemyKill = (enemyStats) => {
    S.enemyHp = 0;

    const goldReward = Math.floor(enemyStats.gold || 2);
    const expReward = Math.floor(enemyStats.exp || 3);

    S.gold += goldReward;
    S.totalGold += goldReward;
    addExp(expReward);

    const enemyRect = document.getElementById('enemyContainer')?.getBoundingClientRect();
    if (enemyRect) {
        const x = enemyRect.left + enemyRect.width / 2 - 30;
        const y = enemyRect.top - 10;
        showFloatingText(x, y, `+${goldReward}G`, 'gold');
        showFloatingText(x, y + 35, `+${expReward}XP`, 'exp');
    }

    S.kills++;
    S.totalKills++;
    S.combo++;
    if (S.combo > S.maxCombo) S.maxCombo = S.combo;

    S.hp = Math.min(S.hp + S.maxHp * 0.5, S.maxHp);
    EventBus.emit('log:add', { msg: `[Heal] HP восстановлено до ${Math.floor(S.hp)}`, cls: 'log-heal' });

    if (S.isBoss) {
        S.totalBossDefeated++;
        if (S.isSuperBoss) {
            EventBus.emit('log:add', {
                msg: `[SB] СУПЕР-БОСС ${enemyStats.name} ПОВЕРЖЕН! +${goldReward}G +${expReward}XP`,
                cls: 'log-super'
            });
            S.superBossCount++;
            const bonusGold = goldReward * 2;
            const bonusExp = expReward * 2;
            S.gold += bonusGold;
            S.totalGold += bonusGold;
            addExp(bonusExp);
            EventBus.emit('log:add', { msg: `[Bonus] БОНУС ЗА СУПЕР-БОССА: +${bonusGold}G +${bonusExp}XP`, cls: 'log-gold' });
            EventBus.emit('superBoss:defeated');
        } else {
            EventBus.emit('log:add', {
                msg: `[Boss] ${enemyStats.name} ПОВЕРЖЕН! +${goldReward}G +${expReward}XP`,
                cls: 'log-boss'
            });
        }
        S.isBoss = false;
        S.isSuperBoss = false;
        S.bossSkipped = false;
        S.bossAttempts = 0;
    } else {
        EventBus.emit('log:add', {
            msg: `[Kill] ${enemyStats.name}! +${goldReward}G +${expReward}XP`,
            cls: 'log-kill'
        });
    }

    levelUp();
    updateFloor();
    if (S.floorKills === 0) {
        S.bossSkipped = false;
    }

    spawnEnemy();
    saveGame();
    EventBus.emit('achievement:check');
};
