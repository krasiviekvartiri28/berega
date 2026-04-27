# Дизайн лендинга «Берега» — спецификация

**Дата:** 2026-04-27
**Статус:** черновик, ожидает ревью заказчика
**Автор:** brainstorming-сессия с Claude Code

---

## 1. Обзор проекта

Лендинг-визитка для бренда посуточной аренды «Берега» (Благовещенск, Амурская область + Санкт-Петербург, Васильевский остров и центр). Бренд позиционируется как премиальная коллекция квартир с видом на реку Амур и Китай.

Сайт решает две задачи:
1. **Бронирование** — посетители находят квартиры и бронируют через виджет Realty Calendar (homereserve.ru).
2. **Лидогенерация на субаренду** — собственники квартир оставляют заявки на доверительное управление через форму.

Слоган бренда: «Остановись у реки» (из логотипа).

## 2. Целевая аудитория

- Туристы и гости Благовещенска и Санкт-Петербурга — отдых, лечение, выезд в Китай.
- Корпоративные клиенты в командировках.
- Граждане Китая, посещающие Благовещенск.
- Собственники квартир, рассматривающие доверительное управление.

## 3. Технический стек

| Слой | Решение | Обоснование |
|---|---|---|
| Фреймворк | Astro 5 (`output: 'static'`) | Статическая генерация, ноль JS по умолчанию, нативный i18n, идеально для лендинга |
| Стили | Tailwind CSS 4 | Скорость разработки, дизайн-токены, маленький итоговый bundle |
| Языки | TypeScript strict | Защита от классов ошибок |
| Анимация | GSAP 3 + ScrollTrigger + Lenis | Индустриальный стандарт премиальной motion-разработки; GSAP бесплатен с 2025 |
| Изображения | Astro Image + Sharp | Авто AVIF/WebP, lazy-loading, адаптивные размеры |
| Валидация | Zod | Одна схема для клиента и сервера |
| Хостинг | Vercel (free) | Авто-деплой, edge-функции, preview-окружения |
| Email | Resend (free 3000/мес) | Простой API, без настройки SPF/DKIM на старте |
| Анти-спам | Cloudflare Turnstile | Бесплатно, без cookies, не раздражает |
| Rate limit | Vercel KV | Бесплатный лимит достаточен для лендинга |
| Аналитика | Yandex.Метрика + Vercel Web Analytics | Метрика обязательна для рынка РФ; Vercel — быстрый обзор |
| Тесты | Vitest (unit/component) + Playwright (e2e) | Стандарт |
| Lint/format | ESLint + Prettier + husky | Pre-commit гарантия |

**Домен:** на старте бесплатный поддомен Vercel (`berega-apart.vercel.app` или аналогичный — финальное имя выбирается при создании проекта).

**Email-получатель заявок:** `krasivie.kvartiri.28@gmail.com`.

**Телеграм-контакт:** `https://t.me/maruruche` (личный аккаунт менеджера, используется как ссылка-кнопка, без бота).

**Телефон контакт:** `+7 (914) 577-00-80`. Используется в футере (рядом с контактами, click-to-call через `tel:`-ссылку), в email-шаблоне писем-уведомлений менеджеру (кнопка «Позвонить»), и опционально в FAQ-ответах.

## 4. Многоязычность

Запуск с двумя языками сразу: **русский (ru) и упрощённый китайский (zh)**.

- Astro нативный i18n: маршруты `/ru/...` и `/zh/...`.
- Корневой `/` → редирект на `/ru/`.
- Переключатель в шапке: «РФ» / «中文».
- Тексты в `src/lib/i18n/ru.json` и `zh.json`, типобезопасный хелпер `t(key)`.
- `<link rel="alternate" hreflang="ru/zh/x-default">` для SEO.
- Шрифты: для CN-локали подгружается `Noto Sans SC`, иначе — Manrope.
- Обе формы (lead, review) валидируются и принимают сообщения на любом языке (UTF-8 unicode).

## 5. Структура страницы (13 секций)

Порядок зафиксирован, основан на Instructions.md (без отдельного блока «логотип компании» — он живёт в шапке).

