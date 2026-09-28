# Design System

## Design Direction

_Pendiente — se completa en la Fase 4 (refactoring-ui)._

## Typography

_Pendiente — se completa en la Fase 4 (refactoring-ui) si hace falta._

## Tokens

Fase 4 (refactoring-ui), 2026-09-24 — auditoría de `tailwind.config.js` + `index.css`. Contrastes calculados (WCAG), no estimados a ojo.

- **Paleta base**: `brand-green` #00ff88 (único acento), `brand-dark` #0a0e1a / `brand-navy` #0d1117 / `brand-surface` #161b2e / `brand-border` #1e2740 (grises tinteados en azul-navy, no negro puro — correcto per refactoring-ui).
- **Contraste verificado**: `brand-green` sobre `brand-dark` = **14.3:1** (pasa AAA). `slate-400` sobre `brand-dark` = **7.5:1** (pasa AAA). `slate-500` sobre `brand-dark` = **4.04:1** — **falla AA** (mínimo 4.5:1) para texto normal. Ver hallazgo en Components/UX Audit Findings.
- **Espaciado**: usa la escala nativa de Tailwind (múltiplos de 4px) de forma consistente — sin valores de píxeles sueltos detectados.
- **Border-radius**: lenguaje consistente por función — `rounded-full` (botones/pills), `rounded-xl` (inputs), `rounded-2xl`/`rounded-3xl` (cards/paneles).

## Components

| Component | Decision | Status |
|---|---|---|
| Texto secundario/meta (timestamps, hints de formulario, labels chicos) usa `text-slate-500`, que mide 4.04:1 de contraste sobre los fondos oscuros — no llega a WCAG AA (4.5:1) | Cambiar a `text-slate-400` (7.5:1) en todo lugar donde el texto deba leerse; reservar `slate-500`/`slate-600` solo para marcas puramente decorativas | shipped 2026-09-28 |
| `Badge.jsx` ya tiene un sistema multi-hue deliberado (verde/azul/amarillo/rojo/gris/violeta) con el criterio documentado en comentario | Sin cambios — ya bien resuelto | done |
| Un solo accent color (`brand-green`) reusado vía opacidad en vez de una paleta de shades — funciona pero es una decisión a mantener presente si en el futuro hace falta más rango (ej. un verde "hover-safe" más apagado) | Sin cambios por ahora — nice-to-have de baja prioridad, no es un defecto | done |

## UX Audit Findings

Fase 2 (ux-heuristics), 2026-09-24 — flujo auditado: armar y programar un post (Editor + Sidebar + TopBar). Trunk Test: **pasa** — `TopBar` muestra título de página y badge de estado; `Sidebar` marca la sección activa en desktop y mobile. Puntaje heurístico actual: **5/10** (sin hallazgos catastróficos/bloqueantes; dos Major que se repiten en cada uso).

| Issue | Heuristic | Severity (0-4) | Fix | Status |
|---|---|---|---|---|
| Al tocar "Publicar ahora"/"Programar", no se muestra a qué cuenta (foto/handle) se va a publicar | H1 Visibility of system status / H6 Recognition rather than recall | 3 | Mostrar la cuenta conectada (avatar + handle) de cada red seleccionada, arriba del botón de publicar | shipped 2026-09-25 |
| No hay paso de revisión final antes de una acción irreversible y pública (publicar a IG/FB real) | H5 Error Prevention / H3 User control and freedom | 3 | Agregar una tarjeta de confirmación (red, imagen, caption, fecha) antes del envío definitivo | shipped 2026-09-25 |
| El selector de plantilla usa emojis (📦🏷️) en vez de una miniatura real del resultado | H6 Recognition rather than recall | 2 | Reemplazar los emojis por un thumbnail renderizado de cada combinación formato×plantilla | shipped 2026-09-28 |
| El caption no valida contra el límite real de cada red (ej. IG ~2200 caracteres) | H5 Error Prevention | 2 | Mostrar el límite por red seleccionada y advertir si se supera, antes de publicar | shipped 2026-09-28 |
| El campo de fecha/hora de programación no aclara en qué huso horario se interpreta | H1 Visibility of system status | 2 | Agregar aclaración del huso horario junto al campo | shipped 2026-09-28 |
| La campanita de notificaciones en `TopBar` no tiene handler ni contador | H1 Visibility of system status | 1 | Ocultarla hasta que haya notificaciones reales, o quitarla por ahora | shipped 2026-09-28 |
| El mensaje de error de publicación es genérico, sin link directo a reconectar la cuenta | H9 Help recognize/recover from errors | 1 | Agregar link/botón "Reconectar cuenta" en el mensaje de error cuando aplique | shipped 2026-09-28 |

