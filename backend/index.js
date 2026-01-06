import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite'; // Importa funciones necesarias de Firestore
import Stripe from 'stripe'; // Usa la importación correcta de Stripe


dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};




// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const server = express();
server.use(cors());
server.use(express.json());

// Ruta para obtener cursos
server.get('/productos', async (req, res) => {
  try {
    const productosCol = collection(db, 'productos'); // Obtén la colección de cursos
    const productosSnapshot = await getDocs(productosCol); // Obtén los documentos de la colección
    const productos = productosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); // Mapea los datos de los cursos
    res.status(200).json(productos); // Envía los datos como respuesta
  } catch (error) {
    console.error('Error al obtener los productos:', error); // Agrega logging para errores
    res.status(500).send('Error al obtener los productos'); // Maneja el error
  }
});



server.post('/create-checkout-session', async (req, res) => {
  try {

    const productos = req.body.productos;

    console.log('Productos recibidos:', productos);

    const line_items = productos.map(item => ({
      price_data: {
        currency: 'clp',
        product_data: {
          name: `${item.nombre} - Talla ${item.talla}`,
        },
        unit_amount: Number(item.precio), // 🔑 PRECIO UNITARIO EN CENTAVOS
      },
      quantity: Number(item.cantidad), // 🔑 AQUÍ ESTABA EL ERROR
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      success_url: 'https://tshirt-storeop.netlify.app/success',
      cancel_url: 'https://tshirt-storeop.netlify.app/cancel',
    });

    res.status(200).json({ id: session.id });

  } catch (error) {
    console.error('Error al crear la sesión de pago:', error);
    res.status(500).json({ error: 'Hubo un problema al crear la sesión de pago' });
  }
});


const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});







