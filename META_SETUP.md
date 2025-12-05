# Meta (Facebook / Instagram) Integration Setup — PostCraft

This document walks through every step needed to integrate PostCraft with the
Meta platform so that users can publish posts to their Facebook Pages and
Instagram Business accounts.

---

## Table of Contents

1. [Crear la Meta App](#1-crear-la-meta-app)
2. [Configurar productos](#2-configurar-productos)
3. [Variables de entorno necesarias](#3-variables-de-entorno-necesarias)
4. [Configurar OAuth Redirect URIs](#4-configurar-oauth-redirect-uris)
5. [Permisos y App Review](#5-permisos-y-app-review)
6. [Usuarios de prueba](#6-usuarios-de-prueba)
7. [Flujo técnico completo](#7-flujo-técnico-completo)
8. [Endpoints de la Meta Graph API usados](#8-endpoints-de-la-meta-graph-api-usados)
9. [Límites de la API](#9-límites-de-la-api)
10. [Checklist de Go-Live](#10-checklist-de-go-live)

---

## 1. Crear la Meta App

### Requisitos previos

- Una cuenta en [developers.facebook.com](https://developers.facebook.com).
  Si no tienes una, regístrate usando tu cuenta personal de Facebook. La
  cuenta personal NO se comparte con los usuarios; solo sirve para
  autenticarte como desarrollador.
- Una cuenta de Business Manager en
  [business.facebook.com](https://business.facebook.com) (recomendado para
  apps en producción).

### Pasos

1. **Acceder al portal de desarrolladores**
   Ir a https://developers.facebook.com y hacer clic en **"My Apps"** (esquina
   superior derecha). Se muestra un panel con todas tus apps actuales.

2. **Crear una nueva app**
   Hacer clic en el botón verde **"Create App"**. Aparece un wizard de tres
   pasos.

3. **Seleccionar el tipo de app**
   El wizard pregunta "What do you want your app to do?". Seleccionar
   **"Business"**. Esta opción habilita los permisos de Pages e Instagram Graph
   API necesarios para PostCraft.
   > No elegir "Consumer" (solo da permisos básicos de perfil) ni "Gaming"
   > (no aplica).

4. **Completar los datos básicos**
   - **App name**: `PostCraft` (o el nombre de tu instancia).
   - **App contact email**: una dirección de email que revises regularmente;
     Meta la usa para notificaciones de seguridad y de revisión.
   - **Business Account**: vincular tu Business Manager si ya lo tienes. Si no
     tienes uno aún, se puede omitir y asociarlo más adelante desde
     *App Settings > Basic*.

5. **Confirmar creación**
   Hacer clic en **"Create App"**. Meta puede pedir verificación de contraseña
   o código 2FA. Una vez confirmado, aterrizas en el **App Dashboard**.

   En el App Dashboard verás:
   - Una barra lateral izquierda con la lista de productos disponibles.
   - El panel central con métricas de uso (vacías por ahora).
   - La sección **"App ID"** y **"App Secret"** en *Settings > Basic*.

---

## 2. Configurar productos

### 2.1 Facebook Login

1. En la barra lateral del App Dashboard, hacer clic en **"Add Product"**.
2. Localizar el tile **"Facebook Login"** y hacer clic en **"Set Up"**.
3. En la pantalla de quickstart, seleccionar **"Web"**.
4. Ingresar la URL de tu sitio (ej. `http://localhost:3000`) y guardar.
5. En la barra lateral aparece ahora **"Facebook Login > Settings"**.
   Asegurarse de que:
   - **"Login with the JavaScript SDK"** esté OFF (no lo usamos; usamos el
     flujo server-side de OAuth).
   - **"Enforce HTTPS"** esté ON en producción (off es aceptable en desarrollo
     con localhost).
   - **"Valid OAuth Redirect URIs"** esté configurado (ver sección 4).

### 2.2 Instagram Graph API vs Instagram Basic Display

PostCraft necesita publicar contenido en cuentas de Instagram de tipo
**Business** o **Creator**. Para esto se requiere **Instagram Graph API**, NO
Instagram Basic Display.

| Característica               | Instagram Basic Display | Instagram Graph API   |
|------------------------------|-------------------------|-----------------------|
| Tipo de cuenta soportada     | Personal                | Business / Creator    |
| Publicar posts               | No                      | Si                    |
| Acceder a métricas           | No                      | Si                    |
| Requiere Facebook Page       | No                      | Si (la cuenta IG debe estar vinculada a una Page) |
| Revisión de Meta requerida   | Menor                   | Mayor (para producción) |

**Para PostCraft: siempre usar Instagram Graph API.**

#### Agregar Instagram Graph API

1. En el App Dashboard, hacer clic en **"Add Product"**.
2. Localizar **"Instagram Graph API"** y hacer clic en **"Set Up"**.
3. No hay configuración adicional inmediata; los permisos se gestionan en
   *App Review > Permissions and Features*.

> Nota: si ves también "Instagram Basic Display" como opción, ignorarlo para
> PostCraft.

---

## 3. Variables de entorno necesarias

Agregar las siguientes variables al archivo `backend/.env` (usar
`backend/.env.example` como plantilla):

```env
# ─── Meta / Facebook / Instagram ─────────────────────────────────────────────
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
META_CALLBACK_URL=http://localhost:3000/auth/meta/callback

# ─── Frontend URL (para redirect post-OAuth) ──────────────────────────────────
FRONTEND_URL=http://localhost:5173
```

### Dónde encontrar cada valor

| Variable          | Dónde encontrarlo en el dashboard                                                  |
|-------------------|------------------------------------------------------------------------------------|
| `META_APP_ID`     | App Dashboard > **Settings > Basic** > campo "App ID" (arriba del todo)            |
| `META_APP_SECRET` | App Dashboard > **Settings > Basic** > campo "App Secret" > clic en "Show"         |
| `META_CALLBACK_URL` | Lo defines tú. Debe coincidir exactamente con lo configurado en *Facebook Login > Settings > Valid OAuth Redirect URIs* |
| `FRONTEND_URL`    | La URL base de tu SPA React (Vite usa puerto 5173 por defecto)                     |

> Nunca subas `META_APP_SECRET` a un repositorio público. Asegúrate de que
> `.env` esté en `.gitignore`.

---

## 4. Configurar OAuth Redirect URIs

### Dónde configurarlas

1. En el App Dashboard, ir a **Facebook Login > Settings** (barra lateral
   izquierda).
2. En el campo **"Valid OAuth Redirect URIs"** agregar las URIs autorizadas.
3. Hacer clic en **"Save Changes"** (botón azul abajo a la derecha).

### URIs a agregar

| Entorno     | URI                                              |
|-------------|--------------------------------------------------|
| Desarrollo  | `http://localhost:3000/auth/meta/callback`       |
| Staging     | `https://staging.tu-dominio.com/auth/meta/callback` |
| Producción  | `https://tu-dominio.com/auth/meta/callback`      |

> Meta es estricto con estas URIs: si el `redirect_uri` enviado en la petición
> OAuth no coincide exactamente (incluyendo protocolo, dominio, puerto y path)
> con alguna de las entradas, el callback falla con `error=redirect_uri_mismatch`.

### También configurar en App Settings > Basic

En **Settings > Basic** existe un campo **"App Domains"**. Agregar los dominios
(sin protocolo) usados en las redirect URIs:
- `localhost`
- `tu-dominio.com`

---

## 5. Permisos y App Review

### Permisos usados por PostCraft

| Permiso                      | Propósito                                              | Requiere revisión |
|------------------------------|--------------------------------------------------------|-------------------|
| `public_profile`             | Nombre y foto del usuario                              | No                |
| `email`                      | Email del usuario para crear cuenta                    | No                |
| `pages_manage_posts`         | Publicar en páginas de Facebook                        | Si                |
| `pages_read_engagement`      | Leer estadísticas de posts en páginas                  | Si                |
| `instagram_basic`            | Acceso básico a la cuenta de Instagram Business        | Si                |
| `instagram_content_publish`  | Publicar fotos/reels/carruseles en Instagram Business  | Si                |

### Modo desarrollo (sin App Review)

Mientras la app está en modo **Development** (no ha pasado por revisión),
solo pueden autenticarse:

- Los **admins** de la app (quien la creó y otros roles agregados en
  *App Roles > Roles*).
- Los **usuarios de prueba** creados desde *Roles > Test Users*.

Esto es suficiente para desarrollar y testear la integración completa.

### Cómo verificar el modo actual

En el App Dashboard, la barra superior muestra una pastilla verde con la
leyenda **"In development"** o azul con **"Live"**.

Para pasar a **Live** (necesario para que usuarios reales puedan autorizar la
app), hay que completar el App Review de cada permiso que lo requiera.

### Solicitar App Review para producción

1. Ir a **App Review > Permissions and Features** en el App Dashboard.
2. Para cada permiso que necesite revisión, hacer clic en **"Request"**.
3. Completar el formulario de cada permiso:
   - **Descripción del uso**: explicar concretamente por qué PostCraft necesita
     ese permiso (ej. "PostCraft programa posts en Facebook Pages del usuario y
     necesita `pages_manage_posts` para crear publicaciones mediante la API").
   - **Video de demostración**: grabar un screencast mostrando el flujo
     completo (login, conexión de página, publicación de post).
   - **Instrucciones de prueba**: pasos exactos para que el revisor de Meta
     pueda reproducir el flujo.
4. Enviar la solicitud. Meta suele responder en 5-10 días hábiles.

> Consejo: preparar una cuenta de demostración con una página de Facebook y
> una cuenta de Instagram Business vinculada, accesibles para el equipo de
> revisión de Meta.

---

## 6. Usuarios de prueba

### Crear un Test User

1. En el App Dashboard, ir a **Roles > Test Users**.
2. Hacer clic en **"Add"**.
3. Configurar:
   - **Number of test users**: 1 (o los que necesites).
   - **Authorize test users for this app**: activar.
   - **App Permissions for this test user**: seleccionar todos los permisos
     que PostCraft solicita.
4. Hacer clic en **"Create"**. Meta genera usuarios del tipo
   `test-user-xxxxxxxxxx@tfbnw.net`.

### Editar/usar un Test User

En la lista de test users, cada entrada tiene un botón **"Edit"** con opciones:
- **"Change name"**: cambiar el nombre para display.
- **"Change password"**: asignar una contraseña para poder iniciar sesión con
  esa cuenta.
- **"Get Access Token"**: obtener un token de acceso para pruebas en la Graph
  API Explorer.

Para probar el flujo OAuth completo de PostCraft, usar **"Change password"**
para asignar una contraseña y luego iniciar el flujo desde
`http://localhost:3000/auth/meta` usando esas credenciales.

### Conectar una cuenta de Instagram de prueba

Las cuentas de Instagram de prueba reales deben ser del tipo Business o Creator
y estar vinculadas a una Facebook Page. Para pruebas en desarrollo:

1. Crear una página de Facebook de prueba desde la cuenta del test user (en
   Facebook, ir a *Pages > Create New Page*).
2. Conectar una cuenta de Instagram existente (Business o Creator) a esa página:
   - En la página de Facebook, ir a **Settings > Instagram**.
   - Hacer clic en **"Connect Account"** y autenticarse con la cuenta IG.
3. Una vez conectada, el endpoint `GET /me/accounts` retornará esa página con
   el campo `instagram_business_account` poblado.

> Nota: Meta no ofrece cuentas de Instagram "sandbox" creadas artificialmente.
> Se necesita una cuenta real de Instagram convertida a Business/Creator.

---

## 7. Flujo técnico completo

### Diagrama ASCII

```
+----------+         +------------------+         +--------------------+
|          |         |                  |         |                    |
|  Usuario |         |  PostCraft       |         |  Meta OAuth        |
|  (SPA)   |         |  Backend         |         |  (graph.facebook)  |
|          |         |                  |         |                    |
+----+-----+         +--------+---------+         +---------+----------+
     |                        |                             |
     | 1. Clic "Conectar Meta"|                             |
     |----------------------->|                             |
     |                        |                             |
     |                        | 2. GET /auth/meta           |
     |                        | passport.authenticate()     |
     |                        | construye URL de autorización
     |                        |----------------------------->|
     |                        |                             |
     |  3. Redirect al usuario al diálogo de OAuth de Meta  |
     |<----------------------------------------------------|
     |                        |                             |
     | 4. Usuario acepta permisos en Meta                   |
     |----------------------------------------------------->|
     |                        |                             |
     |   5. Meta redirige a   |                             |
     |   /auth/meta/callback  |                             |
     |   ?code=XXXXX          |                             |
     |----------------------->|                             |
     |                        |                             |
     |                        | 6. Intercambiar code por    |
     |                        |    access_token (short)     |
     |                        |----------------------------->|
     |                        |<-----------------------------|
     |                        |                             |
     |                        | 7. Exchangiar short-lived   |
     |                        |    por long-lived token     |
     |                        |    (60 dias)                |
     |                        |----------------------------->|
     |                        |<-----------------------------|
     |                        |                             |
     |                        | 8. GET /me/accounts         |
     |                        |    (páginas del usuario)    |
     |                        |----------------------------->|
     |                        |<-----------------------------|
     |                        |                             |
     |                        | 9. Para cada página:        |
     |                        |    GET /{page-id}           |
     |                        |    ?fields=instagram_       |
     |                        |    business_account         |
     |                        |    (incluido en /me/accounts|
     |                        |    con el campo correcto)   |
     |                        |----------------------------->|
     |                        |<-----------------------------|
     |                        |                             |
     |                        | 10. Guardar en meta_tokens  |
     |                        |     (user_access_token,     |
     |                        |      page_access_token,     |
     |                        |      ig_user_id, etc.)      |
     |                        |                             |
     |                        | 11. Firmar JWT              |
     |                        |                             |
     |  12. Redirect al SPA:  |                             |
     |  /auth/callback        |                             |
     |  ?token={jwt}          |                             |
     |<-----------------------|                             |
     |                        |                             |
     | 13. SPA extrae token,  |                             |
     |     lo guarda en       |                             |
     |     localStorage y     |                             |
     |     redirige al        |                             |
     |     dashboard          |                             |
     |                        |                             |
```

### Notas sobre el paso 8-9

`tokenService.fetchPagesAndIgAccounts` usa el campo inline
`instagram_business_account{id,username}` directamente en la llamada a
`/me/accounts`, por lo que en realidad se hace una sola llamada a la Graph API
para obtener tanto las páginas como los `ig_user_id` asociados. No se necesita
una segunda llamada por página separada.

---

## 8. Endpoints de la Meta Graph API usados

| Endpoint                        | Método | Descripción                                                    | Parámetros clave                                              |
|---------------------------------|--------|----------------------------------------------------------------|---------------------------------------------------------------|
| `/oauth/access_token`           | GET    | Intercambiar el `?code` de callback por un access token        | `client_id`, `client_secret`, `redirect_uri`, `code`         |
| `/oauth/access_token`           | GET    | Intercambiar short-lived token por long-lived token (60 días)  | `grant_type=fb_exchange_token`, `client_id`, `client_secret`, `fb_exchange_token` |
| `/me`                           | GET    | Obtener perfil del usuario autenticado                         | `fields=id,name,email,picture`, `access_token`               |
| `/me/accounts`                  | GET    | Listar páginas de Facebook administradas por el usuario        | `fields=id,name,access_token,instagram_business_account{id,username}`, `access_token` |
| `/{page-id}/feed`               | POST   | Publicar un post de texto o link en una página de Facebook     | `message`, `link` (opcional), `access_token` (page token)    |
| `/{page-id}/photos`             | POST   | Publicar una foto en una página de Facebook                    | `url` o `source`, `caption`, `access_token`                  |
| `/{ig-user-id}/media`           | POST   | Crear un container de media en Instagram (paso 1 de publicación) | `image_url` o `video_url`, `caption`, `media_type`, `access_token` |
| `/{ig-user-id}/media_publish`   | POST   | Publicar el container creado (paso 2 de publicación)           | `creation_id`, `access_token`                                 |
| `/{ig-user-id}/media`           | GET    | Listar posts publicados en Instagram                           | `fields=id,caption,media_type,timestamp`, `access_token`     |
| `/{ig-media-id}/insights`       | GET    | Obtener métricas de un post de Instagram                       | `metric=impressions,reach,likes`, `access_token`             |

Todos los endpoints usan la URL base: `https://graph.facebook.com/v18.0/`

---

## 9. Límites de la API

### Rate Limits de Instagram Graph API

Meta aplica dos tipos principales de límites:

#### 9.1 Límites por usuario (User-Level Rate Limiting)

Cada access token de usuario tiene un límite basado en el número de llamadas
en una ventana de tiempo. Meta usa un sistema de "puntos" que se recuperan
gradualmente:

- Cada llamada consume un punto.
- El límite típico es de **200 llamadas por hora** por token de usuario.
- El encabezado de respuesta `X-App-Usage` indica el porcentaje de uso actual:
  ```
  X-App-Usage: {"call_count":15,"total_cputime":2,"total_time":3}
  ```

#### 9.2 Límites de publicación en Instagram

- **Máximo 25 posts por cuenta por 24 horas** (suma de fotos, videos, reels
  y carruseles).
- **Máximo 50 stories por cuenta por 24 horas**.
- Los límites se aplican a nivel de cuenta de Instagram, no de token.

#### 9.3 Límites de la app (App-Level Rate Limiting)

Si la app supera cierto volumen de llamadas globales, Meta puede aplicar
throttling a nivel de app. En el App Dashboard, el panel **"App Activity"**
muestra el uso en tiempo real.

### Qué pasa cuando se alcanza el límite

Meta devuelve un error HTTP 400 con el siguiente cuerpo:
```json
{
  "error": {
    "message": "(#32) Page request limit reached",
    "type": "OAuthException",
    "code": 32,
    "fbtrace_id": "..."
  }
}
```

O para el límite de usuario:
```json
{
  "error": {
    "message": "User request limit reached",
    "type": "OAuthException",
    "code": 17,
    "fbtrace_id": "..."
  }
}
```

### Cómo manejarlos en el código

```js
// En el servicio que llama a la Graph API:
try {
  const { data } = await axios.post(url, payload);
  return data;
} catch (err) {
  const apiError = err.response?.data?.error;

  if (apiError?.code === 17 || apiError?.code === 32) {
    // Rate limit alcanzado — re-encolar el post para más tarde
    // Usar exponential backoff o encolar en Redis/BullMQ
    throw new RateLimitError('Meta API rate limit reached', {
      retryAfter: 3600, // 1 hora en segundos
      originalError: apiError,
    });
  }

  if (apiError?.code === 190) {
    // Token inválido o expirado — marcar al usuario para reautenticación
    throw new TokenExpiredError('Meta access token expired', {
      userId,
      originalError: apiError,
    });
  }

  throw err;
}
```

**Estrategia recomendada para PostCraft:**

1. Los posts programados se encolan con BullMQ. Si la publicación falla por
   rate limit (`code 17` o `code 32`), el job se reintenta con backoff
   exponencial (delays de 5 min, 15 min, 1 hora).
2. Si el token expiró (`code 190`), el job falla permanentemente y se notifica
   al usuario en la UI para que reconecte su cuenta.
3. Revisar el header `X-App-Usage` antes de hacer llamadas en batch y pausar
   si el `call_count` supera el 80%.

---

## 10. Checklist de Go-Live

Antes de desplegar PostCraft a producción con usuarios reales, verificar cada
ítem:

### App de Meta

- [ ] La app está en modo **Live** (no "Development") en el App Dashboard.
- [ ] El App Review fue aprobado para todos los permisos que lo requieren:
  - [ ] `pages_manage_posts`
  - [ ] `pages_read_engagement`
  - [ ] `instagram_basic`
  - [ ] `instagram_content_publish`
- [ ] El campo **"Privacy Policy URL"** está configurado en *Settings > Basic*
      y apunta a la política de privacidad real de PostCraft.
- [ ] El campo **"Terms of Service URL"** está configurado en *Settings > Basic*.
- [ ] El campo **"App Icon"** (1024x1024 px) está subido.
- [ ] La **categoría de la app** está configurada correctamente (ej.
      "Business and Pages").
- [ ] **Business Verification** completada en Business Manager (requerida para
      algunos permisos avanzados).

### Configuración técnica

- [ ] `META_CALLBACK_URL` en producción apunta al dominio real con HTTPS
      (`https://tu-dominio.com/auth/meta/callback`).
- [ ] La URI de producción está agregada en *Facebook Login > Settings >
      Valid OAuth Redirect URIs*.
- [ ] El dominio de producción está en *Settings > Basic > App Domains*.
- [ ] `FRONTEND_URL` en producción apunta al dominio del frontend con HTTPS.
- [ ] `META_APP_SECRET` está almacenado como secret en el gestor de secretos
      del servidor (no en variables de entorno en texto plano si es posible).
- [ ] **"Enforce HTTPS"** está activado en *Facebook Login > Settings*.

### Seguridad

- [ ] El `state` CSRF está implementado en el flujo OAuth (passport-facebook
      lo maneja automáticamente con `enableProof: true` en combinación con la
      sesión o un nonce explícito).
- [ ] El JWT se almacena en `httpOnly` cookie en producción (o en
      `localStorage` con XSS mitigado), y tiene un tiempo de expiración
      razonable.
- [ ] Los tokens de Meta se almacenan cifrados en la base de datos (o al
      menos la columna `user_access_token` en `meta_tokens` está protegida a
      nivel de acceso).
- [ ] No hay `APP_SECRET` ni tokens de Meta en los logs del servidor.

### Monitoreo

- [ ] Se han configurado alertas para errores `code 190` (token expirado) de
      modo que el equipo sea notificado cuando muchos usuarios necesiten
      reautenticar.
- [ ] Se monitorea `X-App-Usage` para detectar acercamiento a rate limits.
- [ ] Hay un job recurrente (ej. diario) que refresca tokens próximos a expirar
      usando `refreshTokenIfNeeded` del `tokenService`.

### Pruebas finales

- [ ] Flujo OAuth completo probado con una cuenta real de Facebook que tenga
      al menos una página con Instagram Business conectado.
- [ ] Publicación de un post de prueba en Facebook Page verificada.
- [ ] Publicación de un post de prueba en Instagram Business verificada.
- [ ] Flujo de error (usuario cancela el OAuth) manejado correctamente en
      el frontend.
- [ ] El refresh automático de tokens funciona correctamente.
