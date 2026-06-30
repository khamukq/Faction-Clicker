export const showFloatingText = (x, y, text, type) => {
    const el = document.createElement('div');
    el.className = `float-text ${type}`;
    el.textContent = text;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.position = 'fixed';
    el.style.pointerEvents = 'none';
    el.style.zIndex = '1000';
    el.style.fontWeight = '700';
    el.style.fontSize = type === 'gold' ? '22px' : '18px';
    el.style.color = type === 'gold' ? '#fbbf24' : '#60a5fa';
    el.style.textShadow = '0 2px 10px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)';
    el.style.transition = 'all 0.8s ease-out';
    el.style.opacity = '1';
    document.body.appendChild(el);

    requestAnimationFrame(() => {
        el.style.transform = 'translateY(-60px)';
        el.style.opacity = '0';
    });

    setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
    }, 800);
};
