import { $ } from '../core/utils.js';

export const addBattleLog = (msg, cls = '') => {
    const log = $('battleLog');
    if (!log) return;
    const d = document.createElement('div');
    d.className = cls;
    d.textContent = msg;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    while (log.children.length > 50) log.removeChild(log.firstChild);
};
