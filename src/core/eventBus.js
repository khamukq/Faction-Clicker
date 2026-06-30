const events = {};

export const EventBus = {
    on(event, fn) {
        if (!events[event]) events[event] = [];
        events[event].push(fn);
    },
    off(event, fn) {
        if (!events[event]) return;
        events[event] = events[event].filter(f => f !== fn);
    },
    emit(event, data) {
        if (!events[event]) return;
        events[event].forEach(fn => fn(data));
    }
};