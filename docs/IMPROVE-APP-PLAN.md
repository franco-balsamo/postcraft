# Improve App Plan

## Context

- **Fecha de inicio**: 2026-09-24
- **App**: PostCraft — construida y funcional, todavía no en producción / sin usuarios reales.
- **Por qué este journey**: el usuario pausó `create-business` (docs/CREATE-BUSINESS-PLAN.md) porque no quiere hablar con clientes por ahora — prioriza pulir la app para "salir a vender" con algo sólido.
- **Zona más rústica (intake)**: UI amateur en la parte de armar publicaciones para redes sociales.
- **Evidencia disponible**: ninguna (sin grabaciones, sin analytics, sin usuarios reales todavía) — las Fases 2-5 corren como auditoría del agente, no sobre evidencia de uso real.
- **Plataforma**: solo web (React/Vite) — Fase 8 (high-perf-browser) aplica normal; se saltea la opcional `ios-hig-design`.
- **Superficies de venta**: pantalla de planes (free/pro/enterprise); el usuario confirma que lo que dice hoy es correcto, solo "muy sencilla" — no es un problema de honestidad, es de desarrollo/pulido.
- **Flujo más preocupante**: armar y programar un post (Editor: CanvasPreview, FieldsPanel, PublishPanel, templates).
- **Docs existentes reutilizados**: `docs/CUSTOMER.md` (job statement de Fase 1 de `create-business`, sin validar con clientes reales — se extiende acá, no se recrea).

## Phase Status
| Phase | Skill | Status | Artifact | Date |
|---|---|---|---|---|
| 1 | jobs-to-be-done | done | CUSTOMER.md | 2026-09-24 |
| 2 | ux-heuristics | done | DESIGN.md, EXPERIMENTS.md | 2026-09-24 |
| 3 | design-everyday-things | done | DESIGN.md, EXPERIMENTS.md | 2026-09-24 |
| 4 | refactoring-ui | done | DESIGN.md, EXPERIMENTS.md | 2026-09-24 |
| 5 | microinteractions | done | DESIGN.md, EXPERIMENTS.md | 2026-09-24 |
| 6 | made-to-stick | done | POSITIONING.md, EXPERIMENTS.md | 2026-09-24 |
| 7 | influence-psychology | done | POSITIONING.md, EXPERIMENTS.md | 2026-09-24 |
| 8 | high-perf-browser | done | DESIGN.md, EXPERIMENTS.md | 2026-09-24 |
| 9 | steve-jobs-design-review | done | PRODUCT.md, DESIGN.md, EXPERIMENTS.md | 2026-09-24 |
Statuses: pending · in-progress · awaiting-evidence · done · deferred: <reason> · skipped: <reason>

