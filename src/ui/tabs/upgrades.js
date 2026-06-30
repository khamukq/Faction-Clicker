import { S } from '../../core/state.js';
import { EventBus } from '../../core/eventBus.js';
import { $, fmt, price, getU, getUs, getHireCost, getNextEffect } from '../../core/utils.js';
import { saveGame } from '../../core/storage.js';
import { checkAchievements } from '../../features/achievements.js';
import { hireMercenary } from '../../upgrades/army.js';
import { recalculateStats } from '../stats.js';
import { addBattleLog } from '../battleLog.js';

export const activateBoost = () => {
    if (S.b.boost) {
        addBattleLog('⏳ Буст уже активен!', 'log-damage');
        return false;
    }
    if (S.boostCooldown && Date.now() - S.boostCooldown < S.b.boostCD * 1000) {
        const remaining = Math.ceil((S.b.boostCD * 1000 - (Date.now() - S.boostCooldown)) / 1000);
        addBattleLog(`⏳ Буст перезаряжается: ${remaining} сек`, 'log-damage');
        return false;
    }
    S.b.boost = true;
    S.boostCooldown = Date.now();
    addBattleLog(`⚡ БУСТ АКТИВИРОВАН! x${S.b.boostMul} доход на ${S.b.boostDur} сек`, 'log-gold');
    if (S.boostTimer) clearTimeout(S.boostTimer);
    S.boostTimer = setTimeout(() => {
        S.b.boost = false;
        S.boostTimer = null;
        addBattleLog('⏳ Буст закончился', 'log-damage');
        recalculateStats();
    }, S.b.boostDur * 1000);
    recalculateStats();
    return true;
};

export const buyUpgrade = (id) => {
    if (!S.f) return;
    const u = getUs().find(x => x.id === id);
    if (!u) return;
    const pr = price(u);
    if (S.gold < pr) return;

    S.gold -= pr;
    S.u[id] = (S.u[id] || 0) + 1;
    recalculateStats();
    EventBus.emit('log:add', { msg: `⬆ ${u.icon} ${u.name} → ${S.u[id]} ур.`, cls: 'log-gold' });
    renderUpgrades();
    saveGame();
    checkAchievements();

    if (u.e.t === 'boost' && S.u[id] === 1) {
        setTimeout(() => activateBoost(), 100);
    }
};

export const renderUpgrades = () => {
    const c = $('upgradesContainer');
    if (!c) return;
    if (!S.f) {
        c.innerHTML = '<p style="color:#8a7a6a;">Выбери фракцию</p>';
        return;
    }

    const hireCost = getHireCost();
    const canAffordHire = S.gold >= hireCost;

    let html = `
        <div style="margin-bottom:15px;padding:15px;background:#0f0a08;border:2px solid #f5c842;border-radius:12px;">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
                <div>
                    <div style="color:#f5c842;font-weight:700;font-size:18px;">⚔️ Нанять отряд</div>
                    <div style="color:#8a7a6a;font-size:13px;">Армия: <span style="color:#f5c842;font-weight:700;">${S.a || 0}</span></div>
                    <div style="color:#8a7a6a;font-size:13px;">Стоимость: <span style="color:#fbbf24;font-weight:700;">${fmt(hireCost)}💰</span></div>
                    <div style="color:#34d399;font-size:12px;">+${S.b.armyDamage || 0} урона, +${S.b.armyPassive || 0} золота/сек</div>
                </div>
                <button id="hireBtnUpgrade" class="btn-primary" style="padding:12px 30px;font-size:18px;opacity:${canAffordHire ? 1 : 0.5};cursor:${canAffordHire ? 'pointer' : 'not-allowed'};">
                    ⚔️ Нанять (${fmt(hireCost)}💰)
                </button>
            </div>
        </div>`;

    const hasBoost = getUs().some(u => u.e.t === 'boost' && getU(u.id) > 0);
    if (hasBoost) {
        html += `
            <div style="margin-bottom:15px;padding:15px;background:#0f0a08;border:2px solid #a855f7;border-radius:12px;">
                <button id="activateBoostBtn" style="padding:12px 30px;font-size:16px;background:#6b3a4a;border:2px solid #a855f7;color:#a855f7;border-radius:8px;cursor:pointer;width:100%;">
                    ⚡ АКТИВИРОВАТЬ БУСТ (${S.b.boostDur} сек)
                </button>
            </div>`;
    }

    html += getUs().map(u => {
        const lv = getU(u.id);
        const pr = price(u);
        const canAfford = S.gold >= pr;
        const nextEffect = getNextEffect(u);
        return `<div class="upgrade-card">
            <div class="upgrade-info">
                <div class="upgrade-name">${u.icon} ${u.name}</div>
                <div class="upgrade-desc">${u.desc}</div>
                <div class="upgrade-level">Уровень: ${lv}</div>
                <div style="color:#8a7a6a;font-size:12px;margin-top:4px;">След. уровень: ${nextEffect}</div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                <div class="upgrade-price">💰 ${fmt(pr)}</div>
                <button class="upgrade-btn" data-id="${u.id}" style="opacity:${canAfford ? 1 : 0.5};cursor:${canAfford ? 'pointer' : 'not-allowed'};" ${!canAfford ? 'disabled' : ''}>Улучшить</button>
            </div>
        </div>`;
    }).join('');

    c.innerHTML = html;
    document.querySelectorAll('.upgrade-btn').forEach(b => { b.onclick = () => buyUpgrade(b.dataset.id); });
    const hireBtn = $('hireBtnUpgrade');
    if (hireBtn) hireBtn.onclick = () => { hireMercenary(); renderUpgrades(); };
    const boostBtn = $('activateBoostBtn');
    if (boostBtn) boostBtn.onclick = activateBoost;
};
