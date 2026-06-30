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
    const defense = S.faction.bonuses.defense || 0;
    damage = Math.max(1, damage - defense * 0.5);
    S.player.hp -= Math.floor(damage);
    EventBus.emit('log:add', { msg: `[Dmg] Враг нанёс ${Math.floor(damage)} урона!`, cls: 'log-damage' });
    EventBus.emit('player:hpChanged');
};

export const attack = () => {
    if (!S.faction.id) {
        EventBus.emit('log:add', { msg: '[X] Сначала выбери фракцию!', cls: 'log-damage' });
        return false;
    }

    const damage = computeDamage();
    const enemyStats = getEnemyStats();
    const armorReduction = enemyStats.armor * CONFIG.difficulty.armorReduction;
    const actualDamage = Math.max(1, Math.floor(damage - armorReduction));

    playHitAnimation();

    S.combat.enemyHp -= actualDamage;
    EventBus.emit('log:add', { msg: `[Hit] Удар на ${actualDamage} урона`, cls: 'log-damage' });
    EventBus.emit('enemy:hpChanged');

    const enemyContainer = document.getElementById('enemyContainer');
    if (enemyContainer) {
        const rect = enemyContainer.getBoundingClientRect();
        const x = rect.left + rect.width / 2 - 20 + (Math.random() - 0.5) * 40;
        const y = rect.top + 10;
        showFloatingText(x, y, `-${actualDamage}`, 'damage');
    }

    if (S.combat.enemyHp <= 0) {
        handleEnemyKill(enemyStats);
    } else {
        enemyAttack();

        if (S.player.hp <= 0) {
            if (S.combat.isBoss) {
                S.combat.bossAttempts++;
                S.player.hp = S.player.maxHp;
                EventBus.emit('log:add', {
                    msg: `[Death] ВЫ УМЕРЛИ ОТ ${S.combat.isSuperBoss ? 'СУПЕР-БОССА' : 'БОССА'}! Попытка ${S.combat.bossAttempts}/${S.combat.bossMaxAttempts}`,
                    cls: 'log-boss'
                });
                if (S.combat.bossAttempts >= S.combat.bossMaxAttempts) {
                    EventBus.emit('log:add', { msg: `[Surr] ${S.combat.bossMaxAttempts} ПОРАЖЕНИЯ! Возврат к обычным врагам`, cls: 'log-boss' });
                    S.combat.isBoss = false;
                    S.combat.isSuperBoss = false;
                    S.combat.bossSkipped = true;
                    S.combat.bossAttempts = 0;
                    S.combat.enemyIndex = S.progression.floorKills % ENEMIES.length;
                    spawnEnemy();
                    EventBus.emit('boss:reset');
                    saveGame();
                } else {
                    S.combat.enemyHp = Math.min(S.combat.enemyMaxHp, S.combat.enemyHp + S.combat.enemyMaxHp * 0.2);
                    EventBus.emit('enemy:hpChanged');
                    playHitAnimation();
                    EventBus.emit('boss:attemptsUpdated');
                }
            } else {
                S.player.hp = 0;
                EventBus.emit('log:add', { msg: '[Death] ВЫ УМЕРЛИ! Возрождение...', cls: 'log-boss' });
                S.player.hp = S.player.maxHp;
                spawnEnemy();
            }
            return true;
        }
    }

    const b = S.faction.bonuses;
    if (b.healRegen > 0 && S.player.hp < S.player.maxHp) {
        let heal = b.healRegen + (S.player.levelStats.healBonus || 0);
        if (b.factionBonus?.alliance_bond?.active) heal *= b.factionBonus.alliance_bond.healMult;
        S.player.hp = Math.min(S.player.maxHp, S.player.hp + heal);
        EventBus.emit('player:hpChanged');
    }

    EventBus.emit('attack:done');
    return true;
};

export const skipBoss = () => {
    if (!S.combat.isBoss) {
        EventBus.emit('log:add', { msg: '[X] Сейчас нет босса!', cls: 'log-damage' });
        return false;
    }

    const label = S.combat.isSuperBoss ? 'супер-босса' : 'босса';
    if (!confirm(`[Boss] Пропустить ${label}?\n\nЭтаж будет завершён без награды за босса.`)) {
        return false;
    }

    S.combat.isBoss = false;
    S.combat.isSuperBoss = false;
    S.combat.bossAttempts = 0;
    S.combat.bossSkipped = false;

    const enemiesPerFloor = CONFIG.floors.enemiesPerFloor || 10;
    const targetKills = S.progression.floor * enemiesPerFloor;
    if (S.progression.totalKills < targetKills) {
        S.progression.totalKills = targetKills;
    }

    updateFloor();
    EventBus.emit('log:add', { msg: `[Skip] Босс пропущен. Добро пожаловать на этаж ${S.progression.floor}!`, cls: 'log-boss' });
    spawnEnemy();
    saveGame();
    EventBus.emit('boss:skipped');
    return true;
};

export const surrenderBoss = () => {
    skipBoss();
};
