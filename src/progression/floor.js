import { S } from '../core/state.js';
import { CONFIG } from '../core/config.js';
import { EventBus } from '../core/eventBus.js';
import { getEnemyStats, SUPER_BOSSES, ENEMIES } from '../combat/enemies.js';

export const updateFloor = () => {
    const floorKills = S.totalKills || 0;
    const enemiesPerFloor = CONFIG.floors.enemiesPerFloor || 10;
    S.floor = Math.floor(floorKills / enemiesPerFloor) + 1;
    S.floorKills = floorKills % enemiesPerFloor;
    EventBus.emit('floor:updated');
};

const shouldSpawnFloorBoss = () => {
    if (S.isBoss || S.isSuperBoss || S.bossSkipped) return false;
    const enemiesPerFloor = CONFIG.floors.enemiesPerFloor || 10;
    // После убийства (enemiesPerFloor - 1) обычных мобов — следующий враг босс
    return S.totalKills > 0 && S.floorKills >= enemiesPerFloor - 1;
};

export const spawnSuperBoss = () => {
    if (S.isBoss || S.isSuperBoss) return;
    S.isSuperBoss = true;
    S.isBoss = true;
    const sbIndex = Math.min(Math.floor(S.floor / CONFIG.floors.superBossInterval) - 1, SUPER_BOSSES.length - 1);
    const sb = SUPER_BOSSES[Math.max(0, sbIndex)] || SUPER_BOSSES[0];
    const floorMult = 1 + (Math.max(0, S.floor - 500) * 0.01);
    const hp = Math.floor(sb.hp * floorMult * CONFIG.floors.superBossMultiplier);
    const damage = Math.floor(sb.damage * floorMult * CONFIG.floors.superBossMultiplier * 0.5);
    S.enemyMaxHp = hp;
    S.enemyHp = hp;
    const stats = {
        name: `${sb.name} (Супер-босс ${S.floor} этажа)`,
        emoji: sb.emoji,
        hp, damage,
        armor: sb.armor || 20,
        gold: Math.floor(sb.gold * floorMult * CONFIG.floors.superBossGoldMult),
        exp: Math.floor(sb.exp * floorMult * CONFIG.floors.superBossExpMult),
        level: S.floor,
        isBoss: true,
        isSuperBoss: true
    };
    EventBus.emit('log:add', { msg: `[SB] СУПЕР-БОСС ЭТАЖА ${S.floor}! ${sb.name}`, cls: 'log-super' });
    EventBus.emit('enemy:spawned', stats);
    EventBus.emit('superBoss:indicator');
};

export const spawnEnemy = () => {
    if (shouldSpawnFloorBoss()) {
        if (S.floor % CONFIG.floors.superBossInterval === 0 && S.floor >= CONFIG.floors.superBossInterval) {
            spawnSuperBoss();
            return;
        }
        S.isBoss = true;
        S.bossCount = S.floor;
        S.bossAttempts = 0;
        EventBus.emit('log:add', { msg: `[Boss] БОСС этажа ${S.floor}!`, cls: 'log-boss' });
    } else if (!S.isBoss && !S.isSuperBoss) {
        S.enemyIndex = S.floorKills % ENEMIES.length;
    }

    const stats = getEnemyStats();
    S.enemyMaxHp = stats.hp;
    S.enemyHp = stats.hp;
    EventBus.emit('enemy:spawned', stats);
};
