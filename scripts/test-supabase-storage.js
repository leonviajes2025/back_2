const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function loadEnv(envPath) {
  const txt = fs.readFileSync(envPath, 'utf8');
  const lines = txt.split(/\r?\n/);
  const env = {};
  for (const line of lines) {
    const m = line.match(/^(\w+)=\"?(.*)\"?$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

async function run() {
  const env = loadEnv(path.resolve(__dirname, '..', '.env'));
  const SUPABASE_URL = env.NG_APP_SUPABASE_URL;
  const SUPABASE_KEY = env.NG_APP_SUPABASE_SERVICE_ROLE_KEY;
  const BUCKET = env.NG_APP_SUPABASE_BUCKET || 'productos';
  const PATH_PREFIX = env.NG_APP_SUPABASE_PRODUCT_IMAGES_PATH || 'productos';

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Variables de supabase faltantes');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

  const content = 'prueba de upload ' + Date.now();
  const filename = `test_${Date.now()}.txt`;
  const filePath = `${PATH_PREFIX}/${filename}`;

  console.log('Subiendo a', filePath);
  const { data: upData, error: upErr } = await supabase.storage.from(BUCKET).upload(filePath, Buffer.from(content), { upsert: true });
  if (upErr) {
    console.error('Error upload:', upErr);
    process.exit(1);
  }
  console.log('Upload OK', upData);

  console.log('Borrando', filePath);
  const { data: delData, error: delErr } = await supabase.storage.from(BUCKET).remove([filePath]);
  if (delErr) {
    console.error('Error delete:', delErr);
    process.exit(1);
  }
  console.log('Delete OK', delData);
}

run().catch(err => { console.error(err); process.exit(1); });
