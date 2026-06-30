import { S } from '../../core/state.js';
import { $, fmt } from '../../core/utils.js';
import { EventBus } from '../../core/eventBus.js';
import { saveGame } from '../../core/storage.js';
import {
    WEAPONS, getWeaponDamage, getTotalWeaponDamage,
    getWeaponCount, getSynergyBonus, getWeaponLevel,
    getWeaponUpgradeCost, getWeaponUnlockCost, getMaxLevelForWeapon,
    buyWeapon, upgradeWeapon, getCurrentWeapon, getWeaponUnlocked
} from '../../upgrades/weapons.js';
import { ICONS } from '../../core/icons.js';

const ERAS = [
    { id: 0, name: 'Деревянное', minTier: 1, maxTier: 10, color: '#8B6914' },
    { id: 1, name: 'Каменное', minTier: 11, maxTier: 20, color: '#808080' },
    { id: 2, name: 'Медное', minTier: 21, maxTier: 30, color: '#B87333' },
    { id: 3, name: 'Бронзовое', minTier: 31, maxTier: 40, color: '#CD7F32' },
    { id: 4, name: 'Железное', minTier: 41, maxTier: 50, color: '#A19D94' },
    { id: 5, name: 'Стальное', minTier: 51, maxTier: 60, color: '#71797E' },
    { id: 6, name: 'Мифриловое', minTier: 61, maxTier: 70, color: '#4A90D9' },
    { id: 7, name: 'Адамантиновое', minTier: 71, maxTier: 80, color: '#E0115F' },
    { id: 8, name: 'Орихалковое', minTier: 81, maxTier: 90, color: '#FFD700' },
    { id: 9, name: 'Магическое', minTier: 91, maxTier: 100, color: '#9B30FF' },
    { id: 10, name: 'Легендарное', minTier: 101, maxTier: 110, color: '#FF4500' },
    { id: 11, name: 'Мифическое', minTier: 111, maxTier: 120, color: '#00CED1' },
    { id: 12, name: 'Божественное', minTier: 121, maxTier: 130, color: '#FFD700' },
    { id: 13, name: 'Демоническое', minTier: 131, maxTier: 140, color: '#DC143C' },
    { id: 14, name: 'Космическое', minTier: 141, maxTier: 150, color: '#191970' },
    { id: 15, name: 'Галактическое', minTier: 151, maxTier: 160, color: '#E6E6FA' },
    { id: 16, name: 'Астральное', minTier: 161, maxTier: 170, color: '#DDA0DD' },
    { id: 17, name: 'Вселенское', minTier: 171, maxTier: 180, color: '#4169E1' },
    { id: 18, name: 'Изначальное', minTier: 181, maxTier: 190, color: '#FFD700' },
    { id: 19, name: 'Абсолютное', minTier: 191, maxTier: 200, color: '#FFFFFF' }
];

const ERA_TYPES = ['меч', 'топор', 'копьё', 'дубина', 'молот', 'щит', 'алебарда', 'коса', 'цеп', 'посох'];

let expandedEras = new Set();

const getEraForWeapon = (tier) => {
    return Math.floor((tier - 1) / 10);
};

const getEraWeapons = (eraIdx) => {
    return WEAPONS.filter(w => getEraForWeapon(w.tier) === eraIdx);
};

const isEraUnlocked = (eraIdx) => {
    const weapons = getEraWeapons(eraIdx);
    return weapons.some(w => getWeaponUnlocked(S, w.id));
};

