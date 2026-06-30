import { S } from '../../core/state.js';
import { $, fmt } from '../../core/utils.js';
import { EventBus } from '../../core/eventBus.js';
import { saveGame } from '../../core/storage.js';
import {
    WEAPONS, getWeaponDamage, getTotalWeaponDamage,
    getWeaponCount, getSynergyBonus, getWeaponLevel,
    getWeaponUpgradeCost, getWeaponUnlockCost, getMaxLevelForWeapon,
    buyWeapon, upgradeWeapon, upgradeWeaponN, upgradeWeaponMax,
    getCurrentWeapon, getWeaponUnlocked
} from '../../upgrades/weapons.js';
import { ICONS } from '../../core/icons.js';
import { ERA_NAMES } from '../../upgrades/weapons.js';

const COLORS = ['#8B6914','#A19D94','#9B30FF','#FFD700','#FFFFFF'];
const ERA_COUNT = ERA_NAMES.length;

let expandedEras = new Set();

const getEraForWeapon = (tier) => Math.floor((tier - 1) / 5);
const getEraWeapons = (eraIdx) => WEAPONS.filter(w => getEraForWeapon(w.tier) === eraIdx);
const isEraFullyUnlocked = (eraIdx) => getEraWeapons(eraIdx).every(w => getWeaponUnlocked(S, w.id));

