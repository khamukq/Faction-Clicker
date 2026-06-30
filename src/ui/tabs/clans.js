import { S } from '../../core/state.js';
import { $, fmt } from '../../core/utils.js';
import { getClans, createClan, joinClan, upgradeClan, syncClansFromFirebase } from '../../features/clan.js';

export const renderClans = async () => {
    const c = $('clansContainer');
    if (!c) return;

    await syncClansFromFirebase();
    const clans = getClans();
    const userClan = S.clan ? clans.find(cl => cl.id === S.clan) : null;

    let html = `
        <div style="margin:10px 0;">
            <h3 style="color:#f5c842;">🛡️ КЛАНЫ</h3>
            <div style="color:#8a7a6a;font-size:14px;margin-bottom:10px;">
                Объединяйся с другими игроками для усиления!
            </div>`;

    if (userClan) {
        html += `
            <div style="background:#0f0a08;border:2px solid #f5c842;border-radius:12px;padding:15px;margin-bottom:15px;">
                <div style="color:#f5c842;font-weight:700;font-size:18px;">🏰 ${userClan.name}</div>
                <div style="color:#8a7a6a;font-size:13px;">👑 Лидер: ${userClan.leader}</div>
                <div style="color:#8a7a6a;font-size:13px;">👥 Участников: ${userClan.members.length}</div>
                <div style="color:#8a7a6a;font-size:13px;">⬆️ Уровень: ${userClan.level}</div>
                <div style="color:#8a7a6a;font-size:13px;">💰 След. улучшение: ${fmt(userClan.upgradeCost)}</div>
                ${userClan.leader === S.nickname ? `
                    <button onclick="window.upgradeClan()" style="margin-top:10px;padding:8px 20px;background:#6b3a4a;border:2px solid #f5c842;color:#f5c842;border-radius:8px;cursor:pointer;font-weight:700;">
                        ⬆️ Улучшить клан
                    </button>` : ''}
                <div style="margin-top:10px;color:#6b3a4a;font-size:12px;">
                    📜 Участники: ${userClan.members.join(', ')}
                </div>
            </div>`;
    }

    html += `<div style="margin-top:15px;"><h4 style="color:#8a7a6a;">Все кланы</h4>`;

    if (clans.length === 0) {
        html += `<p style="color:#6b3a4a;text-align:center;padding:20px;">Нет созданных кланов. Будь первым! 🚀</p>`;
    } else {
        clans.forEach(clan => {
            const isMember = clan.members.includes(S.nickname);
            const isFull = clan.members.length >= 20;
            html += `
                <div style="background:#0f0a08;border:1px solid ${isMember ? '#f5c842' : '#3d2b1f'};border-radius:10px;padding:12px;margin:8px 0;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
                    <div>
                        <div style="color:#d4c5a0;font-weight:700;">${clan.name}</div>
                        <div style="color:#8a7a6a;font-size:12px;">👑 ${clan.leader} • 👥 ${clan.members.length}/20 участников</div>
                        <div style="color:#8a7a6a;font-size:11px;">⬆️ Уровень ${clan.level}</div>
                    </div>
                    ${!isMember && S.nickname && !isFull ? `
                        <button onclick="window.joinClan('${clan.id}')" style="padding:6px 16px;background:#3d2b1f;border:2px solid #8b7355;color:#d4c5a0;border-radius:6px;cursor:pointer;font-weight:600;">
                            Вступить
                        </button>` : isMember ? `
                        <span style="color:#34d399;font-weight:700;">✅ В клане</span>` : isFull ? `
                        <span style="color:#ef4444;font-size:12px;">❌ Клан полон</span>` : ''}
                </div>`;
        });
    }
    html += `</div>`;

    if (!userClan && S.nickname) {
        html += `
            <div style="margin-top:15px;padding:15px;background:#0f0a08;border:2px solid #3d2b1f;border-radius:12px;">
                <div style="color:#8a7a6a;font-size:13px;margin-bottom:8px;">💰 Стоимость создания: 5000 золота</div>
                <input type="text" id="clanNameInput" placeholder="Название клана..."
                    style="width:100%;padding:10px;background:#0f0a08;border:2px solid #3d2b1f;color:#d4c5a0;border-radius:8px;margin-bottom:10px;font-size:14px;">
                <button onclick="window.createClan(document.getElementById('clanNameInput').value)"
                    style="width:100%;padding:10px;background:#6b3a4a;border:2px solid #f5c842;color:#f5c842;border-radius:8px;cursor:pointer;font-weight:700;font-size:16px;">
                    🛡️ СОЗДАТЬ КЛАН (5000💰)
                </button>
            </div>`;
    }

    html += `</div>`;
    c.innerHTML = html;
};

window.createClan = createClan;
window.joinClan = joinClan;
window.upgradeClan = upgradeClan;
