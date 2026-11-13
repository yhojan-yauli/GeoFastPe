# Backend

Solo codigo del backend (API, base de datos, logica).
No agregar codigo de frontend aqui.

## Stack

- Java 21 + Spring Boot 4.1.2 (Spring Security 7)
- Gradle 9.8.2 (wrapper incluido)
- JPA + H2 (desarrollo) / MySQL (perfil `mysql`)
- JWT (HMAC, 24h)
- Registro y login con **correo o telefono + contrasena**

## Ejecutar en desarrollo

```powershell
cd backend
.\gradlew.bat bootRun
```

La API queda en `http://localhost:8080` y la consola H2 en `http://localhost:8080/h2-console`
(JDBC URL: `jdbc:h2:file:./data/geofastpe`, usuario `sa`, sin password).

## Flujo de autenticacion

1. `POST /api/v1/auth/register` con nombre, contrasena y al menos correo o telefono.
2. La respuesta incluye un `token` JWT.
3. Envia `Authorization: Bearer <token>` en los endpoints protegidos.
4. `GET /api/v1/auth/me` devuelve el usuario autenticado.
5. Para volver a entrar: `POST /api/v1/auth/login` con `{ "identifier": "...", "password": "..." }`.

El `identifier` del login acepta correo o telefono. El telefono se normaliza
a formato E.164 (`987654321` -> `+51987654321`).

## Ejecutar con MySQL

```powershell
$env:DB_USERNAME="root"
$env:DB_PASSWORD="tu_password"
.\gradlew.bat bootRun --args="--spring.profiles.active=mysql"
```

## Variables de entorno principales

| Variable | Default | Descripcion |
|---|---|---|
| `SERVER_PORT` | `8080` | Puerto HTTP |
| `DB_URL` / `DB_USERNAME` / `DB_PASSWORD` | H2 local | Conexion a base de datos |
| `JWT_SECRET` | secreto dev | Minimo 32 caracteres |
| `JWT_EXPIRATION_MS` | `86400000` | Duracion del token (24h) |
| `CORS_ALLOWED_ORIGINS` | localhost 5173/3000/4200 | Origenes permitidos |

## Documentacion de la API

Ver [`docs/auth-api.md`](docs/auth-api.md).

### Swagger UI

Con el backend corriendo:

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

Para probar endpoints protegidos:

1. Ejecuta `POST /api/v1/auth/register` o `POST /api/v1/auth/login` en Swagger.
2. Copia el valor de `token`.
3. Clic en **Authorize** (arriba a la derecha).
4. Pega solo el token JWT (sin la palabra `Bearer`) y confirma.
5. Repite la peticion: Swagger enviara `Authorization: Bearer <token>`.

## Reiniciar la base de datos local

Si cambiaste el esquema o quieres empezar de cero, deten el backend y borra:

```powershell
Remove-Item -Recurse -Force data
```

H2 la recrea automaticamente al arrancar.
