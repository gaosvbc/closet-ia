# Auditoría SEO — closet-ia (AtelIA)

> Fecha: 30 junio 2026
> Origen: análisis de reel sobre errores de SEO típicos en webs hechas con IA + auditoría real del repo `gaosvbc/closet-ia`.
> Objetivo: que quien retome este doc (humano o agente IA) revise el estado actual, confirme lo que ya está bien, y corrija lo pendiente.

## Contexto

Hay 3 errores de SEO frecuentes cuando una IA construye una web: (1) tags `title`/`meta description` vacíos o genéricos, (2) HTML sin etiquetas semánticas (todo `<div>`), (3) Google sin un mapa claro del sitio (sin sitemap/robots, sin jerarquía). Verificamos los tres contra el estado real del proyecto. Resultado: **2 de 3 ya estaban resueltos o se resolvieron el 30/06/2026; 1 ya estaba correcto de fábrica.**

---

## 1. Title / Meta description vacíos o genéricos

**Estado: corregido el 30/06/2026 — verificar que el fix siga en `main`.**

- `app/layout.tsx` ya tenía title/description globales correctos ("AtelIA — Your AI Personal Stylist").
- `pricing`, `privacy`, `terms`, `disclaimer`, `waitlist`, `admin` ya exportaban su propio `metadata` — bien.
- **Hueco encontrado:** `/demo` y `/onboarding` son client components (`"use client"`) y un client component **no puede exportar `metadata`** en Next.js App Router. Como resultado, ambas páginas heredaban el title/description genérico de home → metadata duplicada en SERPs para esas dos rutas.
- **Fix aplicado:** se creó `app/demo/layout.tsx` y `app/onboarding/layout.tsx` (server components que solo exportan `metadata` y renderizan `children`), cada uno con su propio title/description. `/onboarding` además lleva `robots: { index: false, follow: true }` porque es un flujo de usuario, no contenido de búsqueda.

### Checklist para quien revise
- [ ] Confirmar que `app/demo/layout.tsx` y `app/onboarding/layout.tsx` existen en `main` y compilan (`tsc --noEmit`).
- [ ] Abrir cada ruta pública (`/`, `/demo`, `/pricing`, `/waitlist`, `/privacy`, `/terms`, `/disclaimer`) y comprobar en el `<head>` que el `<title>` y `<meta name="description">` son únicos, no genéricos, y describen la página real.
- [ ] Ningún title debería superar ~60 caracteres ni ninguna description ~155-160 (si no, Google los trunca).
- [ ] Si se añade una página nueva, **por regla**: si es server component, exporta `metadata` directo; si es `"use client"`, crear un `layout.tsx` hermano que exporte `metadata`.

---

## 2. HTML semántico (evitar "div soup")

**Estado: ya correcto, sin acción pendiente.**

Auditado `app/page.tsx`, `components/SiteNav.tsx`, `components/SiteFooter.tsx`: ya usan `<header>`, `<nav>`, `<main>`, `<section>`, `<h1>`/`<h2>` de forma coherente. No se requería ningún cambio aquí — se deja documentado para que nadie lo "arregle" sin necesidad.

### Checklist para quien revise
- [ ] Al crear páginas nuevas, mantener un único `<h1>` por página (el título principal), y `<h2>`/`<h3>` en orden jerárquico, sin saltarse niveles.
- [ ] Envolver el contenido principal en `<main>`, no en `<div>` suelto.
- [ ] Componentes reutilizables tipo tarjetas/listas: usar `<article>` o `<section>` cuando representen una unidad de contenido independiente (ej. `GarmentCard`, `OutfitSuggestionCard`).

---

## 3. Estructura del sitio para que Google la entienda (sitemap / robots)

**Estado: corregido el 30/06/2026 — verificar que esté desplegado en producción.**

