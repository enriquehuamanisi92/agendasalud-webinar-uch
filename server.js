'use strict';
/**
 * AgendaSalud - demostrador docente Full Stack para el webinar UCH.
 * Local: Node.js + SQLite (módulo nativo node:sqlite).
 * Nube:  Node.js + PostgreSQL (Neon) cuando existe DATABASE_URL.
 * Una sola interfaz HTML/CSS/JS consume la misma API en ambos modos.
 * IMPORTANTE: no maneja datos reales ni tiene autenticación para pacientes.
 */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = Number(process.env.PORT || 5055);
const USE_POSTGRES = !!process.env.DATABASE_URL;
const ROOT = __dirname;
const SEED = process.env.SEED_DEMO !== '0';
const SEED_ROWS = [
  ['María Vásquez','Cardiología','2026-10-14','08:30','Confirmada'],
  ['Carlos Meza','Medicina general','2026-10-14','09:00','Pendiente'],
  ['Lucía Ramos','Pediatría','2026-10-14','09:30','Confirmada'],
  ['Jorge Salazar','Traumatología','2026-10-14','10:00','Pendiente'],
  ['Ana Torres','Pediatría','2026-10-14','10:45','Confirmada'],
  ['Pedro Quispe','Cardiología','2026-10-14','11:15','Confirmada'],
  ['Daniela Rojas','Medicina general','2026-10-14','11:45','Pendiente'],
  ['Miguel Aguirre','Pediatría','2026-10-14','12:15','Confirmada'],
  ['Mariana León','Medicina general','2026-10-15','08:30','Pendiente'],
  ['Raúl Mendoza','Traumatología','2026-10-15','09:00','Confirmada'],
  ['Paola Díaz','Cardiología','2026-10-15','10:00','Pendiente'],
  ['Rosa Huamán','Pediatría','2026-10-15','10:30','Confirmada']
];

// Cada adaptador expone las mismas funciones. No se guarda información en memoria.
async function makeStorage() {
  if (USE_POSTGRES) {
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: true },
      max: 5,
      connectionTimeoutMillis: 15000,
      idleTimeoutMillis: 30000
    });
    await pool.query(`CREATE TABLE IF NOT EXISTS citas (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      paciente VARCHAR(80) NOT NULL,
      especialidad VARCHAR(60) NOT NULL,
      fecha DATE NOT NULL,
      hora VARCHAR(5) NOT NULL,
      estado VARCHAR(15) NOT NULL DEFAULT 'Pendiente'
        CHECK (estado IN ('Pendiente','Confirmada'))
    )`);
    const c = await pool.query('SELECT COUNT(*)::int AS total FROM citas');
    if (SEED && c.rows[0].total === 0) {
      for (const r of SEED_ROWS) {
        await pool.query(
          'INSERT INTO citas (paciente, especialidad, fecha, hora, estado) VALUES ($1,$2,$3,$4,$5)',
          r
        );
      }
    }
    return {
      engine: 'PostgreSQL (Neon / nube)',
      async list() {
        const result = await pool.query("SELECT id, paciente, especialidad, TO_CHAR(fecha,'YYYY-MM-DD') AS fecha, hora, estado FROM citas ORDER BY fecha, hora, id");
        return result.rows;
      },
      async summary() {
        const result = await pool.query(`SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE estado = 'Confirmada')::int AS confirmadas,
          COUNT(*) FILTER (WHERE estado = 'Pendiente')::int AS pendientes,
          COUNT(DISTINCT especialidad)::int AS especialidades FROM citas`);
        return result.rows[0];
      },
      async create(cita) {
        const result = await pool.query(
          "INSERT INTO citas (paciente,especialidad,fecha,hora,estado) VALUES ($1,$2,$3,$4,'Pendiente') RETURNING id",
          [cita.paciente, cita.especialidad, cita.fecha, cita.hora]
        );
        return result.rows[0].id;
      },
      async confirm(id) {
        const result = await pool.query("UPDATE citas SET estado='Confirmada' WHERE id=$1", [id]);
        return result.rowCount > 0;
      },
      async close() { await pool.end(); }
    };
  }
  const { DatabaseSync } = require('node:sqlite');
  const dbPath = process.env.SQLITE_PATH || path.join(ROOT, 'agenda_demo.sqlite');
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec(`CREATE TABLE IF NOT EXISTS citas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente TEXT NOT NULL,
    especialidad TEXT NOT NULL,
    fecha TEXT NOT NULL,
    hora TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'Pendiente'
  )`);
  if (SEED && db.prepare('SELECT COUNT(*) AS n FROM citas').get().n === 0) {
    const insert = db.prepare('INSERT INTO citas (paciente,especialidad,fecha,hora,estado) VALUES (?,?,?,?,?)');
    for (const row of SEED_ROWS) insert.run(...row);
  }
  return {
    engine: 'SQLite (computadora local)',
    async list() {
      return db.prepare('SELECT * FROM citas ORDER BY fecha, hora, id').all();
    },
    async summary() {
      return db.prepare(`SELECT COUNT(*) AS total,
        COUNT(CASE WHEN estado='Confirmada' THEN 1 END) AS confirmadas,
        COUNT(CASE WHEN estado='Pendiente' THEN 1 END) AS pendientes,
        COUNT(DISTINCT especialidad) AS especialidades FROM citas`).get();
    },
    async create(cita) {
      const info = db.prepare("INSERT INTO citas (paciente,especialidad,fecha,hora,estado) VALUES (?,?,?,?,'Pendiente')")
        .run(cita.paciente, cita.especialidad, cita.fecha, cita.hora);
      return Number(info.lastInsertRowid);
    },
    async confirm(id) {
      return db.prepare("UPDATE citas SET estado='Confirmada' WHERE id=?").run(id).changes > 0;
    },
    async close() { db.close(); }
  };
}

