# Skin Lab Pro Logo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Заменить плейсхолдерный фавикон и дженерик-иконку хедера на собственный бренд-знак Skin Lab Pro (вариант A3 «Crisp Region Stack»).

**Architecture:** Знак — самодостаточный SVG (indigo-градиентный скруглённый квадрат + голова + 3 зоны-полосы). Один эталон геометрии используется в двух местах: статический `public/favicon.svg` и React-компонент `src/components/Logo.jsx`. Компонент встраивается в хедер `App.jsx` вместо обёртки с `CalculatorIcon`. Логики нет — это презентационный SVG.

**Tech Stack:** React 19, Vite 7, Tailwind, vitest 4.

**Spec:** `docs/superpowers/specs/2026-05-21-skinlabpro-logo-design.md`
**Рабочая ветка:** `feature/brand-logo` (от `master` @ f7aba1f; HEAD сейчас `ace85b0` — spec-коммит). Репо-корень `C:/Users/Alex/10_Projects/pdai_calculator/`, приложение в `pdai-calculator/`. Пути ниже — относительно `pdai-calculator/`, если не указано иное.

**Замечание про тесты:** знак — статический SVG без поведения. Юнит-тесты на него не пишутся (нет логики; в проекте нет RTL/jsdom, тащить их ради рендера логотипа — оверкилл). Верификация Tasks 1–3 = `npm run lint` + `npm run build` + существующий `npm test` остаётся 26/26 без регрессий + визуальная проверка. Это осознанное решение, не пропуск.

---

## File Structure

| Файл | Ответственность |
|---|---|
| `public/favicon.svg` | Статический фавикон — знак A3 (standalone SVG-документ) |
| `src/components/Logo.jsx` | React-компонент знака (inline SVG, пропсы `size`/`className`) |
| `src/App.jsx` | Хедер: `<Logo/>` вместо обёртки `bg-indigo-600` + `<CalculatorIcon/>`; убрать импорт `CalculatorIcon` |
| `public/og.svg` + `public/og.png` | (Опционально, Task 5) знак в углу OG-карточки |

---

## Task 1: Заменить `public/favicon.svg` на знак A3

**Files:**
- Modify (полная замена содержимого): `public/favicon.svg`

- [ ] **Step 1: Заменить содержимое файла**

Полностью перезаписать `pdai-calculator/public/favicon.svg` на:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="slpG" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#6366f1"/>
      <stop offset="1" stop-color="#4338ca"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="url(#slpG)"/>
  <circle cx="32" cy="16" r="6" fill="#ffffff"/>
  <rect x="19" y="26.5" width="26" height="8" rx="4" fill="#ffffff"/>
  <rect x="15" y="38" width="34" height="8" rx="4" fill="#c7d2fe"/>
  <rect x="23" y="49.5" width="18" height="8" rx="4" fill="#a5b4fc"/>
