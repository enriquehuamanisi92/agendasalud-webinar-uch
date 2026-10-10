'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { setTimeout: sleep } = require('node:timers/promises');

const root = path.join(__dirname, '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'uch-agendasalud-'));
const port = 31000 + (process.pid % 10000);
let child;
async function waitForServer(url) {
  for (let i=0; i<45; i++) {
    if (child?.exitCode !== null) throw new Error(`Servidor se cerró inesperadamente con código ${child?.exitCode}`);
    try { const res=await fetch(url+'/health'); if(res.ok) return; } catch {}
    await sleep(100);
  }
  throw new Error('El servidor no inició durante el periodo de prueba');
}

test('AgendaSalud ejecuta el flujo completo: frontend, API y base de datos', async () => {
  child = spawn(process.execPath, ['server.js'], {
    cwd: root,
    env: {...process.env, PORT:String(port), SQLITE_PATH:path.join(tmp,'test.sqlite'), DATABASE_URL:'', SEED_DEMO:'1'},
    stdio:['ignore','pipe','pipe']
  });
  let errorOutput=''; child.stderr.on('data', c => errorOutput+=c.toString());
  const base = `http://127.0.0.1:${port}`;
  try {
    await waitForServer(base);
    const html = await (await fetch(base)).text();
    assert.match(html, /AgendaSalud/);
    assert.match(html, /Nueva cita/);
    const info=await (await fetch(base+'/api/info')).json();
    assert.match(info.base_de_datos, /SQLite/);
    const initial=await (await fetch(base+'/api/citas')).json();
    assert.equal(initial.total,12);
    const create=await fetch(base+'/api/citas',{
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({paciente:'Caso de prueba', especialidad:'Pediatría', fecha:'2026-10-22',hora:'09:30'})
    });
    assert.equal(create.status,201);
    const {id}=await create.json(); assert.ok(Number.isInteger(id));
    const confirm=await fetch(base+`/api/citas/${id}/confirmar`,{method:'PATCH'});
    assert.equal(confirm.status,200);
    const summary=await (await fetch(base+'/api/resumen')).json();
    assert.equal(summary.total,13);
    assert.equal(summary.confirmadas,8);
    const after=await (await fetch(base+'/api/citas')).json();
    assert.equal(after.data.find(x=>x.id===id).estado,'Confirmada');
    const invalid=await fetch(base+'/api/citas',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({paciente:'A',especialidad:'X',fecha:'2026-99-99',hora:'88:00'})
    });
    assert.equal(invalid.status,422);
    assert.equal((await fetch(base+'/ruta-no-existe')).status,404);
  } catch(err) {
    console.error('Errores del servidor:',errorOutput);
    throw err;
  } finally {
    child.kill('SIGTERM');
    await sleep(150);
    fs.rmSync(tmp,{recursive:true,force:true});
  }
});
