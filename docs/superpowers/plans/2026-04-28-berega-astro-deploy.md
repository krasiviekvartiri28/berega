# Берега — Astro Migration & Netlify Deploy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the working static prototype in `site/` into a production Astro project, wire up Netlify Functions for forms (Telegram + Cloudflare Turnstile), then deploy to Netlify.

**Architecture:** New Astro 5 project bootstrapped in `astro-site/` subfolder. Components mirror existing HTML sections 1:1. Content extracted to `src/content/*.json` with Zod schemas. UI strings to `src/i18n/{ru,zh}.json`. One Netlify Function (`submit-form`) handles both forms. After local smoke tests, migrate to project root and deploy.

**Tech Stack:** Astro 5.x · TypeScript · Vanilla CSS · Cloudflare Turnstile · Telegram Bot API · Yandex.Metrika · Netlify Functions · Vitest (for backend unit tests).

**Spec:** [`docs/superpowers/specs/2026-04-28-berega-astro-deploy-design.md`](../specs/2026-04-28-berega-astro-deploy-design.md)

**Working directory:** `c:/Users/днс/Desktop/Claude AI/My projects CLAUDE CODE/Проект 2/`. New Astro project initialised in `astro-site/` subfolder; contents moved to root at the very end (Task 38).

**Old prototype (`site/`)** — left untouched throughout the migration. Deleted only at Task 38 after smoke tests pass.

---

## Phase 0 — Bootstrap

### Task 1: Initialize Astro project

**Files:**
- Create: `astro-site/` (entire scaffold)

- [ ] **Step 1: Run Astro create**

```bash
cd "c:/Users/днс/Desktop/Claude AI/My projects CLAUDE CODE/Проект 2"
npm create astro@latest astro-site -- --template minimal --typescript strict --no-install --no-git --skip-houston
```

Expected: `astro-site/` folder created with `package.json`, `tsconfig.json`, `astro.config.mjs`, `src/pages/index.astro`.

- [ ] **Step 2: Install dependencies**

```bash
cd astro-site
npm install
npm install @astrojs/sitemap zod
npm install -D vitest @types/node
```

Expected: `node_modules/` populated; `package.json` lists astro, @astrojs/sitemap, zod, vitest.

- [ ] **Step 3: Verify dev server starts**

```bash
npm run dev
```

Expected: server starts on `http://localhost:4321`. Visit it, see Astro default page. Stop server (Ctrl+C).

- [ ] **Step 4: Initialise git in project root**

```bash
cd "c:/Users/днс/Desktop/Claude AI/My projects CLAUDE CODE/Проект 2"
git init
git config user.email "krasivie.kvartiri.28@gmail.com"
git config user.name "Berega"
```

- [ ] **Step 5: Create root .gitignore**

Create `.gitignore` in project root:

```gitignore
# OS
.DS_Store
Thumbs.db

# Editors
.vscode/
.idea/

# Node
node_modules/
.npm
*.log

# Astro
astro-site/dist/
astro-site/.astro/
astro-site/node_modules/

# Env
.env
.env.local
.env.*.local

# Netlify
.netlify/

# Misc
*.swp
*.tmp
```

- [ ] **Step 6: Initial commit**

```bash
git add .gitignore site/ docs/ Instructions.md DESIGN-airbnb.md logo.svg "logotip в png.png" "вид на китайцев.jpg" "1 отзыв.png" "2 отзыв.png" "3 отзыв.png" "4 отзыв.png" "ключ 2.png" "ключик.jpg" make_cursor.js make_cursor.py
git commit -m "chore: snapshot static prototype before Astro migration"
git add astro-site/
git commit -m "feat(astro): scaffold Astro project with TypeScript strict + sitemap + zod + vitest"
```

---

### Task 2: Configure astro.config.mjs

**Files:**
- Modify: `astro-site/astro.config.mjs`

- [ ] **Step 1: Replace astro.config.mjs**

```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://berega.example.com',
  output: 'static',
  integrations: [sitemap()],
  i18n: {
    defaultLocale: 'ru',
    locales: ['ru', 'zh'],
    routing: { prefixDefaultLocale: false }
  },
  image: {
    domains: ['homereserve.ru']
  },
  vite: {
    server: { port: 4321 }
  }
});
```

- [ ] **Step 2: Verify build still works**

```bash
cd astro-site && npm run build
```

Expected: `dist/` created with at least `index.html`, `sitemap-0.xml`, `sitemap-index.xml`. Exit code 0.

- [ ] **Step 3: Commit**

```bash
git add astro-site/astro.config.mjs
git commit -m "feat(astro): configure i18n (ru default, zh secondary), sitemap, static output"
```

---

### Task 3: Create folder structure stubs

**Files:**
- Create: empty `.gitkeep` files to lock in folder structure

- [ ] **Step 1: Create folders**

```bash
cd astro-site
mkdir -p public/reviews
mkdir -p src/assets/properties
mkdir -p src/layouts
mkdir -p src/components
mkdir -p src/content
mkdir -p src/i18n
mkdir -p src/pages/zh
mkdir -p src/styles
mkdir -p src/lib
mkdir -p netlify/functions
mkdir -p tests/lib
mkdir -p tests/functions
```

- [ ] **Step 2: Add .gitkeep to empty dirs**

```bash
touch public/reviews/.gitkeep src/assets/properties/.gitkeep netlify/functions/.gitkeep tests/lib/.gitkeep tests/functions/.gitkeep
```

- [ ] **Step 3: Commit**

```bash
git add astro-site/
git commit -m "chore(astro): create project folder structure"
```

---

### Task 4: Configure tsconfig + vitest

**Files:**
- Modify: `astro-site/tsconfig.json`
- Create: `astro-site/vitest.config.ts`

- [ ] **Step 1: Replace tsconfig.json**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@lib/*": ["./src/lib/*"],
      "@content/*": ["./src/content/*"],
      "@i18n/*": ["./src/i18n/*"]
    },
    "verbatimModuleSyntax": false
  },
  "include": ["src/**/*", "netlify/**/*", "tests/**/*", "*.ts", "*.mjs"],
  "exclude": ["dist", "node_modules"]
}
```

- [ ] **Step 2: Create vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    globals: false
  },
  resolve: {
    alias: {
      '@lib': './src/lib',
      '@i18n': './src/i18n'
    }
  }
});
```

- [ ] **Step 3: Add vitest scripts to package.json**

Modify `astro-site/package.json` `scripts` block to:

```json
"scripts": {
  "dev": "astro dev",
  "start": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "astro": "astro",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 4: Verify tests command works (no tests yet)**

```bash
npm test
```

Expected: vitest runs, reports "No test files found" or similar zero-test pass. Exit code 0.

- [ ] **Step 5: Commit**

```bash
git add astro-site/tsconfig.json astro-site/vitest.config.ts astro-site/package.json astro-site/package-lock.json
git commit -m "feat(astro): configure TypeScript paths and vitest"
```

---

## Phase 1 — Styles foundation

### Task 5: Migrate styles.css → split into 3 files

**Files:**
- Create: `astro-site/src/styles/tokens.css`
- Create: `astro-site/src/styles/base.css`
- Create: `astro-site/src/styles/components.css`
- Create: `astro-site/src/styles/global.css`
- Reference: `site/styles.css` (source)

- [ ] **Step 1: Create tokens.css**

Copy the `:root { ... }` block from `site/styles.css` (lines 4–32) verbatim:

```css
:root {
  /* Dark-navy palette */
  --bg-base:        #0B1628;
  --surface-alt:    #0F1D33;
  --surface:        #16263F;
  --text-primary:   #F2F5F9;
  --text-secondary: #98A8BF;
  --brand-deep:     #5660C4;
  --brand-main:     #4FA8D6;
  --brand-light:    #A5C9D6;
  --warm-accent:    #E0BE8E;
  --border-subtle:  #1F3052;
  --success:        #5DBE8A;
  --error:          #E07070;

  --brand-gradient: linear-gradient(135deg, #6E7AE6 0%, #4FB7E0 100%);

  --font-sans: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-serif: 'Cormorant Garamond', Georgia, serif;

  --shadow-card: 0 8px 32px rgba(0,0,0,.32);
  --shadow-float: 0 18px 56px rgba(0,0,0,.45);

  --r-card: 12px;
  --r-pill: 999px;

  --container: 1280px;
  --gutter: 32px;
}
```

- [ ] **Step 2: Create base.css**

Copy reset + body + typography rules from `site/styles.css` (lines 1–73, excluding `:root`):

```css
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&display=swap');

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: var(--font-sans);
  background: var(--bg-base);
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
  font-size: 16px;
  line-height: 1.55;
}
img { max-width: 100%; display: block; }
a { color: var(--brand-main); text-decoration: none; }
a:hover { text-decoration: underline; text-underline-offset: 3px; }

.container { max-width: var(--container); margin: 0 auto; padding: 0 var(--gutter); }
.section { padding: 120px 0; }
.section--alt { background: var(--surface-alt); }
.section--tight { padding: 80px 0; }

.eyebrow {
  font-size: 12px; font-weight: 600;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--brand-main);
  margin: 0 0 16px;
}

h1, h2, h3, h4 { color: var(--text-primary); margin: 0; letter-spacing: -0.015em; }
h1 { font-size: clamp(36px, 4vw, 55px); font-weight: 600; line-height: 1.22; }
h1 .accent { font-family: var(--font-serif); font-style: italic; font-weight: 400;
  background: var(--brand-gradient); -webkit-background-clip: text; background-clip: text; color: transparent; }
h2 { font-size: clamp(28px, 3.2vw, 44px); font-weight: 600; line-height: 1.12; }
h2 em { font-family: var(--font-serif); font-style: italic; font-weight: 400; color: var(--brand-main); }
h3 { font-size: 20px; font-weight: 600; }
p { color: var(--text-secondary); margin: 0; }
.lead { font-size: 18px; line-height: 1.6; color: var(--text-secondary); }

/* Reveal-on-scroll baseline */
.reveal { opacity: 0; transform: translateY(20px); transition: opacity .8s cubic-bezier(.22,.61,.36,1), transform .8s cubic-bezier(.22,.61,.36,1); }
.reveal.in { opacity: 1; transform: none; }
.reveal.d1 { transition-delay: .08s; }
.reveal.d2 { transition-delay: .16s; }
.reveal.d3 { transition-delay: .24s; }
.reveal.d4 { transition-delay: .32s; }

/* Section heads */
.section-head { text-align: center; max-width: 720px; margin: 0 auto 48px; }
.section-head .lead { margin-top: 12px; }
```

- [ ] **Step 3: Create components.css**

Copy ALL component rules from `site/styles.css` (everything from `/* ============ Header ============ */` to end of file, lines 75 onward). Paste verbatim. This includes header, buttons, hero, booking, subs, trust, offer, props, reviews, marquee, forms, rules, faq, lead-section, footer, and the `@media (max-width: 900px)` block. Do not modify any rules.

- [ ] **Step 4: Create global.css**

```css
@import './tokens.css';
@import './base.css';
@import './components.css';
```

- [ ] **Step 5: Verify visually (defer until Layout exists in Task 6)**

No verification step here — first usable check is at Task 6.

- [ ] **Step 6: Commit**

```bash
git add astro-site/src/styles/
git commit -m "feat(styles): split styles.css into tokens/base/components/global"
```

---

### Task 6: Create BaseLayout.astro

**Files:**
- Create: `astro-site/src/layouts/BaseLayout.astro`

- [ ] **Step 1: Create BaseLayout.astro**

```astro
---
import '../styles/global.css';

export interface Props {
  title: string;
  description?: string;
  lang?: 'ru' | 'zh';
  ogImage?: string;
  canonical?: string;
}

const {
  title,
  description = 'Коллекция квартир в Благовещенске и Санкт-Петербурге. Посуточная аренда у воды.',
  lang = 'ru',
  ogImage = '/og-cover.jpg',
  canonical = Astro.url.href
} = Astro.props;

