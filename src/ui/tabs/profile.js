import { S } from '../../core/state.js';
import { $, fmt, getF } from '../../core/utils.js';
import { ACHIEVEMENTS } from '../../features/achievements.js';

export const renderProfile = () => {
    const container = $('profileContainer');
    if (!container) return;
    if (!S.faction.id || !S.player.nickname) {
        container.innerHTML = '<p style="color:#8a7a6a;">Сначала выбери никнейм и фракцию</p>';
        return;
    }

    const faction = getF();
    container.innerHTML = `
        <div style="background:#0f0a08;border:2px solid #f5c842;border-radius:12px;padding:20px;margin:10px 0;">
            <div style="text-align:center;">
                <div style="font-size:64px;">👤</div>
                <h2 style="color:#f5c842;">${S.player.nickname}</h2>
                <div style="color:#8a7a6a;">${faction?.emoji || '❓'} ${faction?.name || 'Без фракции'}</div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-top:20px;">
                <div class="stat-card">
                    <div style="color:#8a7a6a;font-size:11px;">🌟 ПРЕСТИЖ</div>
                    <div style="color:#f5c842;font-size:20px;font-weight:700;">${S.meta.prestigePoints}</div>
                </div>
                <div class="stat-card">
                    <div style="color:#8a7a6a;font-size:11px;">✨ ВОЗНЕСЕНИЕ</div>
                    <div style="color:#a855f7;font-size:20px;font-weight:700;">${S.meta.ascension}</div>
                </div>
                <div class="stat-card">
                    <div style="color:#8a7a6a;font-size:11px;">⚡ МНОЖИТЕЛЬ</div>
                    <div style="color:#34d399;font-size:20px;font-weight:700;">x${S.meta.permanentMultiplier.toFixed(2)}</div>
                </div>
                <div class="stat-card">
                    <div style="color:#8a7a6a;font-size:11px;">🏗️ ЭТАЖ</div>
                    <div style="color:#60a5fa;font-size:20px;font-weight:700;">${S.progression.floor}</div>
                </div>
                <div class="stat-card">
                    <div style="color:#8a7a6a;font-size:11px;">💀 УБИЙСТВ</div>
                    <div style="color:#a78bfa;font-size:20px;font-weight:700;">${S.progression.totalKills}</div>
                </div>
                <div class="stat-card">
                    <div style="color:#8a7a6a;font-size:11px;">💰 ЗОЛОТО</div>
                    <div style="color:#fbbf24;font-size:20px;font-weight:700;">${fmt(S.player.gold)}</div>
                </div>
                <div class="stat-card">
                    <div style="color:#8a7a6a;font-size:11px;">🛡️ КЛАН</div>
                    <div style="color:#f5c842;font-size:20px;font-weight:700;">${S.faction.clanName || 'Нет'}</div>
                </div>
                <div class="stat-card">
                    <div style="color:#8a7a6a;font-size:11px;">⚔️ АРМИЯ</div>
                    <div style="color:#fbbf24;font-size:20px;font-weight:700;">${S.player.a || 0}</div>
                </div>
            </div>
            <div style="margin-top:15px;padding:10px;background:#0a0705;border-radius:8px;">
                <div style="color:#8a7a6a;font-size:12px;">🏆 Достижения: ${S.faction.achievements.length}/${Object.keys(ACHIEVEMENTS).length}</div>
                <div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:5px;">
                    ${S.faction.achievements.map(a => {
                        const ach = ACHIEVEMENTS[a];
                        return ach ? `<span style="background:#1a1410;padding:2px 8px;border-radius:4px;color:#f5c842;font-size:12px;">${ach.icon} ${ach.name}</span>` : '';
                    }).join('') || '<span style="color:#6b3a4a;font-size:12px;">Нет достижений</span>'}
                </div>
            </div>
        </div>`;
};
