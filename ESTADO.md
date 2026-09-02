# Estado del proyecto — Tshirt Store

> Última actualización: 2026-09-02. Este archivo es un resumen vivo: actualízalo a medida que se cierren o aparezcan pendientes.

## Arquitectura actual

- **Frontend:** Angular 17 (SSR con Angular Universal), desplegado en Netlify (`tshirt-storeop.netlify.app`).
- **Backend:** Node.js + Express, desplegado en Vercel como función serverless (`back-store-mu.vercel.app`, proyecto `back-store`).
- **Base de datos:** Firebase Firestore, proyecto `store-2f422`.
- **Auth:** Firebase Authentication (email/password + Google).
- **Pagos:** Stripe Checkout.
- **Emails:** Resend API.

---

## ✅ Resuelto

### 1. Precio manipulable desde el cliente (crítico)
`create-checkout-session` tomaba el precio directo del body que mandaba el navegador — cualquiera podía editarlo en devtools antes de pagar. Ahora el backend busca cada producto en Firestore por `id` y usa **siempre** ese precio; también valida talla (`S/M/L/XL`) y cantidad (entero 1–20). Ver [backend/index.js](backend/index.js).

### 2. `/compras` expuesto sin autenticación (crítico — fuga de datos)
Cualquiera podía pedir `GET /compras` y ver nombre, email, dirección y monto de **todas** las compras de todos los clientes. Además `purchase-history.component.ts` traía toda la colección `compras` al navegador vía SDK cliente y filtraba en JS (si las reglas de Firestore eran abiertas, cualquier usuario logueado veía los pedidos de todos).

Arreglado:
- Backend migrado al **Admin SDK** de Firebase (antes usaba el SDK cliente en el servidor, lo cual no tiene sentido).
- Middleware que verifica el ID token de Firebase (`Authorization: Bearer <token>`) y `/compras` solo devuelve las compras del usuario autenticado.
- [firestore.rules](firestore.rules) desplegadas: `productos` lectura pública, `compras` denegado a todo cliente (solo el backend con Admin SDK accede). **Ya desplegadas en producción** (`firebase deploy --only firestore:rules`).
- Frontend actualizado para pedir el historial vía backend con token, no directo a Firestore.

### 3. `AuthService` vacío / lógica de auth duplicada
Cada componente (login, register, menu, purchase-history) llamaba a AngularFire directo por su cuenta, sin estado centralizado.

Arreglado:
- [auth.service.ts](src/app/auth/auth.service.ts) centraliza login, registro, logout, Google y el estado de sesión reactivo (`usuario$`).
- [auth.guard.ts](src/app/auth/auth.guard.ts) nuevo: protege rutas privadas.
- `/history` y `/tracking` ahora requieren sesión (antes eran accesibles sin login).
- Se eliminó un `localStorage.setItem('usuario', ...)` que nadie leía (estado duplicado sin uso).

### Infraestructura / despliegue
- Vercel: agregadas `FIREBASE_CLIENT_EMAIL` y `FIREBASE_PRIVATE_KEY` (cuenta de servicio del Admin SDK) y redesplegado en producción — verificado con curl que `/productos` y `/compras` responden correctamente.
- `backend/.env.example` agregado documentando todas las variables requeridas.
- Dependencia `firebase` (SDK cliente) eliminada del backend — ya no se necesita, todo pasa por `firebase-admin`.

### 4. Imágenes hardcodeadas por nombre de archivo
Antes: `src="/assets/img/{{producto.id}}.jpg"` en 4 templates distintos — cada producto nuevo requería subir un `.jpg` al repo y redesplegar el frontend.

Arreglado:
- Firebase Storage habilitado en el proyecto (no estaba activado — hubo que iniciarlo desde la consola).
- [storage.rules](storage.rules) desplegadas: lectura pública de `productos/**`, escritura denegada a todo cliente.
- [backend/scripts/migrar-imagenes.js](backend/scripts/migrar-imagenes.js) (`npm run migrar-imagenes` desde `backend/`): sube las imágenes locales a Storage y guarda la URL real en el campo `imagen` de cada producto en Firestore. Reutilizable si se agregan productos nuevos con imagen local.
- Las 14 imágenes existentes ya migradas y verificadas en producción (`/productos` devuelve `imagen` con URL de Storage en los 14 productos).
- Frontend ([pag-inicio](src/app/pag-inicio/pag-inicio.component.html), [descripcion](src/app/descripcion/descripcion.component.html), [carrito](src/app/carrito/carrito.component.html)) usa `producto.imagen`, con `assets/img/placeholder.svg` como fallback si algún producto no tiene imagen cargada.
- De paso corregido: `FIREBASE_STORAGE_BUCKET` en `.env` tenía el nombre de bucket viejo (`.appspot.com`); el bucket real de este proyecto es `.firebasestorage.app`.
- **Pendiente menor**: los `.jpg` originales en `src/assets/img/1.jpg`...`14.jpg` ya no los usa ningún componente — quedan de respaldo, se pueden borrar del repo cuando quieran.

---

## ⚠️ Pendiente — deuda técnica encontrada, no tocada todavía

### Prioridad alta
- **Sin control de stock**: nada impide vender más unidades de las que hay. El campo `cantidad` existe en los productos de Firestore pero no se usa como inventario real (se descuenta o valida en ningún lado).
- **Sin panel admin**: productos se gestionan a mano desde la consola de Firebase. No hay forma de crear/editar/eliminar productos ni ver pedidos desde una UI propia.
- **`order-tracking` es un componente vacío**: está en el menú y en las rutas pero no muestra nada.

### Prioridad media
- **CORS abierto** (`cors()` sin restricción de origen) en el backend — cualquier dominio puede llamar a la API.
- **Datos sucios en Firestore** (detectado al probar `/productos`): producto `id:11` tiene el campo `"cantidad "` con un espacio al final (no `"cantidad"`), producto `id:13` tiene `"desscripcion"` en vez de `"descripcion"` — typos en los documentos que conviene corregir a mano en la consola de Firebase.
- **Suite de tests con 6 fallas preexistentes** (`login`, `register`, `menu`, `app.component`, `purchase-history` y otro spec): specs scaffoldeados por Angular CLI que nunca proveyeron Firebase en el `TestBed`. No es algo que haya roto yo — ya fallaban antes de tocar el código — pero conviene arreglarlos en algún momento para que la suite sirva de red de seguridad real.
- **Node.js 20.x deprecado en Vercel**: avisó en el último build que los deploys van a fallar después del 2026-10-01 si no se sube a Node 24.x en la configuración del proyecto.

### Prioridad baja / cosas menores
- `environment.ts` / `environment.development.ts` no se usan realmente — la config de Firebase está hardcodeada directo en `app.config.ts`. Se podría limpiar o unificar.
- Sin páginas legales (términos, política de devolución/privacidad) ni boleta/factura — necesario antes de operar como e-commerce real.
- Filtrado de productos en la home se hace 100% en el cliente después de traer todo el catálogo — no escala si el catálogo crece mucho, pero no es un problema hoy con pocos productos.

---

## Variables de entorno requeridas (backend)

Ver [backend/.env.example](backend/.env.example) para la lista completa y el detalle de cómo generar la cuenta de servicio de Firebase.

## Cómo verificar que todo sigue sano

```bash
# Backend local
cd backend && npm install && node index.js

# Tests frontend
npm test -- --watch=false

# Type-check
npx tsc -p tsconfig.app.json --noEmit
```
