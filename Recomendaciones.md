



Desarrollo (recarga, .env.local):
```bash
npm run dev
```

Producción local (simular ambiente prod):
```bash
npm run build
npm run start
```

También puedes arrancar una sesión productiva local con variables de entorno:

```PowerShell
$env:PRIVATE_API_KEY="mi_key"; $env:JWT_SECRET="mi_jwt"; npm run dev
```

Para un entorno productivo local:
$env:NODE_ENV="production"; $env:PRIVATE_API_KEY="mi_key"; npm run build; npm run start


Cómo detecta la API el entorno

process.env.NODE_ENV — valores típicos: development (npm run dev), production (después de build + start).
En Vercel u otros hosts puedes usar process.env.VERCEL_ENV (development | preview | production) para distinguir deploys.
Puedes usar ambas: if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") { /* reglas estrictas */ }


## Matar un proceso y levantar el proyecto localmente

```bash
taskkill /PID 22116 /F ; npm run dev
```