const ymId = import.meta.env.PUBLIC_YANDEX_METRIKA_ID;
---
<!doctype html>
<html lang={lang}>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{title}</title>
  <meta name="description" content={description}>
  <link rel="canonical" href={canonical}>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">

  <meta property="og:type" content="website">
  <meta property="og:title" content={title}>
  <meta property="og:description" content={description}>
  <meta property="og:image" content={ogImage}>
  <meta property="og:locale" content={lang === 'zh' ? 'zh_CN' : 'ru_RU'}>

  {ymId && (
    <script is:inline define:vars={{ ymId }}>
      (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
      m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,
      k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");
      ym(ymId,"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});
    </script>
  )}
</head>
<body>
  <slot name="header" />
  <slot />
  <slot name="footer" />

  <script>
    // Reveal-on-scroll
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    // Header scroll progress
    const bar = document.querySelector('.header__progress');
    if (bar) {
      window.addEventListener('scroll', () => {
        const h = document.documentElement;
        const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
        (bar as HTMLElement).style.width = pct + '%';
      });
    }

    // Block bare href="#" no-op links
    document.querySelectorAll('a[href="#"]').forEach(a => {
      a.addEventListener('click', e => e.preventDefault());
    });
  </script>
</body>
</html>
```

- [ ] **Step 2: Replace src/pages/index.astro with smoke test**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Берега — smoke test">
  <main style="padding: 100px 32px;">
    <h1>Берега</h1>
    <p class="lead">Astro layout works.</p>
  </main>
</BaseLayout>
```

- [ ] **Step 3: Verify**

```bash
cd astro-site && npm run dev
```

Open `http://localhost:4321`. Expected: dark navy background, "Берега" headline in white, lead text in muted blue-grey, Manrope font loaded. Stop server.

- [ ] **Step 4: Commit**

```bash
git add astro-site/src/layouts/BaseLayout.astro astro-site/src/pages/index.astro
git commit -m "feat(layout): create BaseLayout with meta, OG, Yandex.Metrika hook, reveal-on-scroll"
```

---

## Phase 2 — Content & i18n

### Task 7: Define Zod content schemas

**Files:**
- Create: `astro-site/src/content/config.ts`

- [ ] **Step 1: Create config.ts**

```ts
import { z } from 'zod';

export const apartmentSchema = z.object({
  id: z.string(),
  city: z.string(),
  badge: z.enum(['Гостям нравится', 'Новое', 'Премиум']),
  place: z.string(),
  title: z.string(),
  meta: z.string(),
  price: z.number().positive(),
  rating: z.number().min(0).max(5),
  photo: z.string(),
  alt: z.string()
});

export const reviewSchema = z.object({
  text: z.string(),
  author: z.string(),
  source: z.enum(['Авито', 'Суточно.ру', 'Telegram']),
  date: z.string(),
  rating: z.literal(5)
});

export const ruleSchema = z.object({
  number: z.string().regex(/^\d{2}$/),
  title: z.string(),
  text: z.string()
});

export const faqSchema = z.object({
  question: z.string(),
  answer: z.string()
});

export const socialsSchema = z.object({
  telegram: z.object({ url: z.string().url(), handle: z.string() }),
  vk: z.object({ url: z.string() }),
  instagram: z.object({ url: z.string() }),
  phone: z.object({ display: z.string(), tel: z.string() }),
  email: z.string().email()
});

export type Apartment = z.infer<typeof apartmentSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type Rule = z.infer<typeof ruleSchema>;
export type FAQ = z.infer<typeof faqSchema>;
export type Socials = z.infer<typeof socialsSchema>;
```

- [ ] **Step 2: Commit**

```bash
git add astro-site/src/content/config.ts
git commit -m "feat(content): define Zod schemas for apartments, reviews, rules, faq, socials"
```

---

### Task 8: Populate content/*.json

**Files:**
- Create: `astro-site/src/content/apartments.json`
- Create: `astro-site/src/content/reviews.json`
- Create: `astro-site/src/content/rules.json`
- Create: `astro-site/src/content/faq.json`
- Create: `astro-site/src/content/socials.json`

Source: extract from `site/index.html` lines 165–234 (apartments), 254–283 (reviews), 348–358 (rules), 371–377 (faq), 421–429 (socials).

- [ ] **Step 1: apartments.json** (extract data from `site/index.html` lines 166–231)

```json
[
  { "id": "apt-1", "city": "Благовещенск", "badge": "Гостям нравится", "place": "наб. Амура, вид на Хэйхэ", "title": "Окно в реку, балкон в Китай", "meta": "3 гостя · 2 спальни · 7 этаж", "price": 5800, "rating": 4.96, "photo": "apt-1.jpg", "alt": "Спальня с серым изголовьем, белым постельным бельём и красным пледом" },
  { "id": "apt-2", "city": "Благовещенск", "badge": "Новое", "place": "ул. Зейская, центр", "title": "Светлая квартира с рабочим местом", "meta": "2 гостя · 1 спальня · 8 этаж", "price": 5200, "rating": 4.92, "photo": "apt-2.jpg", "alt": "Просторная гостиная-спальня с рабочей зоной и большим окном" },
  { "id": "apt-3", "city": "Благовещенск", "badge": "Гостям нравится", "place": "Центр, Ленина", "title": "Студия с французским окном", "meta": "2 гостя · студия · с балконом", "price": 4400, "rating": 4.88, "photo": "apt-3.jpg", "alt": "Современная спальня в серых тонах с дизайнерской люстрой" },
  { "id": "apt-4", "city": "Благовещенск", "badge": "Премиум", "place": "ул. Амурская, у набережной", "title": "Квартира с авторской кухней", "meta": "4 гостя · 2 спальни · 5 этаж", "price": 7400, "rating": 5.00, "photo": "apt-4.jpg", "alt": "Кухня с тёмно-синими фасадами и обеденной зоной у окна" },
  { "id": "apt-5", "city": "Благовещенск", "badge": "Новое", "place": "наб. Амура, центр", "title": "Двухкомнатная с панорамой", "meta": "4 гостя · 2 спальни · 12 этаж", "price": 6900, "rating": 4.95, "photo": "apt-5.jpg", "alt": "Студия-лофт с кирпичной стеной и стеклянной перегородкой к кухне" },
  { "id": "apt-6", "city": "Благовещенск", "badge": "Гостям нравится", "place": "ул. Мухина, тихий район", "title": "Тёплая квартира с уютной столовой", "meta": "3 гостя · 2 спальни · сауна", "price": 6200, "rating": 4.97, "photo": "apt-6.jpg", "alt": "Уютная кухня-столовая с круглым столом и деревянным акцентом на стене" }
]
```

- [ ] **Step 2: reviews.json**

```json
[
  { "text": "Спасибо за прекрасное жильё! Всё чистенько, в квартире имеется всё, что нужно для прекрасного проживания. Квартира находится у самой набережной — выходи и гуляй! Ну и конечно же, вид из окна на Китай — в самое сердечко. Рекомендую арендодателя.", "author": "Надежда", "source": "Авито", "date": "28 октября 2025", "rating": 5 },
  { "text": "От всей души хочу поблагодарить хозяйку квартиры за прекрасное размещение! Вы знаете то чувство, когда вас ждут? Когда встречают и окружают заботой? В поездке это очень приятно: чистота, всё для комфортного проживания, приятные мелочи. Искренне благодарю и рекомендую всем гостям Санкт-Петербурга. Спасибо вам огромное!", "author": "ПрофСпил39", "source": "Суточно.ру", "date": "2 апреля", "rating": 5 },
  { "text": "Останавливались на один день — остались очень довольны. Квартира чистая, светлая, с хорошим ремонтом. Удобное местоположение, быстрый Wi-Fi, удобная кровать, вкусный чай. Всё необходимое для комфортного краткосрочного проживания и работы. Однозначно буду рекомендовать.", "author": "Александр", "source": "Авито", "date": "11 ноября 2025", "rating": 5 },
  { "text": "Отличная квартира. Всё предусмотрено для комфортного проживания. Очень радует вечерний вид из окна!", "author": "Игорь", "source": "Авито", "date": "20 апреля", "rating": 5 },
  { "text": "Очень хорошая, чистая квартира. Удобное расположение, великолепные хозяева. Есть свободные квартиры — всегда снимаем только у них.", "author": "Анастасия", "source": "Суточно.ру", "date": "26 апреля", "rating": 5 },
  { "text": "Чисто. Хороший вид с окна. Всё устроило. Кровать отличная. Рекомендую.", "author": "Сергей", "source": "Авито", "date": "30 октября 2025", "rating": 5 }
]
```

- [ ] **Step 3: rules.json**

```json
[
  { "number": "01", "title": "Тайминги", "text": "Заезд после 15:00, выезд до 12:00. Раннее заселение и поздний выезд — по договорённости." },
  { "number": "02", "title": "Тишина после 22:00", "text": "Соседи рядом. Музыку и громкие разговоры просим оставить до утра." },
  { "number": "03", "title": "Залог", "text": "Возвратный залог при заселении — сумма зависит от объекта. Возвращаем при выезде." },
  { "number": "04", "title": "Курение", "text": "Курение и вейпы внутри квартиры запрещены. На балконе — пожалуйста." },
  { "number": "05", "title": "Питомцы", "text": "С животными — по согласованию. Сообщите заранее, и мы подберём подходящую квартиру." },
  { "number": "06", "title": "Открытый огонь", "text": "Свечи, благовония и любой открытый огонь — нет. Берегите себя и квартиру." },
  { "number": "07", "title": "Перестановки", "text": "Мебель просим не двигать. Если что-то неудобно — скажите, поможем." },
  { "number": "08", "title": "Вежливое общение", "text": "С соседями, охраной и менеджером — по-доброму. Это упрощает всё." },
  { "number": "09", "title": "Гости", "text": "Дополнительные гости и вечеринки — только с предварительного согласия." },
  { "number": "10", "title": "Бережное отношение", "text": "Обращайтесь с квартирой, как со своей. О поломках сообщайте сразу — починим." },
  { "number": "11", "title": "Регистрация", "text": "Для гостей из других стран помогаем с миграционным учётом. Сообщите заранее." }
]
```

- [ ] **Step 4: faq.json**

```json
[
  { "question": "Я забронировал, что дальше?", "answer": "Сразу после оплаты на почту приходит подтверждение и инструкция: адрес, как пройти, как получить ключи. За день до заезда напишет менеджер с уточнениями." },
  { "question": "Часы работы", "answer": "Заселяем и отвечаем с 9:00 до 22:00 по местному времени. В экстренных случаях доступны круглосуточно через Telegram." },
  { "question": "Как заселение?", "answer": "Бесконтактно по коду от электронного замка или с менеджером — как удобнее. Подробная инструкция приходит за день до заезда." },
  { "question": "Безопасно ли отправлять данные?", "answer": "Да. Все формы защищены, данные не передаются третьим лицам. Подробности — в Политике обработки персональных данных в футере." },
  { "question": "Можно с друзьями или детьми?", "answer": "Конечно. Укажите количество гостей при бронировании. Для семей с детьми есть квартиры с дополнительной кроватью." },
  { "question": "Как выселение?", "answer": "До 12:00 закройте дверь и оставьте ключи в шкатулке у замка (или на ресепшен — зависит от объекта). Всё, отдыхайте." },
  { "question": "Возврат залога?", "answer": "Возвращаем в течение 24 часов после выезда — на ту же карту или наличными. Если есть вопросы — пишите в Telegram." }
]
```

- [ ] **Step 5: socials.json**

```json
{
  "telegram": { "url": "https://t.me/maruruche", "handle": "@maruruche" },
  "vk": { "url": "https://vk.com/" },
  "instagram": { "url": "https://instagram.com/" },
  "phone": { "display": "+7 (914) 577-00-80", "tel": "+79145770080" },
  "email": "krasivie.kvartiri.28@gmail.com"
}
```

- [ ] **Step 6: Write parser test**

Create `tests/lib/content.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { apartmentSchema, reviewSchema, ruleSchema, faqSchema, socialsSchema } from '../../src/content/config';
import apartments from '../../src/content/apartments.json';
import reviews from '../../src/content/reviews.json';
import rules from '../../src/content/rules.json';
import faq from '../../src/content/faq.json';
import socials from '../../src/content/socials.json';

describe('content schemas', () => {
  it('apartments.json validates and has 6 items', () => {
    const parsed = apartments.map(a => apartmentSchema.parse(a));
    expect(parsed).toHaveLength(6);
  });
  it('reviews.json validates and has 6 items', () => {
    const parsed = reviews.map(r => reviewSchema.parse(r));
    expect(parsed).toHaveLength(6);
  });
  it('rules.json validates and has 11 items', () => {
    const parsed = rules.map(r => ruleSchema.parse(r));
    expect(parsed).toHaveLength(11);
  });
  it('faq.json validates and has 7 items', () => {
    const parsed = faq.map(f => faqSchema.parse(f));
    expect(parsed).toHaveLength(7);
  });
  it('socials.json validates', () => {
    expect(() => socialsSchema.parse(socials)).not.toThrow();
  });
});
```

- [ ] **Step 7: Run test**

```bash
cd astro-site && npm test
```

Expected: 5 tests pass.

- [ ] **Step 8: Commit**

```bash
git add astro-site/src/content/ astro-site/tests/lib/content.test.ts
git commit -m "feat(content): populate apartments/reviews/rules/faq/socials JSON with Zod tests"
```

---

### Task 9: Create i18n helper + ru.json + zh.json

**Files:**
- Create: `astro-site/src/i18n/t.ts`
- Create: `astro-site/src/i18n/ru.json`
- Create: `astro-site/src/i18n/zh.json`

- [ ] **Step 1: ru.json** (full string catalog extracted from `site/index.html`)

```json
{
  "site.title": "Берега — Коллекция квартир в Благовещенске и Санкт-Петербурге",
  "site.description": "Коллекция квартир в Благовещенске и Санкт-Петербурге. Посуточная аренда у воды.",
  "nav.book": "Забронировать",
  "nav.properties": "Квартиры",
  "nav.reviews": "Отзывы",
  "nav.rules": "Правила",
  "nav.faq": "FAQ",
  "nav.lead": "Субаренда",
  "hero.eyebrow": "Коллекция квартир · Благовещенск · Санкт-Петербург",
  "hero.h1.line1": "Коллекция квартир",
  "hero.h1.line2": "в Благовещенске",
  "hero.h1.line3": "и Санкт-Петербурге",
  "hero.lead": "Остановись у реки. Вид на Амур и Китай или на Неву и Финский залив. Выбирай тишину, которая ближе.",
  "hero.cta.primary": "Забронировать",
  "hero.cta.secondary": "Доверительное управление",
  "hero.chip.quote": "«Вечер. Амур. Прогулки по набережной.»",
  "hero.chip.cap": "— Благовещенск, вид на Китай",
  "booking.eyebrow": "Бронирование",
  "booking.h2": "Найдите квартиру",
  "booking.h2.em": "у воды",
  "subscribe.eyebrow": "Будь рядом",
  "subscribe.h2": "Подпишись и получи",
  "subscribe.h2.em": "скидку 10%",
  "subscribe.lead": "Расскажем о свободных датах и закрытых предложениях. Без спама — только тишина и пара полезных слов в месяц.",
  "subscribe.tg.title": "Telegram-канал",
  "subscribe.tg.text": "Свободные даты, утренние фото с реки, закрытые цены.",
  "subscribe.tg.cta": "Подписаться",
  "subscribe.vk.title": "ВКонтакте",
  "subscribe.vk.text": "Большие фото квартир, рассказы о соседних местах, пейзажи.",
  "subscribe.vk.cta": "Перейти",
  "subscribe.ig.title": "Instagram",
  "subscribe.ig.text": "Сторис из квартир — закаты, балконы, окна в реку.",
  "subscribe.ig.cta": "Перейти",
  "trust.eyebrow": "Что говорят гости",
  "trust.h2": "Нас выбирают",
  "trust.h2.em": "и возвращаются",
  "trust.avito": "Авито · 280+ оценок",
  "trust.sutochno": "Суточно.ру",
  "trust.satisfied": "— довольных гостей",
  "trust.year": "по итогам 2025 года",
  "offer.promo": "−15% сегодня",
  "offer.h2": "Промокод",
  "offer.h2.em": "TODAY",
  "offer.h2.tail": "до полуночи",
  "offer.text": "Скидка действует до 23:59 по времени Благовещенска. Введите код при бронировании.",
  "offer.cta": "Забронировать со скидкой",
  "offer.label.hours": "час",
  "offer.label.minutes": "мин",
  "offer.label.seconds": "сек",
  "props.eyebrow": "Сейчас на воде",
  "props.h2": "Свободные квартиры",
  "props.h2.em": "в коллекции",
  "props.lead": "Шесть тихих мест на Амуре. Утро, чай, окно — и больше ничего.",
  "props.per": "/ ночь",
  "marquee.items": "Благовещенск ✦ Вид на Амур ✦ Хэйхэ за окном ✦ Набережная ✦ Утро у реки",
  "reviews.eyebrow": "Отзывы гостей",
  "reviews.h2": "«Тихо, чисто,",
  "reviews.h2.em": "красиво»",
  "reviews.lead": "Реальные отзывы с Авито и Суточно.ру — без редактирования.",
  "reviews.proof.title": "Скриншоты с площадок",
  "reviewform.eyebrow": "Поделитесь впечатлением",
  "reviewform.h2": "Оставьте",
  "reviewform.h2.em": "отзыв",
  "reviewform.lead": "Нам важно слышать вас — и приятно, и где можно стать лучше.",
  "reviewform.label.name": "Имя",
  "reviewform.placeholder.name": "Анна",
  "reviewform.label.rating": "Оценка",
  "reviewform.label.text": "Отзыв",
  "reviewform.placeholder.text": "Что запомнилось?",
  "reviewform.consent": "Соглашаюсь с обработкой персональных данных",
  "reviewform.submit": "Отправить отзыв",
  "reviewform.success": "Готово. Спасибо за слова.",
  "reviewform.error": "Что-то пошло не так. Попробуйте снова.",
  "rules.eyebrow": "Правила проживания",
  "rules.h2": "Чтобы всем было",
  "rules.h2.em": "хорошо",
  "rules.lead": "Мы доверяем гостям и просим о взаимности. Одиннадцать простых правил.",
  "faq.eyebrow": "Частые вопросы",
  "faq.h2": "Коротко и по делу",
  "lead.eyebrow": "Доверительное управление",
  "lead.h2": "Сдайте свою квартиру",
  "lead.h2.em": "под ключ",
  "lead.lead": "Мы возьмём на себя поиск гостей, заселение, уборку, отзывы и все хлопоты. Вы получаете доход — без забот.",
  "lead.bullet.report": "Прозрачный отчёт — ежемесячно. Видно каждую бронь.",
  "lead.bullet.photo": "Профессиональная съёмка и тексты — за наш счёт.",
  "lead.bullet.placement": "Размещение на Авито, Суточно, Booking-аналогах.",
  "lead.bullet.cleaning": "Уборка и текстиль — наша команда. Вы не вмешиваетесь.",
  "lead.bullet.income": "Гарантия дохода — обсуждаем индивидуально.",
  "leadform.label.name": "Имя",
  "leadform.placeholder.name": "Мария",
  "leadform.label.phone": "Телефон",
  "leadform.placeholder.phone": "+7 (___) ___-__-__",
  "leadform.label.email": "Email",
  "leadform.placeholder.email": "vy@example.com",
  "leadform.label.city": "Город",
  "leadform.label.message": "Расскажите о квартире",
  "leadform.placeholder.message": "Адрес, метраж, состояние, ваши пожелания…",
  "leadform.consent": "Соглашаюсь с обработкой персональных данных в соответствии с Политикой",
  "leadform.submit": "Оставить заявку",
  "leadform.note": "Ответим в течение часа в рабочее время.",
  "leadform.success": "Готово. Свяжемся в течение часа.",
  "leadform.error": "Что-то пошло не так. Попробуйте снова.",
  "footer.h.site": "Сайт",
  "footer.h.contacts": "Контакты",
  "footer.h.socials": "Соцсети",
  "footer.tagline": "Остановись у реки",
  "footer.legal.copy": "© 2026 ИП Чердакова М. В.",
  "footer.legal.privacy": "Политика обработки ПД",
  "footer.legal.offer": "Договор-оферта",
  "lang.ru": "РФ",
  "lang.zh": "中文"
}
```

- [ ] **Step 2: zh.json** (mirror ru.json structure with empty string values)

Generate by copying `ru.json` and replacing every value with empty string `""`. Use this Node one-liner from the `astro-site/` folder:

```bash
node -e "const ru = require('./src/i18n/ru.json'); const zh = Object.fromEntries(Object.keys(ru).map(k => [k, ''])); require('fs').writeFileSync('./src/i18n/zh.json', JSON.stringify(zh, null, 2));"
```

Expected: `zh.json` exists, has identical keys to `ru.json`, all values are empty strings.

- [ ] **Step 3: Create t.ts helper**

```ts
import ru from './ru.json';
import zh from './zh.json';

type Lang = 'ru' | 'zh';
type Dict = Record<string, string>;

const dicts: Record<Lang, Dict> = { ru, zh };

export function t(key: string, lang: Lang = 'ru'): string {
  const value = dicts[lang]?.[key];
  if (value && value.length > 0) return value;
  return dicts.ru[key] ?? key;
}

export function isLocaleEmpty(lang: Lang): boolean {
  const dict = dicts[lang];
  return Object.values(dict).every(v => v === '');
}
```

- [ ] **Step 4: Write test**

Create `tests/lib/i18n.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { t, isLocaleEmpty } from '../../src/i18n/t';

describe('t() helper', () => {
  it('returns Russian string for known key', () => {
    expect(t('nav.book')).toBe('Забронировать');
  });
  it('falls back to ru when zh value is empty', () => {
    expect(t('nav.book', 'zh')).toBe('Забронировать');
  });
  it('returns key when not found', () => {
    expect(t('does.not.exist')).toBe('does.not.exist');
  });
});

describe('isLocaleEmpty()', () => {
  it('returns true for zh (all empty)', () => {
    expect(isLocaleEmpty('zh')).toBe(true);
  });
  it('returns false for ru (populated)', () => {
    expect(isLocaleEmpty('ru')).toBe(false);
  });
});
```

- [ ] **Step 5: Run tests**

```bash
npm test
```

Expected: 5 i18n tests pass + 5 content tests pass = 10 total.

- [ ] **Step 6: Commit**

```bash
git add astro-site/src/i18n/ astro-site/tests/lib/i18n.test.ts
git commit -m "feat(i18n): ru.json catalog, empty zh.json template, t() helper with fallback"
```

---

### Task 10: Copy assets

**Files:**
- Copy from `site/`: `hero.jpg` → `astro-site/src/assets/hero.jpg`
- Copy from `site/`: `logo.png` → `astro-site/src/assets/logo.png`
- Copy from `site/`: `favicon.svg` → `astro-site/public/favicon.svg`
- Copy from `site/properties/*.jpg` → `astro-site/src/assets/properties/`
- Copy from `site/reviews/*.png` → `astro-site/public/reviews/`

- [ ] **Step 1: Copy assets**

```bash
cd "c:/Users/днс/Desktop/Claude AI/My projects CLAUDE CODE/Проект 2"
cp site/hero.jpg astro-site/src/assets/hero.jpg
cp site/logo.png astro-site/src/assets/logo.png
cp site/favicon.svg astro-site/public/favicon.svg
cp site/properties/*.jpg astro-site/src/assets/properties/
cp site/reviews/*.png astro-site/public/reviews/
```

- [ ] **Step 2: Verify**

```bash
ls astro-site/src/assets/properties/
ls astro-site/public/reviews/
```

Expected: 6 jpg files in properties, 4 png files in reviews.

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/assets/ astro-site/public/
git commit -m "chore(assets): copy hero, logo, favicon, 6 property photos, 4 review screenshots"
```

---

## Phase 3 — Visual components

> Each task in this phase: extract a section from `site/index.html` into a `.astro` component, replace inline strings with `t(...)` calls, replace inline data with imports from `src/content/`. Verify visually after assembling all components in Task 25.

### Task 11: Header.astro (with mobile burger)

**Files:**
- Create: `astro-site/src/components/Header.astro`
- Reference: `site/index.html:13-36` (header markup)

- [ ] **Step 1: Create Header.astro**

```astro
---
import { t } from '../i18n/t';
import logo from '../assets/logo.png';

export interface Props { lang?: 'ru' | 'zh'; }
const { lang = 'ru' } = Astro.props;
const otherLangPath = lang === 'ru' ? '/zh/' : '/';
---
<header class="header">
  <div class="container header__inner">
    <a class="header__brand" href="#top">
      <img src={logo.src} alt="Берега" width="38" height="38">
      <span class="header__word">БЕРЕГА</span>
    </a>
    <nav class="header__nav" id="main-nav">
      <a href="#booking">{t('nav.book', lang)}</a>
      <a href="#properties">{t('nav.properties', lang)}</a>
      <a href="#reviews">{t('nav.reviews', lang)}</a>
      <a href="#rules">{t('nav.rules', lang)}</a>
      <a href="#faq">{t('nav.faq', lang)}</a>
      <a href="#lead">{t('nav.lead', lang)}</a>
    </nav>
    <div class="header__right">
      <div class="lang-switch" role="group" aria-label="Выбор языка">
        <a href={lang === 'ru' ? '/' : '/zh/'} class={lang === 'ru' ? 'active' : ''} aria-current={lang === 'ru' ? 'page' : 'false'}>{t('lang.ru', lang)}</a>
        <a href={otherLangPath} class={lang === 'zh' ? 'active' : ''} aria-current={lang === 'zh' ? 'page' : 'false'}>{t('lang.zh', lang)}</a>
      </div>
      <button type="button" class="header__burger" aria-label="Меню" aria-controls="main-nav" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
      <a class="btn btn-primary header__cta" href="#booking">{t('nav.book', lang)}</a>
    </div>
  </div>
  <div class="header__progress"></div>
</header>
<a id="top"></a>

<script>
  const burger = document.querySelector('.header__burger') as HTMLButtonElement | null;
  const nav = document.getElementById('main-nav');
  burger?.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!open));
    nav?.classList.toggle('header__nav--open');
  });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('header__nav--open');
    burger?.setAttribute('aria-expanded', 'false');
  }));
