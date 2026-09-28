# Experiments

## Experiment Cards

### EXP-001 — Sprint de validación: flujo diseño + publicación en un solo lugar

- **Hypothesis**: Creemos que emprendedores que manejan solos las redes de su negocio van a completar armar-y-programar un post sin ayuda si el flujo junta diseño y publicación en un solo lugar, porque hoy abandonan ese proceso al tener que saltar entre herramientas.
- **Type**: sprint
- **Primary metric & threshold (pre-committed)**: de 5 personas testeadas, ≥4 completan la tarea de armar+programar un post sin ayuda ni explicación, **y** ≥3 dicen espontáneamente (sin que se les pregunte directo) que reemplazarían alguna herramienta/proceso actual por esto.
- **Guardrail metric**: si ≥3 de 5 expresan desconfianza fuerte en "que se programe solo y salga mal" sin que se les pregunte, es señal de resolver esa ansiedad antes de seguir avanzando.
- **Decision rule (pivot / persevere / iterate)**:
  - ≥4/5 completan + ≥3/5 reemplazarían → **build** (pasar a Fase 4, MVP)
  - 2-3/5 completan pero con fricción notoria en el mismo paso → **fix** ese paso puntual y re-testear (no hace falta un sprint nuevo completo)
  - ≤1/5 completa o nadie muestra intención de reemplazar nada → **walk away** / revisar el concepto (volver a Fase 1 o 2)
- **Result & verdict**: _pendiente — awaiting-evidence._

#### Mapa del lunes

**Meta a 2 años**: emprendedores que hoy llevan sus redes solos usan esto cada semana para armar y publicar contenido, y dejan de sentir que sus redes están abandonadas.

**Preguntas del sprint (riesgos a testear)**:
- ¿Esto cambia el comportamiento de alguien que hoy no publica con constancia, o lo prueban una vez y lo abandonan igual que otras herramientas?
- ¿"Diseño + publicación en un solo lugar" es lo que realmente falta, o el problema de fondo es otro (falta de ideas de qué postear, falta de tiempo, falta de disciplina)?
- ¿Confían en dejar un post programado y que salga solo, o quieren revisar/aprobar cada uno antes de que se publique?
- ¿El dolor alcanza para que abandonen Canva/apps nativas/nada y adopten algo nuevo?

**Target customer**: mismo segmento amplio de docs/CUSTOMER.md — emprendedor/a o dueño/a de negocio chico que maneja sus propias redes sin diseñador ni community manager.

**Target moment**: todo el tramo entre "se me ocurrió algo para publicar" y "quedó programado/publicado" — ahí es donde hoy gana el no-consumo.

**Nota práctica**: como PostCraft ya tiene un flujo real construido (el editor existente), no hace falta fabricar una fachada desde cero — conviene usar un recorte del flujo real (crear post → completar campos → programar) como prototipo de la sesión de testeo.

#### Script de 5 actos — sin explicar el prototipo

1. **Bienvenida** (2 min) — aclarar que se testea el prototipo, no a ellos; pedir permiso para grabar/tomar notas.
2. **Contexto** (5 min) — "Contame cómo armaste y publicaste tu última pieza de contenido" (saltear si ya se hizo la entrevista de mom-test con esta persona).
3. **Presentar sin explicar** (5 min) — mostrar el flujo y preguntar: "¿Qué es esto? ¿Para qué te parece que sirve?" No aclarar nada.
4. **Tarea** (15 min) — pedirle que arme y programe un post ficticio de su propio negocio usando el flujo, sin ayuda. Si se traba: "¿Qué harías ahora?", "¿Qué estás pensando?" — nunca ayudar.
5. **Cierre** (5 min) — "¿Qué te pareció?", "¿Para quién te parece que es esto?", "¿Qué reemplazarías de lo que usás hoy por esto, si algo?"

#### Brief de reclutamiento

- **Perfil**: dueño/a o único/a encargado/a de las redes de un negocio o emprendimiento chico, sin diseñador ni community manager.
- **Screener**: ¿quién arma el contenido de tus redes? ¿usás Canva u otra herramienta de diseño? ¿programás tus publicaciones o las subís en el momento?
- **Cantidad**: reclutar 6 para absorber 1 ausencia, testear 5.
- **Canales**: contactos directos, grupos de emprendedores (Facebook/WhatsApp), networking local.
- **Incentivo**: acceso gratis anticipado a PostCraft, o algo simbólico tipo vale/café.

### EXP-002 — Piloto concierge: ¿vuelven a publicar? ⚠️ HIPÓTESIS SIN VALIDAR

Fase 4 (lean-startup) del journey create-business, 2026-09-28 — corrida con override de la gate de evidencia (Fases 2-3 diferidas, ver `docs/CREATE-BUSINESS-PLAN.md`). Reusa el mismo perfil de reclutamiento que EXP-001.

