# Create a Business Plan

## Context

- **Fecha de inicio**: 2026-09-23
- **Idea cruda**: PostCraft — herramienta para crear y publicar contenido en Instagram/Facebook sin salir del browser (plantillas, editor visual, programación de posts, planes pagos free/pro/enterprise vía Stripe). El código ya existe y funciona, pero todavía no está en producción y no hay clientes.
- **Objetivo de esta corrida**: el usuario dice que la idea es "muy básica hasta ahora" y busca sobre todo más ideas — de features, de mercado, de para quién sirve mejor esto — antes de invertir en llevarlo a producción.
- **Cliente imaginado (de partida, sin validar)**: "cualquier persona o emprendimiento" que quiera resolver sus redes sociales desde un mismo lugar — deliberadamente amplio hoy; se espera angostar esto en la Fase 7 (obviously-awesome) y elegir un beachhead en la Fase 10.
- **Acceso a clientes**: ninguno todavía (sin lista, sin comunidad, sin contactos).
- **Evidencia existente**: ninguna — no hubo conversaciones con clientes potenciales.
- **Modelo**: B2C self-serve como motor principal (se registran y pagan solos); venta directa a negocios/agencias (B2B) como vía secundaria posible.
- **Runway**: sin apuro, ritmo relajado — se prioriza profundidad de las fases sobre velocidad.
- **Producto ya construido**: sí, pero se decidió evaluar el negocio desde cero (no saltear la Fase 3 de design-sprint) porque construir código no equivale a validar demanda.

## Phase Status
| Phase | Skill | Status | Artifact | Date |
|---|---|---|---|---|
| 1 Find the real job | jobs-to-be-done | done | CUSTOMER.md | 2026-09-23 |
| 2 Validate the job | mom-test | deferred: usuario no quiere hablar con clientes por ahora, prioriza pulir la app primero | CUSTOMER.md | 2026-09-24 |
| 3 Test riskiest assumption | design-sprint | deferred: mismo motivo que Fase 2 | EXPERIMENTS.md | 2026-09-24 |
| 4 Smallest MVP + BML loop | lean-startup | done ⚠️ hipótesis sin validar | PRODUCT.md, EXPERIMENTS.md | 2026-09-28 |
| 5 Strategy kernel | good-strategy-bad-strategy | done ⚠️ hipótesis sin validar | STRATEGY.md | 2026-09-28 |
| 6 Uncontested space | blue-ocean-strategy | done ⚠️ hipótesis sin validar | STRATEGY.md | 2026-09-28 |
| 7 Positioning | obviously-awesome | done ⚠️ hipótesis sin validar | POSITIONING.md | 2026-09-28 |
| 8 Grand Slam offer | hundred-million-offers | done ⚠️ hipótesis sin validar | OFFER.md | 2026-09-28 |
| 9 Pricing | monetizing-innovation | done ⚠️ hipótesis sin validar (invento total, sin evidencia) | OFFER.md | 2026-09-28 |
| 10 Beachhead | crossing-the-chasm | done ⚠️ hipótesis sin validar | STRATEGY.md | 2026-09-28 |
Statuses: pending · in-progress · awaiting-evidence · done · deferred: <reason> · skipped: <reason>

Nota histórica: por diseño del journey, las Fases 5–10 quedan bloqueadas hasta que la Fase 2 (GATE) devuelva un veredicto de "proceed" con evidencia real de clientes. **2026-09-28: el usuario pidió override explícito de esa gate** — ver Key Decisions. A partir de acá, todo artefacto de las Fases 4-10 está marcado **⚠️ HIPÓTESIS SIN VALIDAR** — son supuestos razonados, no demanda comprobada con clientes reales.