</svg>
```

- [ ] **Step 2: Проверить корректность**

Run (из `pdai-calculator/`):
```bash
node -e "const s=require('fs').readFileSync('public/favicon.svg','utf8'); const ok=s.includes('viewBox=\"0 0 64 64\"')&&s.includes('#c7d2fe')&&s.includes('#a5b4fc')&&(s.match(/<rect/g)||[]).length===4; console.log(ok?'OK favicon':'FAIL'); process.exit(ok?0:1)"
```
Expected: `OK favicon` (4 `<rect>` — фон + 3 зоны; оба оттенка indigo на месте).

- [ ] **Step 3: Commit**

```bash
git -C "C:/Users/Alex/10_Projects/pdai_calculator" add pdai-calculator/public/favicon.svg
git -C "C:/Users/Alex/10_Projects/pdai_calculator" -c commit.gpgsign=false commit -m "feat(brand): replace placeholder favicon with Skin Lab Pro mark"
```

---

## Task 2: Создать компонент `src/components/Logo.jsx`

**Files:**
- Create: `src/components/Logo.jsx`

- [ ] **Step 1: Создать файл**

Создать `pdai-calculator/src/components/Logo.jsx` с содержимым:
```jsx
// Skin Lab Pro brand mark (A3 Region Stack). Презентационный SVG, без логики.
export default function Logo({ size = 40, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Skin Lab Pro"
    >
      <defs>
        <linearGradient id="slpLogoGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="1" stopColor="#4338ca" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#slpLogoGradient)" />
      <circle cx="32" cy="16" r="6" fill="#ffffff" />
      <rect x="19" y="26.5" width="26" height="8" rx="4" fill="#ffffff" />
      <rect x="15" y="38" width="34" height="8" rx="4" fill="#c7d2fe" />
      <rect x="23" y="49.5" width="18" height="8" rx="4" fill="#a5b4fc" />
    </svg>
  );
}
```
Примечания: id градиента `slpLogoGradient` (не `slpG`) — отдельный от favicon.svg, чтобы при inline-встраивании в общий DOM не было коллизии. В JSX SVG-атрибуты — camelCase: `stopColor` (не `stop-color`). Хедеру хватает одного экземпляра `<Logo/>` — фиксированного id достаточно.

- [ ] **Step 2: Проверить, что lint и сборка не сломаны**

Run (из `pdai-calculator/`):
```bash
npm run lint
npx vite build
```
Expected: lint без ошибок; `vite build` успешен (компонент валиден, хоть пока и не импортирован).

- [ ] **Step 3: Commit**

```bash
git -C "C:/Users/Alex/10_Projects/pdai_calculator" add pdai-calculator/src/components/Logo.jsx
git -C "C:/Users/Alex/10_Projects/pdai_calculator" -c commit.gpgsign=false commit -m "feat(brand): add Logo component (Skin Lab Pro mark)"
```

---

## Task 3: Встроить `<Logo/>` в хедер `App.jsx`

**Files:**
- Modify: `src/App.jsx` (импорты + хедер)

Текущий хедер (`src/App.jsx`, ~стр. 76–78) содержит:
```jsx
                <div className="bg-indigo-600 p-2.5 md:p-3 rounded-lg text-white shrink-0">
                  <CalculatorIcon />
                </div>
```
`CalculatorIcon` используется ТОЛЬКО здесь (проверено: `grep -rn CalculatorIcon src/` → только импорт на стр. 18 и это использование). Знак `<Logo/>` сам по себе — скруглённый indigo-квадрат, поэтому обёртку `bg-indigo-600 ... rounded-lg` нужно убрать целиком (иначе indigo-квадрат в indigo-квадрате).

- [ ] **Step 1: Убрать `CalculatorIcon` из импорта icons**

В `src/App.jsx` строку:
```jsx
import { CalculatorIcon, Printer, Download, Loader, RefreshCw } from './components/icons';
```
заменить на:
```jsx
import { Printer, Download, Loader, RefreshCw } from './components/icons';
```

- [ ] **Step 2: Добавить импорт `Logo`**

В `src/App.jsx` сразу ПОСЛЕ строки `import { Printer, Download, Loader, RefreshCw } from './components/icons';` добавить:
```jsx
import Logo from './components/Logo';
```

- [ ] **Step 3: Заменить обёртку с иконкой на `<Logo/>`**

В `src/App.jsx` блок:
```jsx
                <div className="bg-indigo-600 p-2.5 md:p-3 rounded-lg text-white shrink-0">
                  <CalculatorIcon />
                </div>
```
заменить на:
```jsx
                <Logo className="w-12 h-12 md:w-14 md:h-14 shrink-0" />
