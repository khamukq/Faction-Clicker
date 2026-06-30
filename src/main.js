import { S } from './core/state.js';
import { getEnemyStats } from './combat/enemies.js';
import { EventBus } from './core/eventBus.js';
import { loadGame, saveGame, loadGameFromFirebase, saveGameToFirebase } from './core/storage.js';
import { setupNickname } from './core/utils.js';
import { attack, skipBoss, surrenderBoss, showFloatingText } from './combat/battle.js';
import { spawnEnemy } from './progression/floor.js';
import { computeIncome } from './combat/damage.js';
import { CONFIG } from './core/config.js';
import {
updateUI, updateHealthUI, updateEnemyUI,
addBattleLog, recalculateStats,
renderUpgrades, renderFactions, renderClans,
renderPrestige, renderAscension, renderPerks,
renderActiveSkills, renderAutoClickerUI,
renderLevelStats, renderProfile, renderLeaderboard,
renderAchievements
} from './ui/renderer.js';
import { toggleAutoClicker, upgradeAutoClicker } from './auto/autoclicker.js';
import { activateSkill } from './ui/renderer.js';
import { F } from './factions/index.js';
import { login, register, logout, onAuthChange, getCurrentUser } from './firebase/auth.js';
import { saveNicknameMapping, getEmailByNickname, checkNicknameTaken } from './firebase/db.js';

window.attack = attack;
window.skipBoss = skipBoss;
window.surrenderBoss = surrenderBoss;
window.toggleAutoClicker = toggleAutoClicker;
window.upgradeAutoClicker = upgradeAutoClicker;
window.activateSkill = activateSkill;

let authResolve = null;
const authReady = new Promise((resolve) => { authResolve = resolve; });
let pendingNickname = null;

const showLoginError = (msg) => {
    const el = document.getElementById('authLoginError');
    if (el) { el.textContent = msg; el.style.display = 'block'; }
};

const hideLoginError = () => {
    const el = document.getElementById('authLoginError');
    if (el) el.style.display = 'none';
};

const showRegisterError = (msg) => {
    const el = document.getElementById('authRegisterError');
    if (el) { el.textContent = msg; el.style.display = 'block'; }
};

const hideRegisterError = () => {
    const el = document.getElementById('authRegisterError');
    if (el) el.style.display = 'none';
};

const setAuthLoading = (loading) => {
    const spinner = document.getElementById('authSpinner');
    const loginBtn = document.getElementById('authLoginBtn');
    const registerBtn = document.getElementById('authRegisterBtn');
    if (spinner) spinner.style.display = loading ? 'block' : 'none';
    if (loginBtn) loginBtn.disabled = loading;
    if (registerBtn) registerBtn.disabled = loading;
};

const togglePasswordVisibility = (toggleEl) => {
    const wrapper = toggleEl.parentElement;
    const input = wrapper.querySelector('input');
    if (!input) return;
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    toggleEl.textContent = isPassword ? '👁‍🗨' : '👁';
};

