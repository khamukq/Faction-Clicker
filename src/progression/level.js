import { S } from '../core/state.js';
import { CONFIG } from '../core/config.js';
import { EventBus } from '../core/eventBus.js';

export const getExpForLevel = (level) => CONFIG.levelSystem.expFormula(level);

export const getLevelBonuses = (level) => {
    const bonuses = CONFIG.levelSystem.bonuses;
    return {
        damage: 0,  // заменено на процентный множитель в damage.js
        hp: level * bonuses.hpPerLevel,
        heal: level * bonuses.healPerLevel,
        gold: level * bonuses.goldPerLevel
    };
};

export const checkLevelMilestones = () => {
    const milestone = CONFIG.levelSystem.milestones[S.level];
    if (milestone && !S.levelMilestones.includes(S.level)) {
        S.levelMilestones.push(S.level);
        S.gold += milestone.gold;
        EventBus.emit('log:add', { msg: `[Milestone] ${milestone.desc}! +${milestone.gold}G`, cls: 'log-boss' });
        return true;
    }
    return false;
};

export const addExp = (amount) => {
    S.exp += amount;
    levelUp();
};

export const levelUp = () => {
    while (S.exp >= S.expToNext) {
        S.exp -= S.expToNext;
        S.level++;
        S.totalExp += S.expToNext;
        S.expToNext = getExpForLevel(S.level);

        const bonuses = getLevelBonuses(S.level);
        S.levelStats.damageBonus += bonuses.damage;
        S.levelStats.hpBonus += bonuses.hp;
        S.levelStats.healBonus += bonuses.heal;
        S.levelStats.goldBonus += bonuses.gold;

        S.maxHp += bonuses.hp;
        S.hp = S.maxHp;

        checkLevelMilestones();
        EventBus.emit('log:add', { msg: `[Lvl] УРОВЕНЬ ${S.level}!`, cls: 'log-gold' });
        EventBus.emit('player:levelUp');
    }
};