- **Hypothesis**: Creemos que emprendedores que manejan solos las redes de su negocio van a publicar un segundo post real dentro de los 7 días de publicar el primero, si los acompañamos personalmente (concierge) en su primer uso, porque eso demuestra que el hábito reemplaza al no-consumo.
- **Type**: concierge
- **Primary metric & threshold (pre-committed)**: de 5-10 personas onboardeadas a mano, ≥60% publica un segundo post real (no de prueba) dentro de 7 días.
- **Guardrail metric**: capturar cualitativamente el motivo de abandono de cualquiera que no vuelva — no solo contar que no volvió.
- **Decision rule (pivot / persevere / iterate)**:
  - ≥60% publica un 2do post → **persevere** (avanzar hacia un lanzamiento semi-público)
  - 30-59% → **iterate** sobre el punto de fricción específico observado, no hace falta pivotar
  - <30% → **reconsiderar** el job o el segmento (Fase 1/Fase 7) — señal de que el job no pesa lo suficiente como para sostener el hábito
- **Result & verdict**: _pendiente — awaiting-evidence. No se corrió todavía; este card queda listo para cuando el usuario quiera salir a reclutar._

## Experiment Backlog

| Idea | ICE (impact/confidence/ease) | Status |
|---|---|---|
| Mostrar cuenta destino (avatar+handle) antes de publicar | 5/5/3 | shipped 2026-09-25 |
| Tarjeta de revisión final antes de enviar/programar | 5/5/3 | shipped 2026-09-25 |
| Reemplazar emojis del selector de plantilla por thumbnails reales | 4/4/2 | shipped 2026-09-28 (componentes reales escalados, no imágenes estáticas) |
| Validar caption contra el límite de cada red | 3/4/4 | shipped 2026-09-28 (Instagram 2200 / Facebook 63206, toma el más chico de las redes seleccionadas) |
| Aclarar huso horario en el campo de programación | 2/3/5 | shipped 2026-09-28 (zona IANA + offset UTC detectados del navegador) |
| Ocultar/quitar la campanita de notificaciones sin función | 2/5/5 | shipped 2026-09-28 |
| Link "Reconectar cuenta" en el mensaje de error de publicación | 2/4/4 | shipped 2026-09-28 |
| Vaciar/marcar como ejemplo los valores por defecto del editor y bloquear publicar mientras sigan sin editar | 5/5/2 | shipped 2026-09-24 (vaciado; el bloqueo de "publicar sin editar" del hallazgo #2 de Fase 3 sigue pendiente) |
| Requerir caption o campo editado antes de habilitar "Publicar ahora" | 4/5/4 | shipped 2026-09-28 (bloquea con mensaje explicativo en vez de deshabilitar sin explicación) |
| Snackbar "Deshacer" al borrar un post | 3/4/3 | shipped 2026-09-28 (soft-delete optimista, ventana de 5s, sin endpoint nuevo) |
| Label de texto junto al ícono de borrar en PostCard | 1/5/5 | backlog |
| Cambiar text-slate-500 a slate-400 en texto secundario/meta (falla contraste AA) | 2/5/5 | shipped 2026-09-28 |
| Deshabilitar/resetear el botón de publicar tras éxito (evita doble-publicación) | 4/5/3 | shipped 2026-09-25 (cooldown de 5s, no reset de campos) |
| Cambiar texto del botón publicar durante loading ("Publicando…") | 2/5/5 | shipped 2026-09-25 |
| Anclar el feedback de éxito/error al botón de publicar | 2/4/3 | shipped 2026-09-28 (éxito ahora vive en el botón mismo; error sigue en tarjeta aparte, que sigue teniendo sentido para un mensaje más largo) |
| Reemplazar alert() de error al exportar PNG por tarjeta inline | 2/5/4 | shipped 2026-09-28 |
| Loading state en el botón "Confirmar" de borrado | 1/5/4 | shipped 2026-09-28 |
| Transición al aparecer el campo de fecha de programación | 1/5/5 | shipped 2026-09-28 |
| Momento de firma: rediseñar la confirmación de "publicado con éxito" | 4/3/2 | shipped 2026-09-28 (el botón se convierte en la confirmación, con animación) |
| Reescribir mensaje de éxito al publicar con red concreta ("Se publicó en Instagram") | 3/4/5 | shipped 2026-09-25 |
| Reescribir mensaje de éxito al programar con fecha/hora/redes concretas | 3/4/5 | shipped 2026-09-25 |
| Renombrar label "Contenido del diseño" → "Qué va a decir tu post" | 1/4/5 | shipped 2026-09-28 |
| Prefijar "Ejemplo: " en los valores semilla del editor (si se mantienen) | 2/4/5 | no aplica — se eligió vaciar los campos en vez de mantenerlos (ver fila arriba, 2026-09-24) |
| Sacar el badge "Popular" hardcodeado del plan Pro (sin datos reales que lo respalden) | 3/5/5 | shipped 2026-09-25 |
| Code-splitting por ruta (React.lazy + Suspense) | 1/4/3 | shipped 2026-09-28 |
| No ofrecer como toggle una red no conectada en el Editor; guiar a Configuración | 5/5/3 | shipped 2026-09-24 |
| Reemplazar alert() de "Eliminar cuenta" por un flujo real | 2/5/3 | shipped 2026-09-28 |
| Cortar el código muerto del template "tip" en FieldsPanel | 1/5/5 | shipped 2026-09-28 |
