import { S } from '../../core/state.js';
import { $, fmt } from '../../core/utils.js';
import { CONFIG } from '../../core/config.js';

export const renderAutoClickerUI = () => {
    const container = $('autoClickerContainer');
    if (!container) return;
    if (!S.faction.id) {
        container.innerHTML = '<p style="color:#8a7a6a;">Выбери фракцию</p>';
        return;
    }

    const isActive = S.auto.enabled;
    const level = S.auto.level;
    const maxLevel = CONFIG.autoClicker.maxLevel;
    const currentInterval = S.auto.interval || CONFIG.autoClicker.interval;
    const upgradeCost = CONFIG.autoClicker.upgradeCost * (level + 1);
    const canUpgrade = level < maxLevel && S.player.gold >= upgradeCost;

    container.innerHTML = `
        <div style="background:#0f0a08;border:2px solid ${isActive ? '#34d399' : '#3d2b1f'};border-radius:12px;padding:20px;margin:10px 0;text-align:center;">
            <h3 style="color:${isActive ? '#34d399' : '#8a7a6a'};">🤖 АВТОКЛИКЕР</h3>
            <div style="color:#a08060;margin:10px 0;">
                Статус: <span style="color:${isActive ? '#34d399' : '#ef4444'};font-weight:700;">${isActive ? '✅ АКТИВЕН' : '❌ ОТКЛЮЧЁН'}</span>
            </div>
            <div style="color:#a08060;margin:5px 0;">
                Уровень: <span style="color:#f5c842;font-weight:700;">${level}/${maxLevel}</span>
            </div>
            <div style="color:#a08060;margin:5px 0;">
                Интервал: <span style="color:#60a5fa;font-weight:700;">${currentInterval}мс</span>
                ${level > 0 ? `<span style="color:#34d399;font-size:12px;"> (⬇️ ${CONFIG.autoClicker.speedPerLevel * level}мс)</span>` : ''}
            </div>
            <div style="margin-top:15px;display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">
                <button onclick="window.toggleAutoClicker()"
                    style="padding:10px 25px;background:${isActive ? '#3d2b1f' : '#6b3a4a'};border:2px solid ${isActive ? '#ef4444' : '#34d399'};color:${isActive ? '#ef4444' : '#34d399'};border-radius:8px;cursor:pointer;font-weight:700;font-size:14px;">
                    ${isActive ? '⏹️ ОТКЛЮЧИТЬ' : '▶️ АКТИВИРОВАТЬ (100💰)'}
                </button>
                ${isActive ? `
                    <button onclick="window.upgradeAutoClicker()"
                        style="padding:10px 25px;background:${canUpgrade ? '#6b3a4a' : '#1a1410'};border:2px solid ${canUpgrade ? '#f5c842' : '#3d2b1f'};color:${canUpgrade ? '#f5c842' : '#6b3a4a'};border-radius:8px;cursor:${canUpgrade ? 'pointer' : 'not-allowed'};font-weight:700;font-size:14px;">
                        ⬆️ УЛУЧШИТЬ (${fmt(upgradeCost)}💰)
                    </button>` : ''}
            </div>
            <div style="color:#6b3a4a;font-size:11px;margin-top:10px;">
                ⚡ Скорость: ${currentInterval}мс • Уровень: ${level}/${maxLevel}
            </div>
        </div>`;
};
