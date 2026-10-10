# Guion de demostración – Webinar Full Stack UCH

## Duración sugerida: 10–12 minutos

Este guion conecta el demostrador AgendaSalud con las **35 diapositivas** de la presentación del webinar UCH 20 años.

| Diapositiva | Qué explicar | Qué mostrar en vivo |
|---|---|---|
| 2: pregunta central | ¿Qué pasa cuando registramos una cita? | Abre la aplicación principal |
| 3: arquitectura Full Stack | Navegador → API → base de datos | Señala interfaz, API y datos |
| 6–9: fundamentos | HTML estructura, CSS presenta, JS interactúa | Pulsa **Nueva cita**; muestra formulario responsive |
| 10–13: React | Estado, componentes y consumo de APIs | Explica que **React se enseña en la malla**; el demo actual usa JavaScript nativo |
| 14–16: backend | Solicitudes HTTP, validación y JSON | Abre `/api/citas` y `/api/resumen` |
| 17–18: arquitectura | Monolito modular vs. microservicios | Aclara que esta demo es un solo servidor; no está dividida en microservicios |
| 19–22: bases de datos | La información debe conservarse | Crea cita ficticia, reinicia y verifica que sigue allí |
| 23–27: DevOps y nube | Diferencia ambiente local y remoto | Abre `/api/info` local y, si ya la publicaste, la URL de Render |
| 28: IA | Apoyo al programador | Menciona debugging o documentación como asistencia; no afirmar que la demo tiene un modelo IA |
| 29–32: proyecto integrador | Producto final y flujo real | Registra, consulta y confirma una cita en vivo |

### Demostración en 7 pasos

1. **Antes de compartir pantalla**, abre `http://localhost:5055` y el endpoint `/api/citas` en dos pestañas.
2. **Interfaz (1 min):** explica los contadores, la búsqueda, el listado y el botón `+ Nueva cita`.
3. **Registro (2 min):** ingresa un nombre ficticio como `Estudiante Webinar UCH`, una especialidad, una fecha y una hora. Presiona `Guardar cita`.
4. **API REST (2 min):** cambia a `/api/citas` y busca el nombre; muestra que la respuesta es **JSON** y que el backend asignó un identificador.
5. **Persistencia (1 min):** vuelve a la interfaz, confirma la cita y actualiza el listado. Abre `/api/resumen` para observar los contadores.
6. **Arquitectura (2 min):** explica que el navegador consume endpoints de Node y Node consulta SQLite local; si está publicada, Node consulta PostgreSQL en Neon.
7. **Cierre (2 min):** muestra el mismo enlace alojado en Render si ya lo publicaste. Recalca que el programa profundiza React, Express, bases de datos y cloud para desarrollar soluciones más complejas.

### Tres frases para decir textualmente

> “Esto no es una imagen ni una maqueta: el dato viaja desde el formulario hacia la API y se almacena en una base de datos.”

> “La interfaz podría reescribirse con React sin cambiar el contrato de la API: esa es una ventaja de separar las capas.”

> “El demo es intencionalmente sencillo. Los microservicios, JWT y la automatización CI/CD son técnicas que se aplican según los requisitos y la escala de cada proyecto.”

### Plan B ante problemas de Internet

Conserva el servidor local en funcionamiento. Si Render demora, alterna a `http://localhost:5055` para mantener el ritmo de la exposición.

### Qué no prometer

- No atribuyas este demo a React, Express, MongoDB, microservicios o integración de IA: no los implementa.
- No uses datos clínicos reales.
- No presentes el acceso público sin autenticación como un sistema apto para uso productivo.
