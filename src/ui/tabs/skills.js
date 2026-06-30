import { S } from '../../core/state.js';
import { $, getF } from '../../core/utils.js';
import { recalculateStats } from '../stats.js';
import { addBattleLog } from '../battleLog.js';
import { updateUI } from '../hud.js';
import { ICONS } from '../../core/icons.js';

export const activateSkill = (skillId) => {
    const faction = getF();
    const skill = faction?.unique?.actives?.find(s => s.id === skillId);
    if (!skill) {
        addBattleLog('[X] Способность не найдена', 'log-damage');
        return;
    }
    if (S.faction.activeSkills[skillId]?.active) {
        addBattleLog('[CD] Способность уже активна!', 'log-damage');
        return;
    }
    if (S.faction.activeSkills[skillId]?.cooldown > Date.now()) {
        const remaining = Math.ceil((S.faction.activeSkills[skillId].cooldown - Date.now()) / 1000);
        addBattleLog(`[CD] Перезарядка: ${remaining} сек`, 'log-damage');
        return;
    }
    if (skill.effect) skill.effect(S);
    S.faction.activeSkills[skillId] = {
        active: true,
        cooldown: Date.now() + skill.cooldown * 1000,
        timer: setTimeout(() => {
            if (skill.deactivate) skill.deactivate(S);
            S.faction.activeSkills[skillId].active = false;
            addBattleLog(`[CD] ${skill.name} закончилась`, 'log-damage');
            recalculateStats();
            updateUI();
        }, skill.duration * 1000)
    };
    addBattleLog(`[Skill] ${skill.name} активирована!`, 'log-gold');
    recalculateStats();
    updateUI();
};

export const renderActiveSkills = () => {
    const container = $('skillsContainer');
    if (!container || !S.faction.id) {
        if (container) container.innerHTML = '';
        return;
    }
    const faction = getF();
    const skills = faction?.unique?.actives || [];
    if (skills.length === 0) {
        container.innerHTML = '<p style="color:#8a7a6a;">Нет активных способностей</p>';
        return;
    }
    container.innerHTML = skills.map(skill => {
        const state = S.faction.activeSkills[skill.id] || { active: false, cooldown: 0 };
        const isActive = state.active || false;
        const isReady = !state.cooldown || state.cooldown < Date.now();
        const cooldownLeft = state.cooldown ? Math.ceil((state.cooldown - Date.now()) / 1000) : 0;
        return `
            <div class="skill-card" style="background:#0f0a08;border:2px solid ${isActive ? '#34d399' : '#3d2b1f'};border-radius:12px;padding:15px;margin:8px 0;">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
                    <div>
                        <div style="color:${isActive ? '#34d399' : '#d4c5a0'};font-weight:700;font-size:16px;">${skill.icon} ${skill.name}</div>
                        <div style="color:#8a7a6a;font-size:13px;">${skill.desc}</div>
                        <div style="color:#a08060;font-size:12px;">${ICONS.cooldown} ${skill.cooldown} сек • ${skill.duration} сек</div>
                    </div>
                    <button onclick="window.activateSkill('${skill.id}')"
                        style="padding:8px 20px;border-radius:8px;border:2px solid ${isReady ? '#f5c842' : '#3d2b1f'};
                        background:${isActive ? '#2d1b1b' : '#3d2b1f'};color:${isReady ? '#f5c842' : '#6b3a4a'};
                        cursor:${isReady ? 'pointer' : 'not-allowed'};opacity:${isReady ? 1 : 0.5};font-weight:700;" ${!isReady ? 'disabled' : ''}>
                        ${isActive ? `${ICONS.check} АКТИВНА` : isReady ? `${ICONS.boost} АКТИВИРОВАТЬ` : `${ICONS.cooldown} ${cooldownLeft}с`}
                    </button>
                </div>
            </div>`;
    }).join('');
};
