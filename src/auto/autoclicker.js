import { S } from '../core/state.js';
import { CONFIG } from '../core/config.js';
import { EventBus } from '../core/eventBus.js';
import { attack } from '../combat/battle.js';
import { renderAutoClickerUI } from '../ui/renderer.js';

export const toggleAutoClicker = () => {
    const ac = S.auto;
    if (!S.faction.id) {
        EventBus.emit('log:add', { msg: '[X] Сначала выбери фракцию!', cls: 'log-damage' });
        return;
    }
    if (!ac.enabled) {
        if (S.player.gold < CONFIG.autoClicker.cost) {
            EventBus.emit('log:add', { msg: `[X] Нужно ${CONFIG.autoClicker.cost}G для активации!`, cls: 'log-damage' });
            return;
        }
        S.player.gold -= CONFIG.autoClicker.cost;
        ac.enabled = true;
        ac.interval = Math.max(100, CONFIG.autoClicker.interval - (ac.level * CONFIG.autoClicker.speedPerLevel));
        if (ac.timer) clearInterval(ac.timer);
        ac.timer = setInterval(() => { if (S.faction.id && S.player.hp > 0) attack(); }, ac.interval);
        EventBus.emit('log:add', { msg: `[AC] АВТОКЛИКЕР АКТИВИРОВАН! (${ac.interval}мс)`, cls: 'log-gold' });
    } else {
        if (ac.timer) clearInterval(ac.timer);
        ac.enabled = false;
        EventBus.emit('log:add', { msg: '[AC] Автокликер отключён', cls: 'log-damage' });
    }
    EventBus.emit('autoclicker:toggled');
    renderAutoClickerUI();
};

export const upgradeAutoClicker = () => {
    const ac = S.auto;
    if (!ac.enabled) {
        EventBus.emit('log:add', { msg: '[X] Сначала активируй автокликер!', cls: 'log-damage' });
        return;
    }
    if (ac.level >= CONFIG.autoClicker.maxLevel) {
        EventBus.emit('log:add', { msg: '[Max] Автокликер уже на максимальном уровне!', cls: 'log-gold' });
        return;
    }
    const cost = CONFIG.autoClicker.upgradeCost * (ac.level + 1);
    if (S.player.gold < cost) {
        EventBus.emit('log:add', { msg: `[X] Нужно ${cost}G для улучшения!`, cls: 'log-damage' });
        return;
    }
    S.player.gold -= cost;
    ac.level++;
    ac.interval = Math.max(100, CONFIG.autoClicker.interval - (ac.level * CONFIG.autoClicker.speedPerLevel));
    if (ac.timer) {
        clearInterval(ac.timer);
        ac.timer = setInterval(() => { if (S.faction.id && S.player.hp > 0) attack(); }, ac.interval);
    }
    EventBus.emit('log:add', { msg: `[Up] Автокликер улучшен до ${ac.level} уровня! (${ac.interval}мс)`, cls: 'log-gold' });
    EventBus.emit('autoclicker:upgraded');
    renderAutoClickerUI();
};