| № | Секция | Назначение |
|---|---|---|
| 0 | **Header** (sticky) | Логотип, навигация, RU/CN-переключатель, CTA «Забронировать» |
| 1 | **Hero** | Сильный заголовок «Коллекция квартир в Благовещенске и Санкт-Петербурге», подзаголовок «Остановись у реки», 2 CTA (Забронировать / Доверительное управление) |
| 2 | **Booking module** | Контейнер `#hr-widget-search` с RC-виджетом поиска |
| 3 | **Subscribe & discount** | 3 кнопки-ссылки: Telegram, VK, Instagram. Без сбора email |
| 4 | **Trust ratings** | Рейтинги: 4.9★ Авито (→ avito.ru/brands/i49632951), 5.0★ Суточно.ру (→ sutochno.ru/.../1066447), 98% довольных гостей |
| 5 | **Today's offer** | Промокод TODAY −15%, таймер до 23:59 (Asia/Yakutsk для Благовещенска), CTA «Забронировать со скидкой» |
| 6 | **Property list** | Контейнер `#hr-widget-list` с RC-виджетом списка объектов |
| 7 | **Reviews** | Карусель из 8–12 отзывов (источники: Авито, Суточно.ру, Telegram). С pin + horizontal scroll |
| 8 | **Leave review** | Форма: имя, оценка (1–5★), текст ≤500 симв., Turnstile, чекбокс согласия на ПД |
| 9 | **Residence rules** | 11 анимированных правил (адаптация merinohome.ru): тайминги, тишина после 22:00, залог, курение, питомцы, открытый огонь, перестановки, вежливое общение, гости, бережное отношение, регистрация |
| 10 | **FAQ** | 7 аккордеонов: «Я забронировал, что дальше?», «Часы работы», «Как заселение?», «Безопасно ли отправлять данные?», «Можно с друзьями/детьми?», «Как выселение?», «Возврат залога?» |
| 11 | **Lead form** (субаренда) | Главная цель лидогенерации. Форма: имя, телефон, email, город, сообщение, Turnstile, согласие на ПД |
| 12 | **Footer** | Логотип, мини-навигация, **телефон `+7 (914) 577-00-80`** (click-to-call), **email `krasivie.kvartiri.28@gmail.com`** (mailto-ссылка), кнопка Telegram (→ t.me/maruruche), соцсети, юр-ссылки (Политика ПД, оферта), копирайт «© 2026 ИП Чердакова М. В.» |

## 6. Визуальный язык

### Палитра (12 токенов)

| Роль | Hex | Применение |
|---|---|---|
| Background base | `#F8F4ED` | Тёплый кремовый фон, баланс к холодной брендовой синеве |
| Surface alt | `#F1EBE0` | Чередующиеся секции-«ленты» |
| Surface / Card | `#FFFFFF` | Карточки правил, FAQ, отзывов |
| Text primary | `#0E1F33` | Глубокий navy вместо чистого чёрного |
| Text secondary | `#5B5A57` | Описания, мета |
| Brand deep | `#383E8C` | Индиго из верха градиента логотипа — H1, акцент-numerals |
| Brand main | `#2C7CA5` | Бирюза из середины логотипа — основная CTA, ссылки |
| Brand light | `#A5C9D6` | Циан из низа логотипа — фоновые подсветки, иконки |
| Warm accent | `#D4B896` | Песок берега — рейтинговые звёзды, бейджи скидки, premium-детали |
| Border subtle | `#E8E2D5` | Тонкие разделители |
| Success | `#3F7D5C` | Состояния форм |
| Error | `#A04444` | Состояния форм |

**Распределение:** ≈70% тёплых нейтральных, 20% брендового синего на CTA/брендовых моментах, 10% песочного на премиум-деталях.

**Градиент логотипа** (`#383E8C → #2C7CA5`) используется экономно: primary CTA-кнопки, цифры в hero, цифры таймера TODAY.

### Типографика

| Шрифт | Где | Лицензия |
|---|---|---|
| Manrope (variable, weights 200–800) | Все RU-заголовки, body, UI | Google Fonts OFL |
| Noto Sans SC (variable) | Весь китайский язык | Google Fonts OFL |

Загрузка: `font-display: swap`, preload основных weights, subsets `cyrillic+latin` для RU и `chinese-simplified` для CN.

### Стилевые принципы

- Вертикальные ритмы: 96–160px между секциями (mobile: 64–96px).
- Сетка 12-колонок, max-width 1280px, контент часто в 6–8 колонок по центру.
- Радиусы: 12px карточки, 999px пилюли (CTA, бейджи).
- Универсальная тень: `0 8px 32px rgba(20,20,20,.06)`.
- Иконки: Lucide (open-source line-style 1.5px stroke).
- Изображения: натуральная цветокоррекция, тёплый каст.