</script>
```

- [ ] **Step 2: Add burger styles to components.css**

Append to `astro-site/src/styles/components.css`:

```css
.header__burger { display: none; background: none; border: 0; width: 40px; height: 40px; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; }
.header__burger span { display: block; width: 24px; height: 2px; background: var(--text-primary); border-radius: 2px; transition: transform .3s, opacity .3s; }
.header__burger[aria-expanded="true"] span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.header__burger[aria-expanded="true"] span:nth-child(2) { opacity: 0; }
.header__burger[aria-expanded="true"] span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

@media (max-width: 900px) {
  .header__burger { display: flex; }
  .header__cta { display: none; }
  .header__nav {
    display: none; position: absolute; top: 100%; left: 0; right: 0;
    background: var(--surface); border-bottom: 1px solid var(--border-subtle);
    flex-direction: column; gap: 0; padding: 16px;
  }
  .header__nav--open { display: flex; }
  .header__nav a { padding: 12px 16px; }
}
```

- [ ] **Step 3: Update existing 900px media query in components.css**

Find the existing rule `.header__nav { display: none; }` inside `@media (max-width: 900px)` (was needed in old prototype). Remove that single rule (it's now superseded by the open-state rule above). Leave the rest of the media block intact.

- [ ] **Step 4: Commit**

```bash
git add astro-site/src/components/Header.astro astro-site/src/styles/components.css
git commit -m "feat(component): Header with i18n nav, lang switcher as anchors, mobile burger"
```

---

### Task 12: Footer.astro

**Files:**
- Create: `astro-site/src/components/Footer.astro`
- Reference: `site/index.html:423-461`

- [ ] **Step 1: Create Footer.astro**

```astro
---
import { t } from '../i18n/t';
import socials from '../content/socials.json';
import logo from '../assets/logo.png';

