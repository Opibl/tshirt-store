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

const corsOptions = {
  origin: 'https://tshirt-storeop.netlify.app', // Cambia esto por la URL de tu app en producción
  optionsSuccessStatus: 200
};

server.use(cors(corsOptions));

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
    // Mapea los productos del cuerpo de la solicitud
    const line_items = req.body.productos.map((item) => {
      return {
        price_data: {
          currency: 'clp',
          product_data: {
            name: item.nombre, // Nombre del producto
          },
          unit_amount: item.precio, // Precio en centavos (Stripe requiere este formato)
        },
        quantity: item.quantity || 1, // Cantidad de producto
      };
    });

    // Crea la sesión de Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], // Métodos de pago aceptados
      line_items: line_items, // Productos mapeados
      mode: 'payment', // Modo de pago
      success_url: 'https://tshirt-storeop.netlify.app//success', // URL de éxito
      cancel_url: 'https://tshirt-storeop.netlify.app//cancel',  // URL de cancelación
    });

    // Envía la sesión creada como respuesta
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