const setupAuthHandlers = () => {
    // ---- Вкладки Вход / Регистрация ----
    const tabLogin = document.getElementById('authTabLogin');
    const tabRegister = document.getElementById('authTabRegister');
    const loginTab = document.getElementById('authLoginTab');
    const registerTab = document.getElementById('authRegisterTab');

    const switchAuthTab = (showLogin) => {
        if (showLogin) {
            loginTab.style.display = 'block';
            registerTab.style.display = 'none';
            tabLogin.style.background = '#2a1f18';
            tabLogin.style.color = '#f5c842';
            tabRegister.style.background = 'transparent';
            tabRegister.style.color = '#8a7a6a';
        } else {
            loginTab.style.display = 'none';
            registerTab.style.display = 'block';
            tabRegister.style.background = '#2a1f18';
            tabRegister.style.color = '#34d399';
            tabLogin.style.background = 'transparent';
            tabLogin.style.color = '#8a7a6a';
        }
    };

    if (tabLogin) tabLogin.onclick = () => switchAuthTab(true);
    if (tabRegister) tabRegister.onclick = () => switchAuthTab(false);

    // ---- Переключатель Email / Никнейм (вкладка Вход) ----
    const modeEmail = document.getElementById('authModeEmail');
    const modeNickname = document.getElementById('authModeNickname');
    const emailInput = document.getElementById('authEmail');
    const nicknameInput = document.getElementById('authNickname');

    const setLoginMode = (isEmail) => {
        if (isEmail) {
            emailInput.style.display = 'block';
            nicknameInput.style.display = 'none';
            modeEmail.style.background = '#0f0a08';
            modeEmail.style.color = '#60a5fa';
            modeNickname.style.background = 'transparent';
            modeNickname.style.color = '#8a7a6a';
        } else {
            emailInput.style.display = 'none';
            nicknameInput.style.display = 'block';
            modeNickname.style.background = '#0f0a08';
            modeNickname.style.color = '#f5c842';
            modeEmail.style.background = 'transparent';
            modeEmail.style.color = '#8a7a6a';
        }
    };

    if (modeEmail) modeEmail.onclick = () => setLoginMode(true);
    if (modeNickname) modeNickname.onclick = () => setLoginMode(false);

    // ---- Показ/скрытие пароля ----
    document.querySelectorAll('.toggle-password').forEach(el => {
        el.onclick = () => togglePasswordVisibility(el);
    });

    // ---- Вход ----
    const loginBtn = document.getElementById('authLoginBtn');
    const loginPassword = document.getElementById('authPassword');

    if (loginBtn) loginBtn.onclick = async () => {
        hideLoginError();
        const isEmailMode = emailInput.style.display !== 'none';
        const identifier = isEmailMode
            ? (emailInput?.value?.trim() || '')
            : (nicknameInput?.value?.trim() || '');
        const password = loginPassword?.value?.trim() || '';

        if (!identifier || !password) {
            showLoginError(isEmailMode ? 'Введите email и пароль' : 'Введите никнейм и пароль');
            return;
        }
        if (password.length < 6) { showLoginError('Пароль минимум 6 символов'); return; }

        setAuthLoading(true);
        try {
            if (isEmailMode) {
                await login(identifier, password);
            } else {
                const email = await getEmailByNickname(identifier);
                if (!email) {
                    showLoginError('Никнейм не найден');
                    setAuthLoading(false);
                    return;
                }
                await login(email, password);
            }
        } catch (e) {
            showLoginError(getAuthErrorMessage(e));
            setAuthLoading(false);
        }
    };

    if (loginPassword) loginPassword.onkeydown = (e) => {
        if (e.key === 'Enter' && loginBtn) loginBtn.click();
    };
    if (nicknameInput) nicknameInput.onkeydown = (e) => {
        if (e.key === 'Enter' && loginBtn) loginBtn.click();
    };

    // ---- Регистрация ----
    const registerBtn = document.getElementById('authRegisterBtn');
    const regEmail = document.getElementById('regEmail');
    const regNickname = document.getElementById('regNickname');
    const regPassword = document.getElementById('regPassword');

    if (registerBtn) registerBtn.onclick = async () => {
        hideRegisterError();
        const email = regEmail?.value?.trim() || '';
        const nickname = regNickname?.value?.trim() || '';
        const password = regPassword?.value?.trim() || '';

        if (!email || !nickname || !password) { showRegisterError('Заполните все поля'); return; }
        if (nickname.length < 2 || nickname.length > 20) { showRegisterError('Никнейм должен быть 2-20 символов'); return; }
        if (!/^[a-zA-Z0-9_]+$/.test(nickname)) { showRegisterError('Никнейм: только буквы, цифры и _'); return; }
        if (password.length < 6) { showRegisterError('Пароль минимум 6 символов'); return; }

        setAuthLoading(true);
        try {
            const taken = await checkNicknameTaken(nickname);
            if (taken) { showRegisterError('Этот никнейм уже занят'); setAuthLoading(false); return; }
            pendingNickname = nickname;
            await register(email, password);
        } catch (e) {
            pendingNickname = null;
            showRegisterError(getAuthErrorMessage(e));
            setAuthLoading(false);
        }
    };

    if (regPassword) regPassword.onkeydown = (e) => {
        if (e.key === 'Enter' && registerBtn) registerBtn.click();
    };
};

const getAuthErrorMessage = (error) => {
    const code = error.code || '';
    if (code.includes('auth/email-already-in-use')) return 'Этот email уже зарегистрирован';
    if (code.includes('auth/invalid-email')) return 'Некорректный email';
    if (code.includes('auth/user-not-found')) return 'Пользователь не найден';
    if (code.includes('auth/wrong-password')) return 'Неверный пароль';
    if (code.includes('auth/weak-password')) return 'Слишком слабый пароль';
    if (code.includes('auth/too-many-requests')) return 'Слишком много попыток. Попробуй позже';
    if (code.includes('auth/invalid-credential')) return 'Неверный email или пароль';
    return error.message || 'Ошибка авторизации';
};