### Логотип

- Получен в формате PNG (квадратный, с фигурой отдыхающего на волне-кровати и wordmark «БЕРЕГА / ОСТАНОВИСЬ У РЕКИ» в градиенте индиго→циан).
- Файл-источник: `logotip в png.png` в корне проекта. При имплементации копируется в `public/images/logo.png` (нормализуем имя без пробелов и кириллицы).
- SVG-версии **нет**. Файл `logo.svg` в корне проекта — это автосгенерированный плейсхолдер из прошлой сессии, не соответствует реальному логотипу; удаляется в день 1 имплементации.
- PNG заводится в нескольких размерах (`@1x`, `@2x`, `@3x`) через Astro Image для retina-дисплеев.
- Альтернатива при наличии бюджета: позже заказать векторизацию логотипа у дизайнера (cost ~$20–$50 на сервисах вроде Fiverr) — даст возможность управлять цветом в шапке после скролла. Не блокер.

## 7. Интеграция Realty Calendar — план защиты от конфликтов

### Угрозы и митигации

**Угроза 1: ID-конфликт `id="hr-widget"`** (оба сниппета homereserve используют один и тот же ID).

Стратегия (4 шага по предпочтению):
1. **Verify-first** (день 1 имплементации): прочитать исходник `https://homereserve.ru/widget.js`, проверить, принимает ли init-функция параметр `target` / `selector` / `containerId`. Если документация неясна — связаться с поддержкой homereserve.
2. **Сценарий A** (предпочтительный): если кастомный селектор поддерживается — два разных ID (`hr-widget-search`, `hr-widget-list`), передаём в init.
3. **Сценарий B** (резерв): iframe-изоляция — каждый виджет в собственном `<iframe srcdoc>` с независимым DOM-контекстом.
4. **Сценарий C** (худший): разнести виджеты на разные страницы (например, `/booking/` и `/objects/`).

**Угроза 2: Стили виджета RC ломают сайт**.

Митигация:
- Каждый виджет в обёртке `<div class="rc-widget-host">` с `isolation: isolate; contain: layout style;`.
- Reset-граница: `font-family: inherit; color: inherit;` чтобы виджет наследовал Manrope.
- Внешняя визуальная рамка нашей карточки (фон `#FFFFFF`, тень, padding 24px).

**Угроза 3: Виджет не загрузился (timeout, network, downtime)**.

Митигация — компонент-обёртка `RealtyCalendarWidget.astro`:
1. Skeleton с pulse-анимацией с момента render.
2. Lazy-load `widget.js` через IntersectionObserver (за 200px до viewport).
3. Singleton-загрузка скрипта, timeout 10 секунд.
4. На success: вызов init, скрытие skeleton.
5. На failure: логирование ошибки, fallback-блок «Не удалось загрузить модуль бронирования. Свяжитесь с нами в Telegram → @maruruche или почтой krasivie.kvartiri.28@gmail.com», страница не ломается.

**Угроза 4: API виджета изменится без предупреждения**.

Митигация:
- Вся интеграция в `src/lib/realty-calendar.ts` — один источник правды.
- Smoke-тест в Playwright проверяет каждый деплой, что после 10 секунд виджет содержит интерактивные элементы.

**Угроза 5: Мобильная адаптивность виджета**.

Митигация:
- Тест на физических устройствах (iPhone, средне-низкий Android) до релиза.
- Если виджет «вылазит» — `overflow-x-auto` на host-обёртке как fallback.

**Токен RC:** `WDBL6E35aB`.

## 8. Формы — валидация и доставка

### Архитектура

Клиент → Vercel Edge Function → Resend → email `krasivie.kvartiri.28@gmail.com`.

Защита: Zod-валидация (клиент+сервер с одной схемой) + Cloudflare Turnstile + honeypot + rate limit (5/мин/IP) + Origin/Referer проверка + sanitize.

### Схемы

```ts
// LeadFormSchema
name: string (2..80)
phone: string (regex /^\+?[\d\s\-()]{7,20}$/)
email: string (email, ≤120, optional)
city: enum ['blagoveshchensk', 'spb', 'other']
message: string (≤1000, optional)
turnstileToken: string
hp: string (max length 0 — honeypot)
consent: boolean (must be true — согласие на ПД)

// ReviewFormSchema
name: string (2..80)
rating: number (int, 1..5)
text: string (10..500)
turnstileToken: string
hp: string (max length 0)
consent: boolean (must be true)
```

