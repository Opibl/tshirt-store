# Notas de estudio

Registro de comandos y conceptos usados trabajando en este proyecto, con el **por qué**, no solo el qué. Pensado para volver a mirarlo cuando no te acordás cómo se hacía algo.

> Este archivo es distinto de [ESTADO.md](ESTADO.md): ESTADO.md dice qué está resuelto y qué falta del *proyecto*. Este archivo explica *cómo* se hacen las cosas y por qué, para vos.

---

## Firebase

### Admin SDK vs. SDK cliente

Hay dos formas de hablarle a Firebase desde código, y se usan en lugares distintos:

- **SDK cliente** (`firebase`, paquete que usa el navegador): respeta las reglas de seguridad (`firestore.rules`). Es lo que corre en Angular.
- **Admin SDK** (`firebase-admin`, paquete de servidor): **ignora** las reglas de seguridad por diseño, porque corre en un servidor de confianza. Es lo que usa `backend/index.js`.

**Por qué importa**: si el backend usara el SDK cliente (como hacía antes), estaría atado a las mismas reglas que el navegador — no podría, por ejemplo, leer las compras de un usuario para verificar su token. El Admin SDK necesita una cuenta de servicio (`FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY`), no la API key pública del frontend.

### Desplegar reglas de seguridad

```bash
firebase login
firebase deploy --only firestore:rules --project store-2f422
firebase deploy --only storage --project store-2f422
```

**Por qué**: escribir `firestore.rules` o `storage.rules` en el repo no hace nada solo — son texto hasta que se despliegan. `firebase deploy` es el paso que efectivamente las activa contra el proyecto real. Sin este paso, las reglas viejas (o las que estén en la consola) siguen mandando.

`firebase.json` es lo que le dice al CLI dónde está cada archivo de reglas:
```json
{
  "firestore": { "rules": "firestore.rules" },
  "storage": { "rules": "storage.rules" }
}
```

### Habilitar Firebase Storage

Storage **no se activa solo** por tener un proyecto Firebase — la primera vez hay que ir a la consola (Firebase Console → Storage → "Comenzar") y elegir una ubicación. Si intentás subir algo antes de eso, el SDK tira `404 The specified bucket does not exist`, aunque el nombre del bucket esté bien escrito. Nos pasó exactamente esto migrando las imágenes.

### Cuenta de servicio (Admin SDK)

Se genera en: **Firebase Console → ⚙️ Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada**. Descarga un `.json` con `client_email` y `private_key` — esos dos valores van a las variables de entorno del backend (nunca al repo).

---

## Vercel (backend)

### Ver y agregar variables de entorno

```bash
vercel env ls                          # lista nombres, no valores
vercel env add NOMBRE_VAR production   # pide pegar el valor, interactivo
```

**Por qué usar `env ls` primero**: para confirmar qué falta sin tener que preguntar ni exponer valores — la salida muestra "Encrypted" para todas, nunca el contenido real.

### Redesplegar

```bash
vercel --prod
```

**Por qué es un paso aparte**: agregar una variable de entorno con `vercel env add` **no** redespliega el código que ya está corriendo — solo queda guardada para el próximo build. Si cambiás una env var y no corrés `vercel --prod` después, el backend en producción sigue corriendo con la config vieja (esto nos pasó: agregamos las credenciales del Admin SDK, pero como no habíamos redesplegado, seguía fallando).

---

## Testing

### Type-check sin compilar

```bash
npx tsc -p tsconfig.app.json --noEmit    # el código de la app
npx tsc -p tsconfig.spec.json --noEmit   # los tests
```

**Por qué**: `tsc --noEmit` revisa tipos y errores de compilación sin generar archivos — es más rápido que un build completo y atrapa la mayoría de los errores de "me olvidé de importar algo" antes de correr nada.

### Correr la suite de tests

```bash
npm test -- --watch=false
```

**Por qué `--watch=false`**: sin ese flag, Jest se queda escuchando cambios y no termina — sirve para desarrollo pero no para "correlo una vez y dame el resultado".

### Comparar contra un estado anterior (antes de tocar nada)

```bash
git stash        # guarda los cambios sin comitear, vuelve el repo al último commit
npm test -- --watch=false
git stash pop    # trae de vuelta los cambios guardados
```

**Por qué**: para saber con certeza si un test roto "ya estaba roto antes" o "lo rompí yo", no alcanza con mirar — hay que correr la suite en el estado viejo y comparar. `git stash` es la forma rápida de ver el "antes" sin perder el "después" (queda guardado, no se borra).

⚠️ **Cuidado**: si tenés un servidor corriendo en modo watch (`ng serve`, `npm start`) mientras hacés `git stash`/`git stash pop`, el watcher puede confundirse con el cambio brusco de archivos y quedar sirviendo una versión vieja. Si después de un stash algo se ve raro en el navegador, reiniciá el servidor de desarrollo.

---

## Git / GitHub

### Nunca commitear directo a `master`

```bash
git checkout -b nombre-de-la-rama
# ... trabajo, commits ...
git push -u origin nombre-de-la-rama
```

La terminal te da un link tipo `https://github.com/usuario/repo/pull/new/nombre-de-la-rama` — entrando ahí se crea el Pull Request. **Por qué**: así lo que se sube queda revisable (el diff completo) antes de mezclarse a la rama principal, en vez de aparecer directo en producción.

### Comandos usados para ese flujo

```bash
git branch --show-current     # en qué rama estoy parado
git status --short            # qué archivos cambiaron
git add archivo1 archivo2     # stagear archivos puntuales (no todo junto)
git commit -m "mensaje"
git push -u origin rama
git fetch origin               # traer lo nuevo del remoto sin mezclarlo todavía
git pull origin master          # traer y mezclar los cambios de master
```

**Por qué stagear archivos puntuales en vez de `git add -A`**: cuando una sesión de trabajo mezcla varios temas distintos (por ejemplo: arreglos de seguridad + rediseño visual, como pasó acá), agrupar los commits por tema hace que el historial cuente una historia clara — se puede mirar `git log` después y entender qué se hizo y por qué, en vez de un solo commit gigante "cambios varios".

### Sacar una carpeta del repo sin borrarla del disco

```bash
git rm -r --cached .claude
# después agregar ".claude/" a .gitignore
```

**Por qué `--cached`**: borra el archivo del control de versiones (deja de subirse) pero lo deja intacto en tu disco. Sin `--cached`, `git rm` borra el archivo de verdad.

---

## Windows / PowerShell

### Encontrar y liberar un puerto ocupado

```powershell
Get-NetTCPConnection -LocalPort 4200 | Select-Object -ExpandProperty OwningProcess
Get-Process -Id <PID>              # para confirmar qué proceso es antes de matarlo
Stop-Process -Id <PID> -Force
```

**Por qué confirmar antes de matar**: un puerto ocupado puede ser un servidor viejo colgado (lo que nos pasó) o algo que el usuario sí quiere que siga corriendo — conviene mirar qué proceso es (`ProcessName`, `Path`) antes de cerrarlo de prepo.

---

## Conceptos que aparecieron seguido

- **Variable de entorno agregada ≠ efecto inmediato**: en Vercel hace falta redeploy; en local hace falta reiniciar el proceso (`node index.js` no relee `.env` solo).
- **Un archivo `.env.example` sin valores reales** documenta qué variables hacen falta sin exponer secretos — se comitea; el `.env` real nunca.
- **Reglas de seguridad de Firestore/Storage son "deny by default" en este proyecto**: todo lo que no se permite explícitamente queda bloqueado. Es más seguro que empezar abierto e ir cerrando.
