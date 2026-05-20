# Runbook — деплой и верификация SEO skinlabpro.uz

## A. Merge → деплой (CI деплоит только master)
1. Убедиться: `feature/seo-prerender` зелёная (`npm run lint && npm test && npm run build` в pdai-calculator/).
2. `git switch master && git merge --no-ff feature/seo-prerender`
3. `git push origin master`  ← триггерит GitHub Actions (check → SSH deploy: git reset --hard origin/master + docker rebuild).
4. Дождаться зелёного workflow в GitHub Actions.

## B. Smoke прода (как краулер, без JS)
- `curl -s -A "YandexBot" https://skinlabpro.uz/uz | grep -E '<html lang|og:image|twitter:card|hreflang'`
  Ожидание: `lang="uz"`, `og:image .../og.png`, `summary_large_image`, hreflang-блок.
- `curl -s https://skinlabpro.uz/sitemap.xml | grep lastmod` → дата сборки.
- `curl -sI https://skinlabpro.uz/og.png` → `200`, `content-type: image/png`.

## C. Yandex.Webmaster (Alex выполняет — аккаунт/проперти заводит сам)
1. webmaster.yandex.ru → добавить сайт `https://skinlabpro.uz`.
2. Метод «Мета-тег»: скопировать `content` токена → `seo.config.js` → `YANDEX_VERIFICATION`.
   ИЛИ метод «HTML-файл»: положить выданный `yandex_<token>.html` в `pdai-calculator/public/`.
3. Коммит токена/файла на `feature/seo-prerender` → merge → push master → деплой (A).
4. Проверить файловый путь: `curl -s https://skinlabpro.uz/yandex_<token>.html` → должен вернуть ТОКЕН, не HTML SPA.
5. В Вебмастере нажать «Проверить». Сабмитнуть `https://skinlabpro.uz/sitemap.xml`.

## D. Google Search Console (аналогично)
1. search.google.com/search-console → property URL-prefix `https://skinlabpro.uz`.
2. Метод «HTML tag»: `content` → `seo.config.js` → `GOOGLE_VERIFICATION`.
   ИЛИ «HTML file»: `google<token>.html` в `pdai-calculator/public/`.
3. Коммит → merge → push → деплой → «Verify». Сабмит sitemap.

## E. Соц-превью
- Telegram: отправить ссылку https://skinlabpro.uz/ru в Saved Messages → карточка C.
- Facebook debugger: developers.facebook.com/tools/debug/ → Scrape Again.

## F. Регенерация og.png из og.svg (one-off, вне build-пайплайна)
`og.svg` — источник истины; `og.png` — закоммиченный бинарь (image-либы в проект не добавляем).
Рабочий метод (Windows, headless Chrome — `npx svgexport` в этой среде зависал):
```bash
CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"
SVG="C:/Users/Alex/10_Projects/pdai_calculator/pdai-calculator/public/og.svg"
OUT="C:/Users/Alex/10_Projects/pdai_calculator/pdai-calculator/public/og.png"
"$CHROME" --headless=new --disable-gpu --no-sandbox --hide-scrollbars \
  --force-device-scale-factor=1 --window-size=1200,630 --screenshot="$OUT" "file:///$SVG"
```
Проверка: `node -e "const b=require('fs').readFileSync('$OUT');console.log(b.length, b.slice(0,4).toString('hex'))"` → ~46KB, magic `89504e47`. Затем закоммитить обновлённый `public/og.png`.
