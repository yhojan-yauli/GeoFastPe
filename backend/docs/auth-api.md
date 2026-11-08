# API de autenticacion - GeoFastPe

Base URL: `http://localhost:8080`

Swagger UI: `http://localhost:8080/swagger-ui.html` | OpenAPI JSON: `http://localhost:8080/v3/api-docs`

Autenticacion con **correo o telefono + contrasena** y **JWT**.
El registro crea la cuenta y devuelve un token listo para usar.

## Resumen rapido

| Metodo | Ruta | Que hace | Requiere token |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Crea la cuenta y devuelve JWT | No |
| `POST` | `/api/v1/auth/login` | Inicia sesion y devuelve JWT | No |
| `GET` | `/api/v1/auth/me` | Devuelve el usuario autenticado | Si |

## Reglas del registro

- `fullName`: obligatorio, maximo 120 caracteres.
- `email`: opcional, pero debe ser valido y unico.
- `phone`: opcional, pero debe ser valido y unico.
- **Debes enviar al menos uno de los dos: `email` o `phone`.**
- `password`: obligatorio, entre 8 y 64 caracteres.
- El telefono se normaliza a formato E.164: `987654321` -> `+51987654321`.
- El correo se guarda en minusculas.

## POST /api/v1/auth/register

### Solo con correo

```json
{
  "fullName": "Juan Perez",
  "email": "juan@correo.com",
  "password": "miClave123"
}
```

### Solo con telefono

```json
{
  "fullName": "Juan Perez",
  "phone": "987654321",
  "password": "miClave123"
}
```

### Con ambos

```json
{
  "fullName": "Juan Perez",
  "email": "juan@correo.com",
  "phone": "987654321",
  "password": "miClave123"
}
```

**201 Created**

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresInSeconds": 86400,
  "user": {
    "id": 1,
    "fullName": "Juan Perez",
    "email": "juan@correo.com",
    "phone": "+51987654321",
    "role": "USER",
    "active": true,
    "createdAt": "2026-11-08T05:00:00Z",
    "lastLoginAt": "2026-11-08T05:00:00Z"
  }
}
```

La respuesta **nunca** incluye la contrasena ni su hash.

Errores:

- `400 IDENTIFIER_REQUIRED` - no enviaste correo ni telefono.
- `400 VALIDATION_ERROR` - datos invalidos (correo, telefono o contrasena).
- `400 INVALID_ARGUMENT` - telefono con formato invalido.
- `409 EMAIL_ALREADY_REGISTERED` - el correo ya tiene cuenta.
- `409 PHONE_ALREADY_REGISTERED` - el telefono ya tiene cuenta.

## POST /api/v1/auth/login

Envia **correo o telefono** en el campo `identifier`.

### Con correo

```json
{
  "identifier": "juan@correo.com",
  "password": "miClave123"
}
```

### Con telefono

```json
{
  "identifier": "987654321",
  "password": "miClave123"
}
```

**200 OK** - mismo formato que el registro.

Errores:

- `400 VALIDATION_ERROR` - falta `identifier` o `password`.
- `401 INVALID_CREDENTIALS` - el usuario no existe o la contrasena es incorrecta.
- `403 USER_INACTIVE` - la cuenta esta desactivada.

## GET /api/v1/auth/me

Requiere:

```
Authorization: Bearer <token>
```

**200 OK**

```json
{
  "id": 1,
  "fullName": "Juan Perez",
  "email": "juan@correo.com",
  "phone": "+51987654321",
  "role": "USER",
  "active": true,
  "createdAt": "2026-11-08T05:00:00Z",
  "lastLoginAt": "2026-11-08T05:00:00Z"
}
```

Errores:

- `401 UNAUTHORIZED` - falta el token o es invalido/expirado.

## Probar en Swagger UI

1. Ejecuta el backend: `.\gradlew.bat bootRun`
2. Abre `http://localhost:8080/swagger-ui.html`
3. Despliega **Autenticacion** -> `POST /api/v1/auth/register`
4. Pulsa **Try it out**, completa el JSON y pulsa **Execute**
5. Copia el valor de `token` de la respuesta
6. Pulsa el boton **Authorize** (arriba a la derecha)
7. Pega el token **sin** la palabra `Bearer` y confirma
8. Prueba `GET /api/v1/auth/me`

## Codigos de error

| HTTP | code | Descripcion |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Datos invalidos o JSON malformado |
| 400 | `IDENTIFIER_REQUIRED` | Falta correo y telefono en el registro |
| 400 | `INVALID_ARGUMENT` | Telefono con formato invalido |
| 401 | `UNAUTHORIZED` | Falta token o es invalido |
| 401 | `INVALID_CREDENTIALS` | Usuario o contrasena incorrectos |
| 403 | `USER_INACTIVE` | Cuenta desactivada |
| 404 | `USER_NOT_FOUND` / `NOT_FOUND` | Recurso no encontrado |
| 405 | `METHOD_NOT_ALLOWED` | Metodo HTTP no permitido |
| 409 | `EMAIL_ALREADY_REGISTERED` | Correo ya registrado |
| 409 | `PHONE_ALREADY_REGISTERED` | Telefono ya registrado |
| 409 | `CONFLICT` | Conflicto de integridad |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | Content-Type no soportado |
| 500 | `INTERNAL_ERROR` | Error inesperado |

Formato de error:

```json
{
  "status": 401,
  "code": "INVALID_CREDENTIALS",
  "message": "Correo/telefono o contrasena incorrectos.",
  "timestamp": "2026-11-08T05:00:00Z",
  "details": []
}
```
