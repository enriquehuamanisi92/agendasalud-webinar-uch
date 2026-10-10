# Guía paso a paso para publicar AgendaSalud en la nube

**Ruta recomendada para tu webinar: GitHub (código) → Neon (PostgreSQL) → Render (aplicación Node.js con interfaz y API).**

Esta guía se actualizó en octubre de 2026. Los nombres de los botones de los proveedores pueden variar ligeramente. Todos los servicios requieren crear una cuenta; **no se ha creado ningún recurso ni se ha publicado el proyecto en tu nombre**.

## 1. Antes de empezar: comprueba la versión local

En tu computadora con Windows:

1. Instala **Node.js 24 LTS** desde <https://nodejs.org/>.
2. Extrae el archivo ZIP del proyecto. Entra a la carpeta que contiene `server.js` y `package.json`.
3. Abre PowerShell dentro de esa carpeta (Explorador → barra de dirección → escribe `powershell` → Enter).
4. Ejecuta:

   ```powershell
   node --version
   npm start
   ```

5. Abre <http://localhost:5055>. Comprueba que aparezcan 12 citas iniciales.
6. Abre <http://localhost:5055/api/citas>; debe devolver JSON.
7. Presiona `Ctrl + C` para detener la app cuando termines.

**Por qué esta primera prueba:** si no funciona en local, es más difícil diagnosticarlo en la nube.

## 2. Publica el código en GitHub (sin secretos)

1. Entra a <https://github.com/> y crea o inicia sesión en tu cuenta.
2. Selecciona `New repository` (o `+` → `New repository`).
3. Nombre sugerido: `agendasalud-webinar-uch`.
4. Elige `Private` o `Public` según tus necesidades. Para demostrar, ambos pueden funcionar si autorizas a Render a acceder.
5. Crea el repositorio.
6. La forma recomendada es subir el código desde PowerShell en la carpeta que contiene `server.js`:

   ```powershell
   git init
   git add .
   git commit -m "Proyecto AgendaSalud para webinar UCH"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/agendasalud-webinar-uch.git
   git push -u origin main
   ```

7. Reemplaza `TU_USUARIO` por tu nombre de usuario real de GitHub. Si Git solicita autor o correo, configúralos siguiendo sus instrucciones.
8. Comprueba que se vean `server.js`, `package.json`, `public/` y `docs/`.

**Muy importante:** no subas `.env`, contraseñas, `DATABASE_URL`, `node_modules` ni `agenda_demo.sqlite`. El archivo `.gitignore` incluido excluye esos elementos de la publicación normal.

**Alternativa sin comandos Git:** dentro de tu repositorio de GitHub, usa `Add file` → `Upload files` y sube **el contenido** de la carpeta del proyecto (no el ZIP sin extraer). Mantén las subcarpetas `public`, `tests` y `docs`.

## 3. Crea una base de datos PostgreSQL en Neon

1. Abre <https://console.neon.tech/>.
2. Inicia sesión y crea un proyecto nuevo. Nombre sugerido: `agendasalud-uch`.
3. Usa una región adecuada para tus necesidades. Neon creará una base PostgreSQL administrada.
4. En el panel del proyecto, pulsa **Connect**.
5. Copia la **connection string** completa (preferentemente *pooled* si la interfaz permite elegirla). Tendrá esta forma **ilustrativa**:

   ```text
   postgresql://USUARIO:CLAVE@HOST.neon.tech/BASE?sslmode=require
   ```

6. Guarda la cadena en un gestor seguro de contraseñas, no dentro del proyecto.

**Qué va a hacer el código:** cuando encuentre una variable de entorno llamada `DATABASE_URL`, utilizará PostgreSQL. La tabla `citas` se crea al iniciar si no existe. Si la tabla está vacía y `SEED_DEMO=1`, agrega 12 registros **ficticios**.

## 4. Crea la aplicación web en Render

1. Entra a <https://dashboard.render.com/>.
2. Pulsa **New** → **Web Service**.
3. Elige **Git Provider** y conecta tu cuenta de GitHub si Render te lo solicita.
4. Selecciona `agendasalud-webinar-uch`.
5. Configura el formulario con los siguientes datos:

   | Campo en Render | Valor |
   |---|---|
   | **Name** | `agendasalud-webinar-uch` (o uno disponible) |
   | **Language** | `Node` |
   | **Branch** | `main` |
   | **Root Directory** | En blanco si `server.js` está en la raíz |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Instance Type / Plan** | `Free` para demo, si está disponible; considera pago para disponibilidad más estable |
   | **Health Check Path** | `/health` (si se ofrece el campo) |

