import { S } from '../../core/state.js';
import { EventBus } from '../../core/eventBus.js';
import { $, fmt, price, getU, getUs, getHireCost, getNextEffect } from '../../core/utils.js';
import { saveGame } from '../../core/storage.js';
import { checkAchievements } from '../../features/achievements.js';
import { hireMercenary } from '../../upgrades/army.js';
import { recalculateStats } from '../stats.js';
import { addBattleLog } from '../battleLog.js';
import { ICONS } from '../../core/icons.js';
import { ERAS } from '../../features/eras.js';

let subTab = 'upgrades';

export const activateBoost = () => {
    if (S.faction.bonuses.boost) {
        addBattleLog('[CD] Буст уже активен!', 'log-damage');
        return false;
    }
    if (S.player.boostCooldown && Date.now() - S.player.boostCooldown < S.faction.bonuses.boostCD * 1000) {
        const remaining = Math.ceil((S.faction.bonuses.boostCD * 1000 - (Date.now() - S.player.boostCooldown)) / 1000);
        addBattleLog(`[CD] Буст перезаряжается: ${remaining} сек`, 'log-damage');
        return false;
    }
    S.faction.bonuses.boost = true;
    S.player.boostCooldown = Date.now();
    addBattleLog(`[Boost] БУСТ АКТИВИРОВАН! x${S.faction.bonuses.boostMul} доход на ${S.faction.bonuses.boostDur} сек`, 'log-gold');
    if (S.player.boostTimer) clearTimeout(S.player.boostTimer);
    S.player.boostTimer = setTimeout(() => {
        S.faction.bonuses.boost = false;
        S.player.boostTimer = null;
        addBattleLog('[CD] Буст закончился', 'log-damage');
        recalculateStats();
    }, S.faction.bonuses.boostDur * 1000);
    recalculateStats();
    return true;
};

export const buyUpgrade = (id) => {
    if (!S.faction.id) return;
    const u = getUs().find(x => x.id === id);
    if (!u) return;
    const pr = price(u);
    if (S.player.gold < pr) return;

    S.player.gold -= pr;
    S.player.u[id] = (S.player.u[id] || 0) + 1;
    recalculateStats();
    EventBus.emit('log:add', { msg: `[Up] ${u.name} → ${S.player.u[id]} ур.`, cls: 'log-gold' });
    renderUpgrades();
    saveGame();
    checkAchievements();

    if (u.e.t === 'boost' && S.player.u[id] === 1) {
        setTimeout(() => activateBoost(), 100);
    }
};

const renderSubTabBar = () => `
    <div style="display:flex;gap:0;margin-bottom:15px;border-radius:8px;overflow:hidden;border:1px solid #3d2b1f;">
        <button class="upgrade-subtab" data-tab="upgrades" style="flex:1;padding:10px;background:${subTab === 'upgrades' ? '#2a1f18' : 'transparent'};border:none;color:${subTab === 'upgrades' ? '#f5c842' : '#8a7a6a'};font-size:14px;font-weight:700;cursor:pointer;transition:all 0.2s;">
            ${ICONS.swords} Улучшения
        </button>
        <button class="upgrade-subtab" data-tab="eras" style="flex:1;padding:10px;background:${subTab === 'eras' ? '#2a1f18' : 'transparent'};border:none;color:${subTab === 'eras' ? '#f5c842' : '#8a7a6a'};font-size:14px;font-weight:700;cursor:pointer;transition:all 0.2s;">
            ${ICONS.cross} Эпохи мечей
        </button>
    </div>`;

const renderEras = () => {
    let html = `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;">`;
    for (const e of ERAS) {
        const unlocked = true;
        html += `
            <div style="background:#0f0a08;border:2px solid ${unlocked ? '#3d2b1f' : '#1a1410'};border-radius:12px;padding:15px;opacity:${unlocked ? 1 : 0.4};">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <span style="color:#f5c842;font-weight:700;font-size:16px;">${e.name}</span>
                    <span style="color:#8a7a6a;font-size:12px;background:#1a1410;padding:2px 8px;border-radius:6px;">#${e.id}</span>
                </div>
                <div style="color:#8a7a6a;font-size:12px;margin-bottom:6px;">
                    Уровни: <span style="color:#60a5fa;font-weight:600;">${e.lvlMin}-${e.lvlMax}</span>
                </div>
                <div style="color:#8a7a6a;font-size:12px;">
                    Урон: <span style="color:#f87171;font-weight:600;">${fmt(e.dmgMin)}</span> — <span style="color:#f87171;font-weight:600;">${fmt(e.dmgMax)}</span>
                </div>
            </div>`;
    }
    html += `</div>`;
    return html;
};

