import { S } from '../../core/state.js';
import { $ } from '../../core/utils.js';
import { saveGame } from '../../core/storage.js';
import { F } from '../../factions/index.js';
import { spawnEnemy } from '../../progression/floor.js';
import { resetGame } from '../../progression/reset.js';
import { recalculateStats } from '../stats.js';
import { addBattleLog } from '../battleLog.js';
import { renderUpgrades } from './upgrades.js';
import { renderPrestige } from './prestige.js';
import { renderAscension } from './ascension.js';
import { renderPerks } from './perks.js';
import { renderActiveSkills } from './skills.js';
import { updateUI } from '../hud.js';
import { ICONS } from '../../core/icons.js';

export const renderFactions = () => {
    const c = $('factionsContainer');
    if (!c) return;
    c.innerHTML = Object.values(F).map(f => `
        <div class="faction-card ${S.faction.id === f.id ? 'selected' : ''}" data-faction="${f.id}">
            <h3>${f.iconSvg || f.emoji} ${f.name}</h3>
            <p style="color:#8a7a6a;font-size:14px;">${f.style}</p>
            <div style="color:#34d399;font-size:13px;">${ICONS.boost} Множитель: x${f.multiplier}</div>
            <div style="margin-top:10px;color:#a08060;font-size:12px;">
                <strong>Пассивы:</strong> ${f.unique.passives.map(p => p.desc).join(' • ')}
            </div>
            <div style="color:#a08060;font-size:12px;">
                <strong>Активные:</strong> ${f.unique.actives.map(a => `${a.icon} ${a.name}`).join(' • ')}
            </div>
            ${S.faction.id === f.id ? `<div style="color:#f5c842;margin-top:10px;font-weight:700;">${ICONS.check} Выбрано</div>` : ''}
        </div>`).join('');

    document.querySelectorAll('.faction-card').forEach(card => {
        card.onclick = () => {
            const id = card.dataset.faction;
            if (S.faction.id === id) return;
            if (confirm('Сменить фракцию? Всё будет сброшено, кроме престижа и перков!')) {
                S.faction.id = id;
                resetGame();
                spawnEnemy();
                recalculateStats();
                renderFactions();
                renderUpgrades();
                renderPrestige();
                renderAscension();
                renderPerks();
                renderActiveSkills();
                updateUI();
                saveGame();
                addBattleLog(`[Faction] Выбрана фракция: ${F[id].name}`, 'log-gold');
            }
        };
    });
};