- **Hueco encontrado:** no existía `sitemap.xml` ni `robots.txt` en todo el proyecto. Sin esto, Google no tiene un mapa de qué páginas existen ni indicación de cuáles no debe rastrear (`/admin`, `/onboarding`, `/api/*`).
- **Fix aplicado:** `app/sitemap.ts` (genera `/sitemap.xml` con `/`, `/demo`, `/pricing`, `/waitlist`, `/privacy`, `/terms`, `/disclaimer`) y `app/robots.ts` (permite todo excepto `/admin`, `/onboarding`, `/api/`, y enlaza al sitemap). También incluye reglas explícitas de `allow` para crawlers de IA (`OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `Claude-SearchBot`, `ClaudeBot`), añadidas el 01/07/2026 tras revisar `docs/claude-seo-ai-fase2.md`.

### Checklist para quien revise
- [ ] Confirmar que `NEXT_PUBLIC_APP_URL` está seteado al dominio real de producción (no `localhost`) en las variables de entorno del deploy — si no, el sitemap y el `og:url` apuntarán mal.
- [ ] Visitar `https://<dominio-real>/sitemap.xml` y `https://<dominio-real>/robots.txt` en producción y comprobar que cargan y muestran las rutas correctas.
- [ ] Dar de alta la propiedad en **Google Search Console** y enviar el sitemap ahí (esto no es automático, hay que hacerlo manualmente una vez).
- [ ] Si se añaden páginas públicas nuevas (otra ruta de marketing, un blog, etc.), añadirlas a `app/sitemap.ts`. Si se añaden rutas privadas/admin nuevas, añadirlas a `disallow` en `app/robots.ts`.

---

## Nota aparte (no es SEO, pero se detectó en la misma auditoría)

`npm install` marcó que `next@14.2.15` tiene una vulnerabilidad de seguridad conocida con parche disponible. No se tocó en esta auditoría (fuera de alcance), pero conviene programar la actualización.

---

## Resumen ejecutivo

| # | Problema | Estado | Acción restante |
|---|----------|--------|------------------|
| 1 | Title/description vacíos o genéricos | Corregido (demo + onboarding) | Verificar en producción |
| 2 | HTML no semántico | Ya estaba bien | Ninguna, solo mantener el criterio |
| 3 | Sin sitemap/robots | Corregido | Verificar en prod + dar de alta en Search Console |

---

## Ronda 2 — mejores prácticas adicionales (30/06/2026)

Con los 3 puntos base resueltos, se aplicaron mejoras adicionales de SEO técnico sobre la misma base, sin tocar nada de lo ya validado:

### 4. Imagen Open Graph (cómo se ve el link al compartirlo)
No existía ninguna imagen para compartir en redes/WhatsApp/Slack — al pegar el link, no se mostraba preview decente. Se creó `app/opengraph-image.tsx`, que genera dinámicamente una imagen 1200×630 con la marca (usa los colores reales de `tailwind.config.ts`). Next.js la sirve automáticamente como `og:image` en todas las páginas (se hereda del root salvo que una ruta defina la suya propia).

- [ ] Compartir la URL de producción en WhatsApp/Twitter/LinkedIn y comprobar que la preview se ve bien.
- [ ] Si más adelante hay una imagen de marca "de verdad" (foto/ilustración), se puede reemplazar este archivo por una imagen estática sin tocar el resto del sitio.

### 5. Twitter Card
Se añadió `twitter: { card: "summary_large_image", ... }` en `app/layout.tsx` para que la preview en X/Twitter también use la imagen grande, no la mini.

### 6. URLs canónicas (`alternates.canonical`)
Cada página pública (`/`, `/pricing`, `/demo`, `/waitlist`, `/privacy`, `/terms`, `/disclaimer`) ahora declara su propia canonical. Esto evita que Google trate como contenido duplicado variantes con parámetros, trailing slash, etc.

- [ ] Verificar en producción que cada página muestra su `<link rel="canonical">` correcto (DevTools → Elements → `<head>`).

### 7. Datos estructurados (JSON-LD / Schema.org)
Se creó `components/JsonLd.tsx` (componente reutilizable) y se inyectó:
- **Organization + WebSite** en `app/layout.tsx` — sitewide, ayuda a Google a identificar la entidad "AtelIA".
- **FAQPage** en `app/pricing/page.tsx` — reutiliza el array `FAQ` que ya existía en el código (no se inventó contenido nuevo). Esto es lo que puede generar los desplegables de preguntas frecuentes directamente en el resultado de búsqueda de Google.

  > **Matiz (01/07/2026, ver `docs/claude-seo-ai-fase2.md` §6):** Google dejó de mostrar el rich result de FAQPage en el SERP para la mayoría de sitios desde 2023 — closet-ia no es una excepción a eso. El JSON-LD no sobra: sigue ayudando a que motores de IA (ChatGPT, Perplexity, AI Overviews) extraigan esas preguntas y respuestas como contenido citable. Pero no esperar que reaparezca el desplegable clásico de Google por este cambio.

- [ ] Validar con la [Rich Results Test de Google](https://search.google.com/test/rich-results) la URL de producción de `/` y de `/pricing` una vez desplegado.
- [ ] Si se añade o cambia una pregunta en `FAQ`, el JSON-LD se actualiza solo (lee del mismo array) — no hay que tocar nada más.

### Lo que se revisó y NO se tocó (ya estaba bien)
- Jerarquía de encabezados: cada página pública tiene un único `<h1>`. (`/onboarding` tiene dos `<h1>` en el código, pero son pasos distintos del wizard que nunca se muestran a la vez — no es un problema real, y además esa ruta va `noindex`.)
- No hay imágenes `<img>` sueltas sin `alt` — el proyecto no usa imágenes rasterizadas en el marketing site, solo iconos SVG inline (`lucide-react`), así que no aplica el problema típico de "alt text faltante".
- Enlazado interno básico (nav + footer enlazan a `/demo`, `/pricing`, `/onboarding`, legales) ya existía.

### Resumen ejecutivo actualizado

| # | Mejora | Estado | Verificar en prod |
|---|--------|--------|---------------------|
| 4 | Imagen Open Graph dinámica | Aplicado | Preview al compartir el link |
| 5 | Twitter Card | Aplicado | Preview en X |
| 6 | URLs canónicas por página | Aplicado | `<link rel="canonical">` en cada página |
| 7 | JSON-LD (Organization/WebSite/FAQPage) | Aplicado | Rich Results Test de Google |

---

## Ronda 3 — directivas de crawlers de IA (01/07/2026)

Gap identificado en `docs/claude-seo-ai-fase2.md` §7: `app/robots.ts` no tenía reglas explícitas para crawlers de motores de respuesta con IA. Se añadieron reglas `allow` nombradas para `OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `Claude-SearchBot` y `ClaudeBot` (el wildcard `*` ya las permitía implícitamente; nombrarlas explícitamente evita que un futuro bloqueo genérico de bots las capture por accidente).

- [ ] Verificar en producción que `/robots.txt` lista las reglas nombradas junto con la wildcard.