### UX-состояния

| Состояние | UI |
|---|---|
| Idle | Обычная форма |
| Validating | Spinner на кнопке, поля disabled |
| Success | Зелёный экран «Спасибо, ответим в течение часа», CTA «На главную» |
| Validation error | Inline-сообщения, focus на первом некорректном поле |
| Server error | Тостер «Не удалось отправить. Попробуйте Telegram → @maruruche», данные сохраняются в localStorage |
| Network down | Та же логика, другой текст |
| Rate limited | «Слишком много попыток. Подождите минуту» |

### Email-шаблон

Тема: `[Берега] Новая заявка от {имя}` или `[Берега] Новый отзыв ★{rating}`.

HTML-шаблон содержит: данные формы, кнопки «Позвонить», «Написать в Telegram», «Открыть в почте». Reply-To = email отправителя из формы.

### Резерв доставки

Если Resend недоступен — попытка через резервный сервис (например, EmailJS) при второй ошибке. Архитектурный слот заложен; реализация может быть отложена до фазы 2.

## 9. Юридические требования (152-ФЗ)

- Чекбокс согласия на обработку ПД в обеих формах, обязателен к отметке.
- Страница «Политика обработки ПД» (`/ru/privacy/`, `/zh/privacy/`).
- Указание оператора в футере: **ИП Чердакова Мария Владимировна**.

**Реквизиты для футера и Политики ПД:**
- Полное наименование: ИП Чердакова Мария Владимировна
- Контакт-email оператора: krasivie.kvartiri.28@gmail.com
- Дополнительные реквизиты (ИНН, ОГРНИП, юр. адрес) — заполнить заказчиком в соответствующие поля JSON-конфига перед запуском.

Текст Политики ПД пишется по типовому шаблону для самозанятых/ИП в сфере посуточной аренды; рекомендуется (но не обязательно) показать готовый текст юристу заказчика перед публикацией.

## 10. Motion-спецификация

### Принципы

1. Каждый эффект имеет цель.
2. Performance budget — 60 FPS на iPhone 12 / средний Android 2022.
3. Прогрессивная деградация: профили `full` (desktop) / `lite` (mobile) / `none` (`prefers-reduced-motion`).
4. Контент готов к чтению до начала анимации.

### Стек

| Тип | Технология |
|---|---|
| Smooth scroll | Lenis (только desktop, на touch — нативный) |
| Scroll-triggered появления | GSAP + ScrollTrigger |
| Parallax | GSAP + ScrollTrigger |
| Pin + horizontal scroll | GSAP + ScrollTrigger |
| Counter-up | GSAP |
| Hover micro-interactions | CSS transitions + transform |
| FAQ accordion | CSS Grid 1fr trick |

### Карта эффектов по секциям (расширенная)

| Секция | Эффекты |
|---|---|
| Header | Прозрачный → молочный с blur при скролле; smooth-anchor через Lenis; scroll-progress bar 2px под Header (градиент бренда) |
| Hero | Parallax фон (фактор 0.5); split-text letter-by-letter reveal H1; staggered fade-up подзаголовок и CTA; kinetic-tilt буквы «Б» при mouse move; tagline-кинетика «Остановись у реки» (line-decoration «прорастает»); liquid water-ripple на bg-слое (WebGL ogl на desktop, CSS-fallback на mobile, статика при reduced-motion) |
| Booking module | Fade-up; image-reveal mask (clip-path) на рамке; curtain-reveal перед секцией |
| Subscribe & discount | Карточки появляются волной (stagger 100ms); 3D-hover-tilt с parallax-инсайд-карты; magnetic-button effect на кнопке Telegram |
| Trust ratings | Bento-grid morph (3 карточки слетаются из углов); number scramble → counter-up (4.9 / 5.0 / 98%) |
| Today's offer | Pulse «-15%» (1.0 ↔ 1.05 loop); tick-animation секунд таймера; glow-aura на CTA; magnetic button |
| Property list | Fade-up; image-reveal mask на рамке |
| Reviews | Pin + horizontal scroll (5 viewport-высот = вся карусель); 3D-card hover с parallax-слоями; marquee-лента «Благовещенск ✦ Санкт-Петербург ✦ Вид на Амур ✦ Васильевский остров ✦» между секциями |
| Leave review | Inline-success animation (форма → checkmark); confetti-burst на submit success |
| Residence rules | Sticky-storytelling: левая колонка pin (крупная иконка), правая колонка скроллится с описанием правила; cross-fade иконок при переходе блоков; на mobile — обычный список с wave-stagger появлением; SVG line-stroke draws |
| FAQ | Plus → крестик rotate 45°; smooth-expand аккордеонов через CSS Grid 1fr |
| Lead form | Fade-up; sticky CTA-shadow; cursor-spotlight на тёмном фоне (radial-gradient за курсором) |
| Footer | Простой fade-up |
| Глобально | Custom cursor с magnetic CTA (только desktop); scroll-progress bar; magnetic-buttons на primary CTA |

