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
    if (!S.player.nickname) {
        EventBus.emit('log:add', { msg: '[X] Сначала установите никнейм!', cls: 'log-damage' });
        return false;
    }
    if (S.player.gold < 5000) {
        EventBus.emit('log:add', { msg: '[X] Не хватает 5000 золота!', cls: 'log-damage' });
        return false;
    }
    const clans = getClans();
    if (clans.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        EventBus.emit('log:add', { msg: '[X] Клан с таким названием уже существует!', cls: 'log-damage' });
        return false;
    }
    S.player.gold -= 5000;
    const newClan = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
        name,
        leader: S.player.nickname,
        members: [S.player.nickname],
        level: 1,
        upgradeCost: 10000,
        created: new Date().toISOString()
    };
    clans.push(newClan);
    saveClans(clans);
    S.faction.clan = newClan.id;
    S.faction.clanName = newClan.name;
    EventBus.emit('log:add', { msg: `[Clan] Создан клан "${name}"!`, cls: 'log-gold' });
    EventBus.emit('clan:created');
    return true;
};

export const joinClan = (clanId) => {
    const clans = getClans();
    const clan = clans.find(c => c.id === clanId);
    if (!clan) {
        EventBus.emit('log:add', { msg: '[X] Клан не найден!', cls: 'log-damage' });
        return false;
    }
    if (clan.members.includes(S.player.nickname)) {
        EventBus.emit('log:add', { msg: '[X] Вы уже в этом клане!', cls: 'log-damage' });
        return false;
    }
    clan.members.push(S.player.nickname);
    saveClans(clans);
    S.faction.clan = clan.id;
    S.faction.clanName = clan.name;
    EventBus.emit('log:add', { msg: `[Clan] Вступление в клан "${clan.name}"!`, cls: 'log-gold' });
    EventBus.emit('clan:joined');
    return true;
};

export const upgradeClan = () => {
    const clans = getClans();
    const clan = clans.find(c => c.id === S.faction.clan);
    if (!clan) {
        EventBus.emit('log:add', { msg: '[X] Вы не в клане!', cls: 'log-damage' });
        return false;
    }
    if (clan.leader !== S.player.nickname) {
        EventBus.emit('log:add', { msg: '[X] Только лидер может улучшать клан!', cls: 'log-damage' });
        return false;
    }
    if (S.player.gold < clan.upgradeCost) {
        EventBus.emit('log:add', { msg: `[X] Нужно ${fmt(clan.upgradeCost)} золота!`, cls: 'log-damage' });
        return false;
    }
    S.player.gold -= clan.upgradeCost;
    clan.level++;
    clan.upgradeCost = Math.floor(clan.upgradeCost * 2.5);
    saveClans(clans);
    EventBus.emit('log:add', { msg: `⬆ Клан "${clan.name}" улучшен до ${clan.level} уровня!`, cls: 'log-gold' });
    EventBus.emit('clan:upgraded');
    return true;
};