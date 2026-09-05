# Patch for backend/src/server.js

Don't replace the whole file — just add these two lines to your existing
`backend/src/server.js`.

## 1. Add the import (near your other route imports, top of file)

```js
import prerenderRoutes from './routes/prerenderRoutes.js';
```

## 2. Register the route (near your other `app.use('/api/...')` lines)

```js
app.use('/prerender', prerenderRoutes);
```

That's it. Your existing `/api/*` routes, middleware, and everything else
stay exactly as they are.
