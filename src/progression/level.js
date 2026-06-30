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
    const pl = S.player;
    const milestone = CONFIG.levelSystem.milestones[pl.level];
    if (milestone && !pl.levelMilestones.includes(pl.level)) {
        pl.levelMilestones.push(pl.level);
        pl.gold += milestone.gold;
        EventBus.emit('log:add', { msg: `[Milestone] ${milestone.desc}! +${milestone.gold}G`, cls: 'log-boss' });
        return true;
    }
    return false;
};

export const addExp = (amount) => {
    S.player.exp += amount;
    levelUp();
};

export const levelUp = () => {
    const pl = S.player;
    while (pl.exp >= pl.expToNext) {
        pl.exp -= pl.expToNext;
        pl.level++;
        pl.totalExp += pl.expToNext;
        pl.expToNext = getExpForLevel(pl.level);

        const bonuses = getLevelBonuses(pl.level);
        pl.levelStats.damageBonus += bonuses.damage;
        pl.levelStats.hpBonus += bonuses.hp;
        pl.levelStats.healBonus += bonuses.heal;
        pl.levelStats.goldBonus += bonuses.gold;

        pl.maxHp += bonuses.hp;
        pl.hp = pl.maxHp;

        checkLevelMilestones();
        EventBus.emit('log:add', { msg: `[Lvl] УРОВЕНЬ ${pl.level}!`, cls: 'log-gold' });
        EventBus.emit('player:levelUp');
    }
};