## Key Decisions
| Date | Phase | Decision | Rationale |
|---|---|---|---|
| 2026-09-23 | Intake | No saltear Fase 3 (design-sprint) | El usuario pidió evaluar el concepto desde cero, aunque el producto ya esté construido — separar "código existe" de "demanda validada" |
| 2026-09-23 | Intake | Cliente de partida deliberadamente amplio | El usuario aún no tiene un nicho definido; se angostará en Fases 7 y 10 en vez de forzarlo ahora |
| 2026-09-23 | 1 Find the real job | Job statement confirmado tal cual el borrador; hire a vencer primero: no-consumo (postear sin plan / no publicar) | El no-consumo es el competidor más grande y más difícil de vencer — conviene diseñar contra esto antes que contra otras herramientas |
| 2026-09-28 | Gate override | El usuario pidió correr las Fases 4-10 igual, sin la evidencia de las Fases 2-3, con cada artefacto marcado explícitamente como hipótesis sin validar | Decisión explícita del usuario tras plantearle la tensión con el principio del framework ("no strategy on unvalidated demand") — se prioriza tener un boceto completo de negocio por sobre esperar evidencia de clientes |
| 2026-09-28 | 4 lean-startup | MVP = concierge acotado (5-10 personas), motor sticky primero, umbral 60%/30% para persevere/iterate/reconsiderar | Confirmado por el usuario — ver EXP-002 en docs/EXPERIMENTS.md |
| 2026-09-28 | 5 good-strategy-bad-strategy | Diagnóstico: el desafío crítico es la falta de canal de acceso a clientes, no el producto (ya construido). Guiding policy: concentrar todo en conseguir 5-10 personas para el piloto concierge antes de tocar features/pricing/posicionamiento | El intake original quería "más ideas" de forma dispersa; este kernel le da un solo hilo conductor accionable |
| 2026-09-28 | 6 blue-ocean-strategy | Ángulo elegido: eliminar las decisiones de diseño por completo para emprendedores que no saben/no quieren diseñar, en vez de competir en profundidad de diseño. Tier de no-clientes a apuntar primero: soon-to-be (ya usan Canva/proceso manual, frustrados) | Se descubrió que "diseño + publicación en un solo lugar" ya no es único — Canva agregó scheduling. Confirmado por el usuario tras plantearle la tensión |
| 2026-09-28 | 7 obviously-awesome | Se descartó "confianza al publicar" como atributo único (probable tabla stakes de Buffer/Later); posicionamiento se apoya en plantillas por rubro + cero decisiones de diseño. Categoría: subcategoría, no nueva (evita education tax) | Confirmado por el usuario tras plantearle la duda sobre el atributo dudoso |
| 2026-09-28 | 8 hundred-million-offers | Offer del piloto concierge sin valores en dólares inventados en los bonos (a diferencia de lo que pide el framework) | El piloto es gratis, sin transacción real — poner cifras habría sido fabricar evidencia, mismo problema que el badge "Popular" ya corregido |
| 2026-09-28 | 9 monetizing-innovation | El usuario pidió poner precios igual pese a no haber evidencia de WTP real, partiendo de los planes ya existentes en Stripe (Free $0 / Starter $19 / Pro $49 / Agency $99) | Decisión explícita del usuario tras plantearle que esta fase, a diferencia de las anteriores, pedía inventar directamente citas de clientes — se resolvió marcando todo como invento total, no evidencia |
| 2026-09-28 | 10 crossing-the-chasm | Beachhead elegido: revendedores/emprendedores de reventa (ropa, tecnología, accesorios) en Instagram/Facebook. Gap más serio encontrado: ninguna plantilla permite subir foto real de producto — se deja sin resolver a propósito hasta tener señal del piloto | Mejor acceso en frío sin comunidad propia, mayor dolor, encaje total con las 2 plantillas ya construidas — confirmado por el usuario |

## Journey completo — las 10 fases tienen status final

Con la Fase 10 cerrada, `create-business` está completo de punta a punta: Fase 1 con evidencia real (job statement), Fases 2-3 diferidas (guía y experiment card listos para cuando el usuario quiera validar), Fases 4-10 corridas con override explícito, todo marcado ⚠️ hipótesis sin validar. Documentos generados: `CUSTOMER.md`, `EXPERIMENTS.md` (EXP-001, EXP-002), `PRODUCT.md` (Vision, MVP), `STRATEGY.md` (kernel, ERRC, beachhead), `POSITIONING.md` (canvas de 5 pasos), `OFFER.md` (Grand Slam Offer del piloto + pricing especulativo).

## Next Actions
- [ ] **La única acción real que falta**: salir a reclutar 5-10 personas del perfil de reventa (brief en `docs/EXPERIMENTS.md` EXP-001/EXP-002) para el piloto concierge. Todo lo demás en este journey son hipótesis esperando esa evidencia para confirmarse, ajustarse, o descartarse.
- [ ] Si el usuario quiere validar antes con conversaciones reales (mom-test/design-sprint, Fases 2-3), la guía y el experiment card ya están listos en `docs/CUSTOMER.md` y `docs/EXPERIMENTS.md`.
- [ ] Cuando haya evidencia real del piloto: revisar con la regla pre-comprometida de EXP-002 (persevere/iterate/reconsiderar) y ajustar STRATEGY.md/POSITIONING.md/OFFER.md según corresponda — hoy son el mejor razonamiento disponible, no verdades confirmadas.

## Nota
2026-09-24: el usuario decidió pausar la validación de negocio (Fases 2-3, que requieren hablar con clientes) y priorizar mejorar la app para "salir a vender" con algo sólido. Se corrió el journey `improve-app` en paralelo (completo, P0-P3 implementados). 2026-09-28: el usuario pidió correr las Fases 4-10 igual, sin esperar esa evidencia, con override explícito de la gate — todo marcado como hipótesis. El journey de negocio queda completo en el papel; la única pieza real que falta es salir a hablar con las 5-10 personas del beachhead elegido.
