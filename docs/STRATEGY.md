# Strategy

⚠️ **Todo este documento es HIPÓTESIS SIN VALIDAR** — corrido con override de la gate de evidencia del journey `create-business` (Fases 2-3 diferidas, sin clientes reales todavía). Ver `docs/CREATE-BUSINESS-PLAN.md` § Key Decisions.

## Diagnosis

Fase 5 (good-strategy-bad-strategy), 2026-09-28.

No tenemos ningún canal para llegar a un emprendedor real que use PostCraft — cero lista, cero comunidad, cero contactos (relevado en el intake de la Fase 1, `docs/CREATE-BUSINESS-PLAN.md`). El producto ya está construido y pulido (journey `improve-app` completo), pero eso no resuelve el problema de acceso a clientes. Cualquier decisión de pricing, posicionamiento o features nuevas es prematura sin resolver esto primero.

**Auditoría de los 4 hallmarks de mala estrategia** (sobre la estrategia implícita seguida hasta ahora — "construir y pulir el producto"):
- **Fluff**: no se detectó — los documentos del proyecto hasta ahora son concretos, no hay lenguaje vacío.
- **Failure to face the challenge**: sí — ningún documento anterior nombró "no tenemos canal de acceso a clientes" como el obstáculo central; el esfuerzo fue a pulir UX (un desafío real, pero secundario frente a este).
- **Mistaking goals for strategy**: parcial — "que la gente use esto y vuelva" es un deseo sin palanca. El guiding policy de abajo le pone una palanca concreta.
- **Bad strategic objectives**: el intake original ("quiero más ideas, de features, de mercado") era disperso — un poco dog's-dinner, sin un solo hilo conductor.

## Guiding Policy

Concentrar todo el esfuerzo de las próximas semanas en conseguir acceso directo a 5-10 emprendedores reales dispuestos a probar el producto acompañados (el piloto concierge de la Fase 4, `docs/EXPERIMENTS.md` EXP-002), usando red personal y comunidades ya existentes.

**Therefore** (lo que esto descarta explícitamente, ver No-List): no features nuevas, no plata en adquisición paga, no perseguir B2B en paralelo, no competir de frente con Canva en su terreno de diseño general, no pricing final, no lanzamiento self-serve público todavía.

## Coherent Actions

| Action | Owner | Due | Status |
|---|---|---|---|
| Reclutar 5-10 personas del perfil ya definido (brief de EXP-001/EXP-002) vía contactos directos y comunidades de emprendedores | Usuario | sin fecha fija (ritmo relajado) | pending |
| Correr el piloto concierge: acompañar personalmente a conectar la cuenta Meta y publicar el primer post real, seguimiento a los 7 días | Usuario | depende de la acción anterior | pending |
| Decidir con la regla pre-comprometida de EXP-002 (persevere / iterate / reconsiderar) antes de tocar pricing, posicionamiento o features | Usuario | depende de la acción anterior | pending |

Las tres se refuerzan entre sí: la 1 alimenta a la 2, y los datos de la 2 alimentan la decisión de la 3 — no tiene sentido saltar a la 3 sin las anteriores.

## No-List

- No construir features nuevas (más tipos de contenido, más redes, IA) hasta correr el piloto concierge.
- No invertir en marketing pago ni SEO todavía.
- No perseguir el segmento B2B/agencias en paralelo, aunque esté contemplado como vía secundaria en el modelo de negocio.
- No definir pricing final ni modificar los planes de Stripe todavía (eso llega en la Fase 9 de este journey, con demanda ya validada).
- No posicionarse compitiendo de frente contra Canva en diseño general — el ángulo es la fricción de saltar entre diseño y publicación para este segmento específico.
- No abrir registro self-serve público todavía.

## Strategy Canvas & ERRC Grid

⚠️ **HIPÓTESIS SIN VALIDAR** — Fase 6 (blue-ocean-strategy), 2026-09-28.

**Corrección sobre el No-List de la Fase 5**: el ángulo original ("diseño + publicación en un solo lugar") ya no es un océano azul — Canva agregó su propia función de scheduling (ya mapeado en `docs/CUSTOMER.md` § Competing Alternatives), así que el incumbente más grande ya cubre esa combinación. El análisis de esta fase encuentra un ángulo distinto, más específico, detallado abajo.

### Strategy Canvas

Factores en los que compite la industria (herramientas de diseño + programación de contenido para redes: Canva, Buffer, Later, Hootsuite):

| Factor | Industria (promedio) | PostCraft hoy | PostCraft propuesto |
|---|---|---|---|
| Profundidad/libertad de diseño | Alta | Baja | **Muy baja (deliberado)** |
| Cantidad de redes soportadas | Alta | Baja (solo IG/FB) | Baja (solo IG/FB, igual) |
| Funciones de colaboración/equipo | Media-Alta | Ninguna | **Ninguna (deliberado)** |
| Analytics/reportes | Media-Alta | Ninguna | Ninguna (por ahora) |
| Precio | Media-Alta | Media-Baja | Media-Baja |
| Plantillas específicas por rubro de negocio | Ninguna | Ninguna | **Alta (nuevo)** |
| Decisiones de diseño que hay que tomar | Muchas | Pocas (ya limitado a 2 tipos) | **Casi ninguna (nuevo)** |
| Confianza/certeza en el momento de publicar | Baja-Media (genérico en toda la industria) | **Alta (ya construido en improve-app)** | Alta |
| Tiempo de idea a post publicado | Medio-Alto (saltar entre herramientas) | Medio | **Muy bajo (nuevo)** |

