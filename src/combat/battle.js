import { S } from '../core/state.js';
import { EventBus } from '../core/eventBus.js';
import { computeDamage } from './damage.js';
import { getEnemyStats, ENEMIES } from './enemies.js';
import { spawnEnemy, updateFloor } from '../progression/floor.js';
import { saveGame } from '../core/storage.js';
import { CONFIG } from '../core/config.js';
import { showFloatingText } from '../ui/floatingText.js';
import { handleEnemyKill } from './killHandler.js';

export { showFloatingText } from '../ui/floatingText.js';

const playHitAnimation = () => {
    const enemyEl = document.getElementById('enemy');
    if (!enemyEl) return;
    enemyEl.classList.remove('enemy-hit');
    void enemyEl.offsetWidth;
    enemyEl.classList.add('enemy-hit');
};

export const enemyAttack = () => {
    const enemyStats = getEnemyStats();
    let damage = enemyStats.damage || 3;
    const defense = S.b.defense || 0;
    damage = Math.max(1, damage - defense * 0.5);
    S.hp -= Math.floor(damage);
    EventBus.emit('log:add', { msg: `💢 Враг нанёс ${Math.floor(damage)} урона!`, cls: 'log-damage' });
    EventBus.emit('player:hpChanged');
};

export const attack = () => {
    if (!S.f) {
        EventBus.emit('log:add', { msg: '❌ Сначала выбери фракцию!', cls: 'log-damage' });
        return false;
    }

    const damage = computeDamage();
    const enemyStats = getEnemyStats();
    const armorReduction = enemyStats.armor * CONFIG.difficulty.armorReduction;
    const actualDamage = Math.max(1, Math.floor(damage - armorReduction));

    playHitAnimation();

    S.enemyHp -= actualDamage;
    EventBus.emit('log:add', { msg: `⚔️ Удар на ${actualDamage} урона`, cls: 'log-damage' });
    EventBus.emit('enemy:hpChanged');

    const enemyContainer = document.getElementById('enemyContainer');
    if (enemyContainer) {
        const rect = enemyContainer.getBoundingClientRect();
        const x = rect.left + rect.width / 2 - 20 + (Math.random() - 0.5) * 40;
        const y = rect.top + 10;
        showFloatingText(x, y, `-${actualDamage}`, 'damage');
    }

    if (S.enemyHp <= 0) {
        handleEnemyKill(enemyStats);
    } else {
        enemyAttack();

        if (S.hp <= 0) {
            if (S.isBoss) {
                S.bossAttempts++;
                S.hp = S.maxHp;
                EventBus.emit('log:add', {
                    msg: `💀 ВЫ УМЕРЛИ ОТ ${S.isSuperBoss ? 'СУПЕР-БОССА' : 'БОССА'}! Попытка ${S.bossAttempts}/${S.bossMaxAttempts}`,
                    cls: 'log-boss'
                });
                if (S.bossAttempts >= S.bossMaxAttempts) {
                    EventBus.emit('log:add', { msg: `🏳️ ${S.bossMaxAttempts} ПОРАЖЕНИЯ! Возврат к обычным врагам`, cls: 'log-boss' });
                    S.isBoss = false;
                    S.isSuperBoss = false;
                    S.bossSkipped = true;
                    S.bossAttempts = 0;
                    S.enemyIndex = S.floorKills % ENEMIES.length;
                    spawnEnemy();
                    EventBus.emit('boss:reset');
                    saveGame();
                } else {
                    S.enemyHp = Math.min(S.enemyMaxHp, S.enemyHp + S.enemyMaxHp * 0.2);
                    EventBus.emit('enemy:hpChanged');
                    playHitAnimation();
                    EventBus.emit('boss:attemptsUpdated');
                }
            } else {
                S.hp = 0;
                EventBus.emit('log:add', { msg: '💀 ВЫ УМЕРЛИ! Возрождение...', cls: 'log-boss' });
                S.hp = S.maxHp;
                spawnEnemy();
            }
            return true;
        }
    }

    if (S.b.healRegen > 0 && S.hp < S.maxHp) {
        let heal = S.b.healRegen + (S.levelStats.healBonus || 0);
        if (S.b.factionBonus?.alliance_bond?.active) heal *= S.b.factionBonus.alliance_bond.healMult;
        S.hp = Math.min(S.maxHp, S.hp + heal);
        EventBus.emit('player:hpChanged');
    }

    EventBus.emit('attack:done');
    return true;
};

export const skipBoss = () => {
    if (!S.isBoss) {
        EventBus.emit('log:add', { msg: '❌ Сейчас нет босса!', cls: 'log-damage' });
        return false;
    }

    const label = S.isSuperBoss ? 'супер-босса' : 'босса';
    if (!confirm(`👾 Пропустить ${label}?\n\nЭтаж будет завершён без награды за босса.`)) {
        return false;
    }

    S.isBoss = false;
    S.isSuperBoss = false;
    S.bossAttempts = 0;
    S.bossSkipped = false;

    const enemiesPerFloor = CONFIG.floors.enemiesPerFloor || 10;
    const targetKills = S.floor * enemiesPerFloor;
    if (S.totalKills < targetKills) {
        S.totalKills = targetKills;
    }

    updateFloor();
    EventBus.emit('log:add', { msg: `⏭️ Босс пропущен. Добро пожаловать на этаж ${S.floor}!`, cls: 'log-boss' });
    spawnEnemy();
    saveGame();
    EventBus.emit('boss:skipped');
    return true;
};

export const surrenderBoss = () => {
    skipBoss();
};
