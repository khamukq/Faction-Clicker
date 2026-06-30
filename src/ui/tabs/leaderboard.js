import { S } from '../../core/state.js';
import { $, fmt } from '../../core/utils.js';
import { F } from '../../factions/index.js';
import { getLeaderboard } from '../../features/leaderboard.js';
import { addBattleLog } from '../battleLog.js';

export const showPlayerProfile = (nick) => {
    const entries = getLeaderboard();
    const player = entries.find(e => e.nickname === nick);
    if (!player) {
        addBattleLog('❌ Игрок не найден', 'log-damage');
        return;
    }

    const modal = $('modal');
    const body = $('modalBody');
    if (!modal || !body) return;

    body.innerHTML = `
        <div style="text-align:center;">
            <div style="font-size:48px;">👤</div>
            <h2 style="color:#f5c842;">${player.nickname}</h2>
            <div style="color:#8a7a6a;">${F[player.factionId]?.emoji || '❓'} ${player.faction}</div>
            <div style="margin:20px 0;text-align:left;">
                <div class="profile-stat"><span>🌟 Престиж</span><span>${player.prestige || 0}</span></div>
                <div class="profile-stat"><span>✨ Вознесение</span><span>${player.ascension || 0}</span></div>
                <div class="profile-stat"><span>🏗️ Этаж</span><span>${player.floor || 1}</span></div>
                <div class="profile-stat"><span>💰 Золото</span><span>${fmt(player.gold)}</span></div>
                <div class="profile-stat"><span>⬆️ Уровень</span><span>${player.level || 1}</span></div>
                <div class="profile-stat"><span>💀 Убийств</span><span>${player.kills || 0}</span></div>
                <div class="profile-stat"><span>🛡️ Клан</span><span>${player.clan || 'Нет клана'}</span></div>
                <div class="profile-stat"><span>⚡ Множитель</span><span>x${(player.permanent || 1).toFixed(2)}</span></div>
            </div>
            <button onclick="document.getElementById('modal').style.display='none'" class="btn-primary">Закрыть</button>
        </div>`;
    modal.style.display = 'flex';
};

export const renderLeaderboard = () => {
    const container = $('leaderboardContainer');
    if (!container) return;

    const entries = getLeaderboard();

    if (entries.length === 0) {
        container.innerHTML = `
            <div style="background:#0f0a08;border:2px solid #3d2b1f;border-radius:12px;padding:20px;text-align:center;margin:10px 0;">
                <h3 style="color:#f5c842;">🏆 ЛИДЕРБОРД</h3>
                <p style="color:#6b3a4a;padding:20px;">Нет записей. Будь первым! 🚀</p>
            </div>`;
        return;
    }

    let html = `
        <div style="background:#0f0a08;border:2px solid #f5c842;border-radius:12px;padding:20px;margin:10px 0;">
            <h3 style="color:#f5c842;">🏆 ЛИДЕРБОРД</h3>
            <div style="color:#8a7a6a;font-size:12px;margin-bottom:10px;">Топ-50 игроков по престижу</div>
            <div style="overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;font-size:13px;">
                    <thead>
                        <tr style="border-bottom:2px solid #3d2b1f;">
                            <th style="padding:8px;text-align:left;color:#8a7a6a;">#</th>
                            <th style="padding:8px;text-align:left;color:#8a7a6a;">👤 Ник</th>
                            <th style="padding:8px;text-align:center;color:#8a7a6a;">🏛️ Фракция</th>
                            <th style="padding:8px;text-align:center;color:#8a7a6a;">🌟 Престиж</th>
                            <th style="padding:8px;text-align:center;color:#8a7a6a;">✨ Вознес.</th>
                            <th style="padding:8px;text-align:center;color:#8a7a6a;">🏗️ Этаж</th>
                            <th style="padding:8px;text-align:center;color:#8a7a6a;">⚡ Множ.</th>
                            <th style="padding:8px;text-align:center;color:#8a7a6a;">🛡️ Клан</th>
                        </tr>
                    </thead>
                    <tbody>`;

    entries.forEach((entry, index) => {
        const isMe = entry.nickname === S.nickname;
        html += `
            <tr style="border-bottom:1px solid #1a1410;${isMe ? 'background:#2a1f18;' : ''}">
                <td style="padding:8px;color:${index < 3 ? '#f5c842' : '#8a7a6a'};font-weight:${index < 3 ? '700' : '400'};">
                    ${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </td>
                <td style="padding:8px;color:#60a5fa;font-weight:${isMe ? '700' : '400'};cursor:pointer;"
                    data-nickname="${entry.nickname.replace(/"/g, '&quot;')}">
                    ${entry.nickname} ${isMe ? '⭐' : ''}
                </td>
                <td style="padding:8px;text-align:center;color:#8a7a6a;">${F[entry.factionId]?.emoji || '❓'}</td>
                <td style="padding:8px;text-align:center;color:#f5c842;font-weight:700;">${entry.prestige || 0}</td>
                <td style="padding:8px;text-align:center;color:#a855f7;">${entry.ascension || 0}</td>
                <td style="padding:8px;text-align:center;color:#60a5fa;">${entry.floor || 1}</td>
                <td style="padding:8px;text-align:center;color:#34d399;">x${(entry.permanent || 1).toFixed(2)}</td>
                <td style="padding:8px;text-align:center;color:#8a7a6a;">${entry.clan || 'Нет'}</td>
            </tr>`;
    });

    html += `
                    </tbody>
                </table>
            </div>
            ${entries.length >= 50 ? '<div style="color:#6b3a4a;font-size:11px;margin-top:8px;">Показаны первые 50 записей</div>' : ''}
        </div>`;

    container.innerHTML = html;
    container.querySelectorAll('[data-nickname]').forEach(td => {
        td.onclick = () => showPlayerProfile(td.dataset.nickname);
    });
};

window.showPlayerProfile = showPlayerProfile;
