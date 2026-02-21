import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';
import Stripe from 'stripe';
import { Resend } from 'resend';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

/* =========================
   STRIPE
========================= */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

/* =========================
   FIREBASE
========================= */

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

/* =========================
   EXPRESS
========================= */

const server = express();

server.use(cors());

// Stripe webhook necesita RAW
server.use('/stripe-webhook', express.raw({ type: 'application/json' }));

// resto usa JSON
server.use(express.json());

/* =========================
   OBTENER PRODUCTOS
========================= */

server.get('/productos', async (req, res) => {

  try {

    const productosCol = collection(db, 'productos');
    const snapshot = await getDocs(productosCol);

    const productos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(productos);

  } catch (error) {

    console.error("Error obteniendo productos:", error);

    res.status(500).json({
      error: 'Error obteniendo productos'
    });

  }

});


/* =========================
   CREAR CHECKOUT SESSION
========================= */

server.post('/create-checkout-session', async (req, res) => {

  try {

    const productos = req.body.productos;

    console.log("\n🛒 Productos recibidos:");
    console.log(productos);

    if (!productos || productos.length === 0) {

      return res.status(400).json({
        error: "No hay productos"
      });

    }

    const line_items = productos.map(item => ({

      price_data: {

        currency: 'clp',

        product_data: {
          name: `${item.nombre} - Talla ${item.talla}`,
        },

        unit_amount: Number(item.precio),

      },

      quantity: Number(item.cantidad),

    }));


    /* ===== CALCULAR ENVÍO ===== */

    const total = productos.reduce(
      (sum, item) =>
        sum + Number(item.precio) * Number(item.cantidad),
      0
    );

    const costoEnvio = total >= 20000 ? 0 : 3990;

    console.log("Total:", total);
    console.log("Costo envío:", costoEnvio);


    /* ===== CREAR SESIÓN STRIPE ===== */

    const session = await stripe.checkout.sessions.create({

      payment_method_types: ['card'],

      mode: 'payment',

      line_items,

      customer_creation: 'always',

      billing_address_collection: 'required',

      shipping_address_collection: {
        allowed_countries: ['CL'],
      },

      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: costoEnvio,
              currency: 'clp',
            },
            display_name:
              costoEnvio === 0
                ? 'Envío gratis'
                : 'Envío estándar',
          }
        }
      ],

      metadata: {
        origen: 'tienda_online'
      },

      success_url:
        'https://tshirt-storeop.netlify.app/success',

      cancel_url:
        'https://tshirt-storeop.netlify.app/cancel',

    });


    console.log("\n✅ Session creada:");
    console.log("Session ID:", session.id);

    res.json({
      id: session.id,
      url: session.url
    });

  } catch (error) {

    console.error("Error creando sesión:", error);

    res.status(500).json({
      error: error.message
    });

  }

});


/* =========================
   WEBHOOK
========================= */

server.post('/stripe-webhook', async (req, res) => {

  const sig = req.headers['stripe-signature'];

  let event;

  try {

    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

  } catch (err) {

    console.log("❌ Error verificando webhook:", err.message);
    return res.sendStatus(400);

  }

  if (event.type === 'checkout.session.completed') {

    console.log("\n==============================");
    console.log("✅ PAGO COMPLETADO");
    console.log("==============================");

    try {

      /* =========================
         OBTENER SESSION COMPLETA
      ========================= */

      const session = await stripe.checkout.sessions.retrieve(
        event.data.object.id,
        {
          expand: ['customer']
        }
      );


      /* =========================
         OBTENER PRODUCTOS
      ========================= */

      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id,
        { limit: 100 }
      );


      /* =========================
         CREAR HTML PRODUCTOS
      ========================= */

      const productosHTML = lineItems.data.map(item => {

        const nombreProducto = item.description;
        const cantidad = item.quantity;
        const totalProducto = item.amount_total;

        return `
          <tr>
            <td style="padding:8px;border-bottom:1px solid #eee;">
              ${nombreProducto}
            </td>

            <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">
              ${cantidad}
            </td>

            <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">
              $${totalProducto} CLP
            </td>
          </tr>
        `;

      }).join('');


      /* =========================
         DATOS CLIENTE
      ========================= */

      const nombre =
        session.shipping_details?.name ||
        session.customer_details?.name ||
        session.customer?.name ||
        "Cliente";

      const email =
        session.customer_details?.email ||
        session.customer?.email ||
        null;

      const direccion =
        session.shipping_details?.address?.line1 ||
        session.customer_details?.address?.line1 ||
        "No especificada";

      const ciudad =
        session.shipping_details?.address?.city ||
        session.customer_details?.address?.city ||
        "";

      const region =
        session.shipping_details?.address?.state ||
        session.customer_details?.address?.state ||
        "";

      const postal =
        session.shipping_details?.address?.postal_code ||
        session.customer_details?.address?.postal_code ||
        "";

      const monto = session.amount_total;

      console.log("📧 Email cliente:", email);


      /* =========================
         EMAIL ADMIN
      ========================= */

      await resend.emails.send({

        from: "MercadoEnvios <ventas@mercadoenvios.es>",

        to: process.env.EMAIL_TO,

        subject: "🛒 Nueva compra recibida",

        html: `
          <h2>Nueva compra recibida</h2>

          <p><strong>Nombre:</strong> ${nombre}</p>
          <p><strong>Email:</strong> ${email}</p>

          <h3>🛒 Productos</h3>

          <table style="width:100%;border-collapse:collapse;">
            ${productosHTML}
          </table>

          <h3>📦 Dirección</h3>

          <p>
            ${direccion}<br/>
            ${ciudad}<br/>
            ${region}<br/>
            ${postal}
          </p>

          <h3>💰 Total</h3>

          <p><strong>$${monto} CLP</strong></p>

          <hr/>

          <p>Payment Intent: ${session.payment_intent}</p>
          <p>Order ID: ${session.id}</p>
        `

      });


      /* =========================
         EMAIL CLIENTE
      ========================= */

      if (email) {

        await resend.emails.send({

          from: "MercadoEnvios <ventas@mercadoenvios.es>",

          to: email,

          reply_to: "ventas@mercadoenvios.es",

          subject: "Confirmación de compra",

          html: `
            <h2>Gracias por tu compra, ${nombre} 🙌</h2>

            <p>Tu pedido fue recibido correctamente.</p>

            <h3>🛒 Productos</h3>

            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr>
                  <th style="text-align:left;padding:8px;">Producto</th>
                  <th style="text-align:center;padding:8px;">Cantidad</th>
                  <th style="text-align:right;padding:8px;">Total</th>
                </tr>
              </thead>

              <tbody>
                ${productosHTML}
              </tbody>
            </table>

            <h3>📦 Dirección de envío</h3>

            <p>
              ${direccion}<br/>
              ${ciudad}<br/>
              ${region}<br/>
              ${postal}
            </p>

            <h3>💰 Total pagado</h3>

            <p><strong>$${monto} CLP</strong></p>

            <hr/>

            <p>Te avisaremos cuando tu pedido sea enviado.</p>

            <p>Gracias por comprar en MercadoEnvios ❤️</p>

            <p><small>ID Pedido: ${session.id}</small></p>
          `

        });

      }

      console.log("✅ Emails enviados correctamente");

    } catch (error) {

      console.log("❌ Error procesando webhook:", error);

    }

  }

  res.status(200).json({ received: true });

});

/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {

  console.log(`\n🚀 Servidor corriendo en puerto ${PORT}`);

});