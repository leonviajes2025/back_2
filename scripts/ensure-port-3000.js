const kill = require('kill-port');

const PORT = 3000;

kill(PORT, 'tcp')
  .then(() => {
    console.log(`Puerto ${PORT} liberado (si hubo procesos).`);
    process.exit(0);
  })
  .catch((err) => {
    console.warn(`Aviso: no se pudo matar procesos en puerto ${PORT} o no había ninguno: ${err && err.message ? err.message : err}`);
    process.exit(0);
  });
