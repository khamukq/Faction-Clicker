import { S } from '../core/state.js';
import { $, fmt } from '../core/utils.js';
import { CONFIG } from '../core/config.js';
import { computeEffectiveDamage, computeIncome } from '../combat/damage.js';
import { getEnemyStats } from '../combat/enemies.js';
import { getLevelBonuses } from '../progression/level.js';
import { ICONS } from '../core/icons.js';
import { getCurrentWeapon, getWeaponDamage, getTotalWeaponDamage, getSynergyBonus, getWeaponCount } from '../upgrades/weapons.js';

export const updateHealthUI = () => {
    const pl = S.player;
    const hpPct = Math.max(0, (pl.hp / pl.maxHp) * 100);
    const fillEl = $('playerHpFill');
    const textEl = $('playerHpText');
    const pctEl = $('playerHpPct');

    if (fillEl) fillEl.style.width = hpPct + '%';
    if (textEl) textEl.textContent = `${Math.floor(pl.hp)}/${Math.floor(pl.maxHp)}`;
    if (pctEl) pctEl.textContent = hpPct.toFixed(0) + '%';
};

export const updateFloorUI = () => {
    const c = S.combat;
    const p = S.progression;
    const floor = p.floor || 1;
    const floorKills = p.floorKills || 0;
    const enemiesPerFloor = CONFIG.floors.enemiesPerFloor || 10;
    const displayKills = c.isBoss ? enemiesPerFloor : floorKills;
    const progress = Math.min(100, (displayKills / enemiesPerFloor) * 100);

    const floorDisplay = $('floorDisplay');
    const floorProgress = $('floorProgress');
    const floorFill = $('floorFill');

    if (floorDisplay) floorDisplay.textContent = floor;
    if (floorProgress) {
        floorProgress.textContent = c.isBoss
            ? `${enemiesPerFloor}/${enemiesPerFloor} (босс)`
            : `${floorKills}/${enemiesPerFloor}`;
    }
    if (floorFill) floorFill.style.width = progress + '%';
};

export const updateSuperBossIndicator = () => {
    const indicator = $('superBossIndicator');
    if (!indicator) return;

    const c = S.combat;
    const p = S.progression;
    const floor = p.floor || 1;
    const interval = CONFIG.floors.superBossInterval || 500;
    const isSuperBossFloor = floor % interval === 0 && floor >= interval;
    const superBossFloor = $('superBossFloor');

    if (isSuperBossFloor && !c.isBoss && !c.isSuperBoss) {
        indicator.style.display = 'block';
        if (superBossFloor) superBossFloor.textContent = floor;
    } else {
        indicator.style.display = 'none';
    }
};

export const updateEnemyUI = (stats) => {
    if (!stats) return;

    const prefix = stats.isSuperBoss ? '[SB] СУПЕР-БОСС: ' : stats.isBoss ? '[Boss] БОСС: ' : '';
    const nameEl = $('enemyName');
    if (nameEl) nameEl.textContent = prefix + stats.name;

    const levelEl = $('enemyLevel');
    if (levelEl) levelEl.textContent = `Уровень ${stats.level}`;

    const enemyEl = $('enemy');
    if (enemyEl) {
        enemyEl.innerHTML = stats.iconSvg || '?';
        enemyEl.classList.remove('enemy-appear');
        void enemyEl.offsetWidth;
        enemyEl.classList.add('enemy-appear');
    }

    const damageEl = $('enemyDamage');
    const armorEl = $('enemyArmor');
    const killsEl = $('enemyKills');
    const fillEl = $('enemyHpFill');
    const textEl = $('enemyHpText');

    if (damageEl) damageEl.textContent = stats.damage;
    if (armorEl) armorEl.textContent = stats.armor;
    if (killsEl) killsEl.textContent = `Убито: ${S.progression.totalKills}`;

    const pct = Math.max(0, (S.combat.enemyHp / S.combat.enemyMaxHp) * 100);
    if (fillEl) fillEl.style.width = pct + '%';
    if (textEl) textEl.textContent = `${Math.floor(S.combat.enemyHp)}/${Math.floor(S.combat.enemyMaxHp)}`;

    updateBossUI();
};

