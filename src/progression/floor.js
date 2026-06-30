import { S } from '../core/state.js';
import { CONFIG } from '../core/config.js';
import { EventBus } from '../core/eventBus.js';
import { getEnemyStats, SUPER_BOSSES, ENEMIES } from '../combat/enemies.js';

export const updateFloor = () => {
    const floorKills = S.progression.totalKills || 0;
    const enemiesPerFloor = CONFIG.floors.enemiesPerFloor || 10;
    S.progression.floor = Math.floor(floorKills / enemiesPerFloor) + 1;
    S.progression.floorKills = floorKills % enemiesPerFloor;
    EventBus.emit('floor:updated');
};

const shouldSpawnFloorBoss = () => {
    const c = S.combat;
    if (c.isBoss || c.isSuperBoss || c.bossSkipped) return false;
    const enemiesPerFloor = CONFIG.floors.enemiesPerFloor || 10;
    return S.progression.totalKills > 0 && S.progression.floorKills >= enemiesPerFloor - 1;
};

export const spawnSuperBoss = () => {
    const c = S.combat;
    const p = S.progression;
    if (c.isBoss || c.isSuperBoss) return;
    c.isSuperBoss = true;
    c.isBoss = true;
    const sbIndex = Math.min(Math.floor(p.floor / CONFIG.floors.superBossInterval) - 1, SUPER_BOSSES.length - 1);
    const sb = SUPER_BOSSES[Math.max(0, sbIndex)] || SUPER_BOSSES[0];
    const floorMult = 1 + (Math.max(0, p.floor - 500) * 0.01);
    const hp = Math.floor(sb.hp * floorMult * CONFIG.floors.superBossMultiplier);
    const damage = Math.floor(sb.damage * floorMult * CONFIG.floors.superBossMultiplier * 0.5);
    c.enemyMaxHp = hp;
    c.enemyHp = hp;
    const stats = {
        name: `${sb.name} (Супер-босс ${p.floor} этажа)`,
        emoji: sb.emoji,
        hp, damage,
        armor: sb.armor || 20,
        gold: Math.floor(sb.gold * floorMult * CONFIG.floors.superBossGoldMult),
        exp: Math.floor(sb.exp * floorMult * CONFIG.floors.superBossExpMult),
        level: p.floor,
        isBoss: true,
        isSuperBoss: true
    };
    EventBus.emit('log:add', { msg: `[SB] СУПЕР-БОСС ЭТАЖА ${p.floor}! ${sb.name}`, cls: 'log-super' });
    EventBus.emit('enemy:spawned', stats);
    EventBus.emit('superBoss:indicator');
};

export const spawnEnemy = () => {
    const c = S.combat;
    const p = S.progression;
    if (shouldSpawnFloorBoss()) {
        if (p.floor % CONFIG.floors.superBossInterval === 0 && p.floor >= CONFIG.floors.superBossInterval) {
            spawnSuperBoss();
            return;
        }
        c.isBoss = true;
        c.bossCount = p.floor;
        c.bossAttempts = 0;
        EventBus.emit('log:add', { msg: `[Boss] БОСС этажа ${p.floor}!`, cls: 'log-boss' });
    } else if (!c.isBoss && !c.isSuperBoss) {
        c.enemyIndex = p.floorKills % ENEMIES.length;
    }

    const stats = getEnemyStats();
    c.enemyMaxHp = stats.hp;
    c.enemyHp = stats.hp;
    EventBus.emit('enemy:spawned', stats);
};
