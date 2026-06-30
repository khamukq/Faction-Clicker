import { S } from '../core/state.js';
import { EventBus } from '../core/eventBus.js';

export const resetGame = () => {
    S.gold = 10;
    S.maxHp = 100;
    S.hp = 100;
    S.level = 1;
    S.exp = 0;
    S.expToNext = 50;
    S.totalExp = 0;
    S.kills = 0;
    S.combo = 0;
    S.totalKills = 0;
    S.a = 0;
    S.u = {};
    S.isBoss = false;
    S.isSuperBoss = false;
    S.bossCount = 0;
    S.bossSkipped = false;
    S.bossAttempts = 0;
    S.activeSkills = {};
    S.levelStats = { damageBonus: 0, hpBonus: 0, healBonus: 0, goldBonus: 0 };
    S.floor = 1;
    S.floorKills = 0;
    S.superBossCount = 0;
    if (S.autoClicker.timer) {
        clearInterval(S.autoClicker.timer);
        S.autoClicker.timer = null;
    }
    S.autoClicker.enabled = false;
    S.weapon = 'weapon_001';
    S.weapons = {};
    EventBus.emit('gameReset');
};