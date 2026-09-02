import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

dotenv.config();

/* =========================
   Sube las imágenes locales de src/assets/img/{id}.jpg
   a Firebase Storage (carpeta productos/) y guarda la URL
   resultante en el campo "imagen" de cada producto en Firestore.

   Uso: node scripts/migrar-imagenes.js   (desde backend/)
   o:   npm run migrar-imagenes           (desde backend/)
========================= */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VARIABLES_REQUERIDAS = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_STORAGE_BUCKET',
];

const faltantes = VARIABLES_REQUERIDAS.filter(key => !process.env[key]);

if (faltantes.length > 0) {
  console.error('❌ Faltan variables de entorno:', faltantes.join(', '));
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

const CARPETA_IMAGENES = path.join(__dirname, '../../src/assets/img');

async function migrar() {

  console.log(`📂 Buscando imágenes en: ${CARPETA_IMAGENES}`);
  console.log(`🪣 Bucket destino: ${bucket.name}\n`);

  const snapshot = await db.collection('productos').get();

  console.log(`📦 ${snapshot.size} productos encontrados en Firestore\n`);

  let subidas = 0;
  let omitidas = 0;

  for (const doc of snapshot.docs) {

    const id = doc.id;
    const rutaLocal = path.join(CARPETA_IMAGENES, `${id}.jpg`);

    if (!fs.existsSync(rutaLocal)) {
      console.warn(`⚠️  Producto ${id}: no existe ${id}.jpg en assets/img, se omite`);
      omitidas++;
      continue;
    }

    const destino = `productos/${id}.jpg`;
    const token = randomUUID();

    await bucket.upload(rutaLocal, {
      destination: destino,
      metadata: {
        contentType: 'image/jpeg',
        metadata: {
          firebaseStorageDownloadTokens: token
        }
      }
    });

    const urlImagen =
      `https://firebasestorage.googleapis.com/v0/b/${bucket.name}` +
      `/o/${encodeURIComponent(destino)}?alt=media&token=${token}`;

    await db.collection('productos').doc(id).update({ imagen: urlImagen });

    console.log(`✅ Producto ${id}: subida OK → ${urlImagen}`);
    subidas++;
  }

  console.log(`\n🎉 Migración completa — ${subidas} subidas, ${omitidas} omitidas`);
}

migrar()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  });