6. En la sección **Environment** / **Environment Variables**, crea estas variables:

   | Clave | Valor |
   |---|---|
   | `DATABASE_URL` | La cadena de Neon copiada en el paso 3 |
   | `SEED_DEMO` | `1` |
   | `NODE_ENV` | `production` |

7. **No crees manualmente `PORT`**: Render lo configura y `server.js` lo toma mediante `process.env.PORT`.
8. Selecciona **Create Web Service** / **Deploy Web Service**.
9. Observa **Logs / Events** hasta que aparezca un mensaje semejante a:

   ```text
   AgendaSalud lista en http://localhost:10000
   Base de datos: PostgreSQL (Neon / nube)
   ```

   El puerto interno puede ser distinto. No es la dirección pública.

10. Render mostrará una URL **propia de tu servicio**, por ejemplo:

    ```text
    https://NOMBRE-QUE-TE-ASIGNE-RENDER.onrender.com
    ```

    Esa dirección no existe hasta que tú crees el servicio.

## 5. Comprueba el despliegue

Sustituye `TU_DOMINIO` por tu URL real de Render:

- `https://TU_DOMINIO.onrender.com` → panel principal.
- `https://TU_DOMINIO.onrender.com/health` → `{ "ok": true, ... }`.
- `https://TU_DOMINIO.onrender.com/api/info` → debe decir **PostgreSQL (Neon / nube)**.
- `https://TU_DOMINIO.onrender.com/api/citas` → JSON de citas.

Prueba crear una cita ficticia desde el navegador. Actualiza la página y comprueba que persista. Luego abre el endpoint `/api/citas` para ver el registro por API.

## 6. Preparación específica para el webinar

1. Abre el enlace público **10 minutos antes** de empezar.
2. Si usas el plan gratuito de Render, espera a que despierte la aplicación tras un periodo de inactividad.
3. Deja una pestaña abierta con `/api/citas` para mostrar la API.
4. Mantén el proyecto local como **plan B** si falla Internet.
5. Usa solo pacientes ficticios; el proyecto no incluye seguridad ni controles para datos clínicos reales.

## 7. Por qué la versión gratuita requiere estas decisiones

- Render puede suspender servicios web gratuitos después de **15 minutos sin tráfico** y tardar en reactivarlos.
- El sistema de archivos del servicio web gratuito de Render **no es persistente** entre reinicios, redeploys o suspensiones: **no es adecuado para una SQLite alojada en el servidor**.
- Neon guarda los datos en PostgreSQL separado del servidor web. Esto permite que los registros persistan tras el reinicio del proceso de Render, según las condiciones del plan contratado.
- Para un webinar importante, considera una instancia con disponibilidad continua o, como mínimo, abre la app con anticipación y conserva la demo local.
- Los límites y precios pueden cambiar; verifica los planes de Neon y Render antes de crear recursos de pago.

## 8. Solución de problemas frecuentes

**Render indica “Build failed”.** Comprueba que el repositorio contiene `package.json` y que `Build Command` sea `npm install`. Confirma que la rama sea `main`.

**Render indica “No se pudo iniciar ... DATABASE_URL”.** Revisa que la variable exista exactamente como `DATABASE_URL`, que incluya `sslmode=require` y que hayas copiado la cadena completa y vigente de Neon.

**El enlace público queda cargando.** Podría estar despertando un servicio gratuito; espera y vuelve a cargar. Revisa Events y Logs si persiste.

**La interfaz funciona pero no guarda.** Abre `/api/info`, revisa que diga PostgreSQL y verifica el detalle de Logs en Render. No publiques públicamente las contraseñas incluidas en URLs de conexión.

**No aparecen las 12 citas iniciales.** Verifica `SEED_DEMO=1`. El seeding funciona solo cuando la tabla `citas` está vacía; no sobreescribe registros ya existentes.

**El servicio cae por el puerto.** No lo fijes a `5055` en Render. El código lee `process.env.PORT` y escucha sobre `0.0.0.0`.

**El proyecto está en una subcarpeta del repositorio.** Introduce esa carpeta en `Root Directory` o mueve `server.js` a la raíz.

## 9. Fuentes oficiales

- GitHub – Crear un repositorio: <https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository>
- Render – Servicios web: <https://render.com/docs/web-services>
- Render – Desplegar Node/Express: <https://render.com/docs/deploy-node-express-app>
- Render – Limitaciones gratuitas: <https://render.com/docs/free>
- Render – Versiones Node.js: <https://render.com/docs/node-version>
- Neon – Conectar con PostgreSQL: <https://neon.com/docs/get-started/connect-neon>
