import { S } from '../../core/state.js';
import { $, fmt } from '../../core/utils.js';
import { CONFIG } from '../../core/config.js';
import { performPrestige } from '../../progression/prestige.js';

export const renderPrestige = () => {
    const container = $('prestigeContainer');
    if (!container) return;
    if (!S.f) { container.innerHTML = ''; return; }

    const potential = CONFIG.prestigeFormula(S.totalGold);
    const can = S.totalGold >= 100000 && potential > S.prestigePoints;
    const newMult = 1 + Math.log10(1 + (S.totalPrestigePoints + potential) * 0.2);

    container.innerHTML = `
        <div style="background:#0f0a08;border:2px solid #f5c842;border-radius:12px;padding:20px;margin:10px 0;text-align:center;">
            <h3 style="color:#f5c842;">🌟 ПРЕСТИЖ</h3>
            <div style="color:#a08060;margin:10px 0;">Очков престижа: <span style="color:#f5c842;font-weight:700;">${S.prestigePoints}</span></div>
            <div style="color:#a08060;margin:10px 0;">Постоянный множитель: <span style="color:#34d399;font-weight:700;">x${S.permanentMultiplier.toFixed(2)}</span></div>
            <div style="color:#8a7a6a;margin:10px 0;font-size:14px;">
                Всего заработано: <span style="color:#fbbf24;">${fmt(S.totalGold)}💰</span>
                <br>Доступно очков: <span style="color:#f5c842;">${potential}</span>
                <br>Новый множитель: <span style="color:#34d399;">x${newMult.toFixed(2)}</span>
            </div>
            <button id="prestigeBtn" ${!can ? 'disabled' : ''}
                style="background:#6b3a4a;border:2px solid #8b7355;color:#f5c842;padding:10px 30px;border-radius:8px;cursor:${can ? 'pointer' : 'not-allowed'};font-weight:700;font-size:16px;opacity:${can ? 1 : 0.5};">
                ${can ? '🌟 ПРЕСТИЖ' : '❌ НУЖНО 100,000💰'}
            </button>
            <div style="color:#6b3a4a;margin-top:10px;font-size:12px;">⚠️ ВСЁ БУДЕТ СБРОШЕНО, НО МНОЖИТЕЛЬ ОСТАНЕТСЯ</div>
        </div>`;

    const btn = $('prestigeBtn');
    if (btn) btn.onclick = performPrestige;
};