### Профили деградации

| Профиль | Включено |
|---|---|
| `full` (desktop) | Всё: Lenis, parallax, pin, scrub, hover-tilt, custom cursor, water-ripple WebGL |
| `lite` (mobile) | Только fade/slide появления; pin/parallax/cursor отключены; нативный скролл; CSS water-fallback |
| `none` (prefers-reduced-motion) | Контент появляется мгновенно; transitions 0ms; никаких motion-эффектов |

### Performance budget

| Метрика | Цель |
|---|---|
| LCP | < 2.0s |
| INP | < 100ms |
| CLS | < 0.05 |
| FPS scroll-анимации | ≥ 55 |
| JS bundle (initial) | < 110 KB gzipped |
| JS bundle (с lazy-чанками) | < 220 KB gzipped |

CI Lighthouse-проверка на каждый PR. Критические нарушения блокируют merge.

### Архитектура motion-кода

```
src/lib/motion/
  ├── init.ts                    — определение профиля, регистрация GSAP плагинов
  ├── lenis.ts                   — smooth scroll
  ├── cursor.ts                  — custom cursor + magnetic
  ├── progress-bar.ts            — scroll progress
  ├── marquee.ts                 — infinite marquee strips
  ├── water-ripple/
  │   ├── webgl.ts              — ogl-based shader (desktop)
  │   └── css-fallback.ts       — mobile/reduced
  ├── scroll-triggers/
  │   ├── hero.ts
  │   ├── reviews.ts
  │   ├── rules-storytelling.ts
  │   ├── trust-ratings.ts
  │   └── curtains.ts
  └── interactions/
      ├── magnetic.ts
      ├── tilt-3d.ts
      ├── image-reveal.ts
      ├── confetti.ts
      └── spotlight.ts
```

Каждый модуль с `init()` и `cleanup()`, без cross-зависимостей. Cleanup вызывает `ScrollTrigger.killAll()` и снимает listeners — защита от memory leaks.

## 11. Контент

### Источники

- **Логотип:** PNG получен; SVG позже (не блокер).
- **Фото квартир:** на старте — стильный сток (Unsplash/Pexels API, лицензия позволяет коммерческое использование). Реальные фото заменят сток после запуска.
- **Тексты:** драфты пишутся при разработке; заказчик редактирует. Все маркетинговые тексты (Hero, оффер субаренды, описания преимуществ) — проходят итерацию заказчика.
- **Отзывы:** есть реальные у заказчика — 4 скриншота в корне проекта (`1 отзыв.png` … `4 отзыв.png`). При имплементации текст распознаётся со скриншотов вручную, переносится в `src/content/reviews.json` (8–12 шт; если 4 реальных мало для карусели, дополняем стилизованными отзывами с пометкой «заменить» или просим у заказчика ещё).
- **Правила проживания:** 11 правил, адаптированы из merinohome.ru без референсов на чужое приложение/реферальную систему.
- **FAQ:** 7 вопросов, адаптированы из merinohome.ru. Ответы заточены под «Берега» (без упоминания чужого приложения; используется телефон + Telegram).
- **Рейтинги:** на старте плейсхолдеры (4.9★ Авито, 5.0★ Суточно.ру, 98% довольных гостей). Заказчик заменит реальными перед запуском.

### Ссылки на профили (полученные)

- Авито: `https://www.avito.ru/brands/i49632951?src=sharing`
- Суточно.ру: `https://sutochno.ru/front/searchapp/detail/1066447` (страница одного из объектов, представительный пример)

## 12. Структура проекта

