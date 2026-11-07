# Backend

Solo codigo del backend (API, base de datos, logica).
No agregar codigo de frontend aqui.

## Stack

- Java 21 + Spring Boot 4.1.2 (Spring Security 7)
- Gradle 9.8.2 (wrapper incluido)
- JPA + H2 (desarrollo) / MySQL (perfil `mysql`)
- JWT (HS256, 24h)
- OTP por SMS (`log`, `textbelt` o `twilio`)

## Ejecutar en desarrollo

```powershell
cd backend
.\gradlew.bat bootRun
```

La API queda en `http://localhost:8080` y la consola H2 en `http://localhost:8080/h2-console`
(JDBC URL: `jdbc:h2:file:./data/geofastpe`, usuario `sa`, sin password).

Con el proveedor `log` (default), el codigo OTP se imprime en la consola y tambien
se devuelve en el campo `devCode` de la respuesta (solo si `OTP_EXPOSE_CODE=true`).

## Ejecutar con MySQL

```powershell
$env:DB_USERNAME="root"
$env:DB_PASSWORD="tu_password"
.\gradlew.bat bootRun --args="--spring.profiles.active=mysql"
```

## Habilitar SMS real

### Textbelt (gratis, 1 SMS por dia)

```powershell
$env:OTP_PROVIDER="textbelt"
$env:TEXTBELT_KEY="textbelt"
$env:OTP_EXPOSE_CODE="false"
.\gradlew.bat bootRun
```

### Twilio (credito de prueba gratuito)

```powershell
$env:OTP_PROVIDER="twilio"
$env:TWILIO_ACCOUNT_SID="AC..."
$env:TWILIO_AUTH_TOKEN="..."
$env:TWILIO_FROM_NUMBER="+1..."
$env:OTP_EXPOSE_CODE="false"
.\gradlew.bat bootRun
```

En Twilio trial solo se puede enviar a numeros verificados en la consola.

## Variables de entorno principales

| Variable | Default | Descripcion |
|---|---|---|
| `SERVER_PORT` | `8080` | Puerto HTTP |
| `DB_URL` / `DB_USERNAME` / `DB_PASSWORD` | H2 local | Conexion a base de datos |
| `JWT_SECRET` | secreto dev | Minimo 32 caracteres |
| `JWT_EXPIRATION_MS` | `86400000` | Duracion del token (24h) |
| `OTP_PROVIDER` | `log` | `log`, `textbelt` o `twilio` |
| `OTP_EXPOSE_CODE` | `true` | Devuelve `devCode` en la respuesta (solo desarrollo) |
| `CORS_ALLOWED_ORIGINS` | localhost 5173/3000/4200 | Origenes permitidos |
| `ADMIN_PHONE` | vacio | Promueve esa cuenta a ADMIN al arrancar |

## Documentacion de la API

Ver [`docs/auth-api.md`](docs/auth-api.md).

## Tests

```powershell
.\gradlew.bat test
```
