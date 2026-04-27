# Берега — миграция статического прототипа на Astro и деплой на Netlify

**Дата:** 2026-04-28
**Автор:** brainstorm-сессия с пользователем
**Статус:** черновик, ждёт ревью пользователя
**Связанные документы:** [`2026-04-27-berega-landing-design.md`](2026-04-27-berega-landing-design.md) — спека визуального дизайна и контента прототипа

---

## 1. Цель

Превратить рабочий статический прототип в `site/` (один `index.html` ~500 строк, `styles.css`, ассеты) в production-ready Astro-проект, который собирается в чистый статический HTML, деплоится на Netlify и принимает заявки через Netlify Functions с пересылкой в Telegram-бот без хранения ПД.

**Критерий успеха:** живой сайт на боевом домене, формы доходят в Telegram, виджет HomeReserve работает, Yandex.Metrika считает визиты, мобильная версия пригодна для использования, Lighthouse Performance ≥ 90.

## 2. Scope

### В работу входит

1. Перенос вёрстки `site/index.html` → Astro-компоненты, без редизайна (попиксельно тот же сайт)
2. Контент квартир / отзывов / правил / FAQ переезжает в JSON-файлы под `src/content/`
3. Оптимизация изображений (WebP/AVIF, lazy-loading) через Astro Image для квартирных фото и hero
4. Один Netlify Function (`submit-form`) для двух форм — отзыв и субаренда
5. Cloudflare Turnstile (клиент + серверная верификация) и honeypot
6. Telegram Bot API для уведомлений (без хранения ПД)
7. Yandex.Metrika через переменную окружения с номером счётчика
8. Astro i18n routing: `/` (русский, заполнен) и `/zh/` (китайский, пустой шаблон)
9. SEO: `<meta description>`, Open Graph, JSON-LD `LocalBusiness`, `sitemap.xml`, `robots.txt`
10. Адаптив: мобильное меню (бургер) для ≤900px вместо текущего скрытия навигации
11. Реальный countdown в блоке TODAY (отсчёт до полуночи по времени Благовещенска)
12. Страницы `/privacy` (Политика обработки ПД) и `/offer` (Договор-оферта) — заглушки с типовым текстом, помеченные TODO для юристов
13. `netlify.toml` + переменные окружения + `.env.example` + README

### НЕ входит в работу (закреплено как явные ограничения)

- Перевод на китайский — оставляем `src/i18n/zh.json` как шаблон с пустыми значениями. До его заполнения переводчиком путь `/zh/` отдаёт 404.
- Реальная админка / CMS. Контент правится через PR в JSON-файлах.
- БД и модерация отзывов. Формы шлют в Telegram, ничего не хранится.
- Изменение текстов / редизайн. Работаем с тем содержанием и палитрой, что есть в прототипе.
- Юридически выверенные тексты политики ПД и оферты — публикуем шаблонные с пометкой «TODO: согласовать с юристом», финальную редакцию делает пользователь.

## 3. Технологический стек

- **Astro 5.x** — статический генератор + island-гидратация
- **Vanilla CSS** — `tokens.css` + `base.css` + `components.css` (текущий `styles.css` распиливается)
- **TypeScript** — для `src/lib/` и Netlify Function
- **Cloudflare Turnstile** — антиспам (клиент + серверная верификация)
- **Telegram Bot API** — уведомления о заявках
- **Yandex.Metrika** — аналитика
- **GitHub** — repo для авто-деплоя
- **Netlify** — хостинг + Functions

Версии фиксируются на момент создания плана.

## 4. Структура проекта

