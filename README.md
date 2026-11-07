# GeoFastPe
hackaton_comercio2026 en desarrollo

## Ramas

| Rama | Contenido | Quién pushea |
|---|---|---|
| `main` | Integración final (ambos proyectos) | Nadie hace push: solo se mergean Pull Requests |
| `backend` | Solo `backend/` | Desarrolladores backend |
| `frontend` | Solo `frontend/` | Desarrolladores frontend |

`main` está protegida por los hooks del repo: **ningún push directo está permitido**.
Solo el owner integra los cambios mergeando los Pull Requests.

## Primeros pasos (una vez por clon)

```powershell
git clone https://github.com/yhojan-yauli/GeoFastPe.git
cd GeoFastPe
.\scripts\setup-hooks.ps1
```

En Linux/macOS:

```sh
./scripts/setup-hooks.sh
```

## Flujo de trabajo

Backend:

```sh
git switch backend
git pull
# ...trabajar dentro de backend/...
git add .
git commit -m "feat: mi cambio"
git push
```

Frontend:

```sh
git switch frontend
git pull
# ...trabajar dentro de frontend/...
git add .
git commit -m "feat: mi cambio"
git push
```

Para integrar, abre un **Pull Request** de `backend` o `frontend` hacia `main`.
El owner lo revisa y lo mergea.

## Reglas que aplican los hooks (`.githooks/`)

- Push a `main`: **bloqueado** para todos.
- Push a una rama distinta de la actual: **bloqueado** (backend no puede subir a frontend ni al revés).
- Borrar ramas remotas: **bloqueado**.
- Commit de archivos de `frontend/` estando en `backend` (o viceversa): **bloqueado**.
- Commit directo en `main`: **bloqueado**.