```
(`w-12 h-12 md:w-14 md:h-14` ≈ 48/56px — визуально соответствует прежней обёртке `32px icon + p-2.5/p-3`. Tailwind-классы `w-*/h-*` переопределяют атрибуты `width/height` SVG. `shrink-0` сохранён.)

- [ ] **Step 4: Проверить lint + сборку**

Run (из `pdai-calculator/`):
```bash
npm run lint
npx vite build
```
Expected: lint без ошибок (нет неиспользуемого импорта `CalculatorIcon`); build успешен.

- [ ] **Step 5: Commit**

```bash
git -C "C:/Users/Alex/10_Projects/pdai_calculator" add pdai-calculator/src/App.jsx
git -C "C:/Users/Alex/10_Projects/pdai_calculator" -c commit.gpgsign=false commit -m "feat(brand): use Logo in header instead of generic calculator icon"
```

---

## Task 4: Верификационный гейт

**Files:** только проверки, без изменений файлов.

- [ ] **Step 1: Полный гейт (как CI `check`)**

Run (из `pdai-calculator/`):
```bash
npm ci
npm run lint
npm test
npm run build
```
Expected: `npm ci` ok; lint без ошибок; `npm test` → **26 passed** (логотип не трогает логику — регрессий быть не должно); build успешен с `prerender: wrote 4 lang pages + root + sitemap`.

- [ ] **Step 2: Проверить артефакты сборки**

Run (из `pdai-calculator/`):
```bash
node -e "const s=require('fs').readFileSync('dist/favicon.svg','utf8'); console.log(s.includes('#a5b4fc')?'dist favicon OK':'FAIL')"
grep -c "slpLogoGradient" dist/assets/*.js
```
Expected: `dist favicon OK`; `grep` находит `slpLogoGradient` ≥ 1 раз в собранном JS (компонент Logo попал в бандл).

- [ ] **Step 3: Визуальная проверка (ручная)**

Запустить `npm run preview` (из `pdai-calculator/`), открыть показанный localhost-URL: в хедере — новый знак вместо иконки калькулятора; во вкладке браузера — новый фавикон. Знак читается, пропорции не «плывут» на мобильной ширине (DevTools responsive).

(Без коммита — это проверки.)

---

## Task 5: (Опционально) Знак в OG-карточку

**Files:**
- Modify: `public/og.svg`
- Regenerate: `public/og.png`

Low-priority — для визуальной консистентности соц-превью. Можно пропустить без вреда для остального.

- [ ] **Step 1: Добавить знак в `public/og.svg`**

Открыть `pdai-calculator/public/og.svg` (viewBox `0 0 1200 630`, тёмный фон). Перед закрывающим `</svg>` добавить группу со знаком A3 в левом верхнем углу (60×60 в точке 80,72; масштаб 60/64 = 0.9375):
```svg
  <g transform="translate(80 72) scale(0.9375)">
    <linearGradient id="ogMark" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#4338ca"/>
    </linearGradient>
    <rect width="64" height="64" rx="14" fill="url(#ogMark)"/>
    <circle cx="32" cy="16" r="6" fill="#ffffff"/>
    <rect x="19" y="26.5" width="26" height="8" rx="4" fill="#ffffff"/>
    <rect x="15" y="38" width="34" height="8" rx="4" fill="#c7d2fe"/>
    <rect x="23" y="49.5" width="18" height="8" rx="4" fill="#a5b4fc"/>
  </g>
```
Если существующий текст/элементы og.svg визуально пересекаются с углом (80,72) — сдвинуть знак в свободный угол (правый верхний: `translate(1060 72)`); выбрать по факту после просмотра.

- [ ] **Step 2: Регенерировать `public/og.png`**

Run (из `pdai-calculator/`, headless Chrome — метод из runbook `docs/superpowers/runbooks/2026-05-19-skinlabpro-seo-verification.md` §F):
```bash
CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"
"$CHROME" --headless=new --disable-gpu --no-sandbox --hide-scrollbars \
  --force-device-scale-factor=1 --window-size=1200,630 \
  --screenshot="C:/Users/Alex/10_Projects/pdai_calculator/pdai-calculator/public/og.png" \
  "file:///C:/Users/Alex/10_Projects/pdai_calculator/pdai-calculator/public/og.svg"
node -e "const b=require('fs').readFileSync('public/og.png');console.log('og.png',b.length,'bytes, magic',b.slice(0,4).toString('hex'))"
```
Expected: `og.png` ~40–90 КБ, magic `89504e47` (валидный PNG).

- [ ] **Step 3: Commit**

```bash
git -C "C:/Users/Alex/10_Projects/pdai_calculator" add pdai-calculator/public/og.svg pdai-calculator/public/og.png
git -C "C:/Users/Alex/10_Projects/pdai_calculator" -c commit.gpgsign=false commit -m "feat(brand): add Skin Lab Pro mark to OG card"
```

---

## Task 6: PR + деплой

**Files:** только git/деплой.

- [ ] **Step 1: Push ветки**

Run:
```bash
git -C "C:/Users/Alex/10_Projects/pdai_calculator" push -u origin feature/brand-logo
```
Expected: ветка запушена.

- [ ] **Step 2: Создать PR**

`gh` определяет репозиторий по текущему каталогу — выполнять из репо-корня. Run:
```bash
cd "C:/Users/Alex/10_Projects/pdai_calculator" && gh pr create --base master --head feature/brand-logo --title "feat(brand): Skin Lab Pro logo" --body "Заменяет плейсхолдер-фавикон и дженерик-иконку хедера на бренд-знак Skin Lab Pro (A3 Region Stack). favicon.svg + Logo.jsx + интеграция в хедер. Spec: docs/superpowers/specs/2026-05-21-skinlabpro-logo-design.md"
```

- [ ] **Step 3: Merge PR**

После проверки — merge (из репо-корня):
```bash
cd "C:/Users/Alex/10_Projects/pdai_calculator" && gh pr merge feature/brand-logo --merge
```

- [ ] **Step 4: Manual deploy (CI за DO Cloud Firewall — деплой ручной)**

Сообщить Alex выполнить в своём терминале (SSH-пароль вводится в его консоли):
```
ssh root@146.190.170.65
```
затем на сервере:
```bash
cd /root/pdai_calc/pdai-calculator && git fetch origin master && git reset --hard origin/master && docker compose build && docker compose up -d --force-recreate && docker compose ps && echo DONE
```
Ожидание: `HEAD is now at <merge-commit>`, `prerender: wrote 4 lang pages...`, контейнеры `Up`, `DONE`.

- [ ] **Step 5: Пост-деплой smoke**

Run (после деплоя):
```bash
curl -s https://skinlabpro.uz/favicon.svg | grep -c "a5b4fc"
```
Expected: `1` — прод отдаёт новый фавикон-знак. (Браузер: вкладка `skinlabpro.uz` показывает новый знак; хедер — новый логотип.)

(Без коммита — финальная проверка и хендофф.)

---

## Self-Review (выполнено автором плана)

- **Spec coverage:** §2 знак A3 → T1 (favicon) + T2 (Logo.jsx) — точная геометрия/цвета перенесены; §3 файлы/интеграция → T1+T2+T3 (favicon, Logo.jsx, App.jsx header, удаление импорта CalculatorIcon, уникальный gradient id); §3 «id уникальность» → T2 (`slpLogoGradient`); §5 опциональный OG → T5; §7 сборка/доставка → T6; §8 критерии готовности → T4 (lint/build/test 26/26) + T6 Step 5 (прод smoke); §4 локап — явно вне реализации в спеке, задачи нет (корректно). Пробелов нет.
- **Placeholder scan:** код приведён полностью в каждом шаге; «(опционально)» T5 — явно помечено в спеке как optional, не placeholder.
- **Type/signature consistency:** `Logo({ size = 40, className = '' })` — сигнатура одна, используется в T3 как `<Logo className="..."/>` (size берёт дефолт 40, className задаёт реальный размер через Tailwind — согласовано). Gradient id `slpG` (favicon.svg, standalone) vs `slpLogoGradient` (Logo.jsx, inline) vs `ogMark` (og.svg, standalone) — намеренно разные, коллизий нет (разные документы / уникальный inline id).
- Отмечено явно: юнит-тестов на статический SVG нет (нет поведения, нет RTL/jsdom в проекте) — верификация через lint/build/26-tests-green/визуал.