const isEraFullyUnlocked = (eraIdx) => {
    const weapons = getEraWeapons(eraIdx);
    return weapons.every(w => getWeaponUnlocked(S, w.id));
};

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

    let borderColor = '#1a1410';
    let bgColor = '#0a0806';
    let label = 'Заблокировано';

    if (isCurrent) {
        borderColor = '#f5c842';
        bgColor = '#1a1408';
        label = 'Текущее';
    } else if (unlocked) {
        borderColor = '#34d399';
        bgColor = '#0a1410';
        label = `Ур. ${level}`;
    } else if (canAffordUnlock && prevUnlocked) {
        borderColor = '#fbbf24';
        bgColor = '#141008';
        label = 'Купить';
    }

    const eraIdx = getEraForWeapon(wp.tier);
    const eraName = ERAS[eraIdx]?.name || '';

    return `
        <div style="background:${bgColor};border:2px solid ${borderColor};border-radius:10px;padding:12px;margin-bottom:8px;transition:all 0.2s;">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                <div style="flex:1;">
                    <div style="display:flex;align-items:center;gap:8px;">
                        <span style="color:${unlocked ? '#e0d6c8' : '#5a4a3a'};font-weight:700;font-size:15px;">
                            ${isCurrent ? '▶ ' : ''}${wp.name}
                        </span>
                        <span style="color:#8a7a6a;font-size:11px;">#${wp.tier}</span>
                        <span style="color:${unlocked || (canAffordUnlock && prevUnlocked) ? '#8a7a6a' : '#4a3a2a'};font-size:11px;background:#1a1410;padding:2px 6px;border-radius:4px;">${eraName}</span>
                    </div>
                    <div style="color:#8a7a6a;font-size:12px;margin-top:4px;">${wp.desc}</div>
                    ${unlocked ? `
                        <div style="margin-top:6px;">
                            <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:2px;">
                                <span style="color:#f87171;">Урон: ${fmt(damage)}</span>
                                <span style="color:#8a7a6a;">${level}/${maxLvl}</span>
                            </div>
                            <div style="height:6px;background:#1a1410;border-radius:3px;overflow:hidden;">
                                <div style="height:100%;width:${(level/maxLvl*100).toFixed(1)}%;background:${borderColor};border-radius:3px;transition:width 0.3s;"></div>
                            </div>
                        </div>
                    ` : ''}
                </div>
                <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end;">
                    ${!unlocked ? `
                        <button class="weapon-buy-btn" data-id="${wp.id}" style="padding:8px 16px;background:#2a1f18;border:2px solid ${canAffordUnlock && prevUnlocked ? '#fbbf24' : '#3a2a1a'};color:${canAffordUnlock && prevUnlocked ? '#fbbf24' : '#5a4a3a'};border-radius:6px;cursor:${canAffordUnlock && prevUnlocked ? 'pointer' : 'not-allowed'};font-size:13px;font-weight:600;${!(canAffordUnlock && prevUnlocked) ? 'opacity:0.5;' : ''}" ${!(canAffordUnlock && prevUnlocked) ? 'disabled' : ''}>
                            Купить ${fmt(wp.unlockCost)}${ICONS.coin}
                        </button>
                    ` : `
                        <button class="weapon-upgrade-btn" data-id="${wp.id}" style="padding:8px 16px;background:#1a2a10;border:2px solid ${canAffordUpgrade && !atMaxLevel ? '#34d399' : '#1a3a2a'};color:${canAffordUpgrade && !atMaxLevel ? '#34d399' : '#3a5a4a'};border-radius:6px;cursor:${canAffordUpgrade && !atMaxLevel ? 'pointer' : 'not-allowed'};font-size:13px;font-weight:600;${!(canAffordUpgrade && !atMaxLevel) ? 'opacity:0.5;' : ''}" ${(!canAffordUpgrade || atMaxLevel) ? 'disabled' : ''}>
                            ${atMaxLevel ? 'MAX' : `Улучшить ${fmt(upgradeCost)}${ICONS.coin}`}
                        </button>
                        <button class="weapon-select-btn" data-id="${wp.id}" style="padding:4px 10px;background:transparent;border:1px solid ${isCurrent ? '#f5c842' : '#3d2b1f'};color:${isCurrent ? '#f5c842' : '#8a7a6a'};border-radius:4px;cursor:pointer;font-size:11px;">
                            ${isCurrent ? '✓' : 'Выбрать'}
                        </button>
                    `}
                </div>
            </div>
        </div>`;
};