const renderWeaponCard = (wp) => {
    const ws = S.weapons[wp.id];
    const unlocked = ws?.unlocked;
    const level = ws?.level || 0;
    const maxLvl = getMaxLevelForWeapon(S, wp.id);
    const damage = getWeaponDamage(S, wp.id);
    const isCurrent = S.weapon === wp.id;
    const canAffordUnlock = S.gold >= wp.unlockCost;
    const upgradeCost = unlocked ? getWeaponUpgradeCost(S, wp.id) : Infinity;
    const canAffordUpgrade = S.gold >= upgradeCost;
    const atMaxLevel = level >= maxLvl;
    const prevWp = WEAPONS[wp.tier - 2];
    const prevUnlocked = !prevWp || getWeaponUnlocked(S, prevWp.id);

    let borderColor = '#1a1410', bgColor = '#080604';
    if (isCurrent) { borderColor = '#f5c842'; bgColor = '#1a1408'; }
    else if (unlocked) { borderColor = '#34d399'; bgColor = '#0a1208'; }

    return `
        <div style="background:${bgColor};border:1px solid ${borderColor};border-radius:6px;padding:6px 10px;margin-bottom:4px;">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">
                <div style="display:flex;align-items:center;gap:6px;flex:1;min-width:0;">
                    <span style="font-size:16px;">${wp.icon || '⚔️'}</span>
                    <span style="color:${unlocked ? '#e0d6c8' : '#5a4a3a'};font-weight:600;font-size:13px;white-space:nowrap;">${wp.name}</span>
                    ${isCurrent ? '<span style="color:#f5c842;font-size:10px;background:#2a1f08;padding:1px 5px;border-radius:3px;">ТЕК</span>' : ''}
                    <span style="color:#8a7a6a;font-size:10px;">#${wp.tier}</span>
                    ${unlocked ? `<span style="color:#f87171;font-size:11px;">+${fmt(damage)}</span>` : ''}
                </div>
                <div style="display:flex;align-items:center;gap:4px;flex-shrink:0;">
                    ${!unlocked ? `
                        <button class="weapon-buy-btn" data-id="${wp.id}" style="padding:3px 8px;background:#1a1410;border:1px solid ${canAffordUnlock && prevUnlocked ? '#fbbf24' : '#2a1a1a'};color:${canAffordUnlock && prevUnlocked ? '#fbbf24' : '#4a3a2a'};border-radius:4px;cursor:${canAffordUnlock && prevUnlocked ? 'pointer' : 'not-allowed'};font-size:10px;font-weight:600;${!(canAffordUnlock && prevUnlocked) ? 'opacity:0.4;' : ''}" ${!(canAffordUnlock && prevUnlocked) ? 'disabled' : ''}>
                            ${fmt(wp.unlockCost)}G${ICONS.coin}
                        </button>
                    ` : `
                        <span style="color:#8a7a6a;font-size:10px;min-width:32px;text-align:right;">ур.${level}</span>
                        <div style="width:40px;height:4px;background:#1a1410;border-radius:2px;overflow:hidden;">
                            <div style="height:100%;width:${(level/maxLvl*100).toFixed(0)}%;background:${borderColor};border-radius:2px;"></div>
                        </div>
                        <div style="display:flex;gap:3px;">
                            ${atMaxLevel ? '' : `
                                <button class="weapon-upgrade-btn" data-id="${wp.id}" data-n="1" style="padding:2px 6px;background:#0a1410;border:1px solid ${canAffordUpgrade ? '#34d399' : '#1a2a1a'};color:${canAffordUpgrade ? '#34d399' : '#3a4a3a'};border-radius:3px;cursor:${canAffordUpgrade ? 'pointer' : 'not-allowed'};font-size:9px;font-weight:600;${!canAffordUpgrade ? 'opacity:0.4;' : ''}" ${!canAffordUpgrade ? 'disabled' : ''}>×1</button>
                                <button class="weapon-upgrade-btn" data-id="${wp.id}" data-n="5" style="padding:2px 6px;background:#0a1410;border:1px solid ${canAffordUpgrade ? '#34d399' : '#1a2a1a'};color:${canAffordUpgrade ? '#34d399' : '#3a4a3a'};border-radius:3px;cursor:${canAffordUpgrade ? 'pointer' : 'not-allowed'};font-size:9px;font-weight:600;${!canAffordUpgrade ? 'opacity:0.4;' : ''}" ${!canAffordUpgrade ? 'disabled' : ''}>×5</button>
                                <button class="weapon-upgrade-btn" data-id="${wp.id}" data-n="10" style="padding:2px 6px;background:#0a1410;border:1px solid ${canAffordUpgrade ? '#34d399' : '#1a2a1a'};color:${canAffordUpgrade ? '#34d399' : '#3a4a3a'};border-radius:3px;cursor:${canAffordUpgrade ? 'pointer' : 'not-allowed'};font-size:9px;font-weight:600;${!canAffordUpgrade ? 'opacity:0.4;' : ''}" ${!canAffordUpgrade ? 'disabled' : ''}>×10</button>
                                <button class="weapon-upgrade-btn" data-id="${wp.id}" data-n="max" style="padding:2px 6px;background:#0a1410;border:1px solid ${canAffordUpgrade ? '#fbbf24' : '#1a2a1a'};color:${canAffordUpgrade ? '#fbbf24' : '#3a4a3a'};border-radius:3px;cursor:${canAffordUpgrade ? 'pointer' : 'not-allowed'};font-size:9px;font-weight:600;${!canAffordUpgrade ? 'opacity:0.4;' : ''}" ${!canAffordUpgrade ? 'disabled' : ''}>MAX</button>
                            `}
                            ${atMaxLevel ? '<span style="color:#34d399;font-size:9px;font-weight:600;">MAX</span>' : ''}
                        </div>
                        <button class="weapon-select-btn" data-id="${wp.id}" style="padding:2px 6px;background:transparent;border:1px solid ${isCurrent ? '#f5c842' : '#2a1f18'};color:${isCurrent ? '#f5c842' : '#6a5a4a'};border-radius:3px;cursor:pointer;font-size:9px;">${isCurrent ? '✓' : '🔀'}</button>
                    `}
                </div>
            </div>
        </div>`;
};

const renderEraBlock = (eraIdx) => {
    const eraColor = COLORS[eraIdx] || '#8a7a6a';
    const weapons = getEraWeapons(eraIdx);
    const unlocked = weapons.filter(w => getWeaponUnlocked(S, w.id)).length;
    const total = weapons.length;
    const isExpanded = expandedEras.has(eraIdx) || (unlocked > 0 && unlocked < total);
    const isFull = unlocked === total;
    let eraLabel = '🔒', eraLabelColor = '#3a2a1a';
    if (isFull) { eraLabel = '✅'; eraLabelColor = '#34d399'; }
    else if (unlocked > 0) { eraLabel = `⚔️${unlocked}`; eraLabelColor = '#f5c842'; }

    return `
        <div style="margin-bottom:4px;border:1px solid #1a1410;border-radius:6px;overflow:hidden;">
            <div class="era-header" data-era="${eraIdx}" style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;background:#0a0806;cursor:pointer;border-bottom:${isExpanded ? '1px solid #1a1410' : 'none'};">
                <div style="display:flex;align-items:center;gap:6px;">
                    <span style="color:#6a5a4a;font-size:10px;transition:transform 0.15s;${isExpanded ? 'transform:rotate(90deg)' : ''}">▶</span>
                    <span style="color:${eraColor};font-weight:700;font-size:12px;">${weapons[0]?.era || ''}</span>
                    <span style="color:${eraLabelColor};font-size:10px;">${eraLabel}</span>
                </div>
                <div style="display:flex;gap:3px;">
                    ${weapons.map(w => {
                        const u = getWeaponUnlocked(S, w.id);
                        const c = S.weapon === w.id;
                        let d = '#1a1410';
                        if (c) d = '#f5c842';
                        else if (u) d = '#34d399';
                        return `<span style="width:8px;height:8px;border-radius:50%;background:${d};border:1px solid ${c ? '#f5c842' : '#2a1f18'};display:inline-block;" title="${w.name}"></span>`;
                    }).join('')}
                </div>
            </div>
            ${isExpanded ? `<div style="padding:6px;background:#060404;">${weapons.map(w => renderWeaponCard(w)).join('')}</div>` : ''}
        </div>`;
};

