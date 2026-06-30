# AtelIA — Documento Maestro del Proyecto

**Última actualización:** 30 de junio de 2026
**Tagline:** "Your AI Personal Stylist"

---

## 1. Visión del Producto

AtelIA es un asistente de armario inteligente con IA que fotografía la ropa del usuario una sola vez y sugiere el outfit perfecto cada mañana, basándose en el clima, el calendario y las medidas corporales reales del usuario.

### El problema que resuelve
El usuario tiene el armario lleno pero siente que "no tiene nada que ponerse" — no por falta de ropa, sino porque no puede visualizar combinaciones rápidamente cada mañana.

### Diferenciadores clave vs. competencia (Alta Daily, Whering, Smart Closet)

| Diferenciador | AtelIA | Competencia |
|---|---|---|
| Inteligencia corporal (altura, peso, tipo de cuerpo) | ✅ | ❌ Ninguno lo tiene |
| Integración real de calendario | ✅ | ❌ Ninguno lo tiene |
| Diseño verdaderamente unisex | ✅ | ❌ Sesgo femenino |
| Espejo mágico conversacional (Gemini Live) | ✅ (plan Elite) | ❌ Requiere hardware físico en competencia |
| Cost-per-wear tracker | ✅ | ❌ |
| Outfit repeat tracker | ✅ | ❌ |

### Mercado objetivo
Estados Unidos como mercado principal de lanzamiento. iOS es prioritario por cuota de mercado en USA (~57%), pero se desarrolla primero en Android por restricciones de hardware (Windows, sin Mac disponible aún).

Segmento principal: profesionales 25-38 años, alta exposición social, valoran la presentación personal.

---

## 2. Modelo de Negocio

### Estructura de planes — 3 niveles, todos de pago (sin plan gratuito)

| Plan | Precio mensual | Precio anual | Incluye |
|---|---|---|---|
| **Essential** | $3.99/mes | $34.99/año (ahorra 27%) | Catálogo ilimitado, clima diario, análisis IA básico (tipo/color/categoría) |
| **Pro** | $8.99/mes | $69.99/año (ahorra 35%) | + Calendario, cost-per-wear, repeat tracker, análisis IA detallado (tela/patrón/temporada/formalidad) |
| **Elite** | $19.99/mes | $179.99/año | + Espejo Mágico conversacional (Gemini Live, 5 min/día), análisis IA completo (ocasiones, estilo, pairing) |

### Decisión sobre el plan gratuito
Se eliminó deliberadamente. Se considera añadir un trial gratuito de 7 días en el futuro como puerta de entrada, pendiente de validación con usuarios.

### Unit economics — Coste de IA por usuario

- Catalogar prenda con Claude Haiku 4.5: ~$0.002-0.006/prenda según plan
- Espejo mágico con Gemini Live: ~$0.10-0.20/minuto, limitado a 5 min/día en plan Elite
- Margen objetivo: mantener coste de API por debajo del 40% del precio del plan

---

## 3. Arquitectura Técnica

### Repositorio
`gaosvbc/closet-ia` en GitHub, desplegado en Vercel (web) + EAS Build (mobile)

### Stack

| Capa | Tecnología |
|---|---|
| Web | Next.js, Tailwind CSS |
| Mobile | Expo SDK 52 + React Native, Expo Router |
| Backend | Supabase (Postgres + Auth + RLS) |
| IA de visión | Claude Haiku 4.5 (Anthropic API) |
| IA conversacional (futuro) | Gemini Live API (Google) |
| Deployment web | Vercel |
| Deployment mobile | EAS Build (Expo) |
| Fuentes | Cormorant Garamond (display) + Inter (UI) |

### Estructura de carpetas
```
closet-ia/
├── app/              → Next.js web
├── mobile/           → Expo React Native
├── components/       → Componentes web compartidos
├── lib/              → Lógica compartida, Supabase client
└── supabase/         → Migraciones SQL
```

### Decisión de proveedor de IA — por qué Claude y no alternativas

- **Google Vision:** descartado — solo etiquetas genéricas, no entiende moda contextualmente
- **GPT-4o Vision:** descartado — similar calidad a Claude pero añade un proveedor más sin ventaja real
- **Clarifai:** descartado — la empresa está cerrando/siendo absorbida por Nebius (créditos deshabilitados desde 18 junio 2026), riesgo de continuidad
- **Claude Haiku 4.5:** elegido — ya está en el stack del proyecto (Claude Code lo construye todo), precio bajo (~$0.002/imagen), calidad alta entendiendo contexto de moda

**Estrategia de un solo proveedor:** la diferenciación entre planes se logra variando la profundidad del prompt, no cambiando de modelo de IA. Esto simplifica mantenimiento y reduce puntos de fallo.

### Espejo Mágico — Gemini Live (única función de doble proveedor)
Gemini Live es actualmente el único proveedor maduro con capacidad de video en tiempo real + conversación por voz simultánea. OpenAI Realtime se queda corto en video; Meta Llama 4 no tiene streaming en vivo. Esto se documenta como dependencia de proveedor único — riesgo aceptado y monitoreado.

---

## 4. Identidad de Marca

### Nombre
**AtelIA** — anteriormente "Visual Closet Tracker" / "Closet IA", rebrandeado completamente.

