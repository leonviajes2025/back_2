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
    console.log('Ajustando secuencia de productos...');

    const sql = `SELECT setval(pg_get_serial_sequence('productos','id'), COALESCE((SELECT MAX(id) FROM productos),0)+1, false)`;

    const res = await prisma.$executeRawUnsafe(sql);

    console.log('Resultado:', res);
  } catch (err) {
    console.error('Error al ajustar la secuencia:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