export interface Props { lang?: 'ru' | 'zh'; }
const { lang = 'ru' } = Astro.props;
const privacyHref = lang === 'zh' ? '/zh/privacy' : '/privacy';
const offerHref = lang === 'zh' ? '/zh/offer' : '/offer';
---
<footer class="footer">
  <div class="container">
    <div class="footer__top">
      <div class="footer__brand">
        <img src={logo.src} alt="Берега" width="56" height="56">
        <div class="word">БЕРЕГА</div>
        <div class="tag">{t('footer.tagline', lang)}</div>
      </div>
      <div>
        <h4>{t('footer.h.site', lang)}</h4>
        <a href="#booking">{t('nav.book', lang)}</a>
        <a href="#properties">{t('nav.properties', lang)}</a>
        <a href="#reviews">{t('nav.reviews', lang)}</a>
        <a href="#rules">{t('nav.rules', lang)}</a>
        <a href="#faq">{t('nav.faq', lang)}</a>
        <a href="#lead">{t('nav.lead', lang)}</a>
      </div>
      <div class="footer__contacts">
        <h4>{t('footer.h.contacts', lang)}</h4>
        <a href={`tel:${socials.phone.tel}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          {socials.phone.display}
        </a>
        <a href={`mailto:${socials.email}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/></svg>
          {socials.email}
        </a>
        <a href={socials.telegram.url}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-11 11"/><path d="M22 2 15 22l-4-9-9-4Z"/></svg>
          Telegram · {socials.telegram.handle}
        </a>
      </div>
      <div>
        <h4>{t('footer.h.socials', lang)}</h4>
        <a href={socials.telegram.url}>{t('subscribe.tg.title', lang)}</a>
        <a href={socials.vk.url}>{t('subscribe.vk.title', lang)}</a>
        <a href={socials.instagram.url}>{t('subscribe.ig.title', lang)}</a>
      </div>
    </div>
    <div class="footer__legal">
      <span>{t('footer.legal.copy', lang)}</span>
      <span>·</span>
      <a href={privacyHref}>{t('footer.legal.privacy', lang)}</a>
      <span>·</span>
      <a href={offerHref}>{t('footer.legal.offer', lang)}</a>
    </div>
  </div>
</footer>
```

- [ ] **Step 2: Commit**

```bash
git add astro-site/src/components/Footer.astro
git commit -m "feat(component): Footer with i18n, contacts from socials.json, privacy/offer links"
```

---

### Task 13: Hero.astro

**Files:**
- Create: `astro-site/src/components/Hero.astro`
- Reference: `site/index.html:41-61`

- [ ] **Step 1: Create Hero.astro**

```astro
---
import { Image } from 'astro:assets';
import { t } from '../i18n/t';
import hero from '../assets/hero.jpg';

export interface Props { lang?: 'ru' | 'zh'; }
const { lang = 'ru' } = Astro.props;
---
<section class="hero">
  <div class="hero__bg"></div>
  <div class="container hero__grid">
    <div class="reveal in">
      <p class="eyebrow">{t('hero.eyebrow', lang)}</p>
      <h1>{t('hero.h1.line1', lang)}<br>{t('hero.h1.line2', lang)}<br>{t('hero.h1.line3', lang)}</h1>
      <p class="lead hero__lead">{t('hero.lead', lang)}</p>
      <div class="hero__cta">
        <a class="btn btn-primary" href="#booking">{t('hero.cta.primary', lang)}</a>
        <a class="btn btn-secondary" href="#lead">{t('hero.cta.secondary', lang)}</a>
      </div>
    </div>
    <div class="hero__media reveal in d2">
      <Image class="hero__photo" src={hero} alt="Вид на Хэйхэ через Амур" widths={[480, 800, 1200]} sizes="(max-width: 900px) 100vw, 50vw" loading="eager" />
      <div class="hero__chip">
        <div class="quote">{t('hero.chip.quote', lang)}</div>
        <span class="cap">{t('hero.chip.cap', lang)}</span>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Add `.hero__lead` rule to components.css**

Find `/* ============ Hero ============ */` block. Add:

```css
.hero__lead { margin-top: 28px; max-width: 520px; }
```

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/components/Hero.astro astro-site/src/styles/components.css
git commit -m "feat(component): Hero with Astro Image (responsive), i18n strings, chip quote"
```

---

### Task 14: BookingWidget.astro

**Files:**
- Create: `astro-site/src/components/BookingWidget.astro`
- Reference: `site/index.html:64-78`

- [ ] **Step 1: Create BookingWidget.astro**

```astro
---
import { t } from '../i18n/t';
export interface Props { lang?: 'ru' | 'zh'; }
const { lang = 'ru' } = Astro.props;
---
<section id="booking" class="section section--tight">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow">{t('booking.eyebrow', lang)}</p>
      <h2>{t('booking.h2', lang)} <em>{t('booking.h2.em', lang)}</em></h2>
    </div>
    <div class="booking-module reveal d1">
      <div id="hr-widget"></div>
      <script type="module" src="https://homereserve.ru/widget.js"></script>
      <script type="module" is:inline>
        window.homereserve.initWidgetSearch({"token":"WDBL6E35aB","navigation":false})
      </script>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Commit**

```bash
git add astro-site/src/components/BookingWidget.astro
git commit -m "feat(component): BookingWidget mounting HomeReserve hr-widget with token"
```

---

### Task 15: SubscribeStrip.astro

**Files:**
- Create: `astro-site/src/components/SubscribeStrip.astro`
- Reference: `site/index.html:81-109`

- [ ] **Step 1: Create SubscribeStrip.astro**

```astro
---
import { t } from '../i18n/t';
import socials from '../content/socials.json';

export interface Props { lang?: 'ru' | 'zh'; }
const { lang = 'ru' } = Astro.props;
---
<section class="section section--alt">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow">{t('subscribe.eyebrow', lang)}</p>
      <h2>{t('subscribe.h2', lang)} <em>{t('subscribe.h2.em', lang)}</em></h2>
      <p class="lead">{t('subscribe.lead', lang)}</p>
    </div>
    <div class="subs-grid">
      <div class="sub-card reveal d1">
        <div class="ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-11 11"/><path d="M22 2 15 22l-4-9-9-4Z"/></svg></div>
        <h3>{t('subscribe.tg.title', lang)}</h3>
        <p>{t('subscribe.tg.text', lang)}</p>
        <a class="btn btn-primary" href={socials.telegram.url}>{t('subscribe.tg.cta', lang)}</a>
      </div>
      <div class="sub-card reveal d2">
        <div class="ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="18" rx="3"/><path d="M7 9h2l2 4 2-4h2l-3 6h-2z"/></svg></div>
        <h3>{t('subscribe.vk.title', lang)}</h3>
        <p>{t('subscribe.vk.text', lang)}</p>
        <a class="btn btn-secondary" href={socials.vk.url}>{t('subscribe.vk.cta', lang)}</a>
      </div>
      <div class="sub-card reveal d3">
        <div class="ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg></div>
        <h3>{t('subscribe.ig.title', lang)}</h3>
        <p>{t('subscribe.ig.text', lang)}</p>
        <a class="btn btn-secondary" href={socials.instagram.url}>{t('subscribe.ig.cta', lang)}</a>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Commit**

```bash
git add astro-site/src/components/SubscribeStrip.astro
git commit -m "feat(component): SubscribeStrip with 3 cards from socials.json"
```

---

### Task 16: TrustRatings.astro

**Files:**
- Create: `astro-site/src/components/TrustRatings.astro`
- Reference: `site/index.html:112-136`

- [ ] **Step 1: Create TrustRatings.astro**

```astro
---
import { t } from '../i18n/t';
export interface Props { lang?: 'ru' | 'zh'; }
const { lang = 'ru' } = Astro.props;
---
<section class="section">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow">{t('trust.eyebrow', lang)}</p>
      <h2>{t('trust.h2', lang)} <em>{t('trust.h2.em', lang)}</em></h2>
    </div>
    <div class="trust-grid">
      <div class="trust-card reveal d1">
        <div class="num">4.9</div>
        <div class="star">★ ★ ★ ★ ★</div>
        <p class="src">{t('trust.avito', lang)}</p>
      </div>
      <div class="trust-card reveal d2">
        <div class="num">5.0</div>
        <div class="star">★ ★ ★ ★ ★</div>
        <p class="src">{t('trust.sutochno', lang)}</p>
      </div>
      <div class="trust-card reveal d3">
        <div class="num">98%</div>
        <div class="star" style="color:var(--brand-main);font-size:18px">{t('trust.satisfied', lang)}</div>
        <p class="src">{t('trust.year', lang)}</p>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Commit**

```bash
git add astro-site/src/components/TrustRatings.astro
git commit -m "feat(component): TrustRatings with 4.9/5.0/98% cards"
```

---

### Task 17: TodayOffer.astro (with live countdown)

**Files:**
- Create: `astro-site/src/components/TodayOffer.astro`
- Reference: `site/index.html:139-155` (was static `07:42:18`)

- [ ] **Step 1: Create TodayOffer.astro**

```astro
---
import { t } from '../i18n/t';
export interface Props { lang?: 'ru' | 'zh'; }
const { lang = 'ru' } = Astro.props;
---
<section class="section section--tight">
  <div class="container">
    <div class="offer reveal">
      <div>
        <span class="promo">{t('offer.promo', lang)}</span>
        <h2>{t('offer.h2', lang)} <em>{t('offer.h2.em', lang)}</em> {t('offer.h2.tail', lang)}</h2>
        <p>{t('offer.text', lang)}</p>
        <a class="btn" href="#booking">{t('offer.cta', lang)}</a>
      </div>
      <div class="offer__timer" data-tz="Asia/Yakutsk">
        <div class="tt-cell"><div class="v" data-h>--</div><div class="l">{t('offer.label.hours', lang)}</div></div>
        <div class="tt-cell"><div class="v" data-m>--</div><div class="l">{t('offer.label.minutes', lang)}</div></div>
        <div class="tt-cell"><div class="v" data-s>--</div><div class="l">{t('offer.label.seconds', lang)}</div></div>
      </div>
    </div>
  </div>
</section>

<script>
  function pad2(n: number): string { return String(n).padStart(2, '0'); }
  function tick(): void {
    const timer = document.querySelector('.offer__timer');
    if (!timer) return;
    // Asia/Yakutsk is UTC+9 (Blagoveshchensk)
    const now = new Date();
    const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
    const blgMs = utcMs + 9 * 3600000;
    const blg = new Date(blgMs);
    const endOfDay = new Date(blg);
    endOfDay.setUTCHours(23, 59, 59, 999);
    const diff = Math.max(0, endOfDay.getTime() - blg.getTime());
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    timer.querySelector<HTMLElement>('[data-h]')!.textContent = pad2(h);
    timer.querySelector<HTMLElement>('[data-m]')!.textContent = pad2(m);
    timer.querySelector<HTMLElement>('[data-s]')!.textContent = pad2(s);
  }
  tick();
  setInterval(tick, 1000);
</script>
```

- [ ] **Step 2: Commit**

```bash
git add astro-site/src/components/TodayOffer.astro
git commit -m "feat(component): TodayOffer with live countdown to Blagoveshchensk midnight"
```

---

### Task 18: PropertyCard.astro + PropertyGrid.astro

**Files:**
- Create: `astro-site/src/components/PropertyCard.astro`
- Create: `astro-site/src/components/PropertyGrid.astro`

- [ ] **Step 1: Create PropertyCard.astro**

```astro
---
import { Image } from 'astro:assets';
import type { Apartment } from '../content/config';
import { t } from '../i18n/t';

const propertyImages = import.meta.glob<{ default: ImageMetadata }>('../assets/properties/*.jpg', { eager: true });

export interface Props { apartment: Apartment; delay: 'd1'|'d2'|'d3'; lang?: 'ru'|'zh'; }
const { apartment, delay, lang = 'ru' } = Astro.props;

const imgEntry = propertyImages[`../assets/properties/${apartment.photo}`];
if (!imgEntry) throw new Error(`Missing image: ${apartment.photo}`);
---
<article class={`prop reveal ${delay}`}>
  <div class="prop__photo-wrap">
    <Image class="prop__photo-img" src={imgEntry.default} alt={apartment.alt} widths={[400, 800]} sizes="(max-width: 900px) 100vw, 33vw" />
    <span class="badge">{apartment.badge}</span>
    <span class="city">{apartment.city}</span>
  </div>
  <div class="prop__body">
    <div class="prop__place">{apartment.place}</div>
    <h3 class="prop__title">{apartment.title}</h3>
    <p class="prop__meta">{apartment.meta}</p>
    <div class="prop__row">
      <span class="prop__price">{apartment.price.toLocaleString('ru-RU')} ₽<span class="per"> {t('props.per', lang)}</span></span>
      <span class="prop__rate"><span class="star">★</span> {apartment.rating.toFixed(2)}</span>
    </div>
  </div>
</article>
```

- [ ] **Step 2: Update components.css for new image-based card**

In components.css find `.prop__photo` rule. Replace it (keep all other `.prop__*` rules unchanged). Old:

```css
.prop__photo { aspect-ratio: 4/3; background-size: cover; background-position: center; position: relative; }
```

New:

```css
.prop__photo-wrap { position: relative; aspect-ratio: 4/3; overflow: hidden; }
.prop__photo-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.prop__photo-wrap .badge { position: absolute; top: 14px; left: 14px; background: rgba(22,38,63,.85); color: var(--text-primary); font-size: 11px; font-weight: 600; padding: 6px 12px; border-radius: var(--r-pill); letter-spacing: 0.04em; backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,.08); }
.prop__photo-wrap .city { position: absolute; top: 14px; right: 14px; background: rgba(11,22,40,.75); color: #fff; font-size: 11px; font-weight: 600; padding: 6px 12px; border-radius: var(--r-pill); backdrop-filter: blur(8px); }
```

Also delete the now-unused old `.prop__photo .badge` and `.prop__photo .city` rules.

- [ ] **Step 3: Create PropertyGrid.astro**

```astro
---
import PropertyCard from './PropertyCard.astro';
import { t } from '../i18n/t';
import apartments from '../content/apartments.json';
import { apartmentSchema } from '../content/config';
import { z } from 'zod';

export interface Props { lang?: 'ru' | 'zh'; }
const { lang = 'ru' } = Astro.props;

const items = z.array(apartmentSchema).parse(apartments);
const delays: Array<'d1'|'d2'|'d3'> = ['d1','d2','d3'];
---
<section id="properties" class="section">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow">{t('props.eyebrow', lang)}</p>
      <h2>{t('props.h2', lang)} <em>{t('props.h2.em', lang)}</em></h2>
      <p class="lead">{t('props.lead', lang)}</p>
    </div>
    <div class="props-grid">
      {items.map((apt, i) => <PropertyCard apartment={apt} delay={delays[i % 3]} lang={lang} />)}
    </div>
  </div>
</section>
```

- [ ] **Step 4: Commit**

```bash
git add astro-site/src/components/PropertyCard.astro astro-site/src/components/PropertyGrid.astro astro-site/src/styles/components.css
git commit -m "feat(component): PropertyCard with Astro Image + PropertyGrid mapping apartments.json"
```

---

### Task 19: Marquee.astro

**Files:**
- Create: `astro-site/src/components/Marquee.astro`
- Reference: `site/index.html:237-242`

- [ ] **Step 1: Create Marquee.astro**

```astro
---
import { t } from '../i18n/t';
export interface Props { lang?: 'ru' | 'zh'; }
const { lang = 'ru' } = Astro.props;

const items = t('marquee.items', lang).split('✦').map(s => s.trim()).filter(Boolean);
---
<div class="marquee">
  <div class="marquee__inner">
    <span>{items.map((item, i) => <>{item}{i < items.length - 1 && <span class="sep">✦</span>}</>)}<span class="sep">✦</span></span>
    <span>{items.map((item, i) => <>{item}{i < items.length - 1 && <span class="sep">✦</span>}</>)}<span class="sep">✦</span></span>
  </div>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add astro-site/src/components/Marquee.astro
git commit -m "feat(component): Marquee parsing items from i18n string"
```

---

### Task 20: ReviewCard.astro + ReviewsStrip.astro

**Files:**
- Create: `astro-site/src/components/ReviewCard.astro`
- Create: `astro-site/src/components/ReviewsStrip.astro`
- Reference: `site/index.html:245-308`

- [ ] **Step 1: Create ReviewCard.astro**

```astro
---
import type { Review } from '../content/config';
export interface Props { review: Review; delay: 'd1'|'d2'|'d3'|'d4'; }
const { review, delay } = Astro.props;
---
<div class={`review reveal ${delay}`}>
  <div class="stars">★★★★★</div>
  <p class="text">{review.text}</p>
  <div class="who">
    <span>{review.author}</span>
    <span>{review.source} · {review.date}</span>
  </div>
</div>
```

- [ ] **Step 2: Create ReviewsStrip.astro**

```astro
---
import ReviewCard from './ReviewCard.astro';
import { t } from '../i18n/t';
import reviews from '../content/reviews.json';
import { reviewSchema } from '../content/config';
import { z } from 'zod';

export interface Props { lang?: 'ru' | 'zh'; }
const { lang = 'ru' } = Astro.props;
const items = z.array(reviewSchema).parse(reviews);
const delays: Array<'d1'|'d2'|'d3'|'d4'> = ['d1','d2','d3','d4'];

const screenshots = [
  { file: 'review-1.png', src: 'Авито', alt: 'Скриншот отзывов с Авито — Сергей, Надежда, Виктория' },
  { file: 'review-2.png', src: 'Авито', alt: 'Скриншот отзывов с Авито — Андрей, Александр' },
  { file: 'review-3.png', src: 'Суточно.ру', alt: 'Скриншот отзывов с Суточно.ру — Елена, Игорь, ПрофСпил39' },
  { file: 'review-4.png', src: 'Суточно.ру', alt: 'Скриншот отзывов с Суточно.ру — Анастасия, Алексей' }
];
---
<section id="reviews" class="section">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow">{t('reviews.eyebrow', lang)}</p>
      <h2>{t('reviews.h2', lang)} <em>{t('reviews.h2.em', lang)}</em></h2>
      <p class="lead">{t('reviews.lead', lang)}</p>
    </div>

    <div class="reviews-strip">
      {items.map((r, i) => <ReviewCard review={r} delay={delays[i % 4]} />)}
    </div>

    <div class="reviews-proof reveal d2">
      <p class="eyebrow" style="margin-top:64px">{t('reviews.proof.title', lang)}</p>
      <div class="reviews-proof__grid">
        {screenshots.map(s => (
          <a class="reviews-proof__item" href={`/reviews/${s.file}`} target="_blank" rel="noopener">
            <img src={`/reviews/${s.file}`} alt={s.alt} loading="lazy">
            <span class="reviews-proof__src">{s.src}</span>
          </a>
        ))}
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/components/ReviewCard.astro astro-site/src/components/ReviewsStrip.astro
git commit -m "feat(component): ReviewCard + ReviewsStrip with text reviews and 4 screenshots"
```

---

### Task 21: RulesGrid.astro

**Files:**
- Create: `astro-site/src/components/RulesGrid.astro`
- Reference: `site/index.html:340-359`

- [ ] **Step 1: Create RulesGrid.astro**

```astro
---
import { t } from '../i18n/t';
import rules from '../content/rules.json';
import { ruleSchema } from '../content/config';
import { z } from 'zod';

export interface Props { lang?: 'ru' | 'zh'; }
const { lang = 'ru' } = Astro.props;
const items = z.array(ruleSchema).parse(rules);
const delays = ['d1','d1','d2','d2','d3','d3','d4','d4','d1','d2','d3'];
---
<section id="rules" class="section">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow">{t('rules.eyebrow', lang)}</p>
      <h2>{t('rules.h2', lang)} <em>{t('rules.h2.em', lang)}</em></h2>
      <p class="lead">{t('rules.lead', lang)}</p>
    </div>
    <div class="rules-grid">
      {items.map((rule, i) => (
        <div class={`rule reveal ${delays[i]}`}>
          <div class="rule__num">{rule.number}</div>
          <div class="rule__body">
            <h4>{rule.title}</h4>
            <p>{rule.text}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 2: Commit**

```bash
git add astro-site/src/components/RulesGrid.astro
git commit -m "feat(component): RulesGrid mapping 11 rules from rules.json"
```

---

### Task 22: FAQ.astro

**Files:**
- Create: `astro-site/src/components/FAQ.astro`
- Reference: `site/index.html:363-380`

- [ ] **Step 1: Create FAQ.astro**

```astro
---
import { t } from '../i18n/t';
import faq from '../content/faq.json';
import { faqSchema } from '../content/config';
import { z } from 'zod';

export interface Props { lang?: 'ru' | 'zh'; }
const { lang = 'ru' } = Astro.props;
const items = z.array(faqSchema).parse(faq);
const delays = ['d1','d1','d2','d2','d3','d3','d4'];
---
<section id="faq" class="section section--alt">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow">{t('faq.eyebrow', lang)}</p>
      <h2>{t('faq.h2', lang)}</h2>
    </div>
    <div class="faq-list">
      {items.map((item, i) => (
        <details class={`faq-item reveal ${delays[i]}`}>
          <summary>{item.question}</summary>
          <div class="ans">{item.answer}</div>
        </details>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 2: Commit**

```bash
git add astro-site/src/components/FAQ.astro
git commit -m "feat(component): FAQ accordion mapping faq.json"
```

---

## Phase 4 — Forms backend (TDD)

### Task 23: src/lib/verifyTurnstile.ts (with tests)

**Files:**
- Create: `astro-site/src/lib/verifyTurnstile.ts`
- Create: `astro-site/tests/lib/verifyTurnstile.test.ts`

- [ ] **Step 1: Write failing test**

`tests/lib/verifyTurnstile.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyTurnstile } from '../../src/lib/verifyTurnstile';

describe('verifyTurnstile', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('returns true when Cloudflare reports success', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      json: async () => ({ success: true })
    })));
    const ok = await verifyTurnstile('valid-token', 'secret');
    expect(ok).toBe(true);
  });

  it('returns false when Cloudflare reports failure', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      json: async () => ({ success: false, 'error-codes': ['invalid-input-response'] })
    })));
    const ok = await verifyTurnstile('bad-token', 'secret');
    expect(ok).toBe(false);
  });

  it('returns false when token is empty', async () => {
    const ok = await verifyTurnstile('', 'secret');
    expect(ok).toBe(false);
  });

  it('returns false on network error', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('network'); }));
    const ok = await verifyTurnstile('any', 'secret');
    expect(ok).toBe(false);
  });
});
```

- [ ] **Step 2: Run test (should fail with import error)**

```bash
cd astro-site && npm test
```

Expected: 4 tests fail with "Cannot find module" or similar.

- [ ] **Step 3: Implement verifyTurnstile.ts**

```ts
const ENDPOINT = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstile(token: string, secret: string): Promise<boolean> {
  if (!token || !secret) return false;
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`
    });
    const data = await res.json() as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
```

- [ ] **Step 4: Run tests**

```bash
npm test
```

Expected: 4 verifyTurnstile tests pass.

- [ ] **Step 5: Commit**

```bash
git add astro-site/src/lib/verifyTurnstile.ts astro-site/tests/lib/verifyTurnstile.test.ts
git commit -m "feat(lib): verifyTurnstile with happy/fail/empty/network tests"
```

---

### Task 24: src/lib/sendToTelegram.ts (with tests)

**Files:**
- Create: `astro-site/src/lib/sendToTelegram.ts`
- Create: `astro-site/tests/lib/sendToTelegram.test.ts`

- [ ] **Step 1: Write failing test**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendToTelegram } from '../../src/lib/sendToTelegram';

describe('sendToTelegram', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('posts message to Telegram Bot API and resolves on ok=true', async () => {
    const mockFetch = vi.fn(async () => ({ json: async () => ({ ok: true }) }));
    vi.stubGlobal('fetch', mockFetch);
    const result = await sendToTelegram('TOKEN', 'CHAT', 'Hello');
    expect(result).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.telegram.org/botTOKEN/sendMessage',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('rejects on ok=false', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ json: async () => ({ ok: false, description: 'forbidden' }) })));
    const result = await sendToTelegram('TOKEN', 'CHAT', 'Hello');
    expect(result).toBe(false);
  });

  it('rejects on network error', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('boom'); }));
    const result = await sendToTelegram('TOKEN', 'CHAT', 'Hello');
    expect(result).toBe(false);
  });

  it('escapes HTML in message body via parse_mode', async () => {
    const mockFetch = vi.fn(async () => ({ json: async () => ({ ok: true }) }));
    vi.stubGlobal('fetch', mockFetch);
    await sendToTelegram('TOKEN', 'CHAT', '<script>alert(1)</script>');
    const callArg = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(callArg.parse_mode).toBeUndefined();
    expect(callArg.text).toBe('<script>alert(1)</script>');
  });
});
```

- [ ] **Step 2: Run test (failing)**

```bash
npm test
```

Expected: 4 sendToTelegram tests fail with import error.

- [ ] **Step 3: Implement sendToTelegram.ts**

```ts
export async function sendToTelegram(botToken: string, chatId: string, text: string): Promise<boolean> {
  if (!botToken || !chatId || !text) return false;
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true })
    });
    const data = await res.json() as { ok: boolean };
    return data.ok === true;
  } catch {
    return false;
  }
}
```

- [ ] **Step 4: Run tests**

```bash
npm test
```

Expected: all 4 pass.

- [ ] **Step 5: Commit**

```bash
git add astro-site/src/lib/sendToTelegram.ts astro-site/tests/lib/sendToTelegram.test.ts
git commit -m "feat(lib): sendToTelegram with happy/error/network tests"
```

---

### Task 25: netlify/functions/submit-form.ts (with tests)

**Files:**
- Create: `astro-site/netlify/functions/submit-form.ts`
- Create: `astro-site/tests/functions/submit-form.test.ts`

- [ ] **Step 1: Write failing tests covering all paths**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from '../../netlify/functions/submit-form';

const env = {
  TURNSTILE_SECRET: 'ts-secret',
  TELEGRAM_BOT_TOKEN: 'tg-token',
  TELEGRAM_CHAT_ID: 'chat-1'
};

function ev(body: object) {
  return {
    httpMethod: 'POST',
    body: JSON.stringify(body),
    headers: { 'x-forwarded-for': '1.2.3.4' }
  } as any;
}

describe('submit-form handler', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    Object.assign(process.env, env);
  });

  it('rejects non-POST', async () => {
    const res = await handler({ httpMethod: 'GET' } as any, {} as any);
    expect(res.statusCode).toBe(405);
  });

  it('returns 503 when env vars missing', async () => {
    delete process.env.TURNSTILE_SECRET;
    const res = await handler(ev({ form: 'review', name: 'X', text: 'Y', turnstileToken: 't' }), {} as any);
    expect(res.statusCode).toBe(503);
  });

  it('silently 200 on honeypot non-empty', async () => {
    const res = await handler(ev({ form: 'review', name: 'X', text: 'Y', turnstileToken: 't', hp: 'spam' }), {} as any);
    expect(res.statusCode).toBe(200);
  });

  it('returns 400 on Turnstile failure', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      if (url.includes('siteverify')) return { json: async () => ({ success: false }) };
      return { json: async () => ({ ok: true }) };
    }));
    const res = await handler(ev({ form: 'review', name: 'X', text: 'Y', turnstileToken: 'bad' }), {} as any);
    expect(res.statusCode).toBe(400);
  });

  it('returns 400 on missing required fields (review)', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ json: async () => ({ success: true, ok: true }) })));
    const res = await handler(ev({ form: 'review', turnstileToken: 't' }), {} as any);
    expect(res.statusCode).toBe(400);
  });

  it('returns 200 and posts to Telegram on success (review)', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes('siteverify')) return { json: async () => ({ success: true }) };
      return { json: async () => ({ ok: true }) };
    });
    vi.stubGlobal('fetch', fetchMock);
    const res = await handler(ev({ form: 'review', name: 'Анна', text: 'Спасибо', rating: 5, turnstileToken: 't' }), {} as any);
    expect(res.statusCode).toBe(200);
    const tgCall = fetchMock.mock.calls.find(c => String(c[0]).includes('telegram'));
    expect(tgCall).toBeTruthy();
    expect(JSON.parse(tgCall![1].body).text).toMatch(/Анна/);
  });

  it('returns 200 and posts to Telegram on success (lead)', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes('siteverify')) return { json: async () => ({ success: true }) };
      return { json: async () => ({ ok: true }) };
    });
    vi.stubGlobal('fetch', fetchMock);
    const res = await handler(ev({ form: 'lead', name: 'Мария', phone: '+7 914', email: 'm@example.com', city: 'Благовещенск', message: 'квартира', turnstileToken: 't' }), {} as any);
    expect(res.statusCode).toBe(200);
    const tgCall = fetchMock.mock.calls.find(c => String(c[0]).includes('telegram'));
    expect(JSON.parse(tgCall![1].body).text).toMatch(/Мария/);
  });

  it('rate-limits after 5 submits from same IP', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ json: async () => ({ success: true, ok: true }) })));
    const payload = { form: 'review', name: 'X', text: 'Y', rating: 5, turnstileToken: 't' };
    for (let i = 0; i < 5; i++) {
      const res = await handler(ev(payload), {} as any);
      expect(res.statusCode).toBe(200);
    }
    const limited = await handler(ev(payload), {} as any);
    expect(limited.statusCode).toBe(429);
  });
});
```

- [ ] **Step 2: Run tests (failing)**

```bash
npm test
```

Expected: 8 submit-form tests fail with import error.

- [ ] **Step 3: Implement submit-form.ts**

```ts
import { z } from 'zod';
import { verifyTurnstile } from '../../src/lib/verifyTurnstile';
import { sendToTelegram } from '../../src/lib/sendToTelegram';

