# Ejemplos de peticiones a la API

Local: `http://localhost:5055`

## 1. Consultar citas – GET

Abre en el navegador:

`http://localhost:5055/api/citas`

## 2. Consultar resumen – GET

`http://localhost:5055/api/resumen`

## 3. Crear cita – POST (PowerShell)

```powershell
$body = @{
  paciente = 'Estudiante UCH'
  especialidad = 'Medicina general'
  fecha = '2026-10-22'
  hora = '11:30'
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:5055/api/citas' -Method POST -ContentType 'application/json' -Body $body
```

Recibirás **HTTP 201 Created** con el id de la cita.

## 4. Confirmar cita – PATCH (PowerShell)

Cambia `13` por el id devuelto en la operación anterior:

```powershell
Invoke-RestMethod -Uri 'http://localhost:5055/api/citas/13/confirmar' -Method PATCH
```

## 5. Cuerpo JSON para Postman

**Método:** `POST`  
**URL:** `http://localhost:5055/api/citas`  
**Body → raw → JSON:**

```json
{
  "paciente": "Participante del webinar",
  "especialidad": "Pediatría",
  "fecha": "2026-10-22",
  "hora": "09:30"
}
```

## 6. Endpoints una vez publicado

Solo reemplaza `http://localhost:5055` por la **URL real que Render te asigne**. La API mantiene el mismo contrato.
