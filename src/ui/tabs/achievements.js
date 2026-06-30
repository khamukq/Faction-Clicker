import { S } from '../../core/state.js';
import { $ } from '../../core/utils.js';
import { ACHIEVEMENTS } from '../../features/achievements.js';
import { ICONS } from '../../core/icons.js';

export const renderAchievements = () => {
    const container = $('achievementsContainer');
    if (!container) return;
    if (!S.faction.id) {
        container.innerHTML = '<p style="color:#8a7a6a;">Выбери фракцию</p>';
        return;
    }

    let html = `
        <div style="background:#0f0a08;border:2px solid #f5c842;border-radius:12px;padding:20px;margin:10px 0;">
            <h3 style="color:#f5c842;">${ICONS.trophy} ДОСТИЖЕНИЯ</h3>
            <div style="color:#8a7a6a;font-size:12px;margin-bottom:10px;">
                ${S.faction.achievements.length}/${Object.keys(ACHIEVEMENTS).length} разблокировано
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;">`;

    for (const [key, ach] of Object.entries(ACHIEVEMENTS)) {
        const isUnlocked = S.faction.achievements.includes(key);
        html += `
            <div style="background:#0f0a08;border:2px solid ${isUnlocked ? '#f5c842' : '#3d2b1f'};border-radius:10px;padding:15px;text-align:center;opacity:${isUnlocked ? 1 : 0.5};">
                <div style="font-size:32px;">${ach.icon}</div>
                <div style="color:${isUnlocked ? '#f5c842' : '#8a7a6a'};font-weight:700;font-size:14px;">${ach.name}</div>
                <div style="color:#8a7a6a;font-size:12px;">${ach.desc}</div>
                ${isUnlocked ? `<div style="color:#34d399;font-size:11px;margin-top:4px;">${ICONS.check} Разблокировано</div>` : `<div style="color:#6b3a4a;font-size:11px;margin-top:4px;">${ICONS.lock} Заблокировано</div>`}
            </div>`;
    }

    html += `
            </div>
        </div>`;

    container.innerHTML = html;
};
