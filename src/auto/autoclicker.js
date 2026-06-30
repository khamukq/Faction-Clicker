import { S } from '../core/state.js';
import { CONFIG } from '../core/config.js';
import { EventBus } from '../core/eventBus.js';
import { attack } from '../combat/battle.js';
import { renderAutoClickerUI } from '../ui/renderer.js';

export const toggleAutoClicker = () => {
    if (!S.f) {
        EventBus.emit('log:add', { msg: '❌ Сначала выбери фракцию!', cls: 'log-damage' });
        return;
    }
    if (!S.autoClicker.enabled) {
        if (S.gold < CONFIG.autoClicker.cost) {
            EventBus.emit('log:add', { msg: `❌ Нужно ${CONFIG.autoClicker.cost}💰 для активации!`, cls: 'log-damage' });
            return;
        }
        S.gold -= CONFIG.autoClicker.cost;
        S.autoClicker.enabled = true;
        S.autoClicker.interval = Math.max(100, CONFIG.autoClicker.interval - (S.autoClicker.level * CONFIG.autoClicker.speedPerLevel));
        if (S.autoClicker.timer) clearInterval(S.autoClicker.timer);
        S.autoClicker.timer = setInterval(() => { if (S.f && S.hp > 0) attack(); }, S.autoClicker.interval);
        EventBus.emit('log:add', { msg: `🤖 АВТОКЛИКЕР АКТИВИРОВАН! (${S.autoClicker.interval}мс)`, cls: 'log-gold' });
    } else {
        if (S.autoClicker.timer) clearInterval(S.autoClicker.timer);
        S.autoClicker.enabled = false;
        EventBus.emit('log:add', { msg: '⏹️ Автокликер отключён', cls: 'log-damage' });
    }
    EventBus.emit('autoclicker:toggled');
    renderAutoClickerUI();
};

export const upgradeAutoClicker = () => {
    if (!S.autoClicker.enabled) {
        EventBus.emit('log:add', { msg: '❌ Сначала активируй автокликер!', cls: 'log-damage' });
        return;
    }
    if (S.autoClicker.level >= CONFIG.autoClicker.maxLevel) {
        EventBus.emit('log:add', { msg: '⭐ Автокликер уже на максимальном уровне!', cls: 'log-gold' });
        return;
    }
    const cost = CONFIG.autoClicker.upgradeCost * (S.autoClicker.level + 1);
    if (S.gold < cost) {
        EventBus.emit('log:add', { msg: `❌ Нужно ${cost}💰 для улучшения!`, cls: 'log-damage' });
        return;
    }
    S.gold -= cost;
    S.autoClicker.level++;
    S.autoClicker.interval = Math.max(100, CONFIG.autoClicker.interval - (S.autoClicker.level * CONFIG.autoClicker.speedPerLevel));
    if (S.autoClicker.timer) {
        clearInterval(S.autoClicker.timer);
        S.autoClicker.timer = setInterval(() => { if (S.f && S.hp > 0) attack(); }, S.autoClicker.interval);
    }
    EventBus.emit('log:add', { msg: `⬆ Автокликер улучшен до ${S.autoClicker.level} уровня! (${S.autoClicker.interval}мс)`, cls: 'log-gold' });
    EventBus.emit('autoclicker:upgraded');
    renderAutoClickerUI();
};