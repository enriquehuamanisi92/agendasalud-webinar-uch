# AgendaSalud · Demostración Full Stack UCH

**Proyecto ejecutable vinculado al webinar “De la idea a una aplicación Full Stack”, Centro de Formación Continua UCH (20 años).**

AgendaSalud simula la gestión de citas médicas con **pacientes ficticios**. Sirve para enseñar el trayecto completo de una solicitud: **interfaz web → solicitud HTTP → backend Node.js → base de datos → respuesta JSON → actualización de la interfaz**.

## Qué incluye

- Interfaz responsive **HTML5 + CSS3 + JavaScript** (compatible con celular).
- API HTTP real implementada con **Node.js**, usando rutas REST.
- **SQLite en local** (funciona sin instalar paquetes npm).
- **PostgreSQL en la nube**, al configurar la variable `DATABASE_URL` (requiere `npm install` para instalar `pg`).
- Rutas `GET /api/citas`, `GET /api/resumen`, `POST /api/citas`, `PATCH /api/citas/:id/confirmar`, `GET /health`, `GET /api/info`.
- Pruebas automatizadas: `npm test`.
- Datos ficticios iniciales para no empezar con el panel vacío.
- Guía de despliegue **Render + Neon** en [`docs/GUIA_DESPLIEGUE_NUBE.md`](docs/GUIA_DESPLIEGUE_NUBE.md).
- Guion para mostrarlo en el webinar en [`docs/GUION_DEMOSTRACION.md`](docs/GUION_DEMOSTRACION.md).

> **Alcance técnico real:** Esta versión didáctica utiliza HTML/CSS/JavaScript y Node.js HTTP. No utiliza React ni Express. React, Express, microservicios, MongoDB, JWT y CI/CD se explican en la **malla curricular y la presentación como tecnologías/conceptos de aprendizaje**; no deben confundirse con implementaciones de este demostrador. En la nube se utiliza PostgreSQL en vez de SQLite local. Tampoco es un sistema médico real ni incorpora autenticación para pacientes.

## Iniciar en Windows (la forma más sencilla)

1. Instala Node.js 24 LTS desde <https://nodejs.org/>. Necesitas al menos Node.js 22.13.
2. Extrae el ZIP y abre la carpeta `AgendaSalud_FullStack_UCH`.
3. Haz doble clic en `INICIAR_WINDOWS.bat`.
4. Se abrirá `http://localhost:5055` en tu navegador.
5. Deja abierta la ventana negra mientras demuestras el programa.

**Alternativa con la terminal:**

```powershell
node --version
npm start
```

En este modo local **no necesitas `npm install`**. El aviso de Node sobre `node:sqlite` (experimental en algunas versiones) no impide la ejecución.

## Iniciar en macOS o Linux

```bash
cd AgendaSalud_FullStack_UCH
node server.js
```

Visita <http://localhost:5055>.

## Rutas para mostrar en el navegador

| URL | Qué demuestra |
|---|---|
| `http://localhost:5055` | Pantalla principal y formulario |
| `http://localhost:5055/api/citas` | Respuesta JSON de una API real |
| `http://localhost:5055/api/resumen` | Consulta agregada a la base de datos |
| `http://localhost:5055/api/info` | Tecnología y almacenamiento utilizados |
| `http://localhost:5055/health` | Comprobación de que el servidor está activo |

## Cómo demostrar que los datos persisten

1. Abre la aplicación y presiona **+ Nueva cita**.
2. Registra a `Participante de prueba`, elige una especialidad, fecha y hora.
3. La aplicación busca automáticamente al nuevo registro para mostrarlo.
4. Abre `/api/citas` y verás el dato en JSON.
5. Detén el servidor con `Ctrl + C`, ejecútalo otra vez y busca el registro. Continuará almacenado en el archivo SQLite local.

**Restaurar los 12 ejemplos iniciales:** cierra Node, ejecuta `REINICIAR_DEMO_WINDOWS.bat` (Windows), y vuelve a iniciar el programa. No lo ejecutes sobre datos que quieras conservar.

## Estructura del proyecto

```text
AgendaSalud_FullStack_UCH/
├── server.js                 # API, lógica y adaptadores SQLite/PostgreSQL
├── package.json              # Inicio, pruebas y paquete pg para nube
├── .node-version             # Node 24 para Render
├── .gitignore                # Impide publicar secretos y SQLite local
├── .env.example              # Plantilla sin claves reales
├── INICIAR_WINDOWS.bat
├── REINICIAR_DEMO_WINDOWS.bat
├── INICIAR_MAC_LINUX.sh
├── public/
│   └── index.html            # UI responsive con HTML/CSS/JS
├── tests/
│   └── demo.test.js          # Flujo completo automatizado
├── capturas/                 # Imágenes locales para explicar el proyecto
└── docs/
    ├── GUIA_DESPLIEGUE_NUBE.md
    ├── GUION_DEMOSTRACION.md
    ├── PETICIONES_API.md
    └── frontend-script.js    # JS de interfaz extraído para estudio
```

## Nota de seguridad

El proyecto es **exclusivamente docente**: no ofrece usuarios, permisos, cifrado de información sensible, auditoría clínica ni controles suficientes para almacenar historiales o datos reales de pacientes. Usa solamente nombres ficticios. No subas contraseñas a GitHub y no coloques `DATABASE_URL` en archivos compartidos.

## Referencias oficiales

- Node.js: <https://nodejs.org/>
- Render despliegue de servicios: <https://render.com/docs/web-services>
- Neon conexión a PostgreSQL: <https://neon.com/docs/get-started/connect-neon>
- GitHub repositorios: <https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository>
