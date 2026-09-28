# Positioning & Messaging

## Competitive Alternatives

⚠️ **HIPÓTESIS SIN VALIDAR** — Fase 7 (obviously-awesome) del journey create-business, 2026-09-28.

Mismo mapeo de `docs/CUSTOMER.md` § Competing Alternatives (Fase 1): no-consumo/postear sin plan (el más grande), Canva + apps nativas a mano, Buffer/Later/Hootsuite, Canva con su función de scheduling, freelancer/agencia, cámara del celular + editor nativo de IG.

## Unique Attributes → Value Themes

⚠️ **HIPÓTESIS SIN VALIDAR, no confirmadas contra competidores reales**. Se descartó explícitamente "revisión antes de publicar / sin doble-publicación" como atributo único — es muy probable que Buffer/Later/Hootsuite (herramientas maduras) ya lo resuelvan; queda como algo que la app tiene bien resuelto, no como diferenciador.

| Attribute | Value ("so what") | Proof |
|---|---|---|
| Plantillas ultra-específicas por tipo de post de negocio (ficha de producto, oferta con código/vigencia) combinadas con publicar/programar en el mismo flujo — ni Canva (genérico) ni Buffer/Later (no diseñan) ofrecen esta combinación | Armar un post completo en minutos sin tener que aprender una herramienta de diseño | Ninguna todavía — a confirmar con el piloto concierge (EXP-002) |
| Cero decisiones de diseño: llenar 3-4 campos en vez de mover/personalizar elementos en un lienzo libre | Se puede mantener presencia constante en redes sin que eso robe tiempo del negocio ni genere la ansiedad de "no sé diseñar" (dimensión emocional, Fase 1 de `docs/CUSTOMER.md`) | Ninguna todavía |

**Value themes** (2, no más — foco):
1. **Velocidad sin fricción de diseño** — de la idea al post publicado en minutos.
2. **Presencia constante sin culpa** — al ser tan rápido, es más fácil sostener el hábito de publicar seguido, atacando directo al no-consumo (el competidor más grande, Fase 1).

## Best-Fit Customer

⚠️ **HIPÓTESIS SIN VALIDAR**. Angostado del tier "soon-to-be" (Fase 6): dueño/a de un negocio o emprendimiento chico que **ya usa Canva o hace el diseño a mano** y siente la fricción, publica productos/ofertas recurrentes (no contenido editorial variado), sin presupuesto para diseñador ni community manager, activo en Instagram y/o Facebook.

**Criterios negativos** (quién NO es buen fit hoy, por diseño — ver ERRC de la Fase 6): agencias que manejan cuentas de terceros (necesitan colaboración/aprobación, eliminado deliberadamente), negocios que ya tienen diseñador in-house, marcas que necesitan diseño muy custom, negocios cuya red principal es LinkedIn/TikTok/Pinterest (fuera de las redes soportadas).

## Market Category

⚠️ **HIPÓTESIS SIN VALIDAR**. **Subcategoría**, no categoría nueva — evita pagar el "education tax" de enseñar un concepto totalmente nuevo, coherente con la guiding policy de la Fase 5 (no gastar en marketing/educación de mercado todavía). Encuadre: dentro de "herramientas de redes sociales para negocios chicos" (categoría que la gente ya entiende), como la variante *sin decisiones de diseño* — no "otro editor de diseño" ni "otro programador de posts" a secas.

## One-Liner

⚠️ **HIPÓTESIS SIN VALIDAR**.

> Para emprendedores que manejan sus redes sociales solos, PostCraft es la herramienta de posts para redes sociales que arma y publica el contenido de tu negocio sin que tengas que saber diseñar.

## Brand Script (StoryBrand)

_Pendiente — opcional, se completaría con `storybrand-messaging` si hace falta antes de un lanzamiento público (ver No-List de la Fase 5: no hay lanzamiento self-serve todavía)._

## Key Messages

Fase 6 (made-to-stick) del journey improve-app, 2026-09-24 — copy in-app del flujo de armar/programar posts. Puntaje SUCCESs: **~5/10** (Unexpected/Stories no aplican a copy transaccional; los puntos débiles reales son Concrete, Credible y Emotional). Commander's Intent de la pantalla del Editor: *"armé algo profesional y sé exactamente qué va a pasar cuando toque publicar"*.

| Surface | Message | Status |
|---|---|---|
| Mensaje de éxito al publicar (`PublishPanel`) — hoy "¡Publicado con éxito!" + "El post fue enviado correctamente." (poco Concrete/Credible, no dice a qué red) | "Se publicó en Instagram." (o "en Instagram y Facebook" si son varias) | shipped 2026-09-25 |
| Mensaje de éxito al programar — hoy "¡Publicación programada!" + "El post fue enviado correctamente." (no dice cuándo ni dónde) | "Programado para el {fecha} a las {hora} en {redes}." | shipped 2026-09-25 |
| Label "Contenido del diseño" (`FieldsPanel`) — abstracto, habla en términos de diseño y no del job del usuario | "Qué va a decir tu post" | shipped 2026-09-28 |
| Contenido de ejemplo en los campos del editor | Se vació en vez de prefijarlo (ver Fase 3/9 de `improve-app`) | shipped 2026-09-24 |

**Ya bien resuelto, sin tocar**: "Publicar ahora", "Programar publicación", y el empty state "Selecciona un tipo de contenido para editar los campos." — cortos, directos, sin jerga.

Fase 7 (influence-psychology), 2026-09-24 — superficie auditada: pantalla de planes/upgrade (`Settings.jsx`). Única superficie de venta en la app hoy.

**Ya bien aplicado**: los datos de cada plan (precio, límites, features) vienen 100% de `GET /plans`, documentado en comentario de código — nada hardcodeado. El aviso "Solo X posts restantes" (`Sidebar.jsx`) es escasez real basada en uso genuino, no fabricada. Sin testimonios inventados ni prueba social falsa en ningún otro lado.

| Surface | Message | Status |
|---|---|---|
| Badge "Popular" en el plan Pro (`Settings.jsx`, `PLAN_DISPLAY`) — hardcodeado (`popular: true`), no surge de datos reales de qué plan elige más gente; hoy no hay usuarios reales que lo respalden | Sacar el badge hasta que haya datos reales de uso que lo justifiquen | shipped 2026-09-25 |