```
berega-landing/
├── .github/workflows/           # CI: lint, type-check, tests, lighthouse, e2e
├── public/                      # шрифты, изображения, favicon, og.png, robots.txt, sitemap.xml
├── src/
│   ├── components/
│   │   ├── primitives/         # Button, Card, Input, Modal, Skeleton
│   │   ├── layout/             # Header, Footer, LanguageSwitch
│   │   ├── sections/           # Hero, Booking, Subscribe, TrustRatings, ...
│   │   └── widgets/
│   │       ├── RealtyCalendarWidget.astro
│   │       ├── LeadForm.astro
│   │       ├── ReviewForm.astro
│   │       └── TurnstileWidget.astro
│   ├── lib/
│   │   ├── schemas.ts          # Zod-схемы
│   │   ├── i18n/{ru,zh}.json + t.ts
│   │   ├── realty-calendar.ts  # один источник правды для виджета
│   │   ├── motion/             # см. раздел 10
│   │   ├── analytics/{metrika,vercel}.ts
│   │   └── utils/
│   ├── pages/
│   │   ├── index.astro          # → redirect /ru/
│   │   ├── ru/index.astro
│   │   ├── zh/index.astro
│   │   ├── ru/privacy.astro
│   │   ├── zh/privacy.astro
│   │   └── api/
│   │       ├── forms/lead.ts
│   │       ├── forms/review.ts
│   │       └── health.ts
│   ├── styles/{tokens,globals}.css
│   ├── content/{reviews,rules,faq}.json
│   └── env.d.ts
├── tests/{unit,component,e2e}/
├── docs/superpowers/specs/
│   └── 2026-04-27-berega-landing-design.md  # этот файл
├── astro.config.mjs, tailwind.config.ts, vitest.config.ts, playwright.config.ts
├── package.json, tsconfig.json (strict)
├── .eslintrc.cjs, .prettierrc, .nvmrc
└── README.md
```

## 13. Переменные окружения (Vercel)

| Переменная | Назначение |
|---|---|
| `RESEND_API_KEY` | Ключ Resend |
| `TURNSTILE_SECRET_KEY` | Серверная проверка Turnstile |
| `PUBLIC_TURNSTILE_SITE_KEY` | Клиентский ключ Turnstile |
| `PUBLIC_YANDEX_METRIKA_ID` | ID счётчика Метрики |
| `LEAD_EMAIL_TO` | `krasivie.kvartiri.28@gmail.com` |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Vercel KV для rate limit |

Все ключи хранятся в Vercel Environment Variables. В репозитории `.env.example` без значений.

## 14. CI/CD

**На каждый PR:**
- ESLint + Prettier check
- TypeScript `astro check`
- Vitest unit + component тесты
- Astro build (проверка сборки)
- Lighthouse CI на собранной версии (warning при снижении ниже бюджета)

**На merge в `main`:**
- Vercel автоматически деплоит preview → production
- Playwright e2e против production URL
- Уведомление при падении e2e

**Защита:** деплой только из ветки `main`, требуется approve в PR.

## 15. Аналитика и цели

Яндекс.Метрика + Vercel Web Analytics в `<head>` через Astro layout.

Цели Метрики (отправляются JS-событием при успешном действии):
- `form_lead_submit` — отправка лида на субаренду
- `form_review_submit` — отправка отзыва
- `cta_telegram_click` — клик «Написать в Telegram»
- `cta_book_click` — клик «Забронировать» (любая кнопка к виджету)
- `cta_subscribe_click` — клик кнопки соцсетей (Telegram/VK/Instagram)
- `language_switch` — переключение RU↔CN

## 16. Чек-листы качества

### Чек-лист кода (обязательный для merge)

- [ ] TypeScript strict mode, без `any`
- [ ] Все компоненты в Astro, минимум client-JS-островов
- [ ] Все формы — Zod schema на клиенте и сервере (одна схема)
- [ ] Все внешние интеграции — в `src/lib/*` (RC, Resend, Turnstile, Метрика)
- [ ] Каждая секция — отдельный компонент в `src/components/sections/`
- [ ] Каждый motion-эффект — отдельный модуль в `src/lib/motion/`
- [ ] Любой текст в UI — через `t('key')`, никаких хардкодов
- [ ] Все изображения через `<Image />` Astro (auto AVIF/WebP)
- [ ] Lighthouse Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95
- [ ] WCAG AA: focus-states, alt-тексты, контрасты, semantic-разметка

