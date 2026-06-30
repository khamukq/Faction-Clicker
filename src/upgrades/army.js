import { S } from '../core/state.js';
import { EventBus } from '../core/eventBus.js';
import { getHireCost } from '../core/utils.js';

export const hireMercenary = () => {
    const cost = getHireCost();
    if (S.gold < cost) {
        EventBus.emit('log:add', { msg: '[X] Нет золота!', cls: 'log-damage' });
        return false;
    }
    S.gold -= cost;
    S.a = (S.a || 0) + 1;
    EventBus.emit('log:add', { msg: `[Army] Нанят отряд! Армия: ${S.a}`, cls: 'log-gold' });
    EventBus.emit('army:changed');
    return true;
};