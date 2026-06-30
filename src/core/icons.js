export function svg(path, color = '#e0e0e0', viewBox = '0 0 24 24') {
    return `<svg viewBox="${viewBox}" width="20" height="20" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}

export const ICONS = {
    sword: svg('<path d="M12 2L6 8l2 2 4-4M10 10l-4 4 2 2 4-4M14 6l4 4-2 2-4-4"/>', '#f5c842'),
    cross: svg('<path d="M6 18L18 6M10 4L6 8M14 20L18 16"/>', '#f5c842'),
    target: svg('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="2"/>', '#ff6666'),
    coin: svg('<circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/>', '#f5c842'),
    swords: svg('<path d="M16 4l4 4-4 4M8 20l-4-4 4-4M16 20l4-4-4-4M8 4L4 8l4 4"/>', '#f5c842'),
    heart: svg('<path d="M12 21c-6-4-10-8-10-12a5 5 0 0110-2 5 5 0 0110 2c0 4-4 8-10 12"/>', '#ff4466'),
    shield: svg('<path d="M12 2l8 4v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V6z"/>', '#44aaff'),
    shieldGreen: svg('<path d="M12 2l8 4v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V6z"/>', '#44cc66'),
    castle: svg('<path d="M4 21V9l4-3v15M10 21V6l2-2 2 2v15M16 21V6l4 3v12M4 12h4M10 12h4M16 12h4M4 15h4M10 15h4M16 15h4M4 18h4M10 18h4M16 18h4M4 21h16"/>', '#c89b3c'),
    shuriken: svg('<path d="M12 2l2 8 8 2-8 2-2 8-2-8-8-2 8-2z" fill="#6b4c9a" stroke="#6b4c9a"/><circle cx="12" cy="12" r="2" fill="#e0e0e0" stroke="#6b4c9a"/>', '#6b4c9a'),
    lightning: svg('<path d="M13 2L4 14h7l-1 8 10-12h-7z" fill="#f5c842" stroke="#f5c842"/>', '#f5c842'),
    crystal: svg('<circle cx="12" cy="12" r="10"/><path d="M12 6v12M6 12h12"/>', '#bb77dd'),
    healing: svg('<path d="M12 21c-6-4-10-8-10-12a5 5 0 0110-2 5 5 0 0110 2c0 4-4 8-10 12M9 12h6M12 9v6"/>', '#44cc66'),
    goblin: svg('<circle cx="12" cy="10" r="8"/><circle cx="8" cy="9" r="2" fill="#e0e0e0"/><circle cx="16" cy="9" r="2" fill="#e0e0e0"/><path d="M8 15c2 2 6 2 8 0"/><path d="M6 4L3 2M18 4l3-2"/>', '#88cc44'),
    orc: svg('<circle cx="12" cy="10" r="8"/><circle cx="8" cy="9" r="2" fill="#e0e0e0"/><circle cx="16" cy="9" r="2" fill="#e0e0e0"/><path d="M8 15c2 2 6 2 8 0"/><path d="M4 6l-4-2M20 6l4-2"/>', '#cc8844'),
    troll: svg('<circle cx="12" cy="11" r="9"/><circle cx="7" cy="10" r="2" fill="#e0e0e0"/><circle cx="17" cy="10" r="2" fill="#e0e0e0"/><path d="M7 17c3 2 7 2 10 0"/><path d="M6 3l-3 3M18 3l3 3"/>', '#66aa88'),
    knight_face: svg('<circle cx="12" cy="10" r="8"/><path d="M6 6L4 3M18 6l2-3M9 10l-2-4M15 10l2-4"/><circle cx="8" cy="9" r="1.5" fill="#e0e0e0"/><circle cx="16" cy="9" r="1.5" fill="#e0e0e0"/><path d="M10 15c1.5 1.5 4.5 1.5 6 0"/>', '#aaaaff'),
    demon: svg('<circle cx="12" cy="10" r="8"/><circle cx="8" cy="9" r="2" fill="#ff4444"/><circle cx="16" cy="9" r="2" fill="#ff4444"/><path d="M10 15c-1 1-2 3-3 4M14 15c1 1 2 3 3 4M12 13v-3M10 12l-2-1M14 12l2-1"/>', '#ff6644'),
    skull: svg('<circle cx="12" cy="12" r="9"/><circle cx="8" cy="11" r="3" fill="#333" stroke="#e0e0e0"/><circle cx="16" cy="11" r="3" fill="#333" stroke="#e0e0e0"/><path d="M10 17c1 1 3 1 4 0M12 17v-3"/>', '#e0e0e0'),
    dragon: svg('<path d="M12 4c-4 0-8 2-8 6 0 2 1 4 3 5l-2 4s3-1 5-2c2 1 5 2 7 1l2 3s0-5-2-8c2-1 3-3 3-5 0-4-4-4-8-4"/><circle cx="9" cy="8" r="1" fill="#ff4444"/><circle cx="15" cy="8" r="1" fill="#ff4444"/>', '#55ccff'),
    monster: svg('<circle cx="12" cy="10" r="9"/><circle cx="7" cy="9" r="2.5" fill="#e0e0e0"/><circle cx="17" cy="9" r="2.5" fill="#e0e0e0"/><circle cx="7" cy="9" r="1" fill="#333"/><circle cx="17" cy="9" r="1" fill="#333"/><path d="M8 15c2 2 4 2 6 0"/><path d="M3 6l-2-2M21 6l2-2"/>', '#ff88cc'),
    blood: svg('<path d="M12 2c-2 4-6 6-6 10a6 6 0 0012 0c0-4-4-6-6-10z" fill="#ff3344" stroke="#ff3344"/>', '#ff3344'),
    muscle: svg('<path d="M8 4l-2 2M16 4l2 2M5 12H3M21 12h-2M7 18l-2 4M17 18l2 4M12 12c2 2 4 3 4 6 0 3-2 4-4 4s-4-1-4-4c0-3 2-4 4-6z"/>', '#dd8833'),
    clover: svg('<path d="M12 2c-2 0-4 2-4 4 0 2 1 3 2 4l-5 2c1 2 3 3 5 2l1 5c2 0 4-1 4-3l1 5c2-1 3-3 2-5l5-2c-1-2-3-3-5-2 1-1 2-2 2-4 0-2-2-4-4-4z" fill="#44cc66" stroke="#44cc66"/>', '#44cc66'),
    finger: svg('<path d="M7 10v7a3 3 0 006 0v-4M7 10l-2 2M7 10l3-2c1-1 2-1 3 0M13 13l2-2M13 13l2 2"/><path d="M13 10V5a2 2 0 014 0v8"/>', '#e0e0e0'),
    bow: svg('<path d="M4 4l6 6M4 4l4 8 8-4M10 10l4 4M14 6l-4 4M14 6l6-2-2 6"/>', '#f5c842'),
    crown: svg('<path d="M4 20h16v-2H4zM4 8l4 6 4-6 4 6 4-6v10H4z"/>', '#f5c842'),
    fire: svg('<path d="M12 2c-2 4-4 6-4 10 0 4 2 8 4 8s4-4 4-8c0-4-2-6-4-10z"/><path d="M10 16c-1-1-1-3 0-4 1 1 2 1 2 0 1 0 1 2 0 3"/>', '#ff6644'),
    explosion: svg('<circle cx="12" cy="12" r="9"/><path d="M8 8l8 8M16 8l-8 8"/><path d="M12 4v3M12 17v3M4 12h3M17 12h3"/>', '#ff8844'),
    star: svg('<path d="M12 2l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1z" fill="#f5c842" stroke="#f5c842"/>', '#f5c842'),
    sparkles: svg('<path d="M12 2l1 3 3 1-3 1-1 3-1-3-3-1 3-1z"/><circle cx="6" cy="6" r="1" fill="#f5c842"/><circle cx="18" cy="18" r="1" fill="#f5c842"/><circle cx="18" cy="6" r="1" fill="#f5c842"/><circle cx="6" cy="18" r="1" fill="#f5c842"/>', '#f5c842'),
    hand: svg('<path d="M12 10V4a2 2 0 014 0v8M12 10l-3-2a2 2 0 00-2 3l4 5c1 2 3 3 5 2l4-2c1-1 2-3 1-5l-4-6M12 10v7"/>', '#e0e0e0'),
    trophy: svg('<path d="M6 4h12v4a6 6 0 01-12 0zM8 18h8v2H8zM5 20h14v2H5zM12 14v4"/>', '#f5c842'),
    gear: svg('<circle cx="12" cy="12" r="3"/><path d="M12 1v3M12 20v3M1 12h3M20 12h3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>', '#e0e0e0'),
    up: svg('<path d="M12 4v16M8 8l4-4 4 4"/>', '#44cc66'),
    down: svg('<path d="M12 20V4M8 16l4 4 4-4"/>', '#ff6644'),
    xmark: svg('<path d="M6 6l12 12M18 6l-12 12"/>', '#ff6644'),
    check: svg('<path d="M5 13l4 4L19 7"/>', '#44cc66'),
    lock: svg('<rect x="8" y="11" width="8" height="9" rx="1"/><path d="M9 11V8a3 3 0 016 0v3"/>', '#e0e0e0'),
    unlock: svg('<rect x="8" y="11" width="8" height="9" rx="1"/><path d="M9 11V8a3 3 0 016 0v3"/><circle cx="12" cy="15" r="2" fill="#44cc66" stroke="#44cc66"/><path d="M12 15v2"/>', '#44cc66'),
    robot: svg('<rect x="6" y="6" width="12" height="12" rx="3"/><circle cx="9" cy="11" r="2" fill="#44ccff"/><circle cx="15" cy="11" r="2" fill="#44ccff"/><path d="M9 15c2 1 4 1 6 0"/><path d="M10 6V3M14 6V3"/>', '#e0e0e0'),
    floor: svg('<rect x="4" y="16" width="16" height="4" rx="1"/><rect x="6" y="8" width="12" height="8" rx="1"/><rect x="8" y="4" width="8" height="4" rx="1"/>', '#e0e0e0'),
    stats: svg('<rect x="4" y="4" width="4" height="4"/><rect x="12" y="4" width="8" height="4"/><rect x="4" y="10" width="8" height="4"/><rect x="16" y="10" width="4" height="4"/><rect x="4" y="16" width="16" height="4"/>', '#e0e0e0'),
    profile: svg('<circle cx="12" cy="8" r="5"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>', '#e0e0e0'),
    clan: svg('<path d="M4 20v-2a4 4 0 014-4h8a4 4 0 014 4v2M12 10a3 3 0 100-6 3 3 0 000 6z"/><circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/><path d="M9 17c1.5 1 4.5 1 6 0"/>', '#e0e0e0'),
    logout: svg('<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>', '#ff6644'),
    menu: svg('<path d="M3 12h18M3 6h18M3 18h18"/>', '#e0e0e0'),
    ding: svg('<path d="M12 2a8 8 0 00-8 8v4l-2 3h20l-2-3v-4a8 8 0 00-8-8z"/><path d="M9 19a3 3 0 006 0"/>', '#f5c842'),
    prestige: svg('<path d="M12 2l2 6 6 1-4 4 1 6-5-3-5 3 1-6-4-4 6-1z"/>', '#f5c842'),
    ascension: svg('<path d="M12 2l1 3 3 1-3 1-1 3-1-3-3-1 3-1z"/><circle cx="6" cy="6" r="1" fill="#f5c842"/><circle cx="18" cy="18" r="1" fill="#f5c842"/><circle cx="6" cy="18" r="1" fill="#f5c842"/><circle cx="18" cy="6" r="1" fill="#f5c842"/><path d="M4 14l3-3M17 4l3 3"/>', '#f5c842'),
    key: svg('<circle cx="8" cy="16" r="4"/><path d="M11 13l8-8M15 9l3-3M13 11l2-2"/>', '#f5c842'),
    pen: svg('<path d="M17 3a2 2 0 012.83 2.83L8 17.5 3 19l1.5-5L17 3z"/><path d="M14 6l4 4"/>', '#e0e0e0'),
    skills: svg('<path d="M12 2L4 8v8l8 6 8-6V8z"/><path d="M12 12l2-4M12 12l-2-4M12 12v6"/>', '#f5c842'),
    perk: svg('<path d="M12 2a4 4 0 00-4 4v2H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-2V6a4 4 0 00-4-4z"/><path d="M9 14l2 2 4-4"/>', '#e0e0e0'),
    boss: svg('<circle cx="12" cy="10" r="9"/><path d="M7 8l-2-3M17 8l2-3"/><circle cx="8" cy="9" r="2" fill="#ff4444"/><circle cx="16" cy="9" r="2" fill="#ff4444"/><path d="M9 15c1.5 1.5 4.5 1.5 6 0"/>', '#ff4444'),
    superboss: svg('<circle cx="12" cy="10" r="9"/><path d="M7 8l-2-3M17 8l2-3"/><circle cx="8" cy="9" r="2" fill="#ff4444"/><circle cx="16" cy="9" r="2" fill="#ff4444"/><path d="M9 15c1.5 1.5 4.5 1.5 6 0"/><path d="M12 2v3M12 15v3"/>', '#ff4444'),
    skip: svg('<path d="M6 4v16M10 12l8-8v16z"/>', '#e0e0e0'),
    stop: svg('<rect x="6" y="6" width="12" height="12" rx="2"/>', '#ff6644'),
    play: svg('<path d="M6 4l14 8-14 8z"/>', '#44cc66'),
    boost: svg('<path d="M13 2L4 14h7l-1 8 10-12h-7z" fill="#f5c842" stroke="#f5c842"/>', '#f5c842'),
    warn: svg('<circle cx="12" cy="12" r="10"/><path d="M12 6v8M12 17v1"/>', '#ffaa00'),
    heal: svg('<path d="M12 21c-6-4-10-8-10-12a5 5 0 0110-2 5 5 0 0110 2c0 4-4 8-10 12"/><path d="M9 12h6M12 9v6"/>', '#44cc66'),
    hp: svg('<path d="M12 21c-6-4-10-8-10-12a5 5 0 0110-2 5 5 0 0110 2c0 4-4 8-10 12"/>', '#ff4466'),
    armor_val: svg('<path d="M12 2l8 4v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V6z"/>', '#44aaff'),
    army_icon: svg('<path d="M8 4l4 4 4-4M6 8v6M18 8v6M12 12v6"/><circle cx="12" cy="18" r="2"/>', '#f5c842'),
    treasure: svg('<ellipse cx="12" cy="15" rx="10" ry="6"/><path d="M12 9c-5 0-9 3-9 6s4 6 9 6 9-3 9-6-4-6-9-6z"/><circle cx="12" cy="12" r="2"/>', '#f5c842'),
    cooldown: svg('<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>', '#e0e0e0')
};

export function getIcon(name) {
    return ICONS[name] || '';
}

export function inlineSvg(name, color) {
    const icon = ICONS[name];
    if (color && icon) {
        return icon.replace(/stroke="#[^"]*"/g, `stroke="${color}"`).replace(/fill="#[^"]*"/g, '');
    }
    return icon || '';
}
