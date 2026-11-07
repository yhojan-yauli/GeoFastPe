# API de autenticacion - GeoFastPe

Base URL: `http://localhost:8080`

Autenticacion con **OTP por SMS**. El registro crea la cuenta y el login vuelve a pedir un codigo.

## Proveedores de SMS

Configura con la variable `OTP_PROVIDER`:

| Valor | Descripcion |
|---|---|
| `log` (default) | No envia SMS; imprime el codigo en la consola. Ideal para desarrollo. |
| `textbelt` | SMS real con la key gratuita `textbelt` (1 envio por dia por IP). |
| `twilio` | SMS real con credito de prueba de Twilio (solo numeros verificados en trial). |

En desarrollo, con `app.otp.expose-code=true` la respuesta incluye `devCode` para poder probar sin SMS.

### Configuracion Twilio (trial gratuito)

```powershell
$env:OTP_PROVIDER="twilio"
$env:TWILIO_ACCOUNT_SID="AC..."
$env:TWILIO_AUTH_TOKEN="..."
$env:TWILIO_FROM_NUMBER="+1..."
$env:OTP_EXPOSE_CODE="false"
.\gradlew.bat bootRun
```

En la consola de Twilio (trial) debes **verificar** cada numero destino antes de enviar.

## Flujo de registro

```
1. POST /api/v1/auth/register/request-otp   { "phone": "987654321" }
2. POST /api/v1/auth/register/verify        { "phone": "987654321", "code": "123456", "fullName": "Juan Perez" }
3. Usar el token devuelto en  Authorization: Bearer <token>
```

## Flujo de login

```
1. POST /api/v1/auth/login/request-otp      { "phone": "987654321" }
2. POST /api/v1/auth/login/verify           { "phone": "987654321", "code": "123456" }
```

El telefono se normaliza a E.164: `987654321` -> `+51987654321`.

---

## POST /api/v1/auth/register/request-otp

**200 OK**

```json
{
  "message": "Codigo enviado al ****4321",
  "expiresInSeconds": 300,
  "devCode": "123456"
}
```

`devCode` solo aparece si `app.otp.expose-code=true`.

Errores:
- `409 PHONE_ALREADY_REGISTERED` - el numero ya tiene cuenta.
- `429 OTP_COOLDOWN` - esperar antes de pedir otro codigo.
- `400 VALIDATION_ERROR` / `INVALID_ARGUMENT` - telefono invalido.

## POST /api/v1/auth/register/verify

**201 Created**

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresInSeconds": 86400,
  "user": {
    "id": 1,
    "phone": "+51987654321",
    "fullName": "Juan Perez",
    "role": "USER",
    "phoneVerified": true,
    "active": true,
    "createdAt": "2026-11-07T15:00:00Z",
    "lastLoginAt": "2026-11-07T15:00:00Z"
  }
}
```

Errores:
- `400 OTP_INVALID` - codigo incorrecto (incluye intentos restantes).
- `400 OTP_EXPIRED` - codigo vencido.
- `400 OTP_NOT_FOUND` - no hay codigo vigente.
- `429 OTP_TOO_MANY_ATTEMPTS` - supero el maximo de intentos.

## POST /api/v1/auth/login/request-otp

**200 OK**

```json
{
  "message": "Codigo enviado al ****4321",
  "expiresInSeconds": 300,
  "devCode": "123456"
}
```

Errores:
- `404 PHONE_NOT_REGISTERED` - el numero no tiene cuenta.

## POST /api/v1/auth/login/verify

**200 OK** - mismo formato que el registro.

## GET /api/v1/auth/me

Requiere `Authorization: Bearer <token>`.

**200 OK**

```json
{
  "id": 1,
  "phone": "+51987654321",
  "fullName": "Juan Perez",
  "role": "USER",
  "phoneVerified": true,
  "active": true,
  "createdAt": "2026-11-07T15:00:00Z",
  "lastLoginAt": "2026-11-07T15:00:00Z"
}
```

## GET /api/v1/users/me y PATCH /api/v1/users/me

`PATCH` recibe `{ "fullName": "Nuevo Nombre" }`.

## Endpoints de administrador

Requieren que el usuario tenga rol `ADMIN`.

- `GET /api/v1/admin/users`
- `PATCH /api/v1/admin/users/{id}/role` con `{ "role": "ADMIN" }`

## Como crear el primer ADMIN

1. Registra la cuenta con el telefono que sera admin.
2. Define `ADMIN_PHONE` y reinicia el backend:

```powershell
$env:ADMIN_PHONE="987654321"
.\gradlew.bat bootRun
```

El `AdminSeeder` promueve esa cuenta a `ADMIN` al arrancar.

## Codigos de error

| HTTP | code | Descripcion |
|---|---|---|
| 400 | VALIDATION_ERROR | Datos de entrada invalidos |
| 400 | INVALID_ARGUMENT | Telefono invalido |
| 400 | OTP_INVALID / OTP_EXPIRED / OTP_NOT_FOUND | Problema con el codigo |
| 401 | UNAUTHORIZED | Falta token o es invalido |
| 403 | FORBIDDEN | Sin permisos (rol insuficiente) |
| 404 | PHONE_NOT_REGISTERED / USER_NOT_FOUND | No encontrado |
| 409 | PHONE_ALREADY_REGISTERED | Numero ya registrado |
| 429 | OTP_COOLDOWN / OTP_TOO_MANY_ATTEMPTS | Limite de envios/intentos |
| 500 | INTERNAL_ERROR | Error inesperado |