### Чек-лист предзапускной готовности

**Контент:**
- [x] Логотип PNG получен (`logotip в png.png`); SVG нет, и не требуется
- [x] Юридическое название получено (ИП Чердакова Мария Владимировна)
- [x] Контакт-email получен (krasivie.kvartiri.28@gmail.com)
- [x] Telegram-контакт получен (t.me/maruruche)
- [x] Точные ссылки на профили Авито и Суточно получены
- [x] 4 реальных отзыва есть в скриншотах
- [ ] Реальные тексты Hero, оффера субаренды, описаний (драфты пишутся при разработке, заказчик редактирует)
- [ ] Реальные фото квартир (или согласие на сток на старте)
- [ ] Реальные числа рейтингов (заменить плейсхолдеры 4.9 / 5.0 / 98%)
- [ ] Дополнительные реквизиты ИП (ИНН, ОГРНИП, юр.адрес) для футера

**Технический:**
- [ ] RC widget integration verified (вариант A или B)
- [ ] Resend API working, тестовое письмо приходит
- [ ] Turnstile site/secret keys активированы
- [ ] Yandex.Метрика счётчик установлен
- [ ] 6 целей в Метрике настроены и фиксируются
- [ ] Vercel domain активен, SSL ок
- [ ] `robots.txt`, `sitemap.xml`, OG-image готовы
- [ ] hreflang-теги корректно ссылают `/ru/` ↔ `/zh/`
- [ ] Lighthouse PASS на главной (RU и CN)
- [ ] Тест на iPhone, Android, desktop Chrome/Safari/Firefox

**Юридический:**
- [ ] Юридическое название/реквизиты получены
- [ ] Политика ПД — текст согласован, страница опубликована
- [ ] Чекбокс согласия в обеих формах
- [ ] Cookie-уведомление (если планируется)

**UX-тест (smoke):**
- [ ] Гость хочет забронировать: главная → виджет поиска → результат
- [ ] Партнёр-инвестор: главная → секция субаренды → форма → email пришёл
- [ ] Гость хочет оставить отзыв: главная → форма отзыва → email пришёл
- [ ] Гость из Китая: переключатель → весь сайт на CN → формы работают

## 17. Открытые вопросы и зависимости

- [ ] **День 1 имплементации:** проверить, поддерживает ли `widget.js` от homereserve.ru кастомный target. Решает выбор между сценарием A и B интеграции RC.
- [x] Логотип: SVG-версии нет, работаем с PNG (`logotip в png.png` → `public/images/logo.png`). Существующий `logo.svg` в корне — плейсхолдер из прошлой сессии, удаляется в день 1.
- [ ] Проверить мобильное поведение виджета RC на реальных устройствах.
- [x] Юридическое название получено: **ИП Чердакова Мария Владимировна**. Дополнительные реквизиты (ИНН, ОГРНИП, юр.адрес) заказчик внесёт в JSON-конфиг перед запуском.
- [x] **Перевод на упрощённый китайский:** делается Claude в процессе имплементации (не нужен внешний переводчик). Перевод покрывает весь UI, тексты секций, тексты форм, валидационные сообщения, FAQ, правила проживания, юридические страницы. Качество — competent business level (подходит для лендинга-визитки). Для критически важных юридических формулировок Политики ПД — рекомендуется финальная вычитка носителем языка после запуска (опционально, не блокер).
- [ ] Получить готовые маркетинговые тексты или согласовать драфты, написанные при разработке.
- [ ] Согласие заказчика на использование стоковых фото на старте (если своих нет).

## 18. Что НЕ входит в scope (явно)

Чтобы не было неожиданностей:

- **Личный кабинет / регистрация пользователей** — не делается. Все взаимодействия через виджет RC и формы.
- **Собственная база данных квартир** — нет. Источник истины — homereserve.ru.
- **Платежи на сайте** — нет. Платежи через виджет RC.
- **CMS / админка** — нет. Контент в JSON-файлах, обновляется коммитом.
- **Бот в Telegram** — нет. Только ссылка на личный аккаунт менеджера.
- **CRM-интеграция** — не на старте. Заявки приходят на email; CRM может быть добавлен в фазе 2.
- **Адаптация под Tilda / WordPress** — нет, проект на Astro.
- **A/B-тесты** — не на старте.
- **Push-уведомления** — нет.
- **PWA / offline-режим** — нет.

---

**Конец спецификации.**