```
berega-landing/
├── public/
│   ├── favicon.svg                  # квадратный SVG с волнами на градиенте (готов)
│   ├── robots.txt                   # генерируется через @astrojs/sitemap
│   └── reviews/                     # PNG-скрины с площадок, отдаются как есть
│       └── review-1.png ... review-4.png
├── src/
│   ├── assets/                      # ассеты под Astro Image (оптимизация WebP/AVIF)
│   │   ├── hero.jpg
│   │   ├── logo.png
│   │   ├── og-cover.jpg             # 1200×630, генерируется из hero
│   │   └── properties/
│   │       └── apt-1.jpg ... apt-6.jpg
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── components/                  # см. раздел 5
│   ├── content/
│   │   ├── config.ts                # Zod-схемы коллекций
│   │   ├── apartments.json
│   │   ├── reviews.json
│   │   ├── rules.json
│   │   ├── faq.json
│   │   └── socials.json
│   ├── i18n/
│   │   ├── ru.json
│   │   ├── zh.json                  # пустой шаблон, копия структуры ru.json
│   │   └── t.ts
│   ├── pages/
│   │   ├── index.astro              # /
│   │   ├── zh/index.astro           # /zh/  — 404 если zh.json пустой
│   │   ├── privacy.astro            # /privacy
│   │   ├── offer.astro              # /offer
│   │   └── 404.astro
│   ├── styles/
│   │   ├── tokens.css               # CSS-переменные
│   │   ├── base.css                 # reset, типографика
│   │   ├── components.css           # стили компонентов
│   │   └── global.css               # импортирует всё выше
│   └── lib/
│       ├── sendToTelegram.ts
│       └── verifyTurnstile.ts
├── netlify/
│   └── functions/
│       └── submit-form.ts
├── docs/superpowers/specs/          # спека и план
├── astro.config.mjs
├── netlify.toml
├── tsconfig.json
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## 5. Декомпозиция компонентов

Каждая секция текущего `index.html` становится отдельным `.astro`-компонентом, который читает данные из `src/content/` или принимает props.

| Astro-компонент | Что переезжает из `index.html` | Источник данных |
|---|---|---|
| `BaseLayout.astro` | `<html>/<head>`, мета, Я.Метрика, header+footer слоты | `src/i18n/{ru,zh}.json` |
| `Header.astro` | Шапка с навигацией, переключателем РФ/中文, прогресс-баром | `src/i18n/`, `socials.json` |
| `Hero.astro` | Hero с фото и chip-цитатой | i18n + `src/assets/hero.jpg` |
| `BookingWidget.astro` | Контейнер `#hr-widget` + `<script type="module">` | хардкод (token + navigation:false) |
| `SubscribeStrip.astro` | 3 карточки Telegram / VK / Instagram | `socials.json` |
| `TrustRatings.astro` | 4.9 / 5.0 / 98% | хардкод (3 числа) |
| `TodayOffer.astro` | Промо TODAY + countdown | client:load — JS считает до полуночи Благовещенска |
| `PropertyCard.astro` | Одна карточка квартиры | props |
| `PropertyGrid.astro` | Сетка из 6 карточек | `apartments.json` |
| `Marquee.astro` | Бегущая строка | i18n строки |
| `ReviewCard.astro` | Одна карточка отзыва | props |
| `ReviewsStrip.astro` | 6 текстовых + 4 скрина | `reviews.json` + `public/reviews/*.png` |
| `ReviewForm.astro` | Форма отзыва с Turnstile | client:load |
| `RulesGrid.astro` | 11 правил | `rules.json` |
| `FAQ.astro` | Аккордеон | `faq.json` |
| `LeadForm.astro` | Форма субаренды с Turnstile | client:load |
| `Footer.astro` | Футер | `socials.json`, i18n |

`Header.astro` — в нём же мобильный бургер для ≤900px (текущая верстка просто скрывает nav, нужно дать пользователю войти в навигацию на телефоне).

## 6. Модель данных

Все коллекции типизированы через Zod в `src/content/config.ts`. Astro строит сайт только если данные валидны.

### `apartments.json` — массив из 6

```ts
{
  id: string,                    // "apt-1"
  city: string,                  // "Благовещенск"
  badge: "Гостям нравится" | "Новое" | "Премиум",
  place: string,                 // "наб. Амура, вид на Хэйхэ"
  title: string,                 // "Окно в реку, балкон в Китай"
  meta: string,                  // "3 гостя · 2 спальни · 7 этаж"
  price: number,                 // 5800
  rating: number,                // 4.96
  photo: string                  // "apt-1.jpg" — резолвится в src/assets/properties/
  alt: string                    // alt-текст для скринридеров
}
```

### `reviews.json` — массив из 6

```ts
{
  text: string,
  author: string,
  source: "Авито" | "Суточно.ру" | "Telegram",
  date: string,                  // "28 октября 2025"
  rating: 5
}
```

### `rules.json` — массив из 11

```ts
{
  number: string,                // "01"
  title: string,                 // "Тайминги"
  text: string
}
```

