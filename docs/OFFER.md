# Offer & Pricing

⚠️ **Todo este documento es HIPÓTESIS SIN VALIDAR** — journey `create-business` corrido con override de la gate de evidencia. Ver `docs/CREATE-BUSINESS-PLAN.md` § Key Decisions. Esta oferta es para el **piloto concierge** (Fase 4, `docs/EXPERIMENTS.md` EXP-002), no un pricing público — la guiding policy de la Fase 5 explícitamente pide no definir pricing final todavía.

## Offer Stack

Fase 8 (hundred-million-offers), 2026-09-28. Nota de honestidad: el framework pide asignarle un valor en dólares a cada bono — se omite deliberadamente porque este es un piloto gratis sin transacción real; inventar cifras sería el mismo tipo de problema que el badge "Popular" que se sacó en el journey `improve-app` (Fase 7) por no tener datos reales detrás.

| Elemento | Descripción | Objeción que mata |
|---|---|---|
| **Core offer** | Acceso gratuito y acompañado a PostCraft durante el piloto — armar y publicar/programar contenido de tu negocio sin saber diseñar | — |
| **Bono 1 — Sesión de armado 1 a 1** | El founder te acompaña en una llamada de 15-20 minutos a conectar tu cuenta y publicar tu primer post real | "No tengo tiempo de aprender algo nuevo" / "no sé si voy a usarlo" |
| **Bono 2 — Acceso gratis mientras dure el piloto** | Sin cobrar durante todo el piloto, aunque el plan público sea pago a futuro | "Ya tengo Canva gratis" |
| **Bono 3 — Canal directo con el founder** | WhatsApp o email directo para pedir ajustes o reportar problemas durante el piloto — no un ticket de soporte genérico | "Qué pasa si no me sirve" |
| **Guarantee — "15 minutos o desconectamos"** | Si en la primera sesión no se logra publicar un post real en menos de 15 minutos, se desconecta la cuenta de Meta ahí mismo y no se sigue — sin insistir | Miedo a perder tiempo probando algo que no funciona |
| **Control de datos** | Se puede desconectar la cuenta de Meta en cualquier momento, en un clic, sin nada instalado que quede atrás | Miedo a dar acceso a la cuenta real de redes sociales |
| **Scarcity (real, no fabricada)** | Hasta 10 lugares — es el tamaño real del piloto definido en la Fase 4 (EXP-002: "5-10 personas onboardeadas a mano"), no un número inventado para presionar | Falta de urgencia para decidir |
| **Name (MAGIC)** | **"Piloto Fundador PostCraft"** — armá y publicá tu primer post en 15 minutos, sin saber diseñar | — |

## Willingness-to-Pay Evidence

⚠️ **HIPÓTESIS SIN VALIDAR — invento total del founder, sin ninguna conversación real de por medio.** Fase 9 (monetizing-innovation), 2026-09-28. El usuario pidió explícitamente poner precios igual, partiendo de los planes que ya existen en el código, aunque no haya evidencia de willingness-to-pay real — esto NO es investigación de mercado, es un punto de partida a validar cuando el piloto (Fase 4, EXP-002) dé señal de perseverar.

**Script de WTP para usar más adelante** (no corrido todavía — queda listo para cuando haya gente real con quien hablar de precio, siguiendo el mismo patrón que la guía de mom-test de la Fase 2):
1. "¿Hoy pagás algo por herramientas o gente que te ayude con tus redes? ¿Cuánto?"
2. "Si esto te resolviera [el job de la Fase 1] de verdad, ¿qué precio mensual te parecería que vale la pena pagar?"
3. "¿En qué precio empezarías a dudar si vale la pena?"
4. "¿En qué precio directamente no lo pagarías, sin importar qué tan bien funcione?"
5. Probabilidad de compra 1-5 al precio propuesto — solo cuentan los 5 (los 4 son "tal vez", todo lo demás es no.

| Segment | Acceptable | Expensive | Prohibitive | Source |
|---|---|---|---|---|
| _Sin datos todavía_ | — | — | — | — |

## Leader / Filler / Killer Features

⚠️ **HIPÓTESIS SIN VALIDAR.** Hallazgo: la escalera de planes actual (`backend/migrations/001_init.sql`) diferencia sobre todo por **cantidad de cuentas conectadas** (1/2/5/20) — un eje pensado para agencias gestionando clientes. El posicionamiento de la Fase 7 excluye agencias a propósito (necesitan colaboración, eliminada en el ERRC de la Fase 6). Para el best-fit real (dueño de 1 negocio, 1-2 cuentas propias), "más cuentas" no es un eje de valor.

| Feature | Class | Tier placement |
|---|---|---|
| Programación de posts (`scheduling`) | **Leader** — la razón real de pagar, ya bien puesta detrás del paywall (Free no la tiene) | Starter en adelante |
| Cantidad de posts/mes | **Filler** — acompaña, no vende por sí sola | Escala en todos los tiers pagos |
| Cantidad de cuentas conectadas (1/2/5/20) | **Killer para este segmento** — hoy es el eje principal de diferenciación, pero no es lo que el best-fit valora | Recomendación: desenfatizar, no eje central |
| Analytics (`analytics` flag en DB) | Promesa sin entregar — el flag existe en la base para Pro/Agency pero ninguna pantalla del frontend lo muestra todavía | No cobrar por esto hasta construirlo — nota de producto, no se resuelve en esta fase |

## Tiers (Good / Better / Best)

⚠️ **HIPÓTESIS SIN VALIDAR — mismos precios que ya existen en Stripe, no se propone ningún cambio real al producto.** Solo se marca qué segmento calza con cada tier, per la guiding policy de la Fase 5 ("no definir pricing final ni modificar los planes todavía").

| Tier | Precio (ya en Stripe) | Para quién | Nota |
|---|---|---|---|
| Free | $0 | Prueba | Sin cambios |
| **Starter** | $19/mes | El "better" real para este segmento — emprendedor solo, 1-2 cuentas propias | Encaja con el best-fit de la Fase 7 |
| Pro | $49/mes | Dudoso para este segmento — el salto a 5 cuentas no aplica a un dueño de 1 negocio | A futuro: repensar el eje (plantillas por rubro, soporte prioritario) en vez de cuentas — no tocar ahora |
| Agency | $99/mes | **Fuera de alcance del piloto** — es el segmento que la Fase 6/7 decidió no perseguir todavía | No promover durante el piloto concierge |

## Price Metric

⚠️ **HIPÓTESIS SIN VALIDAR.** Recomendación: seguir cobrando por **posts/mes + programación habilitada** (ya es lo que hace el producto hoy) — desenfatizar la cantidad de cuentas conectadas como eje de valor para el segmento solo-emprendedor. Revisar esta recomendación con datos reales de WTP cuando el piloto lo permita.