const reviewSchema = z.object({
  form: z.literal('review'),
  name: z.string().min(1).max(80),
  rating: z.number().int().min(1).max(5),
  text: z.string().min(1).max(2000),
  turnstileToken: z.string().min(1),
  hp: z.string().optional()
});

const leadSchema = z.object({
  form: z.literal('lead'),
  name: z.string().min(1).max(80),
  phone: z.string().min(5).max(40),
  email: z.string().email(),
  city: z.string().min(1).max(80),
  message: z.string().max(2000).optional(),
  turnstileToken: z.string().min(1),
  hp: z.string().optional()
});

const inputSchema = z.discriminatedUnion('form', [reviewSchema, leadSchema]);

const ipHits = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipHits.get(ip);
  if (!entry || entry.resetAt < now) {
    ipHits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_HITS;
}

function formatMessage(payload: z.infer<typeof inputSchema>): string {
  if (payload.form === 'review') {
    const stars = '★'.repeat(payload.rating) + '☆'.repeat(5 - payload.rating);
    return `Новый отзыв ${stars}\nИмя: ${payload.name}\nОценка: ${payload.rating}/5\n\n${payload.text}`;
  }
  return [
    'Заявка на доверительное управление',
    `Имя: ${payload.name}`,
    `Телефон: ${payload.phone}`,
    `Email: ${payload.email}`,
    `Город: ${payload.city}`,
    payload.message ? `\n${payload.message}` : ''
  ].join('\n').trim();
}

