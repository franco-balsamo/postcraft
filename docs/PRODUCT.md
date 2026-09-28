# Product

## Vision

⚠️ **HIPÓTESIS SIN VALIDAR** (Fase 4, create-business, 2026-09-28 — corrida con override de la gate de evidencia; ver `docs/CREATE-BUSINESS-PLAN.md` § Key Decisions).

PostCraft ayuda a emprendedores y dueños de negocios chicos que manejan sus redes sociales solos, sin diseñador ni community manager, a mantener una presencia activa y prolija en Instagram y Facebook — armando contenido con buena imagen y publicándolo o programándolo desde un solo lugar, en vez de saltar entre una herramienta de diseño y cada red por separado.

## MVP Definition

⚠️ **HIPÓTESIS SIN VALIDAR** (Fase 4, 2026-09-28).

**Tipo**: el producto ya está construido — se usa como vehículo de aprendizaje (no se construye nada nuevo), pero con onboarding tipo **concierge**: reclutar 5-10 personas del perfil ya definido en `docs/EXPERIMENTS.md` EXP-001 (dueño/a o único/a encargado/a de redes de un negocio chico, sin diseñador ni community manager) y acompañarlas personalmente a conectar su cuenta de Meta y publicar su primer post real — no self-serve abierto todavía.

**Excluye deliberadamente**: campañas de adquisición pagas, onboarding self-serve masivo, features nuevas, más tipos de contenido — el objetivo de esta etapa es aprender si el job se sostiene en el tiempo, no crecer.

**Motor de crecimiento a priorizar**: *sticky* (retención) antes que pago o viral — la pregunta que más importa hoy es si la gente vuelve a usarlo para su segundo post, no cuánta gente se entera que existe.

## Outcome Roadmap

Fase 9 (steve-jobs-design-review) del journey improve-app, 2026-09-24 — cierre del journey. Veredicto: **NOT DONE (4/10)**. Lista priorizada combinando los hallazgos de las 9 fases más el walkthrough end-to-end de esta fase.

| Outcome / problem | Job served | Priority | Status |
|---|---|---|---|
| [NUEVO, Fase 9] El Editor deja seleccionar/"publicar" a una red que el usuario nunca conectó, sin guiarlo a conectar antes — recién en Configuración se entera, después de un error genérico | Confianza al publicar (dimensión emocional, Fase 1) | P0 | **shipped 2026-09-24** |
| Contenido de ejemplo del editor indistinguible de contenido real (Fase 3, severidad 4) | Confianza al publicar | P0 | **shipped 2026-09-24** |
| Sin confirmación de cuenta destino antes de publicar (Fase 2 #1) | Confianza al publicar | P1 | **shipped 2026-09-25** |
| Sin revisión final antes de una acción irreversible/pública (Fase 2 #2) | Confianza al publicar | P1 | **shipped 2026-09-25** |
| Sin cooldown/reset tras publicar con éxito — riesgo de doble-publicación (Fase 5) | Confianza al publicar | P1 | **shipped 2026-09-25** |
| Mensajes de éxito genéricos, no dicen a qué red ni cuándo (Fase 6) | Confianza al publicar | P1 | **shipped 2026-09-25** |
| Badge "Popular" hardcodeado sin datos reales (Fase 7) — decidido sacarlo | Honestidad de la oferta | P1 | **shipped 2026-09-25** |
| [NUEVO, Fase 9] Flujo "Eliminar cuenta" usa `alert()` nativo — la superficie menos cuidada de la app, justo en la zona que más debería transmitir seriedad | Confianza en la cuenta/negocio | P2 | **shipped 2026-09-28** |
| Selector de plantillas con emojis en vez de miniaturas reales (Fase 2 #3) | Sentirse profesional (dimensión emocional) | P2 | **shipped 2026-09-28** |
| [NUEVO, Fase 9 — cut] Cortar el código muerto del template `tip` en `FieldsPanel` en vez de completarlo — solo existen 2 tipos de contenido reales | Simplicidad | P2 | **shipped 2026-09-28** |
| Contraste de texto secundario `slate-500` (Fase 4) | Accesibilidad | P2 | **shipped 2026-09-28** |
| Campanita de notificaciones sin función en `TopBar` (Fase 5 — cut) | Simplicidad/honestidad | P2 | **shipped 2026-09-28** |
| Resto de hallazgos cosméticos y menores: validar caption por red, aclarar huso horario, link "Reconectar cuenta", snackbar de deshacer borrado, anclar feedback de éxito al botón (momento de firma), alert() al exportar PNG, renombrar "Contenido del diseño", requerir contenido antes de publicar — todos shipped 2026-09-28. Único pendiente: label de texto junto al ícono de borrar en PostCard (bajo impacto, no priorizado). Ver `docs/DESIGN.md` y `docs/EXPERIMENTS.md` para el detalle completo | — | P3 | **shipped 2026-09-28** (salvo 1 ítem de bajo impacto, ver nota) |

## Opportunity Solution Tree Notes

_Pendiente._

## Hook Model

_Pendiente._

## Activation & Retention Plan

_Pendiente._

## Discovery Cadence

_Pendiente._
