import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Все файлы проекта
const files = {
    'src/core/config.js': 'Конфиг игры',
    'src/core/state.js': 'Глобальное состояние',
    'src/core/eventBus.js': 'События',
    'src/core/storage.js': 'Сохранение',
    'src/core/utils.js': 'Утилиты',
    'src/combat/battle.js': 'Боевая система',
    'src/combat/damage.js': 'Расчёт урона',
    'src/combat/enemies.js': 'Враги и боссы',
    'src/progression/level.js': 'Уровни и XP',
    'src/progression/floor.js': 'Этажи',
    'src/progression/prestige.js': 'Престиж',
    'src/progression/ascension.js': 'Вознесение',
    'src/progression/reset.js': 'Сброс',
    'src/factions/index.js': 'Фракции',
    'src/ui/renderer.js': 'UI (ГЛАВНЫЙ)',
    'src/features/achievements.js': 'Достижения',
    'src/features/clan.js': 'Кланы',
    'src/features/leaderboard.js': 'Лидерборд',
    'src/auto/autoclicker.js': 'Автокликер',
    'src/perks/perks.js': 'Перки',
    'src/upgrades/upgrades.js': 'Улучшения',
    'src/upgrades/army.js': 'Армия',
    'src/main.js': 'Точка входа'
};

let context = '# FACTION CLICKER — ПОЛНЫЙ КОНТЕКСТ\n\n';
context += '## СТРУКТУРА ПРОЕКТА\n```\n';
context += 'src/\n';

// Группируем по папкам для красивого вывода
const grouped = {};
for (const [file] of Object.entries(files)) {
    const parts = file.split('/');
    const dir = parts.slice(0, -1).join('/');
    const name = parts[parts.length - 1];
    if (!grouped[dir]) grouped[dir] = [];
    grouped[dir].push(name);
}

for (const [dir, names] of Object.entries(grouped)) {
    context += `├── ${dir}/\n`;
    for (const name of names) {
        context += `│   └── ${name}\n`;
    }
}
context += '```\n\n## ВЕСЬ КОД\n\n';

// Добавляем код каждого файла
for (const [file, desc] of Object.entries(files)) {
    try {
        const fullPath = path.join(projectRoot, file);
        if (fs.existsSync(fullPath)) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            context += `### ${file} — ${desc}\n`;
            context += '```javascript\n';
            context += content;
            context += '\n```\n\n';
        } else {
            context += `### ${file} — ${desc}\n`;
            context += '```javascript\n// Файл не найден\n```\n\n';
        }
    } catch (e) {
        context += `### ${file} — ${desc}\n`;
        context += `\`\`\`javascript\n// Ошибка: ${e.message}\n\`\`\`\n\n`;
    }
}

// Добавляем анализ проблем
context += `## 🔴 ПРОБЛЕМЫ ПРОЕКТА\n\n`;
context += `### 1. Дублирование кода (отсутствует — удалено)\n`;
context += `- Были упоминания ui/animations.js, ui/notifications.js, ui/tabs.js — файлы не найдены, удалено из списка\n\n`;
context += `### 2. Обрезанные файлы\n`;
context += `- renderClans() в renderer.js\n`;
context += `- renderAutoClickerUI() в renderer.js\n`;
context += `- style.css\n\n`;
context += `### 3. Циклические зависимости\n`;
context += `- storage.js ↔ leaderboard.js ↔ utils.js ↔ state.js\n\n`;
context += `### 4. Пустые файлы\n`;
context += `- empire.js, massons.js, syndicate.js, factionBase.js, modals.js — удалены\n`;

// Сохраняем
const outputPath = path.join(projectRoot, 'CONTEXT.md');
fs.writeFileSync(outputPath, context, 'utf-8');

const stats = fs.statSync(outputPath);
console.log(`✅ CONTEXT.md создан!`);
console.log(`📄 Размер: ${Math.round(stats.size / 1024)} KB`);
console.log(`📁 Путь: ${outputPath}`);
console.log(`\n📋 Теперь скопируй CONTEXT.md в чат с AI!`);