function sendJSON(res, code, body) {
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(JSON.stringify(body, null, 2));
}
function sendHtml(res) {
  res.writeHead(200, {'Content-Type':'text/html; charset=utf-8','X-Content-Type-Options':'nosniff','Cache-Control':'no-cache'});
  fs.createReadStream(path.join(ROOT, 'public', 'index.html')).pipe(res);
}
async function readJSON(req) {
  let raw = '';
  for await (const c of req) {
    raw += c;
    if (Buffer.byteLength(raw) > 16 * 1024) {
      const err = new Error('La solicitud supera el límite permitido.'); err.status = 413; throw err;
    }
  }
  try { return JSON.parse(raw || '{}'); }
  catch { const err = new Error('El JSON enviado no es válido.'); err.status = 400; throw err; }
}
function dateValid(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0,10) === value;
}
function getValidatedCita(obj) {
  const paciente = typeof obj.paciente === 'string' ? obj.paciente.trim() : '';
  const especialidad = typeof obj.especialidad === 'string' ? obj.especialidad.trim() : '';
  const hora = typeof obj.hora === 'string' ? obj.hora.trim() : '';
  if (paciente.length < 2 || paciente.length > 80 || especialidad.length < 2 || especialidad.length > 60 ||
      !dateValid(obj.fecha) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(hora)) {
    const err = new Error('Verifica el paciente, especialidad, fecha (AAAA-MM-DD) y hora (HH:MM).');
    err.status = 422; throw err;
  }
  return { paciente, especialidad, fecha: obj.fecha, hora };
}

async function main() {
  const storage = await makeStorage();
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      if (req.method === 'GET' && ['/', '/index.html'].includes(url.pathname)) return sendHtml(res);
      if (req.method === 'GET' && url.pathname === '/health') return sendJSON(res,200,{ok:true,servicio:'AgendaSalud'});
      if (req.method === 'GET' && url.pathname === '/api/info') {
        return sendJSON(res,200,{proyecto:'AgendaSalud',modo: USE_POSTGRES ? 'Nube' : 'Local',backend:'Node.js HTTP',base_de_datos:storage.engine,demo:true});
      }
      if (req.method === 'GET' && url.pathname === '/api') {
        return sendJSON(res,200,{rutas:['GET /health','GET /api/info','GET /api/citas','GET /api/resumen','POST /api/citas','PATCH /api/citas/:id/confirmar']});
      }
      if (req.method === 'GET' && url.pathname === '/api/citas') {
        const list = await storage.list(); return sendJSON(res,200,{total:list.length,data:list});
      }
      if (req.method === 'GET' && url.pathname === '/api/resumen') return sendJSON(res,200,await storage.summary());
      if (req.method === 'POST' && url.pathname === '/api/citas') {
        const payload = getValidatedCita(await readJSON(req));
        const id = await storage.create(payload);
        return sendJSON(res,201,{id,mensaje:'Cita registrada',estado:'Pendiente'});
      }
      const match = url.pathname.match(/^\/api\/citas\/(\d+)\/confirmar$/);
      if (req.method === 'PATCH' && match) {
        const ok = await storage.confirm(Number(match[1]));
        return sendJSON(res,ok?200:404,{mensaje:ok?'Cita confirmada':'Cita no encontrada'});
      }
      if (['/favicon.ico'].includes(url.pathname)) { res.writeHead(204); return res.end(); }
      return sendJSON(res,404,{error:'Ruta no encontrada'});
    } catch (err) {
      const status = Number(err.status) || 500;
      if (status >= 500) console.error(err);
      return sendJSON(res,status,{error: status >= 500 ? 'Error interno del servidor' : err.message});
    }
  });
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`\nAgendaSalud lista en http://localhost:${PORT}`);
    console.log(`Base de datos: ${storage.engine}`);
    console.log('Rutas de demostración: /api/citas | /api/resumen | /health\n');
  });
  const shutdown = async () => {
    server.close(async () => { await storage.close(); process.exit(0); });
  };
  process.on('SIGINT', shutdown); process.on('SIGTERM', shutdown);
}
main().catch(err => {
  console.error('No se pudo iniciar AgendaSalud. Revisa DATABASE_URL y la conectividad.', err.message);
  process.exit(1);
});