La curva de PostCraft hoy está por DEBAJO del promedio de la industria en casi todo — no es todavía una curva divergente, es una versión más chica de Canva+Buffer. La curva propuesta diverge deliberadamente: baja donde a este segmento no le importa (libertad de diseño, colaboración, multi-red), y sube donde nadie más lo hace (plantillas por rubro, cero decisiones de diseño, velocidad).

### ERRC Grid

| Eliminar | Reducir |
|---|---|
| Editor de diseño de propósito general (libertad total de mover/personalizar cada elemento) — la mayoría de este segmento no sabe ni quiere diseñar desde cero | Cantidad de tipos de plantilla genéricos — en vez de cubrir "todo tipo de post", especializarse en los 2-3 formatos que este segmento realmente repite |
| Funciones de colaboración/equipo/aprobación — es una herramienta para una sola persona, no una agencia | Soporte multi-red — quedarse en IG+FB (donde vive este segmento) en vez de perseguir LinkedIn/TikTok/Pinterest |

| Elevar | Crear |
|---|---|
| Velocidad de "idea → post publicado" — minutos, no decisiones de diseño en el medio | Plantillas ultra-específicas por rubro de negocio (ej. "oferta de comida", "servicio profesional") en vez de plantillas genéricas — ni Canva ni Buffer hacen esto, son generalistas |
| Confianza en el momento de publicar (ya construido: revisión antes de enviar, mensajes concretos, sin dobles publicaciones — journey `improve-app`) | Cero decisiones de diseño como propuesta central — no una feature entre muchas, sino el motivo de ser del producto |

### Tier de no-clientes a apuntar primero

- **Soon-to-be** (recomendado para el piloto): gente que ya usa Canva o hace el proceso a mano de forma frustrada — ya tienen el hábito de querer publicar, solo les falta que sea más fácil. Son los más rápidos de convertir con un salto de valor chico, y calzan con el foco del piloto concierge (Fase 4/5).
- **Refusing** (más adelante): el no-consumo puro — requiere resolver además la barrera de motivación/hábito, no solo la de herramienta. Más difícil, se ataca después de tener señal de los soon-to-be.
- **Unexplored** (descartado por ahora): profesionales que ni se plantean esto como parte de su negocio — interesante a futuro, pero disperso dado el recurso limitado (usuario solo, sin presupuesto).

## Beachhead

⚠️ **HIPÓTESIS SIN VALIDAR** — Fase 10 (crossing-the-chasm), 2026-09-28.

**Beachhead elegido**: revendedores/emprendedores de reventa de productos (ropa, tecnología, accesorios) que publican con frecuencia en Instagram/Facebook — un recorte angosto dentro del best-fit de la Fase 7.

**Scoring frente a otros candidatos evaluados** (boutiques de ropa propia, gastronomía chica, artesanos):
- **Dolor**: altísimo — publicar seguido es el corazón de su actividad, no algo secundario.
- **Acceso**: el más alto de los candidatos — comunidades públicas y muy activas (grupos de Facebook/WhatsApp de reventa), alcanzables en frío sin presupuesto ni contactos previos (relevante dado que el usuario no tiene ninguna lista/comunidad propia hoy).
- **Boca a boca**: muy alto — se copian tácticas y herramientas entre sí todo el tiempo.
- **Encaje con el producto ya construido**: casi perfecto — su contenido es "producto + precio" u "oferta + descuento", exactamente las 2 plantillas que ya existen (`PostProducto`, `PostOferta`), sin construir nada nuevo — coherente con la guiding policy de la Fase 5.

Boutiques de ropa propia quedaron como segunda opción (buen encaje de producto, algo menos accesibles en frío sin comunidad propia); gastronomía y artesanos, descartados por ahora (comunidades más locales/fragmentadas, más difíciles de alcanzar sin presupuesto).

## Whole-Product Checklist

⚠️ **HIPÓTESIS SIN VALIDAR**. Qué le falta al producto actual para que este beachhead específico lo adopte de verdad.

| Gap | Owner | Priority | Status |
|---|---|---|---|
| **Ninguna plantilla permite subir una foto real de producto** — todas son texto/badges sobre fondos decorativos genéricos. Para un revendedor, la foto del producto es el corazón del post | Usuario | **P0 — pero no arreglar antes del piloto** | No tocar todavía: el piloto concierge (EXP-002) es justo lo que sirve para confirmar si esto es un bloqueante real en el uso, antes de invertir en construirlo (No-List de la Fase 5) |
| Variantes/talles del producto (común en reventa de ropa) no tienen un campo dedicado — solo "Especificaciones" genérico | Usuario | P2 | Revisar según feedback real del piloto, no antes |
| Onboarding 1-a-1 para conectar cuenta y publicar el primer post | Usuario | P0 | Ya cubierto — ver `docs/OFFER.md` (Bono 1 del piloto concierge) |
| Confianza al conectar la cuenta real de Instagram/Facebook | Usuario | P0 | Ya cubierto — journey `improve-app` completo (gating de redes no conectadas, revisión antes de publicar, control de datos en `docs/OFFER.md`) |
| Soporte inmediato ante problemas durante el piloto | Usuario | P0 | Ya cubierto — Bono 3 del piloto concierge, `docs/OFFER.md` |

**Nota**: la mayoría de los gaps "aumentados" (confianza, onboarding, soporte) ya están resueltos por trabajo previo de este mismo proyecto (`improve-app` + la Offer de la Fase 8) — el único gap genuinamente nuevo y potencialmente serio es la falta de fotos de producto, que queda deliberadamente sin resolver hasta tener señal real del piloto.