## Key Decisions
| Date | Phase | Decision | Rationale |
|---|---|---|---|
| 2026-09-24 | Intake | Foco inicial: el flujo de armar y programar un post (Editor) | Es la zona que el usuario marcó como más rústica y la que más le preocupa |
| 2026-09-24 | Intake | Fase 7 (persuasión) queda de menor prioridad | La pantalla de planes ya es honesta hoy, solo le falta desarrollo — no hay tácticas engañosas que corregir con urgencia |
| 2026-09-24 | 1 Re-anchor on the job | Dimensión peor: Emocional (falta de confianza/contexto al publicar). Tipo de fallo: Little Hire (uso repetido, no solo primera impresión) | Confirmado con el usuario — orienta las Fases 2-5 a priorizar hallazgos que afecten la confianza en el momento de publicar por sobre pulido puramente visual |
| 2026-09-24 | 2 ux-heuristics | Puntaje 5/10; 7 hallazgos aprobados sin cambios, todos a backlog | Sin bloqueantes (severidad 4) — se prioriza arreglar en Fase 3-5 según orden severidad×frecuencia, no todo de una |
| 2026-09-24 | 3 design-everyday-things | Hallazgo de severidad 4 encontrado: valores default del editor son indistinguibles de contenido real | Es el hallazgo más grave del journey hasta ahora — combinado con la falta de revisión final (Fase 2), permite publicar contenido de ejemplo a una cuenta real sin darse cuenta |
| 2026-09-24 | 4 refactoring-ui | Sistema de diseño ya maduro (contraste verificado, radios consistentes, badges bien resueltos) — único hallazgo real: `slate-500` falla contraste AA (4.04:1) | Confirma la sospecha inicial: el problema no era la paleta/tipografía, era confianza y contenido (Fases 2-3) |
| 2026-09-24 | 5 microinteractions | Nuevo hallazgo severidad 3: sin cooldown/reset tras publicar con éxito, riesgo de doble-publicación. Momento de firma elegido: la confirmación de "publicado con éxito" | El riesgo de doble-post es un problema de Rules, no solo de pulido — se suma a los hallazgos de severidad 3-4 de Fases 2-3 |
| 2026-09-24 | 6 made-to-stick | Puntaje SUCCESs ~5/10 — los mensajes de éxito genéricos no refuerzan la confianza en el momento que más lo necesita (dimensión emocional, Fase 1); el resto del copy ya está bien | Confirma que el foco sigue siendo confianza/contenido, no jerga — las reescrituras de esta fase refuerzan directamente los fixes de Fase 2 (#1, #2) |
| 2026-09-24 | 7 influence-psychology | Badge "Popular" del plan Pro está hardcodeado sin datos reales que lo respalden — se decide sacarlo por ahora | Gate de ética del framework: ninguna prueba social puede ser fabricada, aunque el impacto actual sea cero (todavía no hay usuarios viéndolo) |
| 2026-09-24 | 8 high-perf-browser | Performance real (sin throttling simulado): LCP 842ms, CLS ~0, TBT 0ms, score 99/100 — todo pasa con margen. Único hallazgo: sin code-splitting por ruta (severidad 1, no urgente) | Se levantó Docker/Colima y se corrió Lighthouse real (Puppeteer programático) contra `/editor` autenticado — no son estimaciones. La app nunca tuvo un problema de performance |
| 2026-09-24 | 9 steve-jobs-design-review | Veredicto: NOT DONE (4/10). Hallazgo nuevo no visto en fases anteriores: el Editor deja publicar a redes no conectadas sin guiar al usuario a conectar antes (P0, junto con el contenido de ejemplo de Fase 3) | Las fases 1-8 auditaron el Editor de forma aislada; el walkthrough de punta a punta de esta fase (registro → dashboard → editor → publicar) encontró un gap que ninguna auditoría por pantalla podía ver |

## Journey cerrado — Exit checklist

- [x] Las 9 fases están `done` (ninguna quedó `deferred`/`skipped`)
- [x] `CUSTOMER.md` re-ancla el job y nombra dónde la app no cumple por dimensión (Fase 1)
- [x] `DESIGN.md` tiene hallazgos UX, tokens/componentes, inventario de microinteracciones y filas de performance, todas con owner/prioridad implícito en severidad
- [x] `POSITIONING.md` § Key Messages tiene el copy in-app y la superficie de persuasión, con cada claim de escasez/prueba social verificado como real (badge "Popular" marcado para sacar)
- [x] Cada cambio propuesto es una fila de `EXPERIMENTS.md` con ICE, y `PRODUCT.md` § Outcome Roadmap tiene la lista de cortes y arreglos priorizada del veredicto final

## Next Actions (post-journey — implementación, no planificación)
1. [x] [P0] Gating de redes no conectadas en el Editor + guía a Configuración — implementado en `PublishPanel.jsx` (2026-09-24): red no conectada se muestra como no-clickeable con link a `/settings`; `connectedSelectedNetworks` filtra el payload de publish para que nunca se envíe una red sin conectar, aunque quede en el estado por default. Verificado en vivo (Docker + Puppeteer): screenshot + click real navega a `/settings`. Tests y lint del frontend en verde.
2. [x] [P0] Resolver contenido de ejemplo indistinguible de real (Fase 3) — implementado en `editorStore.js` (2026-09-24): `fields` inicial y `resetEditor()` vacíos; los `placeholder` correctos ya existían en `FieldsPanel.jsx`, solo hacía falta destapar el hueco. Los templates ya tenían fallback genérico (`'Nombre del Producto'`, `'$0'`) para campos vacíos. Verificado con screenshot real.
3. [x] [P1] Confirmación de cuenta destino + revisión final + cooldown tras publicar (Fases 2, 5) — implementado en `PublishPanel.jsx` (2026-09-25): tarjeta de revisión (`reviewing`) muestra red + handle real (`@usuario`/nombre de página) y fecha/hora antes de un segundo click de confirmación; cooldown de 5s tras el éxito bloquea un doble-submit sin tocar los campos. Bonus fix: programar sin elegir fecha ya no publicaba de inmediato en silencio — ahora bloquea con mensaje claro. Verificado en vivo: screenshot de la tarjeta con `@febtechstore`, click real a "Confirmar publicación", path de error probado (400 esperado, sin token real de Meta).
4. [x] [P1] Mensajes de éxito concretos (Fase 6) — implementado: usa un snapshot (`lastPublish`) de qué se envió realmente para decir "Se publicó en Instagram." o "Se publicará el {fecha} en {redes}.", en vez del genérico anterior. Botón también cambia texto durante loading ("Publicando…"/"Programando…", hallazgo cosmético de Fase 5 resuelto de paso.
   [x] [P1] Sacar badge "Popular" (Fase 7) — implementado en `Settings.jsx`: se quitó el flag `popular` y el bloque JSX muerto que lo renderizaba (no dejar código inerte). Verificado: la palabra "Popular" ya no aparece en la pantalla de planes.
5. [x] [P2] Implementado 2026-09-28: selector de plantillas con miniaturas reales (componentes escalados, no imágenes), contraste slate-500→slate-400 (42 usos en 14 archivos), corte de código muerto del template "tip", corte de la campanita sin función, flujo honesto de "Eliminar cuenta" (sin `alert()`), loading state en confirmar borrado, transición del campo de fecha, code-splitting por ruta (bundle principal 104.22→87.76 kB gzip). Bonus: ícono de "Publicar ahora" se veía como triángulo de alerta, corregido a avión de papel. Todo verificado con tests, lint y screenshots reales (Docker + Puppeteer).
6. [x] [P3] Implementado 2026-09-28: validación de caption por red (Instagram 2200/Facebook 63206), aclaración de huso horario (zona IANA + UTC del navegador), link "Reconectar cuenta" en error de publicar, snackbar "Deshacer" al borrar post (soft-delete optimista con ventana de 5s, sin endpoint nuevo), momento de firma — el botón de publicar se convierte en la confirmación con animación (resuelve a la vez "anclar feedback al botón"), tarjeta de error inline al exportar PNG (reemplaza `alert()`), label "Qué va a decir tu post", bloqueo de "Publicar" si no hay caption ni campos completados. Único pendiente de todo el journey: label de texto junto al ícono de borrar en `PostCard` (bajo impacto, no priorizado). Todo verificado con lint, tests, y screenshots reales — incluida una corrida con mock de red para ver el estado de éxito sin depender de credenciales reales de Meta.

## Journey de mejora — completo
Con esto, las 9 fases de `improve-app` y sus fixes P0/P1/P2/P3 están implementados. Ver `docs/PRODUCT.md` § Outcome Roadmap para el estado final de cada hallazgo.
- [ ] Limpieza: se creó un usuario de prueba `lighthouse-test@postcraft.local` en la DB de dev durante la Fase 8 — sin impacto, pero queda ahí si se quiere borrar
