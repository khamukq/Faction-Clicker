import { S } from '../../core/state.js';
import { $ } from '../../core/utils.js';
import { performAscension } from '../../progression/ascension.js';

export const renderAscension = () => {
    const container = $('ascensionContainer');
    if (!container) return;
    if (!S.faction.id) { container.innerHTML = ''; return; }

    const gain = Math.floor(Math.log1p(S.meta.prestigePoints) * 0.5);

    container.innerHTML = `
        <div style="background:#0f0a08;border:2px solid #a855f7;border-radius:12px;padding:20px;margin:10px 0;text-align:center;">
            <h3 style="color:#a855f7;">🌟 ВОЗНЕСЕНИЕ</h3>
            <div style="color:#a08060;margin:10px 0;">
                Уровень вознесения: <span style="color:#a855f7;font-weight:700;">${S.meta.ascension}</span>
                <br>Очков вознесения: <span style="color:#a855f7;font-weight:700;">${S.meta.ascensionPoints}</span>
            </div>
            <div style="color:#8a7a6a;margin:10px 0;font-size:14px;">
                Множитель силы: <span style="color:#34d399;">+${(S.meta.ascension * 10).toFixed(0)}%</span>
                <br>Доступно очков: <span style="color:#a855f7;">${gain}</span>
                <br>Требуется престижа: <span style="color:#fbbf24;">5+ очков</span>
            </div>
            <button id="ascensionBtn" ${S.meta.prestigePoints < 5 || gain <= 0 ? 'disabled' : ''}
                style="background:#6b3a4a;border:2px solid #a855f7;color:#a855f7;padding:10px 30px;border-radius:8px;cursor:${S.meta.prestigePoints >= 5 && gain > 0 ? 'pointer' : 'not-allowed'};font-weight:700;font-size:16px;opacity:${S.meta.prestigePoints >= 5 && gain > 0 ? 1 : 0.5};">
                ${S.meta.prestigePoints >= 5 && gain > 0 ? '🌟 ВОЗНЕСТИСЬ' : '❌ НУЖНО 5+ ПРЕСТИЖА'}
            </button>
            <div style="color:#6b3a4a;margin-top:10px;font-size:12px;">⚠️ СБРОСИТ ПРЕСТИЖ, НО ОСТАВИТ МНОЖИТЕЛЬ ВОЗНЕСЕНИЯ</div>
        </div>`;

    const btn = $('ascensionBtn');
    if (btn) btn.onclick = performAscension;
};
