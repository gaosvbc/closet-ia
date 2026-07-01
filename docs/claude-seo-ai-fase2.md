# Herramientas para la fase SEO — claude-seo-ai (plugin de Claude Code)

> Fecha: 01 julio 2026
> Tipo de doc: **referencia + activación** — no se instala todavía, se deja documentado para cuando termine la fase de construcción y empiece la fase SEO/lanzamiento.
> Fuentes: [guía de tododeia](https://www.tododeia.com/community/claude-seo-ai) + [repo Hainrixz/claude-seo-ai](https://github.com/Hainrixz/claude-seo-ai) (MIT, verificado, real — 2 stars, autor Enrique Rocha / tododeia.com).

---

## 1. Qué es y por qué nos sirve

Es un **plugin de Claude Code** (no una web ni un SaaS — corre dentro de Claude Code, sobre nuestro propio repo o sobre la URL en producción) que audita un sitio en **dos ejes que nunca mezcla**:

- **Search SEO** — lo clásico: que Google pueda rastrear, indexar y entender la web (justo los 3 puntos que ya trabajamos: title/meta, HTML semántico, sitemap/robots — más Core Web Vitals, canonical, datos estructurados).
- **AI Visibility (GEO/AEO)** — qué tan citable es el contenido para ChatGPT, Perplexity, Google AI Overviews, Gemini y el propio Claude. Es decir: si esos motores pueden entrar a leer la página y si el contenido tiene bloques de respuesta extraíbles que puedan citar.

Da **dos notas independientes de 0-100 con letra A-F** (nunca un único número promedio, porque eso esconde en cuál de los dos ejes estamos flojos). Corre **offline, sin API keys**, en su modo por defecto.

---

## 2. Instalación (cuando llegue el momento)

Dentro de Claude Code, en este orden, sin cerrar Claude Code en medio:

```
/plugin marketplace add Hainrixz/claude-seo-ai
/plugin install claude-seo-ai@claude-seo-ai
/reload-plugins
```

El paso 3 es obligatorio — si no se recarga, los comandos `/claude-seo-ai:*` no aparecen.

---

## 3. Los 4 comandos

| Comando | Qué hace | ¿Escribe archivos? |
|---|---|---|
| `/claude-seo-ai:audit <url>` | Auditoría completa, los dos ejes | No — solo lectura |
| `/claude-seo-ai:geo <url>` | Solo el eje de visibilidad en IA | No — solo lectura |
| `/claude-seo-ai:score` | Resume las dos notas de la última auditoría | No |
| `/claude-seo-ai:fix <url> [--dry-run]` | Aplica los arreglos seguros | Sí, pero solo con confirmación explícita por cada cambio |

`audit`, `geo` y `score` se le pueden pedir a Claude en lenguaje natural ("Audita el SEO y la visibilidad en IA de tusitio.com"). `fix` siempre hay que escribirlo como comando — por diseño, Claude no lo puede disparar solo (`disable-model-invocation: true` en el propio plugin).

---

## 4. Qué audita (resumen de los ~20 módulos)

| Área | Incluye |
|---|---|
| Crawl & índice | robots.txt, indexabilidad, canonical, salud del sitio, renderizado CSR/SSR/SSG, sitemaps |
| Datos estructurados | JSON-LD (validación + generación), entidades / `sameAs` |
| On-page & meta | title/meta/head, mobile, headings, social cards (OG/Twitter), imágenes y alt, enlazado interno |
| Búsqueda con IA (GEO/AEO) | bloques de respuesta extraíbles, densidad de hechos, acceso de crawlers de IA, `llms.txt` |
| Contenido y confianza | E-E-A-T, frescura del contenido |
| Rendimiento | Core Web Vitals (LCP/INP/CLS) — solo con field data real, no estimaciones de laboratorio |
| Verticales condicionales | e-commerce/Product, negocio local, internacional/hreflang |

---

## 5. El modelo de seguridad del fixer

Tres niveles, y solo el primero se aplica sin pedir aprobación item por item:

- **AUTO** — etiquetas técnicas que faltaban: meta tags, JSON-LD, robots.txt, canonical, hreflang, sitemaps, `llms.txt`. Nunca borra ni reescribe contenido.
- **PROPOSED** — requiere criterio (reescribir un title, una meta description, insertar enlaces): te lo propone uno por uno, tú aceptas o rechazas.
- **ADVISORY** — nunca lo escribe: velocidad real, estrategia de renderizado, reescrituras de contenido, redirecciones, link-building, ficha de Google Business. Solo diagnostica.

Protecciones activas siempre: modo `--dry-run` (preview sin tocar nada), bloqueo duro de escritura sobre `.git`/secretos/lockfiles, backup antes de tocar cualquier archivo, se detiene solo si el repo tiene cambios sin guardar, y no repite arreglos ya aplicados si se corre dos veces.

---

## 6. Honestidad: mitos que evita (importante, corrige algo que ya hicimos)

El propio plugin documenta explícitamente que **no infla resultados**:

- **`llms.txt`** lo genera, pero lo puntúa en **0** — impacto incierto, solo algunos motores (Anthropic, Perplexity) lo respetan en su recuperación de contenido; Google no lo usa para sus respuestas de IA.
- **FAQPage/HowTo schema están marcados como "deprecated para rich results de Google"** — Google dejó de mostrar los desplegables de preguntas en el SERP para la mayoría de sitios desde 2023 (sigue siendo válido para que la IA extraiga la respuesta, pero no para el "rich snippet" clásico que solíamos esperar).

  > **Nota sobre lo que hicimos en closet-ia:** en la ronda 2 de la auditoría añadimos un `FAQPage` JSON-LD en `/pricing` y dijimos que "puede hacer que salgan los desplegables de preguntas en el resultado de Google". Eso hay que matizarlo: para la mayoría de sitios (closet-ia incluido, no es un sitio gubernamental/salud) Google ya no muestra ese rich result aunque el schema esté bien puesto. El JSON-LD no sobra — sigue ayudando a que la IA (ChatGPT, Perplexity, AI Overviews) extraiga esas preguntas y respuestas como contenido citable — pero no esperar que reaparezca el desplegable en Google clásico por este cambio.
- No optimiza para densidad de keywords; el "keyword stuffing" se marca como negativo.
- Nunca inventa estadísticas, fechas, credenciales ni enlaces de identidad (`sameAs`).
- Cada hallazgo lleva un nivel de confianza (`established` / `directional` / `speculative`).

---

## 7. Cómo se relaciona con lo que ya hicimos en closet-ia

Buena noticia: varios de los arreglos **AUTO** del plugin ya están cubiertos a mano antes de instalarlo siquiera:

| Arreglo AUTO del plugin | Estado en closet-ia |
|---|---|
| Meta tags por página | Hecho (rondas 1-2) |
| JSON-LD (Organization/WebSite/FAQPage) | Hecho (ronda 2) — ver matiz sobre FAQPage arriba |
| robots.txt | Hecho (`app/robots.ts`), incluyendo reglas explícitas para crawlers de IA (`OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `Claude-SearchBot`, `ClaudeBot`) añadidas el 01/07/2026 |
| Sitemaps XML | Hecho (`app/sitemap.ts`) |
| Canonical | Hecho (ronda 2) |
| OG/Twitter cards | Hecho (ronda 2, `app/opengraph-image.tsx`) |
| hreflang | No aplica todavía (el sitio es solo en inglés, sin versiones por idioma) |
| `llms.txt` | No lo tenemos — y según el punto 6, no es prioritario (impacto incierto) |

Donde el plugin sí va a aportar algo que **no hemos tocado todavía**: el eje completo de **AI Visibility (GEO/AEO)** — si los crawlers de búsqueda de IA pueden leer la web, densidad de hechos, bloques de respuesta extraíbles — y **Core Web Vitals reales** (campo, no estimados), que requieren conectar una herramienta extra (Tier 1).

---

## 8. Cuándo activarlo (criterio de disparo)

No instalar todavía. Activar este plugin cuando se cumpla **cualquiera** de estos:

- [ ] La página de marketing de closet-ia está terminada y en producción (no en `localhost`).
- [ ] Se entra formalmente en la fase de SEO/lanzamiento (la que mencionaste que viene después de cerrar la construcción).
- [ ] Se quiere una foto de "dónde estamos" antes de invertir tiempo en contenido o backlinks, para no optimizar a ciegas.

Primer paso cuando se active: correr `/claude-seo-ai:audit <url-producción>` en modo solo lectura, comparar sus hallazgos contra este documento y `docs/seo-auditoria-2026-06.md`, y recién después decidir si correr `fix --dry-run`.