### Logo
"A" estilizada en rojo vino con detalle negro, dentro de un círculo. Versión app icon: fondo rojo vino, "A" blanca con detalle negro, formato rounded-square.

### Paleta de colores

| Token | HEX | Uso |
|---|---|---|
| Blanco cálido | `#FBFAF7` | Fondo principal |
| Marfil claro | `#F7F4EF` | Tarjetas, paneles |
| Gris perla | `#E8E2DC` | Bordes |
| Gris medio | `#8C8580` | Texto secundario |
| Negro carbón | `#171717` | Texto principal |
| Rojo vino | `#8B1524` | CTAs, acentos (máx. 8% de la interfaz) |
| Vino oscuro | `#5A1118` | Hover, detalles |
| Dorado suave | `#C8A45D` | Accesorios únicamente |

### Tipografía
- **Cormorant Garamond** — títulos editoriales, con palabra clave en itálica vino
- **Inter** — interfaz, botones, navegación

### Principio de diseño
70% blanco/marfil, 20% negro/grises, 8% rojo vino, 2% dorado. Estilo editorial premium, minimalista europeo, unisex.

---

## 5. Estado Actual del Desarrollo

### ✅ Completado
- Web de validación desplegada en Vercel
- Supabase conectado (leads, survey_responses, feature_votes, price_votes, page_events)
- App móvil Expo funcionando en dispositivo Android real (Xiaomi, Vivo)
- 10 pantallas de onboarding diseñadas y construidas
- Design system aplicado (colores, tipografía)
- Rebrand completo a AtelIA con icono nuevo
- SDK actualizado a Expo 52 (compatible con Expo Go)
- Build EAS configurado, APK generado y probado

### 🔄 En proceso / pendiente de fix
- Iconos de interfaz (flechas, campana, etc.) no renderizan correctamente en build Android — fix solicitado a Claude Code
- Botones +/- en pantalla de peso no visibles — fix solicitado
- Pantallas de ocupación y marcas no habilitan "Continuar" tras escribir texto libre — fix solicitado
- Falta pantalla de registro real (actualmente salta a modo demo)

### ⬜ No iniciado
- Integración real de Claude Vision para catalogar prendas (prompt preparado, falta ejecutar)
- Autenticación real con Supabase Auth (actualmente modo mock)
- Lógica del algoritmo de sugerencia de outfit (clima + calendario + perfil real)
- Integración de Google Calendar API
- Integración de API de clima real
- Sistema de pagos (Google Play Billing / Apple In-App Purchase)
- Espejo mágico con Gemini Live (documentado, no construido)
- Build de iOS (requiere Mac + Xcode + cuenta Apple Developer $99/año)
- Política de privacidad y términos reales (actualmente placeholder)
- Capturas y ficha de Google Play / App Store

---

## 6. Validación de Mercado

### Estudio de mercado original
Recomendación: 🟡 GO con condiciones fuertes. Hallazgos clave: diferenciación real pero ventana de 12-24 meses, onboarding es el asesino histórico de la categoría, unit economics viables pero ajustados.

### Auditoría crítica posterior
Se identificó que el estudio original no modeló CAC (coste de adquisición de cliente) ni LTV (lifetime value) — gap crítico no resuelto. Veredicto del auditor: NO GO hasta validar CAC real.

### Experimento WhatsApp realizado
10 personas contactadas, las 10 expresaron interés positivo. **Nota de cautela:** esta señal tiene limitaciones metodológicas — posible sesgo de cercanía/cortesía, no se validó disposición real a pagar con dinero real. Se recomienda un segundo experimento más exigente (pre-pago real) antes de invertir más en desarrollo.

### Competidor crítico identificado
**Alta Daily** — nombrada TIME Best Invention of 2025, con respaldo mediático fuerte (Vogue, Forbes, CFDA). Tiene IA visual, clima, packing assistant. NO tiene: medidas corporales, calendario, diseño unisex real. Estos son los pilares de diferenciación de AtelIA.

---

## 7. Roadmap

### Fase 1 — Validación (actual)
- Resolver bugs visuales pendientes en Android
- Conectar Claude Vision real
- Segundo experimento de validación con pre-pago real

### Fase 2 — MVP funcional
- Autenticación real
- Algoritmo de sugerencia de outfit con clima + calendario reales
- Sistema de pagos

### Fase 3 — Lanzamiento
- Build y publicación Android (Google Play, $25 único)
- Build y publicación iOS (requiere Mac, Apple Developer $99/año)
- Política de privacidad y términos legales reales

### Fase 4 — Expansión
- Espejo mágico con Gemini Live (plan Elite)
- Monetización B2B (datos agregados a marcas) — explorar solo si hay tracción

---

## 8. Riesgos Documentados

| Riesgo | Mitigación |
|---|---|
| Dependencia de Gemini Live como proveedor único para espejo mágico | Documentado, aceptado como riesgo de fase tardía |
| CAC no validado | Pendiente de segundo experimento con pago real |
| Validación con sesgo de muestra pequeña/cercana | Repetir experimento con público no cercano |
| Entrada de competidores grandes (Apple, Google, Amazon) | Ventana estimada de 12-24 meses, moverse rápido |
| Onboarding con fricción alta | Resuelto parcialmente con 10 pantallas guiadas, pendiente validar tasa de completación real |

---

*Fin del documento maestro. Actualizar tras cada decisión estratégica relevante.*