export const updateBossUI = () => {
    const container = $('bossContainer');
    if (!container) return;

    if (S.combat.isBoss) {
        container.classList.add('active');
        const c = S.combat;
        const label = c.isSuperBoss ? '[SB] СУПЕР-БОСС' : '[Boss] БОСС';
        const attempts = c.bossAttempts > 0
            ? ` · попыток ${c.bossAttempts}/${c.bossMaxAttempts}`
            : '';
        container.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                <span style="color:#f472b6;font-weight:700;">${label} этажа ${S.progression.floor}${attempts}</span>
                <button type="button" id="skipBossBtn" style="background:#2a1f18;border:1px solid #f5c842;color:#f5c842;padding:6px 14px;border-radius:8px;cursor:pointer;font-weight:600;">
                    ${ICONS.skip} Пропустить
                </button>
            </div>`;
        const skipBtn = $('skipBossBtn');
        if (skipBtn) skipBtn.onclick = () => window.skipBoss?.();
    } else {
        container.classList.remove('active');
        container.innerHTML = '';
    }
};

export const updateWeaponUI = () => {
    const container = $('weaponDisplay');
    if (!container) return;
    if (!S.faction.id) { container.style.display = 'none'; return; }
    const wp = getCurrentWeapon(S);
    const lvl = (S.weapons.inventory[wp.id]?.level) || 0;
    const dmg = getWeaponDamage(S, wp.id);
    const iconEl = $('weaponIcon');
    const nameEl = $('weaponName');
    const damageEl = $('weaponDamageDisplay');
    if (iconEl) iconEl.textContent = wp.icon || '🗡️';
    if (nameEl) nameEl.textContent = `${wp.name} [${wp.era}] ур.${lvl}`;
    if (damageEl) damageEl.textContent = `${fmt(dmg)} урона от оружия`;
    container.style.display = 'block';
};

export const updateUI = () => {
    const enemyStats = getEnemyStats();
    const totalDamage = computeEffectiveDamage(enemyStats);
    const income = computeIncome();

    const goldEl = $('gold');
    const damageEl = $('damage');
    const levelEl = $('playerLevel');
    const nicknameEl = $('nicknameDisplay');
    const prestigeDisplayEl = $('prestigeDisplay');
    const prestigeMultEl = $('prestigeMultiplier');
    const ascensionDisplayEl = $('ascensionDisplay');
    const killsEl = $('totalKillsDisplay');
    const totalGoldEl = $('totalGoldDisplay');
    const armyEl = $('armyDisplay');
    const incomeEl = $('incomeDisplay');
    const comboEl = $('comboCount');

    const pl = S.player;
    const m = S.meta;
    const c = S.combat;
    const p = S.progression;

    if (goldEl) goldEl.textContent = fmt(pl.gold);
    if (damageEl) damageEl.textContent = fmt(totalDamage);
    if (levelEl) levelEl.textContent = pl.level;
    if (nicknameEl) nicknameEl.textContent = pl.nickname || '-';
    if (prestigeDisplayEl) prestigeDisplayEl.textContent = `P${m.prestigePoints}`;
    if (prestigeMultEl) prestigeMultEl.textContent = `x${m.permanentMultiplier.toFixed(2)}`;
    if (ascensionDisplayEl) ascensionDisplayEl.textContent = `A${m.ascension}`;
    if (killsEl) killsEl.textContent = p.totalKills;
    if (totalGoldEl) totalGoldEl.textContent = fmt(pl.totalGold);
    if (armyEl) armyEl.textContent = pl.a || 0;
    if (incomeEl) incomeEl.textContent = fmt(income) + '/сек';
    if (comboEl) comboEl.textContent = c.combo;

    const expPct = (pl.exp / pl.expToNext) * 100;
    const expFill = $('expFill');
    const expText = $('expText');
    const levelDisplay = $('levelDisplay');
    const levelBonusDisplay = $('levelBonusDisplay');

    if (expFill) expFill.style.width = Math.min(expPct, 100) + '%';
    if (expText) expText.textContent = `${fmt(pl.exp)}/${fmt(pl.expToNext)} XP`;
    if (levelDisplay) levelDisplay.textContent = pl.level;
    if (levelBonusDisplay) {
        const bonus = getLevelBonuses(S.player.level);
        levelBonusDisplay.textContent = `+${bonus.damage} урона, +${bonus.hp} HP`;
    }

    updateHealthUI();
    updateFloorUI();
    updateSuperBossIndicator();
    updateBossUI();
    updateWeaponUI();
};