interface NetlifyEvent { httpMethod: string; body?: string; headers?: Record<string, string>; }
interface NetlifyResponse { statusCode: number; headers?: Record<string, string>; body: string; }

export const handler = async (event: NetlifyEvent, _ctx: unknown): Promise<NetlifyResponse> => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const turnstileSecret = process.env.TURNSTILE_SECRET;
  const tgToken = process.env.TELEGRAM_BOT_TOKEN;
  const tgChat = process.env.TELEGRAM_CHAT_ID;
  if (!turnstileSecret || !tgToken || !tgChat) {
    return { statusCode: 503, body: JSON.stringify({ error: 'Service temporarily unavailable' }) };
  }

  let parsed: z.infer<typeof inputSchema>;
  try {
    const json = JSON.parse(event.body || '{}');
    if (json.hp && json.hp.length > 0) {
      return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    }
    parsed = inputSchema.parse(json);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid input' }) };
  }

  const ip = event.headers?.['x-forwarded-for']?.split(',')[0].trim() ?? 'unknown';
  if (rateLimited(ip)) {
    return { statusCode: 429, body: JSON.stringify({ error: 'Too many requests' }) };
  }

  const ok = await verifyTurnstile(parsed.turnstileToken, turnstileSecret);
  if (!ok) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Anti-spam check failed' }) };
  }

  const sent = await sendToTelegram(tgToken, tgChat, formatMessage(parsed));
  if (!sent) {
    return { statusCode: 502, body: JSON.stringify({ error: 'Notification dispatch failed' }) };
  }

  return { statusCode: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ok: true }) };
};
```

- [ ] **Step 4: Run tests**

```bash
npm test
```

Expected: all 8 submit-form tests pass.

- [ ] **Step 5: Commit**

```bash
git add astro-site/netlify/functions/submit-form.ts astro-site/tests/functions/submit-form.test.ts
git commit -m "feat(api): submit-form handler with Turnstile, honeypot, rate-limit, Telegram dispatch"
```

---

### Task 26: ReviewForm.astro

**Files:**
- Create: `astro-site/src/components/ReviewForm.astro`
- Reference: `site/index.html:311-336`

- [ ] **Step 1: Create ReviewForm.astro**

```astro
---
import { t } from '../i18n/t';
export interface Props { lang?: 'ru' | 'zh'; }
const { lang = 'ru' } = Astro.props;
const turnstileKey = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY;
---
<section class="section section--alt">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow">{t('reviewform.eyebrow', lang)}</p>
      <h2>{t('reviewform.h2', lang)} <em>{t('reviewform.h2.em', lang)}</em></h2>
      <p class="lead">{t('reviewform.lead', lang)}</p>
    </div>
    <form class="form-card reveal d1" id="review-form" aria-label={t('reviewform.eyebrow', lang)}>
      <div class="field-row">
        <div class="field"><label for="rev-name">{t('reviewform.label.name', lang)}</label><input id="rev-name" name="name" placeholder={t('reviewform.placeholder.name', lang)} required></div>
        <div class="field">
          <label id="rev-rating-label">{t('reviewform.label.rating', lang)}</label>
          <div class="rating-input" role="radiogroup" aria-labelledby="rev-rating-label" data-rating="5">
            {[1,2,3,4,5].map(n => <button type="button" class="on" data-n={n} aria-label={`${n} из 5`}>★</button>)}
          </div>
        </div>
      </div>
      <div class="field"><label for="rev-text">{t('reviewform.label.text', lang)}</label><textarea id="rev-text" name="text" rows="5" placeholder={t('reviewform.placeholder.text', lang)} required></textarea></div>
      <input type="text" name="hp" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0" aria-hidden="true">
      <label class="consent"><input type="checkbox" name="consent" required> <span>{t('reviewform.consent', lang)}</span></label>
      {turnstileKey && <div class="cf-turnstile" data-sitekey={turnstileKey}></div>}
      <button type="submit" class="btn btn-primary" style="margin-top:20px">{t('reviewform.submit', lang)}</button>
      <p class="form-msg" hidden></p>
    </form>
  </div>
</section>

{turnstileKey && <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>}

<script>
  const form = document.getElementById('review-form') as HTMLFormElement | null;
  if (form) {
    const stars = form.querySelectorAll<HTMLButtonElement>('.rating-input button');
    const ratingGroup = form.querySelector<HTMLElement>('.rating-input');
    stars.forEach((b, i) => b.addEventListener('click', () => {
      stars.forEach((x, j) => x.classList.toggle('on', j <= i));
      ratingGroup?.setAttribute('data-rating', String(i + 1));
    }));

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = form.querySelector<HTMLParagraphElement>('.form-msg')!;
      const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
      const fd = new FormData(form);
      // @ts-ignore turnstile global
      const token = (window as any).turnstile?.getResponse?.() || '';
      const payload = {
        form: 'review',
        name: fd.get('name'),
        rating: Number(ratingGroup?.getAttribute('data-rating') || 0),
        text: fd.get('text'),
        hp: fd.get('hp') ?? '',
        turnstileToken: token
      };
      submit.disabled = true;
      try {
        const res = await fetch('/.netlify/functions/submit-form', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          form.querySelectorAll('input, textarea, button').forEach(el => (el as HTMLInputElement).disabled = true);
          msg.textContent = 'Готово. Спасибо за слова.';
          msg.hidden = false;
          msg.classList.add('form-msg--ok');
        } else {
          msg.textContent = 'Что-то пошло не так. Попробуйте снова.';
          msg.hidden = false;
          msg.classList.add('form-msg--err');
          submit.disabled = false;
        }
      } catch {
        msg.textContent = 'Сетевая ошибка. Попробуйте снова.';
        msg.hidden = false;
        submit.disabled = false;
      }
    });
  }
</script>
```

- [ ] **Step 2: Add form-msg styles to components.css**

```css
.form-msg { margin-top: 16px; padding: 12px 16px; border-radius: var(--r-card); font-size: 14px; }
.form-msg--ok { background: rgba(93,190,138,.12); color: var(--success); border: 1px solid var(--success); }
.form-msg--err { background: rgba(224,112,112,.12); color: var(--error); border: 1px solid var(--error); }
```

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/components/ReviewForm.astro astro-site/src/styles/components.css
git commit -m "feat(component): ReviewForm with Turnstile, honeypot, rating, async submit"
```

---

### Task 27: LeadForm.astro

**Files:**
- Create: `astro-site/src/components/LeadForm.astro`
- Reference: `site/index.html:383-420`

- [ ] **Step 1: Create LeadForm.astro**

```astro
---
import { t } from '../i18n/t';
export interface Props { lang?: 'ru' | 'zh'; }
const { lang = 'ru' } = Astro.props;
const turnstileKey = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY;
---
<section id="lead" class="section lead-section">
  <div class="container">
    <div class="lead-grid">
      <div class="reveal">
        <p class="eyebrow">{t('lead.eyebrow', lang)}</p>
        <h2>{t('lead.h2', lang)} <em>{t('lead.h2.em', lang)}</em></h2>
        <p class="lead">{t('lead.lead', lang)}</p>
        <ul>
          <li><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg><div>{t('lead.bullet.report', lang)}</div></li>
          <li><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg><div>{t('lead.bullet.photo', lang)}</div></li>
          <li><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg><div>{t('lead.bullet.placement', lang)}</div></li>
          <li><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg><div>{t('lead.bullet.cleaning', lang)}</div></li>
          <li><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg><div>{t('lead.bullet.income', lang)}</div></li>
        </ul>
      </div>
      <form class="form-card reveal d1" id="lead-form" aria-label={t('lead.eyebrow', lang)}>
        <div class="field-row">
          <div class="field"><label for="lead-name">{t('leadform.label.name', lang)}</label><input id="lead-name" name="name" placeholder={t('leadform.placeholder.name', lang)} required></div>
          <div class="field"><label for="lead-phone">{t('leadform.label.phone', lang)}</label><input id="lead-phone" name="phone" type="tel" placeholder={t('leadform.placeholder.phone', lang)} required></div>
        </div>
        <div class="field-row">
          <div class="field"><label for="lead-email">{t('leadform.label.email', lang)}</label><input id="lead-email" name="email" type="email" placeholder={t('leadform.placeholder.email', lang)} required></div>
          <div class="field"><label for="lead-city">{t('leadform.label.city', lang)}</label>
            <select id="lead-city" name="city" required>
              <option>Благовещенск</option>
              <option>Санкт-Петербург</option>
              <option>Другой</option>
            </select>
          </div>
        </div>
        <div class="field"><label for="lead-msg">{t('leadform.label.message', lang)}</label><textarea id="lead-msg" name="message" rows="4" placeholder={t('leadform.placeholder.message', lang)}></textarea></div>
        <input type="text" name="hp" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0" aria-hidden="true">
        <label class="consent"><input type="checkbox" name="consent" required> <span>{t('leadform.consent', lang)}</span></label>
        {turnstileKey && <div class="cf-turnstile" data-sitekey={turnstileKey}></div>}
        <button type="submit" class="btn btn-primary" style="margin-top:20px;width:100%">{t('leadform.submit', lang)}</button>
        <p class="form-msg" hidden></p>
        <p style="font-size:12px;color:var(--text-secondary);margin-top:12px;text-align:center">{t('leadform.note', lang)}</p>
      </form>
    </div>
  </div>
</section>

<script>
  const form = document.getElementById('lead-form') as HTMLFormElement | null;
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = form.querySelector<HTMLParagraphElement>('.form-msg')!;
      const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
      const fd = new FormData(form);
      // @ts-ignore turnstile global
      const tokens = document.querySelectorAll<HTMLInputElement>('input[name="cf-turnstile-response"]');
      const token = tokens[tokens.length - 1]?.value || '';
      const payload = {
        form: 'lead',
        name: fd.get('name'),
        phone: fd.get('phone'),
        email: fd.get('email'),
        city: fd.get('city'),
        message: fd.get('message') ?? '',
        hp: fd.get('hp') ?? '',
        turnstileToken: token
      };
      submit.disabled = true;
      try {
        const res = await fetch('/.netlify/functions/submit-form', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          form.querySelectorAll('input, textarea, select, button').forEach(el => (el as HTMLInputElement).disabled = true);
          msg.textContent = 'Готово. Свяжемся в течение часа.';
          msg.hidden = false;
          msg.classList.add('form-msg--ok');
        } else {
          msg.textContent = 'Что-то пошло не так. Попробуйте снова.';
          msg.hidden = false;
          msg.classList.add('form-msg--err');
          submit.disabled = false;
        }
      } catch {
        msg.textContent = 'Сетевая ошибка. Попробуйте снова.';
        msg.hidden = false;
        submit.disabled = false;
      }
    });
  }
</script>
```

