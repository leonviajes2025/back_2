import fs from 'fs';
import { PrismaClient } from '@prisma/client';

function loadEnv(path = '.env') {
  try {
    const src = fs.readFileSync(path, 'utf8');
    for (const rawLine of src.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const idx = line.indexOf('=');
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim();
      let val = line.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  } catch (e) {
    // ignore
  }
}

loadEnv();

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Buscando columnas con default nextval(...) en schema public...');

    const rows = await prisma.$queryRawUnsafe(`
      SELECT table_name, column_name, column_default
      FROM information_schema.columns
      WHERE column_default LIKE 'nextval(%' AND table_schema = 'public'
    `);

    if (!rows || rows.length === 0) {
      console.log('No se encontraron secuencias para ajustar.');
      return;
    }

    console.log(`Encontradas ${rows.length} columnas con secuencia.`);

    for (const r of rows) {
      const table = r.table_name || r.table || r.tablename;
      const column = r.column_name || r.column || r.columnname;
      const def = r.column_default || r.columndefault || '';

      const m = /nextval\('(.*)'::regclass\)/.exec(def);
      if (!m) {
        console.log(`No se pudo extraer secuencia para ${table}.${column}`);
        continue;
      }

      const seq = m[1];

      const sql = `SELECT setval('${seq}', COALESCE((SELECT MAX("${column}") FROM "${table}"),0)+1, false)`;

      try {
        const res = await prisma.$executeRawUnsafe(sql);
        console.log(`Ajustada secuencia ${seq} para ${table}.${column} -> resultado:`, res);
      } catch (e) {
        console.error(`Error ajustando secuencia ${seq} para ${table}.${column}:`, e.message || e);
      }
    }
  } catch (err) {
    console.error('Error al buscar/ajustar secuencias:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