const renderEraBlock = (eraIdx) => {
    const era = ERAS[eraIdx];
    const weapons = getEraWeapons(eraIdx);
    const unlocked = weapons.filter(w => getWeaponUnlocked(S, w.id)).length;
    const total = weapons.length;
    const isExpanded = expandedEras.has(eraIdx) || (unlocked > 0 && unlocked < total);
    const isFull = unlocked === total;
    const hasAny = unlocked > 0;

    let eraLabel = '🔒 Закрыто';
    let eraColor = '#3a2a1a';
    if (isFull) { eraLabel = '✅ Полностью'; eraColor = '#34d399'; }
    else if (hasAny) { eraLabel = `⚔️ ${unlocked}/${total}`; eraColor = '#f5c842'; }

    return `
        <div style="margin-bottom:10px;border:1px solid #2a1f18;border-radius:10px;overflow:hidden;">
            <div class="era-header" data-era="${eraIdx}" style="display:flex;justify-content:space-between;align-items:center;padding:12px 15px;background:#0f0a08;cursor:pointer;border-bottom:${isExpanded ? '1px solid #2a1f18' : 'none'};">
                <div style="display:flex;align-items:center;gap:10px;">
                    <span style="color:#8a7a6a;font-size:16px;transition:transform 0.2s;display:inline-block;${isExpanded ? 'transform:rotate(90deg)' : ''}">▶</span>
                    <span style="color:${era.color};font-weight:700;font-size:15px;">${era.name}</span>
                    <span style="color:${eraColor};font-size:12px;background:#1a1410;padding:2px 8px;border-radius:6px;">${eraLabel}</span>
                </div>
                <div style="display:flex;gap:4px;">
                    ${weapons.map((w, i) => {
                        const unlocked = getWeaponUnlocked(S, w.id);
                        const isCurrent = S.weapon === w.id;
                        let dotColor = '#2a1a1a';
                        if (isCurrent) dotColor = '#f5c842';
                        else if (unlocked) dotColor = '#34d399';
                        return `<span style="width:12px;height:12px;border-radius:50%;background:${dotColor};border:1px solid ${isCurrent ? '#f5c842' : '#3a2a1a'};display:inline-block;" title="${w.name}"></span>`;
                    }).join('')}
                </div>
            </div>
            ${isExpanded ? `
                <div style="padding:10px;background:#080604;">
                    ${weapons.map(w => renderWeaponCard(w)).join('')}
                </div>
            ` : ''}
        </div>`;
};

const renderEraRoadmap = () => {
    const currentWp = getCurrentWeapon(S);
    const currentEra = getEraForWeapon(currentWp.tier);
    return `
        <div style="margin-bottom:15px;padding:12px;background:#0f0a08;border-radius:10px;border:1px solid #2a1f18;">
            <div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:center;">
                ${ERAS.map((era, i) => {
                    const hasAny = getEraWeapons(i).some(w => getWeaponUnlocked(S, w.id));
                    const isFull = isEraFullyUnlocked(i);
                    let bg = '#1a1410';
                    let border = '#2a1f18';
                    if (i === currentEra) { bg = '#2a1f08'; border = '#f5c842'; }
                    else if (isFull) { bg = '#0a1a10'; border = '#34d399'; }
                    else if (hasAny) { bg = '#1a1808'; border = '#fbbf24'; }
                    return `<div class="era-dot" data-era="${i}" style="width:24px;height:24px;border-radius:6px;background:${bg};border:2px solid ${border};display:flex;align-items:center;justify-content:center;font-size:9px;color:#8a7a6a;cursor:pointer;transition:all 0.2s;" title="${era.name}">${i + 1}</div>`;
                }).join('')}
            </div>
        </div>`;
};

const renderSmartAdvisor = () => {
    let bestUpgrade = null;
    let bestUpgradeGain = 0;
    let bestBuy = null;
    let bestBuyGain = 0;

    for (const wp of WEAPONS) {
        const unlocked = getWeaponUnlocked(S, wp.id);
        if (unlocked) {
            const level = getWeaponLevel(S, wp.id);
            const maxLvl = getMaxLevelForWeapon(S, wp.id);
            if (level < maxLvl) {
                const currentDmg = getWeaponDamage(S, wp.id);
                const nextDmg = wp.baseDamage + wp.damagePerLevel * (level + 1);
                const gain = nextDmg - currentDmg;
                if (gain > bestUpgradeGain) {
                    bestUpgradeGain = gain;
                    bestUpgrade = wp;
                }
            }
        } else {
            const prevWp = WEAPONS[wp.tier - 2];
            const prevUnlocked = !prevWp || getWeaponUnlocked(S, prevWp.id);
            if (prevUnlocked && S.gold >= wp.unlockCost) {
                const gain = wp.baseDamage + wp.damagePerLevel;
                if (gain > bestBuyGain) {
                    bestBuyGain = gain;
                    bestBuy = wp;
                }
            }
        }
    }

    let html = '';
    if (bestBuy) {
        html += `<div style="margin-bottom:8px;padding:10px;background:#1a1408;border:2px solid #fbbf24;border-radius:8px;font-size:13px;">
            <span style="color:#fbbf24;font-weight:700;">💡 Совет:</span>
            <span style="color:#e0d6c8;"> Купите <strong>${bestBuy.name}</strong> (+${fmt(bestBuyGain)} урона) за ${fmt(bestBuy.unlockCost)} золота</span>
        </div>`;
    }
    if (bestUpgrade) {
        html += `<div style="margin-bottom:8px;padding:10px;background:#0a1a10;border:2px solid #34d399;border-radius:8px;font-size:13px;">
            <span style="color:#34d399;font-weight:700;">💡 Совет:</span>
            <span style="color:#e0d6c8;"> Улучшите <strong>${bestUpgrade.name}</strong> (+${fmt(bestUpgradeGain)} урона)</span>
        </div>`;
    }
    return html;
};