- [ ] **Step 2: Commit**

```bash
git add astro-site/src/components/LeadForm.astro
git commit -m "feat(component): LeadForm with Turnstile, honeypot, async submit"
```

---

## Phase 5 — Pages

### Task 28: pages/index.astro — assemble

**Files:**
- Modify: `astro-site/src/pages/index.astro`

- [ ] **Step 1: Replace index.astro**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Header from '../components/Header.astro';
import Hero from '../components/Hero.astro';
import BookingWidget from '../components/BookingWidget.astro';
import SubscribeStrip from '../components/SubscribeStrip.astro';
import TrustRatings from '../components/TrustRatings.astro';
import TodayOffer from '../components/TodayOffer.astro';
import PropertyGrid from '../components/PropertyGrid.astro';
import Marquee from '../components/Marquee.astro';
import ReviewsStrip from '../components/ReviewsStrip.astro';
import ReviewForm from '../components/ReviewForm.astro';
import RulesGrid from '../components/RulesGrid.astro';
import FAQ from '../components/FAQ.astro';
import LeadForm from '../components/LeadForm.astro';
import Footer from '../components/Footer.astro';
import { t } from '../i18n/t';

const lang = 'ru' as const;
---
<BaseLayout title={t('site.title', lang)} description={t('site.description', lang)} lang={lang}>
  <Header slot="header" lang={lang} />
  <Hero lang={lang} />
  <BookingWidget lang={lang} />
  <SubscribeStrip lang={lang} />
  <TrustRatings lang={lang} />
  <TodayOffer lang={lang} />
  <PropertyGrid lang={lang} />
  <Marquee lang={lang} />
  <ReviewsStrip lang={lang} />
  <ReviewForm lang={lang} />
  <RulesGrid lang={lang} />
  <FAQ lang={lang} />
  <LeadForm lang={lang} />
  <Footer slot="footer" lang={lang} />
</BaseLayout>
```

- [ ] **Step 2: Run dev server, verify whole page renders**

```bash
cd astro-site && npm run dev
```

Open `http://localhost:4321`. Expected: page looks identical to `site/index.html` (open `localhost:4280` in another tab to compare). Specifically check: header, hero with image, booking widget loads HomeReserve, all 6 property cards with photos, marquee scrolls, reviews + 4 screenshots, both forms, footer. Stop server.

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/pages/index.astro
git commit -m "feat(pages): assemble Russian landing from all components"
```

---

### Task 29: pages/zh/index.astro (with empty-zh gate)

**Files:**
- Create: `astro-site/src/pages/zh/index.astro`

- [ ] **Step 1: Create zh/index.astro**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import Header from '../../components/Header.astro';
import Hero from '../../components/Hero.astro';
import BookingWidget from '../../components/BookingWidget.astro';
import RulesGrid from '../../components/RulesGrid.astro';
import Footer from '../../components/Footer.astro';
import { t, isLocaleEmpty } from '../../i18n/t';

const lang = 'zh' as const;

if (isLocaleEmpty(lang)) {
  return Astro.redirect('/404');
}
---
<BaseLayout title={t('site.title', lang)} description={t('site.description', lang)} lang={lang}>
  <Header slot="header" lang={lang} />
  <Hero lang={lang} />
  <BookingWidget lang={lang} />
  <RulesGrid lang={lang} />
  <Footer slot="footer" lang={lang} />
</BaseLayout>
```

- [ ] **Step 2: Verify gate**

```bash
npm run dev
```

Open `http://localhost:4321/zh/`. Expected: redirected to `/404` (because `zh.json` is empty). Stop server.

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/pages/zh/index.astro
git commit -m "feat(pages): /zh/ partial Chinese page with empty-locale gate to 404"
```

---

### Task 30: pages/404.astro

**Files:**
- Create: `astro-site/src/pages/404.astro`

- [ ] **Step 1: Create 404.astro**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
---
<BaseLayout title="Берега — страница не найдена" description="Страница не найдена">
  <Header slot="header" />
  <main style="padding: 120px 32px; text-align: center; min-height: 50vh;">
    <p class="eyebrow">404</p>
    <h1 style="margin: 16px 0 24px">Здесь пока тихо.</h1>
    <p class="lead" style="max-width: 480px; margin: 0 auto 32px;">Страницы, которую вы искали, не существует. Можно вернуться к началу или поискать в навигации.</p>
    <a class="btn btn-primary" href="/">На главную</a>
  </main>
  <Footer slot="footer" />
</BaseLayout>
```

- [ ] **Step 2: Commit**

```bash
git add astro-site/src/pages/404.astro
git commit -m "feat(pages): 404 page in brand voice"
```

---

### Task 31: pages/privacy.astro + pages/offer.astro

**Files:**
- Create: `astro-site/src/pages/privacy.astro`
- Create: `astro-site/src/pages/offer.astro`

- [ ] **Step 1: Create privacy.astro (template — TODO юристу)**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
---
<BaseLayout title="Берега — Политика обработки персональных данных" description="Политика обработки персональных данных">
  <Header slot="header" />
  <main class="container" style="padding: 80px 0 120px; max-width: 820px;">
    <p class="eyebrow">Юридический документ</p>
    <h1 style="margin: 16px 0 32px">Политика обработки персональных данных</h1>

    <!-- TODO: согласовать финальный текст с юристом перед публичным запуском -->
    <p style="color: var(--text-secondary); line-height: 1.7;">
      Настоящая Политика обработки персональных данных (далее — Политика) разработана в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных».
    </p>
    <h2 style="margin-top: 32px; margin-bottom: 16px;">1. Оператор персональных данных</h2>
    <p style="color: var(--text-secondary); line-height: 1.7;">
      ИП Чердакова М. В., ОГРНИП [TODO], адрес: [TODO]. Адрес электронной почты: krasivie.kvartiri.28@gmail.com.
    </p>
    <h2 style="margin-top: 32px; margin-bottom: 16px;">2. Цели обработки</h2>
    <p style="color: var(--text-secondary); line-height: 1.7;">
      Сбор и обработка персональных данных осуществляется в целях: обработки заявок на бронирование квартир, обработки заявок на доверительное управление недвижимостью, ответа на обращения через формы обратной связи.
    </p>
    <h2 style="margin-top: 32px; margin-bottom: 16px;">3. Состав обрабатываемых данных</h2>
    <p style="color: var(--text-secondary); line-height: 1.7;">
      Имя, телефон, адрес электронной почты, текст сообщения, город, IP-адрес.
    </p>
    <h2 style="margin-top: 32px; margin-bottom: 16px;">4. Передача данных третьим лицам</h2>
    <p style="color: var(--text-secondary); line-height: 1.7;">
      Заявки автоматически пересылаются в чат Telegram оператора через API сервиса Telegram (Telegram Messenger Inc., Великобритания). Данные не сохраняются на серверах сайта.
      Сайт размещён на платформе Netlify Inc. (США), что является трансграничной передачей данных.
    </p>
    <h2 style="margin-top: 32px; margin-bottom: 16px;">5. Срок обработки</h2>
    <p style="color: var(--text-secondary); line-height: 1.7;">
      Обработка персональных данных осуществляется с момента заполнения формы до момента ответа оператора, но не более 30 календарных дней.
    </p>
    <h2 style="margin-top: 32px; margin-bottom: 16px;">6. Права субъекта</h2>
    <p style="color: var(--text-secondary); line-height: 1.7;">
      Субъект персональных данных имеет право на доступ к своим данным, их уточнение, блокирование или удаление. Запросы направляются на krasivie.kvartiri.28@gmail.com.
    </p>
    <p style="margin-top: 48px; font-size: 13px; color: var(--text-secondary);">
      Дата последнего обновления: [TODO дата публикации финальной редакции].
    </p>
  </main>
  <Footer slot="footer" />
</BaseLayout>
```

- [ ] **Step 2: Create offer.astro (template — TODO юристу)**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
---
<BaseLayout title="Берега — Договор-оферта" description="Договор-оферта на оказание услуг краткосрочной аренды">
  <Header slot="header" />
  <main class="container" style="padding: 80px 0 120px; max-width: 820px;">
    <p class="eyebrow">Юридический документ</p>
    <h1 style="margin: 16px 0 32px">Договор-оферта</h1>

    <!-- TODO: согласовать финальный текст с юристом перед публичным запуском -->
    <p style="color: var(--text-secondary); line-height: 1.7;">
      Настоящий документ является публичной офертой ИП Чердакова М. В. (далее — Исполнитель) и адресован любому физическому лицу, желающему воспользоваться услугами краткосрочной аренды (далее — Гость).
    </p>
    <h2 style="margin-top: 32px; margin-bottom: 16px;">1. Предмет договора</h2>
    <p style="color: var(--text-secondary); line-height: 1.7;">
      Исполнитель обязуется предоставить Гостю в краткосрочную аренду квартиру (объект размещения), а Гость обязуется принять и оплатить услугу.
    </p>
    <h2 style="margin-top: 32px; margin-bottom: 16px;">2. Стоимость и порядок оплаты</h2>
    <p style="color: var(--text-secondary); line-height: 1.7;">
      Стоимость размещения указывается на странице объекта в момент бронирования. Оплата производится через сервис бронирования Realty Calendar (HomeReserve) или согласованным способом.
    </p>
    <h2 style="margin-top: 32px; margin-bottom: 16px;">3. Заезд и выезд</h2>
    <p style="color: var(--text-secondary); line-height: 1.7;">
      Заезд после 15:00, выезд до 12:00 по местному времени. Раннее заселение и поздний выезд — по согласованию с Исполнителем.
    </p>
    <h2 style="margin-top: 32px; margin-bottom: 16px;">4. Правила проживания</h2>
    <p style="color: var(--text-secondary); line-height: 1.7;">
      Гость соглашается с правилами проживания, опубликованными на сайте.
    </p>
    <h2 style="margin-top: 32px; margin-bottom: 16px;">5. Ответственность сторон</h2>
    <p style="color: var(--text-secondary); line-height: 1.7;">
      Стороны несут ответственность согласно действующему законодательству Российской Федерации.
    </p>
    <p style="margin-top: 48px; font-size: 13px; color: var(--text-secondary);">
      Дата последнего обновления: [TODO дата публикации финальной редакции].
    </p>
  </main>
  <Footer slot="footer" />
</BaseLayout>
```

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/pages/privacy.astro astro-site/src/pages/offer.astro
git commit -m "feat(pages): privacy and offer template pages with TODO markers for legal review"
```

---

## Phase 6 — SEO & polish

### Task 32: Add JSON-LD LocalBusiness to BaseLayout

**Files:**
- Modify: `astro-site/src/layouts/BaseLayout.astro`

- [ ] **Step 1: Add JSON-LD inside `<head>` after the OG tags**

Insert before the `{ymId && ...}` block:

```astro
<script type="application/ld+json" set:html={JSON.stringify({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Берега",
  "image": new URL(ogImage, Astro.url).href,
  "telephone": "+79145770080",
  "email": "krasivie.kvartiri.28@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Благовещенск",
    "addressRegion": "Амурская область",
    "addressCountry": "RU"
  },
  "url": Astro.url.origin,
  "sameAs": ["https://t.me/maruruche"]
})}></script>
```

- [ ] **Step 2: Build and verify**

```bash
npm run build
```

Inspect `dist/index.html`, confirm the `<script type="application/ld+json">` block present.

- [ ] **Step 3: Commit**

```bash
git add astro-site/src/layouts/BaseLayout.astro
git commit -m "feat(seo): add JSON-LD LocalBusiness schema in BaseLayout"
```

---

### Task 33: Create OG cover image

**Files:**
- Create: `astro-site/public/og-cover.jpg`

- [ ] **Step 1: Generate OG cover from hero**

The `hero.jpg` is already `800×1000` portrait. Open Graph wants `1200×630` landscape. For now reuse `hero.jpg` directly — it's not ideal aspect but acceptable for v1. Set:

```bash
cd "c:/Users/днс/Desktop/Claude AI/My projects CLAUDE CODE/Проект 2"
cp astro-site/src/assets/hero.jpg astro-site/public/og-cover.jpg
```

- [ ] **Step 2: Mark TODO in spec for proper OG**

Append to `docs/superpowers/specs/2026-04-28-berega-astro-deploy-design.md` section 11 a new row:

```markdown
| Q4 | Корректная OG-картинка 1200×630 | На запуске используем `hero.jpg` как есть. Сделать landscape-кроп с надписью «Берега · Остановись у реки» — задача после первого деплоя. |
```

- [ ] **Step 3: Commit**

```bash
git add astro-site/public/og-cover.jpg docs/superpowers/specs/2026-04-28-berega-astro-deploy-design.md
git commit -m "feat(seo): add OG cover (placeholder hero crop, refinement queued as Q4)"
```

---

### Task 34: robots.txt + sitemap verification

**Files:**
- Create: `astro-site/public/robots.txt`

- [ ] **Step 1: Create robots.txt**

```
User-agent: *
Allow: /