export const renderUpgrades = () => {
    const c = $('upgradesContainer');
    if (!c) return;
    if (!S.faction.id) {
        c.innerHTML = '<p style="color:#8a7a6a;">Выбери фракцию</p>';
        return;
    }

    if (subTab === 'eras') {
        c.innerHTML = renderSubTabBar() + renderEras();
        document.querySelectorAll('.upgrade-subtab').forEach(b => {
            b.onclick = () => { subTab = b.dataset.tab; renderUpgrades(); };
        });
        return;
    }

    const hireCost = getHireCost();
    const canAffordHire = S.gold >= hireCost;

    let html = renderSubTabBar();

    html += `
        <div style="margin-bottom:15px;padding:15px;background:#0f0a08;border:2px solid #f5c842;border-radius:12px;">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
                <div>
                    <div style="color:#f5c842;font-weight:700;font-size:18px;">${ICONS.swords} Нанять отряд</div>
                    <div style="color:#8a7a6a;font-size:13px;">Армия: <span style="color:#f5c842;font-weight:700;">${S.player.a || 0}</span></div>
                    <div style="color:#8a7a6a;font-size:13px;">Стоимость: <span style="color:#fbbf24;font-weight:700;">${fmt(hireCost)}</span> ${ICONS.coin}</div>
                    <div style="color:#34d399;font-size:12px;">+${S.faction.bonuses.armyDamage || 0} урона, +${S.faction.bonuses.armyPassive || 0} золота/сек</div>
                </div>
                <button id="hireBtnUpgrade" class="btn-primary" style="padding:12px 30px;font-size:18px;opacity:${canAffordHire ? 1 : 0.5};cursor:${canAffordHire ? 'pointer' : 'not-allowed'};">
                    ${ICONS.swords} Нанять (${fmt(hireCost)}) ${ICONS.coin}
                </button>
            </div>
        </div>`;

    const hasBoost = getUs().some(u => u.e.t === 'boost' && getU(u.id) > 0);
    if (hasBoost) {
        html += `
            <div style="margin-bottom:15px;padding:15px;background:#0f0a08;border:2px solid #a855f7;border-radius:12px;">
                <button id="activateBoostBtn" style="padding:12px 30px;font-size:16px;background:#6b3a4a;border:2px solid #a855f7;color:#a855f7;border-radius:8px;cursor:pointer;width:100%;">
                    ${ICONS.boost} АКТИВИРОВАТЬ БУСТ (${S.faction.bonuses.boostDur} сек)
                </button>
            </div>`;
    }

    html += getUs().map(u => {
        const lv = getU(u.id);
        const pr = price(u);
        const canAfford = S.player.gold >= pr;
        const nextEffect = getNextEffect(u);
        return `<div class="upgrade-card">
            <div class="upgrade-info">
                <div class="upgrade-name">${u.iconSvg || u.icon} ${u.name}</div>
                <div class="upgrade-desc">${u.desc}</div>
                <div class="upgrade-level">Уровень: ${lv}</div>
                <div style="color:#8a7a6a;font-size:12px;margin-top:4px;">След. уровень: ${nextEffect}</div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                <div class="upgrade-price">${ICONS.coin} ${fmt(pr)}</div>
                <button class="upgrade-btn" data-id="${u.id}" style="opacity:${canAfford ? 1 : 0.5};cursor:${canAfford ? 'pointer' : 'not-allowed'};" ${!canAfford ? 'disabled' : ''}>Улучшить</button>
            </div>
        </div>`;
    }).join('');

    c.innerHTML = html;
    document.querySelectorAll('.upgrade-subtab').forEach(b => {
        b.onclick = () => { subTab = b.dataset.tab; renderUpgrades(); };
    });
    document.querySelectorAll('.upgrade-btn').forEach(b => { b.onclick = () => buyUpgrade(b.dataset.id); });
    const hireBtn = $('hireBtnUpgrade');
    if (hireBtn) hireBtn.onclick = () => { hireMercenary(); renderUpgrades(); };
    const boostBtn = $('activateBoostBtn');
    if (boostBtn) boostBtn.onclick = activateBoost;
};