export const renderWeapons = () => {
    const c = $('weaponsContainer');
    if (!c) return;
    if (!S.f) {
        c.innerHTML = '<p style="color:#8a7a6a;">Выбери фракцию</p>';
        return;
    }

    const totalDmg = getTotalWeaponDamage(S);
    const synergyBonus = getSynergyBonus(S);
    const weaponCount = getWeaponCount(S);
    const currentWp = getCurrentWeapon(S);
    const currentLevel = getWeaponLevel(S, currentWp.id);
    const currentMaxLvl = getMaxLevelForWeapon(S, currentWp.id);
    const currentDmg = getWeaponDamage(S, currentWp.id);
    const currentEra = getEraForWeapon(currentWp.tier);

    let html = `
        <div style="margin-bottom:15px;padding:15px;background:#0f0a08;border:2px solid #f5c842;border-radius:12px;">
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:12px;">
                <div style="text-align:center;padding:10px;background:#0a0806;border-radius:8px;">
                    <div style="color:#8a7a6a;font-size:11px;margin-bottom:4px;">Общий урон</div>
                    <div style="color:#34d399;font-weight:700;font-size:24px;">${fmt(totalDmg)}</div>
                </div>
                <div style="text-align:center;padding:10px;background:#0a0806;border-radius:8px;">
                    <div style="color:#8a7a6a;font-size:11px;margin-bottom:4px;">Оружий</div>
                    <div style="color:#f5c842;font-weight:700;font-size:24px;">${weaponCount}</div>
                </div>
                <div style="text-align:center;padding:10px;background:#0a0806;border-radius:8px;">
                    <div style="color:#8a7a6a;font-size:11px;margin-bottom:4px;">Синергия</div>
                    <div style="color:#60a5fa;font-weight:700;font-size:24px;">+${(synergyBonus * 100).toFixed(0)}%</div>
                </div>
            </div>
            <div style="padding:10px;background:#0a0806;border-radius:8px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                    <span style="color:#f5c842;font-weight:700;font-size:16px;">▶ ${currentWp.name}</span>
                    <span style="color:#f87171;font-weight:700;font-size:14px;">${fmt(currentDmg)} урона</span>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:2px;">
                    <span style="color:#8a7a6a;">Уровень ${currentLevel}/${currentMaxLvl}</span>
                    <span style="color:#8a7a6a;">${ERAS[currentEra]?.name || ''}</span>
                </div>
                <div style="height:8px;background:#1a1410;border-radius:4px;overflow:hidden;">
                    <div style="height:100%;width:${(currentLevel/currentMaxLvl*100).toFixed(1)}%;background:linear-gradient(90deg,#f5c842,#fbbf24);border-radius:4px;transition:width 0.3s;"></div>
                </div>
            </div>
        </div>
        ${renderSmartAdvisor()}
        ${renderEraRoadmap()}
        <div style="margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;">
            <span style="color:#8a7a6a;font-size:13px;">Все оружия</span>
            <span style="color:#8a7a6a;font-size:12px;">${weaponCount}/${WEAPONS.length}</span>
        </div>`;

    for (let i = 0; i < ERAS.length; i++) {
        html += renderEraBlock(i);
    }

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
            if (upgradeWeapon(S, id)) {
                EventBus.emit('log:add', { msg: `[Up] Улучшено: ${WEAPONS.find(w => w.id === id).name} → ${S.weapons[id].level} ур.`, cls: 'log-gold' });
                saveGame();
                renderWeapons();
            }
        };
    });

    document.querySelectorAll('.weapon-select-btn').forEach(b => {
        b.onclick = () => {
            S.weapon = b.dataset.id;
            renderWeapons();
        };
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
            const eraIdx = parseInt(el.dataset.era);
            const eraContainer = document.querySelectorAll('.era-header')[eraIdx];
            expandedEras.add(eraIdx);
            renderWeapons();
        };
    });
};
