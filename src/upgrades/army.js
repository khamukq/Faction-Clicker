import { S } from '../core/state.js';
import { EventBus } from '../core/eventBus.js';
import { getHireCost } from '../core/utils.js';

export const hireMercenary = () => {
    const cost = getHireCost();
    if (S.player.gold < cost) {
        EventBus.emit('log:add', { msg: '[X] Нет золота!', cls: 'log-damage' });
        return false;
    }
    S.player.gold -= cost;
    S.player.a = (S.player.a || 0) + 1;
    EventBus.emit('log:add', { msg: `[Army] Нанят отряд! Армия: ${S.player.a}`, cls: 'log-gold' });
    EventBus.emit('army:changed');
    return true;
};