### `faq.json` — массив

```ts
{
  question: string,
  answer: string
}
```

### `socials.json` — объект

```ts
{
  telegram: { url: string, handle: string },
  vk: { url: string },
  instagram: { url: string },
  phone: { display: string, tel: string },
  email: string
}
```

## 7. Архитектура форм

```
[Browser]
  Форма отзыва ИЛИ форма субаренды
  ↓
  Cloudflare Turnstile (клиент): получает token
  ↓
  POST /.netlify/functions/submit-form
  body: { form: "review"|"lead", ...fields, turnstileToken, hp }
  ↓
[Netlify Function: submit-form.ts]
  1. honeypot check: если hp != "" → 200 OK (молча игнор)
  2. Turnstile verify: POST к siteverify.cloudflare.com с token+secret
     если success=false → 400
  3. валидация полей (zod)
     если invalid → 400 с ошибками
  4. форматирование сообщения по шаблону:
     - review: "Новый отзыв ★★★★★\nИмя: ...\nТекст: ..."
     - lead:   "Заявка на субаренду\nИмя: ...\nТелефон: ...\n..."
  5. POST к Telegram Bot API: api.telegram.org/bot<TOKEN>/sendMessage
  6. возврат 200 OK
[Telegram Bot] → канал/чат
```

**Переменные окружения** (в Netlify dashboard):
- `TURNSTILE_SECRET` — секрет Turnstile
- `TELEGRAM_BOT_TOKEN` — токен бота
- `TELEGRAM_CHAT_ID` — id чата для уведомлений
- `PUBLIC_TURNSTILE_SITE_KEY` — публичный ключ Turnstile (для `<script>` в браузере)
- `PUBLIC_YANDEX_METRIKA_ID` — номер счётчика

Префикс `PUBLIC_` означает, что Astro прокинет переменную в клиентский бандл. Остальные доступны только в Netlify Function.

**Состояния формы:**
- `idle` — обычное состояние
- `submitting` — кнопка disabled, спиннер
- `success` — заменяем форму на сообщение «Готово, ждём вас у воды»
- `error` — баннер с ошибкой и возможностью повторить

**Rate-limit:** простой in-memory счётчик в Function на IP — максимум 5 заявок за 10 минут (защита от ручного флуда после прохождения Turnstile).

## 8. Архитектура i18n

Astro i18n routing с двумя локалями: `ru` (default) и `zh`.

```js
// astro.config.mjs (фрагмент)
export default {
  i18n: {
    defaultLocale: 'ru',
    locales: ['ru', 'zh'],
    routing: { prefixDefaultLocale: false }
    // / → ru, /zh/ → zh
  }
}
```

`src/i18n/t.ts` — крошечный хелпер:

```ts
import ru from './ru.json';
import zh from './zh.json';
const dicts = { ru, zh };
export function t(key: string, lang: 'ru'|'zh' = 'ru'): string {
  return dicts[lang][key] || dicts.ru[key] || key; // фолбэк на ru
}
```

`src/i18n/zh.json` имеет ту же структуру ключей, что `ru.json`, но значения пустые строки. Хелпер `t()` фолбэчит на русский, чтобы пустые места не ломали страницу — но визуально будет видно «местами русский, местами 中文». Поэтому на запуске **`/zh/` рендерится в 404** (gate в `pages/zh/index.astro`: если все ключи пустые — `Astro.redirect('/404')`). Гейт снимется, когда переводчик заполнит файл.

Переключатель РФ/中文 в `Header.astro`:
- На `/` ведёт на `/zh/`
- На `/zh/` ведёт на `/`
- Использует Astro `Astro.url.pathname`

## 9. Сборка и деплой

### `astro.config.mjs`

```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://berega.example.com',  // подставится финальный домен
  output: 'static',
  integrations: [sitemap()],
  i18n: { /* см. выше */ },
  image: { /* настройки оптимизации */ }
});
```

### `netlify.toml`

```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    Content-Security-Policy = "frame-src https://homereserve.ru https://challenges.cloudflare.com; ..."
    Referrer-Policy = "strict-origin-when-cross-origin"

[[redirects]]
  from = "/zh"
  to = "/zh/"
  status = 301
```

### Workflow деплоя