**Nota de código**: `FieldsPanel.jsx` tiene campos para un template `tip` que `TemplateSelector.jsx` nunca ofrece (código muerto, inalcanzable desde la UI) — no es un hallazgo de usabilidad en sí (nadie lo ve), pero conviene limpiarlo o completarlo como tercer tipo de contenido cuando se ataque el hallazgo #3.

Fase 3 (design-everyday-things), 2026-09-24 — mismos flujos, encuadrados en los dos gulfs de Norman (Execution: "¿cómo hago esto?"; Evaluation: "¿qué pasó?").

| Issue | Heuristic (Norman gulf) | Severity (0-4) | Fix | Status |
|---|---|---|---|---|
| Los valores por defecto de `editorStore.js` ("iPhone 15 Pro", "$999", specs, etc.) son indistinguibles de contenido real — no hay señal de "esto es un ejemplo, reemplazalo". Sumado al hallazgo de Fase 2 sobre falta de revisión final, se puede publicar contenido de ejemplo a una cuenta real sin darse cuenta | Execution | 4 | Vaciar los campos y usar `placeholder=` real (texto fantasma no enviable como contenido), o si se mantiene contenido de ejemplo, marcarlo visualmente como tal y bloquear "Publicar" mientras algún campo siga en su valor default | shipped 2026-09-24 |
| El botón "Publicar ahora" se habilita con solo elegir una red, sin exigir que se haya escrito un caption ni tocado ningún campo | Execution | 3 | Requerir que el caption o al menos un campo editado no esté vacío/no sea el default antes de habilitar publicar | shipped 2026-09-28 |
| Al confirmar el borrado de un post (`PostCard.jsx`) no hay ventana de "Deshacer" — se va de una | Evaluation | 2 | Snackbar "Post eliminado — Deshacer" por unos segundos antes del borrado definitivo | shipped 2026-09-28 |
| El ícono de basura en `PostCard` no tiene etiqueta de texto, solo `title` (no funciona en touch/mobile) | Execution | 1 | Agregar label visualmente oculto o texto chico junto al ícono | backlog (icono visual sigue siendo lo suficientemente claro por ahora; bajo impacto, no priorizado) |

**Ya bien aplicado** (no tocar): borrado con confirmación in-line de 2 pasos (Confirmar/Cancelar) en vez de `window.confirm()` nativo; campo de fecha de programación con `min` seteado a "ahora" — constraint que ya impide programar en el pasado.

Fase 9 (steve-jobs-design-review), 2026-09-24 — auditoría "back of the fence" (superficies que nadie demo-ea).

| Issue | Heuristic | Severity (0-4) | Fix | Status |
|---|---|---|---|---|
| El flujo "Eliminar cuenta" (`Settings.jsx`, zona de peligro) usa `alert('Contacta soporte para eliminar tu cuenta.')` — la superficie menos cuidada de toda la app, justo donde más debería transmitir seriedad | Back of the fence | 2 | Reemplazar por un flujo real (aunque sea un modal simple con confirmación explícita y next steps), consistente con el resto de la app | shipped 2026-09-28 |
| El Editor deja seleccionar y "publicar" a una red que el usuario nunca conectó vía Meta — sin verificar `user.instagramConnected`/`facebookConnected` antes de ofrecer el toggle | End-to-end (own the whole experience) | 3 | Si la red no está conectada, no ofrecerla como toggle funcional — mostrar "Conectá Instagram para publicar acá" con link directo a Configuración | shipped 2026-09-24 |

**Ya bien resuelto** (para no tocar): `ErrorBoundary` — copy claro, en tono, botón de recuperación, mismo nivel que una pantalla principal. Empty state de `Posts` (sin posts todavía) — ícono, copy contextual según filtro, CTA directo ("Ir al editor"). Sin ruta 404 dedicada, pero redirige limpio a "/" — elección mínima razonable para el tamaño de la app.