const renderFullUI = () => {
    spawnEnemy();
    updateUI();
    renderUpgrades();
    renderFactions();
    renderClans();
    renderPrestige();
    renderAscension();
    renderPerks();
    renderActiveSkills();
    renderAutoClickerUI();
    renderLevelStats();
    renderProfile();
    renderLeaderboard();
    renderAchievements();
};

const enterGame = () => {
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    document.getElementById('factionSelectScreen').style.display = 'none';
};

function startGame() {
    document.getElementById('app').style.display = 'flex';
    document.getElementById('factionSelectScreen').style.display = 'none';
    spawnEnemy();
    recalculateStats();
    updateUI();
    renderUpgrades();
    renderFactions();
    renderClans();
    renderPrestige();
    renderAscension();
    renderPerks();
    renderActiveSkills();
    renderAutoClickerUI();
    renderLevelStats();
    renderProfile();
    renderLeaderboard();
    renderAchievements();
    saveGame();
    addBattleLog(`👋 Добро пожаловать, ${S.nickname}! Выбрана фракция: ${F[S.f]?.emoji} ${F[S.f]?.name}`, 'log-gold');
}

function showFactionSelect(nickname) {
    document.getElementById('welcomeNickname').textContent = nickname;
    document.getElementById('factionSelectScreen').style.display = 'flex';
    document.querySelectorAll('.faction-select-card').forEach(card => {
        card.onclick = function() {
            const factionId = this.dataset.faction;
            if (S.f) {
                if (!confirm(`Вы уже играете за ${F[S.f]?.name}. Смена фракции сбросит весь прогресс (кроме престижа и перков). Продолжить?`)) return;
                S.gold = 10;
                S.maxHp = 100;
                S.hp = 100;
                S.level = 1;
                S.exp = 0;
                S.expToNext = 50;
                S.totalExp = 0;
                S.kills = 0;
                S.combo = 0;
                S.totalKills = 0;
                S.a = 0;
                S.u = {};
                S.isBoss = false;
                S.isSuperBoss = false;
                S.bossCount = 0;
                S.bossSkipped = false;
                S.bossAttempts = 0;
                S.activeSkills = {};
                S.levelStats = { damageBonus: 0, hpBonus: 0, healBonus: 0, goldBonus: 0 };
                S.floor = 1;
                S.floorKills = 0;
                S.superBossCount = 0;
                S.enemyIndex = 0;
                if (S.autoClicker.timer) {
                    clearInterval(S.autoClicker.timer);
                    S.autoClicker.timer = null;
                }
                S.autoClicker.enabled = false;
            }
            S.f = factionId;
            startGame();
        };
        card.addEventListener('mouseenter', function() {
            this.style.borderColor = '#f5c842';
            this.style.transform = 'scale(1.02)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.borderColor = '#3d2b1f';
            this.style.transform = 'scale(1)';
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupAuthHandlers();

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.onclick = async () => {
        await saveGameToFirebase();
        await logout();
        location.reload();
    };

    onAuthChange(async (user) => {
        if (user) {
            document.getElementById('authScreen').style.display = 'none';
            document.getElementById('authSpinner').style.display = 'none';
            document.getElementById('authLoginBtn').disabled = false;
            document.getElementById('authRegisterBtn').disabled = false;

            if (pendingNickname) {
                const nickname = pendingNickname;
                pendingNickname = null;
                if (user) {
                    await saveNicknameMapping(nickname, user.email, user.uid);
                }
                S.nickname = nickname;
                document.getElementById('nicknameScreen').style.display = 'none';
                const display = document.getElementById('nicknameDisplay');
                if (display) display.textContent = nickname;
                showFactionSelect(nickname);
            } else {
                const fbLoaded = await loadGameFromFirebase();
                if (fbLoaded && S.f && S.nickname) {
                    document.getElementById('nicknameScreen').style.display = 'none';
                    enterGame();
                    renderFullUI();
                    addBattleLog('☁️ Загружено из облака!', 'log-gold');
                } else if (fbLoaded && S.nickname && !S.f) {
                    document.getElementById('nicknameScreen').style.display = 'none';
                    showFactionSelect(S.nickname);
                } else {
                    const localLoaded = loadGame();
                    if (localLoaded && S.f && S.nickname) {
                        document.getElementById('nicknameScreen').style.display = 'none';
                        enterGame();
                        renderFullUI();
                        addBattleLog('💾 Загружено из кеша', 'log-gold');
                    } else if (localLoaded && S.nickname && !S.f) {
                        document.getElementById('nicknameScreen').style.display = 'none';
                        showFactionSelect(S.nickname);
                    } else {
                        document.getElementById('nicknameScreen').style.display = 'flex';
                        setupNickname(() => {
                            document.getElementById('nicknameScreen').style.display = 'none';
                            showFactionSelect(S.nickname);
                        });
                    }
                }
            }

            // Для старых аккаунтов — создать маппинг ника, если его нет
            if (user && S.nickname && !pendingNickname) {
                const existing = await getEmailByNickname(S.nickname);
                if (!existing) {
                    await saveNicknameMapping(S.nickname, user.email, user.uid);
                }
            }

            if (authResolve) authResolve();
        } else {
            document.getElementById('authScreen').style.display = 'flex';
            document.getElementById('app').style.display = 'none';
            document.getElementById('nicknameScreen').style.display = 'none';
        }
    });

    EventBus.on('log:add', ({ msg, cls }) => addBattleLog(msg, cls));

    EventBus.on('state:changed', ({ key }) => {
        if (['gold', 'totalGold', 'level', 'totalKills', 'combo', 'hp', 'maxHp', 'prestigePoints', 'ascension', 'isBoss'].includes(key)) {
            updateUI();
        }
    });

    EventBus.on('enemy:hpChanged', () => {
        const stats = getEnemyStats();
        updateEnemyUI(stats);
    });

    EventBus.on('enemy:spawned', (stats) => {
        updateEnemyUI(stats);
    });

    EventBus.on('player:hpChanged', () => {
        updateHealthUI();
        updateUI();
    });

    EventBus.on('boss:skipped', () => updateUI());
    EventBus.on('boss:reset', () => updateUI());
    EventBus.on('boss:attemptsUpdated', () => updateUI());
    EventBus.on('prestige:done', () => { renderLeaderboard(); });
    EventBus.on('ascension:done', () => { renderLeaderboard(); });

    const enemy = document.getElementById('enemyContainer');
    if (enemy) enemy.onclick = attack;

    document.querySelectorAll('.menu-item').forEach(item => {
        item.onclick = function() {
            document.querySelectorAll('.menu-item').forEach(x => x.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(x => x.classList.remove('active'));
            const tab = document.getElementById('tab-' + this.dataset.tab);
            if (tab) tab.classList.add('active');

            switch (this.dataset.tab) {
                case 'upgrades': renderUpgrades(); break;
                case 'factions': renderFactions(); break;
                case 'clans': renderClans(); break;
                case 'prestige': renderPrestige(); break;
                case 'ascension': renderAscension(); break;
                case 'perks': renderPerks(); break;
                case 'skills': renderActiveSkills(); break;
                case 'autoclicker': renderAutoClickerUI(); break;
                case 'levelstats': renderLevelStats(); break;
                case 'leaderboard': renderLeaderboard(); break;
                case 'profile': renderProfile(); break;
                case 'achievements': renderAchievements(); break;
                default: break;
            }
        };
    });

    const modalClose = document.querySelector('.modal-close');
    if (modalClose) {
        modalClose.onclick = () => {
            const modal = document.getElementById('modal');
            if (modal) modal.style.display = 'none';
        };
    }
    window.onclick = (e) => {
        const modal = document.getElementById('modal');
        if (e.target === modal) modal.style.display = 'none';
    };

    setInterval(() => {
        if (!S.f) return;
        const income = computeIncome();
        S.gold += income;
    }, 1000);

    setInterval(() => {
        if (S.combo > 0) {
            S.combo = Math.max(0, S.combo - 1);
        }
    }, CONFIG.difficulty.comboDecaySeconds * 1000);

    setInterval(async () => {
        if (S.f) {
            saveGame();
            await saveGameToFirebase();
        }
    }, 30000);

    recalculateStats();
    EventBus.on('save:done', () => {
        import('./features/leaderboard.js').then(({ addToLeaderboard }) => {
            addToLeaderboard();
        });
    });
});
