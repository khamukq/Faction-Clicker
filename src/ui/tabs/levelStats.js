import { S } from '../../core/state.js';
import { $, fmt } from '../../core/utils.js';
import { CONFIG } from '../../core/config.js';
import { getLevelBonuses } from '../../progression/level.js';

export const renderLevelStats = () => {
    const container = $('levelStatsContainer');
    if (!container) return;
    if (!S.f) {
        container.innerHTML = '<p style="color:#8a7a6a;">Выбери фракцию</p>';
        return;
    }

    const bonuses = getLevelBonuses(S.level);
    container.innerHTML = `
        <div style="background:#0f0a08;border:2px solid #3d2b1f;border-radius:12px;padding:20px;margin:10px 0;">
            <h3 style="color:#60a5fa;">📊 СТАТИСТИКА УРОВНЯ</h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-top:15px;">
                <div class="stat-card">
                    <div style="color:#8a7a6a;font-size:11px;">⬆️ УРОВЕНЬ</div>
                    <div style="color:#34d399;font-size:24px;font-weight:700;">${S.level}</div>
                </div>
                <div class="stat-card">
                    <div style="color:#8a7a6a;font-size:11px;">⚔️ БОНУС УРОНА</div>
                    <div style="color:#f87171;font-size:24px;font-weight:700;">+${bonuses.damage}</div>
                </div>
                <div class="stat-card">
                    <div style="color:#8a7a6a;font-size:11px;">❤️ БОНУС HP</div>
                    <div style="color:#34d399;font-size:24px;font-weight:700;">+${bonuses.hp}</div>
                </div>
                <div class="stat-card">
                    <div style="color:#8a7a6a;font-size:11px;">💚 БОНУС РЕГЕНА</div>
                    <div style="color:#60a5fa;font-size:24px;font-weight:700;">+${bonuses.heal.toFixed(1)}/сек</div>
                </div>
                <div class="stat-card">
                    <div style="color:#8a7a6a;font-size:11px;">💰 БОНУС ДОХОДА</div>
                    <div style="color:#fbbf24;font-size:24px;font-weight:700;">+${bonuses.gold}/сек</div>
                </div>
                <div class="stat-card">
                    <div style="color:#8a7a6a;font-size:11px;">📊 ВСЕГО XP</div>
                    <div style="color:#a78bfa;font-size:24px;font-weight:700;">${fmt(S.totalExp)}</div>
                </div>
            </div>
            <div style="margin-top:15px;padding:10px;background:#0a0705;border-radius:8px;">
                <div style="color:#8a7a6a;font-size:12px;">🏆 Вехи:</div>
                <div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:5px;">
                    ${S.levelMilestones.length > 0 ? S.levelMilestones.map(l =>
                        `<span style="background:#1a1410;padding:2px 8px;border-radius:4px;color:#f5c842;font-size:12px;">${CONFIG.levelSystem.milestones[l]?.desc || `Уровень ${l}`}</span>`
                    ).join('') : '<span style="color:#6b3a4a;font-size:12px;">Нет вех</span>'}
                </div>
            </div>
        </div>`;
};