Fase 8 (high-perf-browser), 2026-09-24 — medido contra el servidor de dev, autenticado, en `/editor` (Puppeteer + Lighthouse programático, ver `docs/CREATE-BUSINESS-PLAN.md`/`IMPROVE-APP-PLAN.md` para contexto de la corrida).

**Nota de metodología**: Lighthouse aplica throttling simulado por default incluso en modo desktop — la primera corrida dio score 38/100 (LCP 16.7s) hasta desactivarlo (`throttlingMethod: 'provided'`). Los números reales están abajo. INP real no se midió (requiere datos de campo con usuarios reales, no una corrida de laboratorio) — TBT se usa como proxy.

| Issue | Heuristic (performance) | Severity (0-4) | Fix | Status |
|---|---|---|---|---|
| LCP medido: 842ms (objetivo <2.5s) | performance | — | Sin acción — pasa con margen | pass |
| CLS medido: 0.00004 (objetivo <0.1) | performance | — | Sin acción — prácticamente cero | pass |
| TBT medido: 0ms (proxy de INP, objetivo <200ms) | performance | — | Sin acción. INP real requiere instrumentación de campo (`web-vitals`) una vez haya usuarios | pass |
| Bundle de producción: 344.82 kB (104.22 kB gzip) en un solo chunk — todas las páginas juntas, sin code-splitting por ruta. `html2canvas` (201 kB) ya está bien separado con `import()` dinámico | performance | 1 | `React.lazy` + `Suspense` por página, cuando se quiera afinar más — no urgente, 104KB gzip no es alto para esta app | shipped 2026-09-28 (266.23 kB / 87.76 kB gzip el chunk principal, cada página en su propio chunk) |

## Microinteraction Inventory

Fase 5 (microinteractions), 2026-09-24 — flujo de armar/programar posts.

**Ya bien resuelto**: el botón "Descargar PNG" (`CanvasPreview`) cambia su texto a "Exportando…" durante la carga, no solo agrega un spinner — patrón correcto. El toggle de redes sociales (`PublishPanel`) tiene feedback instantáneo y escalado a la acción.

**Momento de firma recomendado**: la confirmación de "publicado con éxito" — es la acción más frecuente y la que más pesa en la dimensión emocional del job (Fase 1, docs/CUSTOMER.md). Hoy es una tarjeta genérica igual a cualquier otro estado de éxito; vale la pena invertir craft ahí (ícono de la red + confirmación con más peso), aplicando el test de remoción: es la que un usuario recordaría al describir la app.

| Interaction | Trigger/Rules/Feedback/Loops | Fix | Status |
|---|---|---|---|
| Botón "Publicar ahora"/"Programar" (`PublishPanel`) — tras éxito, el botón queda habilitado y los campos intactos | Rules: sin cooldown ni reset tras éxito — riesgo de publicar el mismo post dos veces por error | Deshabilitar el botón unos segundos al éxito, o resetear el formulario (`resetEditor`) | shipped 2026-09-25 (cooldown de 5s) |
| Botón "Publicar ahora"/"Programar" — no cambia texto durante `loading`, solo agrega spinner | Feedback | Cambiar texto a "Publicando…"/"Programando…" durante loading, igual que `CanvasPreview` | shipped 2026-09-25 |
| Tarjeta de éxito/error de publicar aparece separada del botón, más abajo del panel | Feedback | Anclar el feedback más cerca del botón o animar el botón mismo en vez de una tarjeta aparte | shipped 2026-09-28 |
| Error de exportar PNG (`CanvasPreview`) usa `alert()` nativo | Feedback | Reemplazar por el mismo patrón de tarjeta de error inline que ya usa `PublishPanel` | shipped 2026-09-28 |
| Botón "Confirmar" de borrado (`PostCard`) sin estado de carga durante la mutación | Feedback | Deshabilitar/mostrar spinner en "Confirmar" mientras `deleteMutation` está en curso | shipped 2026-09-28 |
| Campo de fecha de programación aparece de golpe al activar el switch | Feedback | Transición simple de altura/opacidad al aparecer | shipped 2026-09-28 |
