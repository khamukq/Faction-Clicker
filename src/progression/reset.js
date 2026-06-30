import { S } from '../core/state.js';
import { EventBus } from '../core/eventBus.js';

export const resetGame = () => {
    S.player.gold = 10;
    S.player.maxHp = 100;
    S.player.hp = 100;
    S.player.level = 1;
    S.player.exp = 0;
    S.player.expToNext = 50;
    S.player.totalExp = 0;
    S.player.a = 0;
    S.player.u = {};
    S.player.levelStats = { damageBonus: 0, hpBonus: 0, healBonus: 0, goldBonus: 0 };

    S.progression.kills = 0;
    S.progression.totalKills = 0;
    S.progression.floor = 1;
    S.progression.floorKills = 0;
    S.progression.superBossCount = 0;

    S.combat.combo = 0;
    S.combat.isBoss = false;
    S.combat.isSuperBoss = false;
    S.combat.bossCount = 0;
    S.combat.bossSkipped = false;
    S.combat.bossAttempts = 0;

    S.faction.activeSkills = {};

    if (S.auto.timer) {
        clearInterval(S.auto.timer);
        S.auto.timer = null;
    }
    S.auto.enabled = false;

    S.weapons.current = 'weapon_001';
    S.weapons.inventory = {
        weapon_001: { level: 1, unlocked: true }
    };

    EventBus.emit('gameReset');
};