# Stripe Setup – PostCraft

Esta guía cubre todo lo necesario para configurar Stripe en PostCraft, desde crear la cuenta hasta procesar pagos en producción.

---

## 1. Crear cuenta y proyecto en Stripe

1. Ve a [dashboard.stripe.com](https://dashboard.stripe.com) y crea una cuenta (o inicia sesión).
2. Stripe te coloca automáticamente en **modo test** al crear la cuenta. Verás el indicador "Test mode" en la barra superior derecha.
3. **Modo test vs producción**:
   - **Test**: las claves empiezan con `sk_test_` y `pk_test_`. Los pagos no son reales. Usa este modo para desarrollo y QA.
   - **Producción**: las claves empiezan con `sk_live_` y `pk_live_`. Solo activa este modo cuando el producto esté listo para usuarios reales.
4. Para cambiar entre modos usa el toggle "Test mode / Live mode" en el dashboard.

> Siempre usa claves de test en el archivo `.env` de desarrollo. Nunca pongas claves live en el repositorio.

---

## 2. Crear productos y precios en Stripe

PostCraft tiene tres planes. El plan Free no se crea en Stripe (no tiene cargo). Los planes Pro y Agency se crean como productos con precio recurrente.

| Plan   | Precio    | Posts/mes   | Redes          | Programación |
|--------|-----------|-------------|----------------|--------------|
| Free   | $0        | 10          | IG + FB        | No           |
| Pro    | $19/mes   | 100         | IG + FB        | Sí           |
| Agency | $49/mes   | Ilimitado   | IG + FB        | Sí           |

### Crear el plan Pro

1. En el dashboard ve a **Products** → **Add product**.
2. Completa:
   - **Name**: `PostCraft Pro`
   - **Description**: `100 posts/mes, programación de publicaciones`
3. En la sección **Pricing**:
   - **Pricing model**: Standard pricing
   - **Price**: `19.00` USD
   - **Billing period**: Monthly
4. Haz clic en **Save product**.
5. En la página del producto verás el **Price ID** con formato `price_xxxxxxxxxxxxxxxxxx`.
6. Copia ese valor y ponlo en tu `.env` como `STRIPE_PRICE_PRO=price_xxxxxxxx`.

### Crear el plan Agency

1. **Products** → **Add product**.
2. Completa:
   - **Name**: `PostCraft Agency`
   - **Description**: `Posts ilimitados, programación de publicaciones`
3. En **Pricing**:
   - **Price**: `49.00` USD
   - **Billing period**: Monthly
4. Guarda y copia el Price ID.
5. Ponlo en `.env` como `STRIPE_PRICE_AGENCY=price_xxxxxxxx`.

---

## 3. Variables de entorno necesarias

Agrega estas variables a `backend/.env` (copia desde `backend/.env.example`):

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_AGENCY=price_...
```

### Dónde encontrar cada valor

| Variable               | Dónde obtenerla                                                                                   |
|------------------------|---------------------------------------------------------------------------------------------------|
| `STRIPE_SECRET_KEY`    | Dashboard → Developers → API keys → **Secret key** (haz clic en "Reveal test key")               |
| `STRIPE_WEBHOOK_SECRET`| Se obtiene al ejecutar `stripe listen` (desarrollo) o al registrar el endpoint (producción)       |
| `STRIPE_PRICE_PRO`     | Dashboard → Products → PostCraft Pro → sección Pricing → columna **Price ID**                    |
| `STRIPE_PRICE_AGENCY`  | Dashboard → Products → PostCraft Agency → sección Pricing → columna **Price ID**                 |

> El `STRIPE_WEBHOOK_SECRET` de desarrollo (generado por `stripe listen`) empieza con `whsec_` y es distinto al de producción. Debes actualizarlo cuando despliegues.

---

## 4. Configurar webhooks

### Desarrollo local con Stripe CLI

1. Instala la [Stripe CLI](https://stripe.com/docs/stripe-cli):
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe

   # Linux (Debian/Ubuntu)
   curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
   echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee /etc/apt/sources.list.d/stripe.list
   sudo apt update && sudo apt install stripe
   ```

2. Autentica con tu cuenta:
   ```bash
   stripe login
   ```

3. Inicia el forwarding de eventos al backend local:
   ```bash
   stripe listen --forward-to localhost:3000/webhooks/stripe
   ```

4. La CLI imprimirá en consola el webhook secret de desarrollo:
   ```
   > Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxx (^C to quit)
   ```
   Copia ese valor a `STRIPE_WEBHOOK_SECRET` en tu `.env`.

5. Deja `stripe listen` corriendo mientras desarrollas. Cada evento de Stripe será reenviado a tu servidor local.

### Producción

1. Ve a Dashboard → **Developers** → **Webhooks** → **Add endpoint**.
2. En **Endpoint URL** escribe la URL pública de tu backend:
   ```
   https://api.tu-dominio.com/webhooks/stripe
   ```
3. En **Events to send** selecciona:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.paid`
4. Haz clic en **Add endpoint**.
5. En la página del endpoint recién creado, haz clic en **Reveal** junto a **Signing secret** y copia el valor `whsec_...` a tu variable de entorno de producción.

---

## 5. Flujo de upgrade

```
Usuario hace clic en "Upgrade"
        │
        ▼
POST /plans/upgrade  { plan: "pro" }
        │
        ├─ Busca o crea Stripe Customer (guarda stripe_customer_id en DB)
        │
        ▼
Stripe Checkout Session creada
        │
        ▼
Frontend redirige a session.url  (página de pago de Stripe)
        │
        ▼
Usuario completa el pago en Stripe
        │
        ├─ Stripe envía evento  checkout.session.completed
        │
        ▼
POST /webhooks/stripe  (evento recibido y verificado)
        │
        ├─ setUserPlan(userId, "pro")
        ├─ saveStripeIds(userId, { customerId, subscriptionId })
        │
        ▼
Usuario redirigido a  /settings?upgrade=success
```

### Endpoints involucrados

| Método | Ruta                  | Descripción                                              |
|--------|-----------------------|----------------------------------------------------------|
| GET    | `/plans`              | Lista los 3 planes con precios y features                |
| GET    | `/plans/current`      | Plan actual del usuario, posts usados y límite mensual   |
| POST   | `/plans/upgrade`      | Crea Stripe Checkout Session y devuelve `{ url }`        |
| POST   | `/plans/portal`       | Crea Stripe Billing Portal session para gestionar plan   |
| POST   | `/webhooks/stripe`    | Recibe eventos de Stripe (requiere raw body)             |

---

## 6. Testing

### Tarjetas de prueba

Usa estas tarjetas durante el checkout en modo test (cualquier fecha futura de vencimiento y CVC):

| Número de tarjeta      | Resultado                                 |
|------------------------|-------------------------------------------|
| `4242 4242 4242 4242`  | Pago exitoso                              |
| `4000 0000 0000 0002`  | Tarjeta declinada                         |
| `4000 0025 0000 3155`  | Requiere autenticación 3D Secure          |
| `4000 0000 0000 9995`  | Fondos insuficientes                      |

### Simular webhooks con Stripe CLI

Con `stripe listen` corriendo puedes disparar eventos manualmente:

```bash
# Simular checkout completado
stripe trigger checkout.session.completed

# Simular suscripción cancelada
stripe trigger customer.subscription.deleted

# Simular pago fallido
stripe trigger invoice.payment_failed

# Simular renovación exitosa
stripe trigger invoice.paid
```

Para ver todos los eventos disponibles:
```bash
stripe trigger --help
```

### Verificar el flujo completo manualmente

1. Inicia el backend: `npm run dev`
2. En otra terminal: `stripe listen --forward-to localhost:3000/webhooks/stripe`
3. Llama al endpoint de upgrade:
   ```bash
   curl -X POST http://localhost:3000/plans/upgrade \
     -H "Authorization: Bearer <tu_jwt>" \
     -H "Content-Type: application/json" \
     -d '{"plan": "pro"}'
   ```
4. Abre la `url` devuelta en el navegador y completa el pago con `4242 4242 4242 4242`.
5. Observa los logs del webhook en la terminal de `stripe listen`.

---

## 7. Portal del cliente (Stripe Customer Portal)

El Customer Portal permite a los usuarios gestionar su suscripción directamente desde una página alojada por Stripe: cambiar plan, cancelar, actualizar método de pago, ver historial de facturas.

### Activarlo en el dashboard

1. Ve a Dashboard → **Settings** → **Billing** → **Customer portal**.
2. Activa el portal y configura:
   - **Cancellation**: permite a los usuarios cancelar su suscripción.
   - **Plan switching**: permite cambiar entre planes Pro y Agency.
   - **Invoice history**: muestra facturas pasadas.
3. Guarda los cambios.

### Usar el portal desde PostCraft

```bash
# El usuario hace POST a /plans/portal
curl -X POST http://localhost:3000/plans/portal \
  -H "Authorization: Bearer <tu_jwt>" \
  -H "Content-Type: application/json" \
  -d '{"returnUrl": "http://localhost:5173/settings"}'

# Respuesta:
# { "url": "https://billing.stripe.com/session/..." }
```

Redirige al usuario a esa URL. Al terminar, Stripe lo devuelve a `returnUrl`.

> El portal solo funciona para usuarios que ya tienen un `stripe_customer_id` en la base de datos (es decir, que han completado al menos un checkout).

---

## Resumen de migraciones de base de datos necesarias

Asegúrate de que la tabla `users` tenga estas columnas:

```sql
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS stripe_customer_id     TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_failed         BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS plan                   TEXT    NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS posts_this_month       INT     NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS billing_cycle_start    DATE    NOT NULL DEFAULT CURRENT_DATE;
```
