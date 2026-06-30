import { S } from '../core/state.js';
import { EventBus } from '../core/eventBus.js';
import { CONFIG } from '../core/config.js';
import { addExp, levelUp } from '../progression/level.js';
import { spawnEnemy, updateFloor } from '../progression/floor.js';
import { saveGame } from '../core/storage.js';
import { showFloatingText } from '../ui/floatingText.js';

export const handleEnemyKill = (enemyStats) => {
    const c = S.combat;
    const p = S.progression;
    const pl = S.player;

    c.enemyHp = 0;

    const goldReward = Math.floor(enemyStats.gold || 2);
    const expReward = Math.floor(enemyStats.exp || 3);

    pl.gold += goldReward;
    pl.totalGold += goldReward;
    addExp(expReward);

    const enemyRect = document.getElementById('enemyContainer')?.getBoundingClientRect();
    if (enemyRect) {
        const x = enemyRect.left + enemyRect.width / 2 - 30;
        const y = enemyRect.top - 10;
        showFloatingText(x, y, `+${goldReward}G`, 'gold');
        showFloatingText(x, y + 35, `+${expReward}XP`, 'exp');
    }

    p.kills++;
    p.totalKills++;
    c.combo++;
    if (c.combo > c.maxCombo) c.maxCombo = c.combo;

    pl.hp = Math.min(pl.hp + pl.maxHp * 0.5, pl.maxHp);
    EventBus.emit('log:add', { msg: `[Heal] HP восстановлено до ${Math.floor(pl.hp)}`, cls: 'log-heal' });

    if (c.isBoss) {
        c.totalBossDefeated++;
        if (c.isSuperBoss) {
            EventBus.emit('log:add', {
                msg: `[SB] СУПЕР-БОСС ${enemyStats.name} ПОВЕРЖЕН! +${goldReward}G +${expReward}XP`,
                cls: 'log-super'
            });
            p.superBossCount++;
            const bonusGold = goldReward * 2;
            const bonusExp = expReward * 2;
            pl.gold += bonusGold;
            pl.totalGold += bonusGold;
            addExp(bonusExp);
            EventBus.emit('log:add', { msg: `[Bonus] БОНУС ЗА СУПЕР-БОССА: +${bonusGold}G +${bonusExp}XP`, cls: 'log-gold' });
            EventBus.emit('superBoss:defeated');
        } else {
            EventBus.emit('log:add', {
                msg: `[Boss] ${enemyStats.name} ПОВЕРЖЕН! +${goldReward}G +${expReward}XP`,
                cls: 'log-boss'
            });
        }
        c.isBoss = false;
        c.isSuperBoss = false;
        c.bossSkipped = false;
        c.bossAttempts = 0;
    } else {
        EventBus.emit('log:add', {
            msg: `[Kill] ${enemyStats.name}! +${goldReward}G +${expReward}XP`,
            cls: 'log-kill'
        });
    }

    levelUp();
    updateFloor();
    if (p.floorKills === 0) {
        c.bossSkipped = false;
    }

    spawnEnemy();
    saveGame();
    EventBus.emit('achievement:check');
};