const renderEraRoadmap = () => {
    const currentEra = getEraForWeapon(getCurrentWeapon(S).tier);
    return `
        <div style="margin-bottom:8px;padding:6px 8px;background:#0a0806;border-radius:6px;border:1px solid #1a1410;">
            <div style="display:flex;gap:2px;flex-wrap:wrap;justify-content:center;">
                ${Array.from({length: ERA_COUNT}, (_, i) => {
                    const hasAny = getEraWeapons(i).some(w => getWeaponUnlocked(S, w.id));
                    const isFull = isEraFullyUnlocked(i);
                    let bg = '#1a1410', bd = '#1a1410';
                    if (i === currentEra) { bg = '#2a1f08'; bd = '#f5c842'; }
                    else if (isFull) { bg = '#0a1a10'; bd = '#34d399'; }
                    else if (hasAny) { bg = '#1a1808'; bd = '#fbbf24'; }
                    return `<div class="era-dot" data-era="${i}" style="width:18px;height:18px;border-radius:4px;background:${bg};border:1px solid ${bd};display:flex;align-items:center;justify-content:center;font-size:7px;color:#6a5a4a;cursor:pointer;" title="${ERA_NAMES[i]}">${i+1}</div>`;
                }).join('')}
            </div>
        </div>`;
};

const renderSmartAdvisor = () => {
    let bestUpgrade = null, bestUpgradeGain = 0, bestBuy = null, bestBuyGain = 0;
    for (const wp of WEAPONS) {
        const unlocked = getWeaponUnlocked(S, wp.id);
        if (unlocked) {
            const level = getWeaponLevel(S, wp.id);
            const maxLvl = getMaxLevelForWeapon(S, wp.id);
            if (level < maxLvl) {
                const gain = wp.damagePerLevel;
                if (gain > bestUpgradeGain) { bestUpgradeGain = gain; bestUpgrade = wp; }
            }
        } else if ((!WEAPONS[wp.tier - 2] || getWeaponUnlocked(S, WEAPONS[wp.tier - 2].id)) && S.gold >= wp.unlockCost) {
            const gain = wp.baseDamage + wp.damagePerLevel;
            if (gain > bestBuyGain) { bestBuyGain = gain; bestBuy = wp; }
        }
    }
    const parts = [];
    if (bestBuy) parts.push(`<span style="color:#fbbf24;">Купить <b>${bestBuy.name}</b> +${fmt(bestBuyGain)}⚔️ за ${fmt(bestBuy.unlockCost)}G</span>`);
    if (bestUpgrade) parts.push(`<span style="color:#34d399;">Улучшить <b>${bestUpgrade.name}</b> +${fmt(bestUpgradeGain)}⚔️</span>`);
    if (!parts.length) return '';
    return `<div style="margin-bottom:6px;padding:5px 10px;background:#0a0806;border:1px solid #1a1410;border-radius:6px;font-size:11px;display:flex;gap:12px;flex-wrap:wrap;">${parts.join('')}</div>`;
};