1. Локально: `npm run dev` → `localhost:4321`
2. `git push origin main` → Netlify ловит webhook
3. Netlify запускает `npm install && npm run build`
4. `dist/` публикуется на CDN
5. Functions из `netlify/functions/` деплоятся отдельно
6. Smoke-тесты вручную: открыть прод-URL, отправить тестовый отзыв и тестовую заявку

### Env vars в Netlify dashboard

Все 5 переменных (см. раздел 7) добавляются в Site settings → Environment variables. Для preview-деплоев те же значения. Для production отдельный Telegram-бот рекомендуется (чтобы тестовые заявки не смешивались с боевыми).

## 10. План миграции `site/` → Astro

Делается одним коммитом — старый `site/` удаляется после полной готовности нового. Промежуточных состояний с двумя реализациями не оставляем.

1. `npm create astro@latest` в новой временной папке, минимальный шаблон
2. Копирование `site/styles.css` → разнесение в `src/styles/{tokens,base,components}.css`
3. Создание `BaseLayout.astro` — шапка/футер/мета — на основе текущего `<head>` + Header.astro + Footer.astro
4. По одному компоненту: HTML-фрагмент из `site/index.html` → `.astro`-компонент с props
5. Контент текущего HTML → `src/content/*.json` (квартиры, отзывы, правила, FAQ)
6. Локали: вытаскиваем все строки UI в `src/i18n/ru.json`, дублируем структуру в `zh.json` с пустыми значениями
7. Создание `submit-form.ts` Netlify Function + библиотеки `sendToTelegram.ts` + `verifyTurnstile.ts`
8. Подключение Turnstile к `ReviewForm.astro` и `LeadForm.astro` (client:load)
9. Замена статического countdown на живой в `TodayOffer.astro`
10. Добавление мобильного бургер-меню в `Header.astro`
11. Создание страниц `/privacy` и `/offer` со шаблонными текстами
12. SEO-метаданные, OG-картинка, sitemap, robots.txt
13. Локальное тестирование: `npm run dev`, проверка всех форм через `netlify dev`
14. Удаление старой папки `site/`, перенос новой структуры в корень проекта
15. Создание GitHub-репо, первый push, подключение Netlify
16. Настройка env vars в Netlify, первый production-деплой
17. Smoke-тесты на live-домене

## 11. Открытые вопросы / риски

| ID | Риск / вопрос | Митигация |
|---|---|---|
| R1 | Netlify CDN иногда тормозит у российских пользователей | План B — миграция на Beget/Timeweb. Закладываем как «known risk», не блокирует запуск. |
| R2 | Виджет HomeReserve может требовать привязки production-домена к токену в их кабинете | Шаг 17 (smoke-test) обязательно проверяет работу виджета на live-домене. Если 404 — пользователь добавляет домен в их whitelist. |
| R3 | Trust ratings блок (4.9 / 5.0 / 98%) — числа хардкод | Согласовано с пользователем. Обновление вручную раз в квартал. |
| R4 | Yandex.Metrika может не работать в Турции, если бот-проверка ловит на DNS уровне | Низкий риск. Если возникнет — добавим клиентский fallback. |
| R5 | 152-ФЗ: Netlify за пределами РФ — формально требуется уведомление в Роскомнадзор о трансграничной передаче ПД | Пользователь принимает риск. Подача уведомления опциональна, делается через Госуслуги. |
| Q1 | Финальный домен | Не выбран. Подставится при деплое в `astro.config.mjs.site` и `netlify.toml`. |
| Q2 | Telegram-канал для уведомлений: личный или общий? | Уточняется у пользователя при настройке env vars. |
| Q3 | Тексты Политики ПД и Договора-оферты | Шаблоны помечены TODO. Финальную версию пользователь согласует с юристом. |

## 12. Принципы

- **Деструктивных операций нет до финального шага.** Старый `site/` остаётся неприкосновенным до завершения миграции и smoke-тестов на новом проекте.
- **Каждый шаг плана = отдельный коммит.** Откатить любой шаг можно через `git revert`.
- **Никакой логики в шаблонах.** Вся обработка данных — в `src/lib/` или в Function.
- **Никаких inline-стилей в Astro-компонентах.** Всё через классы.
- **Формы не работают без Turnstile + Telegram env vars.** Если переменных нет — Function возвращает 503, форма показывает «Сервис временно недоступен».