Sitemap: https://berega.example.com/sitemap-index.xml
```

- [ ] **Step 2: Build, verify sitemap**

```bash
cd astro-site && npm run build
ls dist/
```

Expected: `dist/sitemap-index.xml`, `dist/sitemap-0.xml`, `dist/robots.txt`.

- [ ] **Step 3: Commit**

```bash
git add astro-site/public/robots.txt
git commit -m "feat(seo): robots.txt with sitemap reference"
```

---

## Phase 7 — Deploy infrastructure

### Task 35: netlify.toml + .env.example

**Files:**
- Create: `astro-site/netlify.toml`
- Create: `astro-site/.env.example`

- [ ] **Step 1: Create netlify.toml**

```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[functions]
  node_bundler = "esbuild"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' https://homereserve.ru https://challenges.cloudflare.com https://mc.yandex.ru https://api-maps.yandex.ru; frame-src https://homereserve.ru https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://mc.yandex.ru https://homereserve.ru;"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[redirects]]
  from = "/zh"
  to = "/zh/"
  status = 301
```

- [ ] **Step 2: Create .env.example**

```bash
# Cloudflare Turnstile (https://dash.cloudflare.com/?to=/:account/turnstile)
PUBLIC_TURNSTILE_SITE_KEY=

# Cloudflare Turnstile secret (server-only)
TURNSTILE_SECRET=

# Telegram Bot (https://core.telegram.org/bots#botfather)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# Yandex.Metrika (https://metrika.yandex.ru/)
PUBLIC_YANDEX_METRIKA_ID=
```

- [ ] **Step 3: Commit**

```bash
git add astro-site/netlify.toml astro-site/.env.example
git commit -m "feat(deploy): netlify.toml with CSP, headers, redirects + .env.example template"
```

---

### Task 36: README

**Files:**
- Create: `astro-site/README.md`

- [ ] **Step 1: Create README.md**

```markdown
# Берега — production landing

Astro-based static landing for Берега, deployed on Netlify.

## Tech stack
- Astro 5 (static output)
- TypeScript strict
- Vanilla CSS (3 files: tokens / base / components)
- Cloudflare Turnstile + honeypot
- Telegram Bot API for form notifications
- Yandex.Metrika for analytics
- Netlify Functions for form backend

## Local development

\`\`\`bash
npm install
cp .env.example .env  # fill in values
npm run dev           # http://localhost:4321
\`\`\`

For testing the form Function locally:

\`\`\`bash
npx netlify dev       # http://localhost:8888 with Functions
\`\`\`

## Tests

\`\`\`bash
npm test              # vitest run
npm run test:watch    # vitest watch
\`\`\`

## Build & deploy

Build is automatic on \`git push\` to main via Netlify webhook. To build locally:

\`\`\`bash
npm run build         # outputs to dist/
npm run preview       # preview the static build
\`\`\`

## Environment variables

All required in Netlify dashboard (Site settings → Environment variables):

| Variable | Where used | Public/Secret |
|---|---|---|
| \`PUBLIC_TURNSTILE_SITE_KEY\` | Forms (browser) | Public (in client bundle) |
| \`TURNSTILE_SECRET\` | submit-form Function | Secret |
| \`TELEGRAM_BOT_TOKEN\` | submit-form Function | Secret |
| \`TELEGRAM_CHAT_ID\` | submit-form Function | Secret |
| \`PUBLIC_YANDEX_METRIKA_ID\` | BaseLayout | Public |

## Content management

To update apartments / reviews / rules / FAQ — edit the JSON files in \`src/content/\`. Schema is enforced by Zod (\`src/content/config.ts\`) — invalid content fails the build.

To update UI strings — edit \`src/i18n/ru.json\` (and \`src/i18n/zh.json\` once a translator fills it in).

## Adding the Chinese version

1. Open \`src/i18n/zh.json\` — same keys as \`ru.json\`, all values empty
2. Translate each value
3. Once at least 80% of values are non-empty, the gate in \`src/pages/zh/index.astro\` lets the page render instead of redirecting to /404

## Project layout

See \`docs/superpowers/specs/2026-04-28-berega-astro-deploy-design.md\` for the full architecture spec.
```

- [ ] **Step 2: Commit**

```bash
git add astro-site/README.md
git commit -m "docs: project README with dev/test/deploy instructions"
```

---

### Task 37: Local smoke test with netlify dev

**Files:** none (verification step)

- [ ] **Step 1: Install Netlify CLI**

```bash
npm install -g netlify-cli
```

- [ ] **Step 2: Create local .env**

```bash
cd astro-site
cp .env.example .env
```

Manually fill `.env` with TEST values:
- Get a test Turnstile site key + secret at https://dash.cloudflare.com → Turnstile (use widget mode "Always passes" for local)
- Create a test Telegram bot via @BotFather → save token, send a message to the bot, then `getUpdates` to find chat_id
- Yandex.Metrika ID can be left empty for local testing

- [ ] **Step 3: Run netlify dev**

```bash
netlify dev
```

Expected: server at `http://localhost:8888`. Visit page, fill the review form, submit. Check Telegram for the message.

- [ ] **Step 4: Test honeypot**

Open browser console, run:

```js
document.querySelector('input[name="hp"]').value = 'spam-bot';
document.getElementById('review-form').requestSubmit();
```

Expected: form shows success but NO message arrives in Telegram (silently dropped).

- [ ] **Step 5: Stop server**

Ctrl+C. No commit (this is a verification task).

---

## Phase 8 — Migration to root + git + production deploy

### Task 38: Move astro-site/ to root, remove site/

**Files:** mass move

- [ ] **Step 1: Verify clean working tree**

```bash
cd "c:/Users/днс/Desktop/Claude AI/My projects CLAUDE CODE/Проект 2"
git status
```

Expected: clean (all earlier work committed).

- [ ] **Step 2: Stop the local serve process from earlier turns**

If the `npx serve site` background task from earlier conversation is still running, stop it (it's serving from `site/` which we're about to delete).

- [ ] **Step 3: Move astro-site contents to root**

```bash
# Move content (not . and ..)
git mv astro-site/package.json package.json
git mv astro-site/package-lock.json package-lock.json
git mv astro-site/astro.config.mjs astro.config.mjs
git mv astro-site/tsconfig.json tsconfig.json
git mv astro-site/vitest.config.ts vitest.config.ts
git mv astro-site/netlify.toml netlify.toml
git mv astro-site/.env.example .env.example
git mv astro-site/README.md README.md
git mv astro-site/src src
git mv astro-site/public public
git mv astro-site/netlify netlify
git mv astro-site/tests tests
# Delete now-empty astro-site/
rmdir astro-site
```

- [ ] **Step 4: Remove old prototype**

```bash
git rm -r site/
```

- [ ] **Step 5: Verify build still works from root**

```bash
npm install
npm run build
```

Expected: `dist/` created in project root, build succeeds.

- [ ] **Step 6: Update .gitignore for root layout**

Edit project-root `.gitignore`. Replace astro-site lines with root paths:

```gitignore
# Replace astro-site/dist/ etc. with:
dist/
.astro/
.netlify/
```

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "chore: promote astro-site to project root, remove old site/ prototype"
```

---

### Task 39: Push to GitHub

**Files:** none (Git remote setup)

- [ ] **Step 1: Create GitHub repo via gh CLI or web UI**

If `gh` CLI is installed:

```bash
gh repo create berega-landing --private --source=. --remote=origin --push
```

If using web UI: create empty private repo at github.com, then:

```bash
git remote add origin https://github.com/<user>/berega-landing.git
git branch -M main
git push -u origin main
```

- [ ] **Step 2: Verify push**

Visit the GitHub repo URL. Confirm files appear, all commits are present.

---

### Task 40: Connect Netlify

**Files:** none (Netlify dashboard configuration)

- [ ] **Step 1: New site from Git**

In Netlify dashboard → Add new site → Import from Git → GitHub → select repo.

Build settings (auto-detected from netlify.toml):
- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`

Click Deploy. First build will probably succeed but forms won't work yet (no env vars).

- [ ] **Step 2: Add env vars**

Site settings → Environment variables → add:
- `PUBLIC_TURNSTILE_SITE_KEY` (production value)
- `TURNSTILE_SECRET` (production secret)
- `TELEGRAM_BOT_TOKEN` (production bot)
- `TELEGRAM_CHAT_ID` (production chat)
- `PUBLIC_YANDEX_METRIKA_ID` (production counter)

- [ ] **Step 3: Trigger redeploy**

Deploys → Trigger deploy → Deploy site (with new env vars).

Expected: build succeeds, site live at `<random>.netlify.app`.

---

### Task 41: Production smoke tests

**Files:** none (manual verification)

- [ ] **Step 1: Visit production URL**

Open the Netlify-assigned URL. Verify visually:
- Page loads without errors
- Hero photo displays
- HomeReserve booking widget loads (no 404 — if it 404s, add the production domain to HomeReserve token whitelist)
- All 6 property cards visible
- Reviews + 4 screenshots
- Both forms display

- [ ] **Step 2: Test review form on production**

Fill out and submit. Check production Telegram chat for the message.

- [ ] **Step 3: Test lead form**

Fill out and submit. Check Telegram.

- [ ] **Step 4: Verify Yandex.Metrika**

Open Метрика dashboard. Confirm visit shows up within ~1 minute.

- [ ] **Step 5: Run Lighthouse**

DevTools → Lighthouse → run audit on the production URL. Expected scores:
- Performance: ≥ 90
- Accessibility: ≥ 95
- Best Practices: ≥ 95
- SEO: ≥ 95

If Performance is below 90 — likely image optimization issue or render-blocking CSS. Iterate.

- [ ] **Step 6: Verify mobile**

Chrome DevTools → Toggle device toolbar → iPhone 12 → reload. Confirm:
- Burger menu opens nav
- All sections render readable
- Forms usable
- HomeReserve widget responsive

- [ ] **Step 7: Final commit (if any tweaks needed)**

If smoke tests revealed issues, fix and commit. If all green:

```bash
git tag -a v1.0.0 -m "Production launch"
git push --tags
```

---

## Self-review

Run these checks after writing the plan, before handing it off:

### 1. Spec coverage

Going section-by-section through the spec:

| Spec section | Plan coverage |
|---|---|
| §1 Goal / success criteria | Task 41 verifies all four (live site, forms reach Telegram, widget works, Я.Метрика, Lighthouse ≥90) |
| §2 In-scope items 1–13 | Tasks 5,8 (vector → JSON), Task 18 (Astro Image), 25 (Function), 23 (Turnstile), 24 (Telegram), 6 (Я.Метрика), 9+29 (i18n), 32+34 (SEO), 11 (mobile burger), 17 (countdown), 31 (privacy/offer), 35+36 (deploy infra) |
| §2 Out-of-scope | Spec captures these as constraints; plan does not implement them — correct |
| §3 Tech stack | Tasks 1,4 install all listed deps |
| §4 Project structure | Task 3 stubs all dirs, Tasks 5–36 populate them |
| §5 Components 17 entries | Tasks 11–22 + 26–27 = 14 components present (BaseLayout in Task 6 acts as 18th). All listed 17 covered. |
| §6 Data model | Task 7 schemas, Task 8 populated, Task 8 step 6–7 validates with tests |
| §7 Forms architecture | Task 25 implements full flow, Tasks 26–27 wire forms to it, Task 35 sets env vars |
| §8 i18n architecture | Task 9 t() helper + ru/zh JSONs + isLocaleEmpty gate. Task 29 uses it. |
| §9 Build & deploy | Tasks 35–36 (netlify.toml, README), Task 40 (Netlify connect) |
| §10 Migration steps 1–17 | Steps 1–17 mapped to Tasks 1–41 |
| §11 Risks/Q | Q4 (OG image) added in Task 33; R2 (HomeReserve domain whitelist) called out in Task 41 step 1 |
| §12 Principles | Atomic commits enforced by `Step N: Commit` in every task; no inline styles in components (forms use small inline overrides only); 503 fallback implemented in Task 25 |

No gaps.

### 2. Placeholder scan

Searched for: `TBD`, `implement later`, "fill in details", "appropriate error handling", "similar to". Only legitimate uses found:
- Privacy/offer pages contain `[TODO]` — explicit content gaps for the user/lawyer (Task 31), not plan placeholders
- Q4 in spec for OG image refinement (acknowledged as queued)
- Task 37 step 2 says "manually fill .env" with TEST values — task is a verification step that requires human input, acceptable

### 3. Type consistency

- `Apartment`, `Review`, `Rule`, `FAQ`, `Socials` types defined in Task 7, imported by Tasks 18, 20, 21, 22, 12 respectively. Consistent.
- `t(key, lang)` signature in Task 9 matches all call sites.
- `verifyTurnstile(token, secret)` (Task 23) called from Task 25 with same signature. Match.
- `sendToTelegram(token, chatId, text)` (Task 24) called from Task 25 with same signature. Match.
- `inputSchema` discriminated union in Task 25 matches frontend payloads in Tasks 26 (`form: 'review'`) and 27 (`form: 'lead'`). Match.
- Env var names consistent: `PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `PUBLIC_YANDEX_METRIKA_ID` referenced identically across Task 6, 25, 26, 27, 35, 36, 40.

### 4. Ambiguity

- Task 5 step 3 says "copy ALL component rules verbatim" — clear instruction with reference range.
- Task 8 step 1 has all 6 apartment objects spelled out — no inference needed.
- Task 25 rate-limit: "5 hits / 10 min per IP" — concrete.
- Task 29 gate condition: `isLocaleEmpty(lang)` returns true → redirect — concrete.

No ambiguities found. Plan ready.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-28-berega-astro-deploy.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