export const renderWeapons = () => {
    const c = $('weaponsContainer');
    if (!c) return;
    if (!S.f) { c.innerHTML = '<p style="color:#8a7a6a;">Выбери фракцию</p>'; return; }

    const totalDmg = getTotalWeaponDamage(S);
    const weaponCount = getWeaponCount(S);
    const synergyBonus = getSynergyBonus(S);
    const currentWp = getCurrentWeapon(S);
    const currentLevel = getWeaponLevel(S, currentWp.id);
    const currentMaxLvl = getMaxLevelForWeapon(S, currentWp.id);
    const currentDmg = getWeaponDamage(S, currentWp.id);

    let html = `
        <div style="margin-bottom:8px;padding:8px 12px;background:#0a0806;border:1px solid #f5c842;border-radius:8px;">
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <div style="flex:1;display:flex;align-items:center;gap:8px;">
                    <span style="font-size:24px;">${currentWp.icon || '⚔️'}</span>
                    <div>
                        <div style="color:#f5c842;font-weight:700;font-size:13px;">${currentWp.name}</div>
                        <div style="display:flex;gap:8px;font-size:10px;color:#8a7a6a;">
                            <span>ур.${currentLevel}/${currentMaxLvl}</span>
                            <span>${fmt(currentDmg)}⚔️</span>
                        </div>
                    </div>
                </div>
                <div style="display:flex;gap:8px;align-items:center;">
                    <div style="text-align:center;padding:4px 10px;background:#080604;border-radius:6px;">
                        <div style="color:#8a7a6a;font-size:9px;">ВСЕГО</div>
                        <div style="color:#34d399;font-weight:700;font-size:16px;">${fmt(totalDmg)}</div>
                    </div>
                    <div style="text-align:center;padding:4px 10px;background:#080604;border-radius:6px;">
                        <div style="color:#8a7a6a;font-size:9px;">ОРУЖИЙ</div>
                        <div style="color:#f5c842;font-weight:700;font-size:16px;">${weaponCount}</div>
                    </div>
                    <div style="text-align:center;padding:4px 10px;background:#080604;border-radius:6px;">
                        <div style="color:#8a7a6a;font-size:9px;">СИНЕРГИЯ</div>
                        <div style="color:#60a5fa;font-weight:700;font-size:16px;">+${(synergyBonus*100).toFixed(0)}%</div>
                    </div>
                </div>
            </div>
            <div style="margin-top:6px;height:4px;background:#1a1410;border-radius:2px;overflow:hidden;">
                <div style="height:100%;width:${(currentLevel/currentMaxLvl*100).toFixed(0)}%;background:linear-gradient(90deg,#f5c842,#fbbf24);border-radius:2px;"></div>
            </div>
        </div>
        ${renderSmartAdvisor()}
        ${renderEraRoadmap()}
        <div style="margin-bottom:4px;display:flex;justify-content:space-between;">
            <span style="color:#6a5a4a;font-size:11px;">Все оружия</span>
            <span style="color:#6a5a4a;font-size:11px;">${weaponCount}/${WEAPONS.length}</span>
        </div>`;

    for (let i = 0; i < ERA_COUNT; i++) html += renderEraBlock(i);

    c.innerHTML = html;

    document.querySelectorAll('.weapon-buy-btn').forEach(b => {
        b.onclick = () => {
            const id = b.dataset.id;
            if (buyWeapon(S, id)) {
                EventBus.emit('log:add', { msg: `[Weapon] Куплено: ${WEAPONS.find(w => w.id === id).name}`, cls: 'log-gold' });
                saveGame();
                renderWeapons();
            }
        };
    });

    document.querySelectorAll('.weapon-upgrade-btn').forEach(b => {
        b.onclick = () => {
            const id = b.dataset.id;
            const n = b.dataset.n;
            let upgraded = 0;
            if (n === 'max') upgraded = upgradeWeaponMax(S, id);
            else upgraded = upgradeWeaponN(S, id, parseInt(n));
            if (upgraded > 0) {
                const wp = WEAPONS.find(w => w.id === id);
                EventBus.emit('log:add', { msg: `[Up] ${wp.name} ×${upgraded} → ${S.weapons[id].level} ур.`, cls: 'log-gold' });
                saveGame();
                renderWeapons();
            }
        };
    });

    document.querySelectorAll('.weapon-select-btn').forEach(b => {
        b.onclick = () => { S.weapon = b.dataset.id; renderWeapons(); };
    });

    document.querySelectorAll('.era-header').forEach(el => {
        el.onclick = () => {
            const era = parseInt(el.dataset.era);
            if (expandedEras.has(era)) expandedEras.delete(era);
            else expandedEras.add(era);
            renderWeapons();
        };
    });

    document.querySelectorAll('.era-dot').forEach(el => {
        el.onclick = () => {
            expandedEras.add(parseInt(el.dataset.era));
            renderWeapons();
        };
    });
};
