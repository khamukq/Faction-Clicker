// ==============================================
// UTILITIES
// ==============================================

import { S } from './state.js';
import { F } from '../factions/index.js';
import { CONFIG } from './config.js';

export const $ = id => document.getElementById(id);

export const fmt = n => {
if (isNaN(n) || !isFinite(n)) return '0';
if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
return Math.floor(n).toString();
};

export const RNG = (() => {
let seed = Date.now() % 233280;
return {
setSeed(s) { seed = s; },
next() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; },
range(min, max) { return min + this.next() * (max - min); },
chance(p) { return this.next() < p; }
};
})();

export const getU = id => S.u[id] || 0;
export const getF = () => F[S.f];
export const getUs = () => S.f ? F[S.f].u : [];

export const getHireCost = () => {
let cost = 120 * Math.pow(CONFIG.difficulty.hireBaseMult, S.a || 0);
if (S.b.hireDiscount > 0) cost *= (1 - S.b.hireDiscount);
return Math.max(1, Math.floor(cost));
};

export const price = (u) => {
const lv = getU(u.id);
let cost = u.base * Math.pow(CONFIG.difficulty.upgradeBaseMult, lv);
const discount = (S.b.hireDiscount || 0);
cost *= (1 - discount);
return Math.max(1, Math.floor(cost));
};

export const getNextEffect = (u) => {
const lv = getU(u.id);
const nextVal = u.e.v * (lv + 1);
switch (u.e.t) {
case 'damage': return `+${nextVal} урона`;
case 'critChance': return `+${(nextVal * 100).toFixed(0)}% шанс крита`;
case 'critMultiplier': return `+${nextVal} множитель крита`;
case 'gold': return `+${nextVal} золота/сек`;
case 'boost': return `x${u.e.v} доход на ${u.e.dur} сек`;
case 'armyPassive': return `+${nextVal} золота/сек за наёмника`;
case 'armyDamage': return `+${nextVal} урона за наёмника`;
case 'passive': return `+${nextVal} золота/сек`;
case 'healRegen': return `+${nextVal} регенерации/сек`;
case 'defense': return `+${nextVal} защиты`;
default: return `+${nextVal}`;
}
};

// НИКНЕЙМ (с callback после установки)
export const setupNickname = (onComplete) => {
const screen = document.getElementById('nicknameScreen');
const input = document.getElementById('nicknameInput');
const error = document.getElementById('nicknameError');
const btn = document.getElementById('setNicknameBtn');

const validate = (name) => {
if (!name || name.length < 2 || name.length > 20) {
error.textContent = '[X] Никнейм должен быть 2-20 символов';
error.style.display = 'block';
return false;
}
if (!/^[a-zA-Z0-9_]+$/.test(name)) {
error.textContent = '[X] Только буквы, цифры и _';
error.style.display = 'block';
return false;
}
error.style.display = 'none';
return true;
};

const setNick = () => {
const name = input.value.trim();
if (!validate(name)) return;
S.nickname = name;
screen.style.display = 'none';
// дополнительно обновим отображение
const display = document.getElementById('nicknameDisplay');
if (display) display.textContent = name;
// вызываем callback, если передан
if (onComplete) onComplete();
};

btn.onclick = setNick;
input.addEventListener('keydown', (e) => {
if (e.key === 'Enter') setNick();
});
// если уже есть сохранённый ник, можно сразу применить
if (S.nickname) {
screen.style.display = 'none';
const display = document.getElementById('nicknameDisplay');
if (display) display.textContent = S.nickname;
if (onComplete) onComplete();
}
};