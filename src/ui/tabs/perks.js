import { S } from '../../core/state.js';
import { $ } from '../../core/utils.js';
import { saveGame } from '../../core/storage.js';
import { PERKS } from '../../perks/perks.js';
import { recalculateStats } from '../stats.js';
import { addBattleLog } from '../battleLog.js';
import { ICONS } from '../../core/icons.js';

export const buyPerk = (id) => {
    const perk = PERKS[id];
    if (!perk) return;
    if (S.faction.perks.includes(id)) {
        addBattleLog('[X] Перк уже куплен!', 'log-damage');
        return;
    }
    if (S.meta.prestigePoints < perk.cost) {
        addBattleLog('[X] Не хватает очков престижа!', 'log-damage');
        return;
    }
    S.meta.prestigePoints -= perk.cost;
    S.faction.perks.push(id);
    recalculateStats();
    addBattleLog(`[Perk] "${perk.name}" активирован!`, 'log-gold');
    renderPerks();
    saveGame();
};

export const renderPerks = () => {
    const c = $('perksContainer');
    if (!c) return;
    if (!S.faction.id) { c.innerHTML = ''; return; }

    let html = `
        <div style="margin:10px 0;">
            <h3 style="color:#a855f7;">${ICONS.perk} ПЕРКИ</h3>
            <div style="color:#8a7a6a;font-size:14px;margin-bottom:10px;">
                Улучшают силу через специальные бонусы (сохраняются при престиже)
            </div>`;

    for (const [key, perk] of Object.entries(PERKS)) {
        const isUnlocked = S.faction.perks.includes(key);
        const canAfford = S.meta.prestigePoints >= perk.cost;
        html += `
            <div class="perk-card" style="background:#0f0a08;border:2px solid ${isUnlocked ? '#a855f7' : '#3d2b1f'};border-radius:12px;padding:15px;margin:8px 0;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
                <div>
                    <div style="color:${isUnlocked ? '#a855f7' : '#8a7a6a'};font-weight:700;">${perk.icon} ${perk.name}</div>
                    <div style="color:#8a7a6a;font-size:13px;">${perk.desc}</div>
                    <div style="color:#fbbf24;font-size:12px;">${ICONS.coin} ${perk.cost} очков престижа</div>
                </div>
                <button class="perk-btn" data-id="${key}" ${isUnlocked || !canAfford ? 'disabled' : ''}
                    style="background:${isUnlocked ? '#2d1b1b' : '#3d2b1f'};border:2px solid ${isUnlocked ? '#a855f7' : '#8b7355'};color:${isUnlocked ? '#a855f7' : '#d4c5a0'};padding:8px 20px;border-radius:8px;cursor:${!isUnlocked && canAfford ? 'pointer' : 'not-allowed'};opacity:${isUnlocked || !canAfford ? 0.5 : 1};">
                    ${isUnlocked ? `${ICONS.check} АКТИВЕН` : canAfford ? `${ICONS.unlock} КУПИТЬ` : `${ICONS.lock} НЕТ ОЧКОВ`}
                </button>
            </div>`;
    }
    html += `</div>`;
    c.innerHTML = html;
    document.querySelectorAll('.perk-btn').forEach(b => { b.onclick = () => buyPerk(b.dataset.id); });
};
