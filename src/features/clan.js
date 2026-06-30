import { S } from '../core/state.js';
import { EventBus } from '../core/eventBus.js';
import { fmt } from '../core/utils.js';
import { saveClansToFirebase, loadClansFromFirebase } from '../firebase/db.js';

const CLAN_KEY = 'factionClans';

let syncPending = false;

export const syncClansFromFirebase = async () => {
    try {
        const fbClans = await loadClansFromFirebase();
        if (fbClans && Array.isArray(fbClans) && fbClans.length > 0) {
            saveClans(fbClans);
        }
    } catch (e) {
        console.warn('Clans sync failed:', e);
    }
};

export const getClans = () => {
    try {
        const data = localStorage.getItem(CLAN_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) { return []; }
};

export const saveClans = (clans) => {
    try {
        localStorage.setItem(CLAN_KEY, JSON.stringify(clans));
        if (!syncPending) {
            syncPending = true;
            setTimeout(() => {
                syncPending = false;
                saveClansToFirebase(getClans());
            }, 1000);
        }
    } catch (e) { console.warn('Clans save failed:', e); }
};

export const createClan = (name) => {
    if (!S.nickname) {
        EventBus.emit('log:add', { msg: '❌ Сначала установите никнейм!', cls: 'log-damage' });
        return false;
    }
    if (S.gold < 5000) {
        EventBus.emit('log:add', { msg: '❌ Не хватает 5000 золота!', cls: 'log-damage' });
        return false;
    }
    const clans = getClans();
    if (clans.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        EventBus.emit('log:add', { msg: '❌ Клан с таким названием уже существует!', cls: 'log-damage' });
        return false;
    }
    S.gold -= 5000;
    const newClan = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
        name,
        leader: S.nickname,
        members: [S.nickname],
        level: 1,
        upgradeCost: 10000,
        created: new Date().toISOString()
    };
    clans.push(newClan);
    saveClans(clans);
    S.clan = newClan.id;
    S.clanName = newClan.name;
    EventBus.emit('log:add', { msg: `🛡️ Создан клан "${name}"!`, cls: 'log-gold' });
    EventBus.emit('clan:created');
    return true;
};

export const joinClan = (clanId) => {
    const clans = getClans();
    const clan = clans.find(c => c.id === clanId);
    if (!clan) {
        EventBus.emit('log:add', { msg: '❌ Клан не найден!', cls: 'log-damage' });
        return false;
    }
    if (clan.members.includes(S.nickname)) {
        EventBus.emit('log:add', { msg: '❌ Вы уже в этом клане!', cls: 'log-damage' });
        return false;
    }
    clan.members.push(S.nickname);
    saveClans(clans);
    S.clan = clan.id;
    S.clanName = clan.name;
    EventBus.emit('log:add', { msg: `🛡️ Вступление в клан "${clan.name}"!`, cls: 'log-gold' });
    EventBus.emit('clan:joined');
    return true;
};

export const upgradeClan = () => {
    const clans = getClans();
    const clan = clans.find(c => c.id === S.clan);
    if (!clan) {
        EventBus.emit('log:add', { msg: '❌ Вы не в клане!', cls: 'log-damage' });
        return false;
    }
    if (clan.leader !== S.nickname) {
        EventBus.emit('log:add', { msg: '❌ Только лидер может улучшать клан!', cls: 'log-damage' });
        return false;
    }
    if (S.gold < clan.upgradeCost) {
        EventBus.emit('log:add', { msg: `❌ Нужно ${fmt(clan.upgradeCost)} золота!`, cls: 'log-damage' });
        return false;
    }
    S.gold -= clan.upgradeCost;
    clan.level++;
    clan.upgradeCost = Math.floor(clan.upgradeCost * 2.5);
    saveClans(clans);
    EventBus.emit('log:add', { msg: `⬆ Клан "${clan.name}" улучшен до ${clan.level} уровня!`, cls: 'log-gold' });
    EventBus.emit('clan:upgraded');
    return true;
};