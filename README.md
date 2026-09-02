# Tshirt Store – Ecommerce de Poleras de Programación

## Descripción

**Tshirt Store** es una aplicación de ecommerce desarrollada para la venta de poleras inspiradas en lenguajes de programación.

El sistema utiliza una arquitectura moderna con:

- **Frontend:** Angular
- **Backend:** Node.js + Express
- **Base de datos:** Firebase Firestore
- **Pagos:** Stripe Checkout
- **Emails:** Resend API
- **Webhooks:** Stripe Webhooks para confirmación automática de pagos

Cuando una compra se completa exitosamente, el sistema envía automáticamente:

- Email al administrador
- Email de confirmación al cliente

---

## Arquitectura

### Frontend

- Angular
- Consume API REST del backend
- Muestra productos desde Firebase
- Redirige a Stripe Checkout para pagos

### Backend

- Node.js
- Express
- Firebase Firestore (productos)
- Stripe API (procesamiento de pagos)
- Stripe Webhooks (confirmación de pagos)
- Resend API (envío de correos)

---

## Servicios externos

- **Stripe** → Procesamiento de pagos
- **Firebase Firestore** → Base de datos de productos
- **Resend** → Envío de emails automáticos

---

## Funcionalidades principales

- Obtener productos desde Firebase Firestore
- Crear sesiones de pago con Stripe Checkout
- Calcular costos de envío automáticamente
- Procesar eventos `checkout.session.completed` mediante Stripe Webhook
- Enviar email al administrador con detalles de la compra
- Enviar email de confirmación al cliente
- Manejo seguro de variables de entorno

---

## Estructura del proyecto


tshirt-store/
│
├── frontend/ # Aplicación Angular
│
├── backend/ # Servidor Express
│ ├── server.js
│ ├── routes/
│ ├── services/
│ └── webhook/
│
└── README.md


---

## 🔌 Endpoints del Backend

### Obtener productos

**GET** `/productos`

Obtiene la lista de productos desde Firebase Firestore.

**Respuesta:**

```json
[
  {
    "nombre": "Polera React",
    "precio": 15000,
    "imagen": "url_imagen"
  }
]
Crear sesión de pago

POST /create-checkout-session

Crea una sesión de pago en Stripe Checkout.

Body:

{
  "productos": [
    {
      "nombre": "Polera Angular",
      "precio": 15000,
      "cantidad": 1,
      "talla": "M"
    }
  ]
}

Respuesta:

{
  "id": "session_id",
  "url": "stripe_checkout_url"
}
Webhook de Stripe

POST /stripe-webhook

Endpoint que recibe eventos desde Stripe.

Evento procesado:

checkout.session.completed

Acciones realizadas:

Obtiene detalles de la compra desde Stripe

Obtiene productos comprados

Obtiene información del cliente

Envía email al administrador

Envía email de confirmación al cliente

Variables de entorno requeridas

Crear un archivo .env en el backend:

PORT=3000

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Resend
RESEND_API_KEY=your_resend_api_key
EMAIL_TO=admin@email.com

# Firebase (proyecto)
FIREBASE_PROJECT_ID=your_project

# Firebase Admin SDK (cuenta de servicio, ver backend/.env.example)
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
Instalación
1. Clonar repositorio
git clone https://github.com/tuusuario/tshirt-store.git

cd tshirt-store/backend
2. Instalar dependencias
npm install
3. Ejecutar servidor

Modo desarrollo:

npm run dev

Modo normal:

node server.js

Servidor disponible en:

http://localhost:3000
Stripe Webhook en desarrollo

Instalar Stripe CLI y ejecutar:

stripe listen --forward-to localhost:3000/stripe-webhook
Flujo de pago

Usuario selecciona productos en Angular

Angular envía productos al backend

Backend crea sesión en Stripe

Usuario paga en Stripe Checkout

Stripe envía evento al webhook

Backend procesa el evento

Backend envía emails con Resend

Base de datos

Los productos se almacenan en Firebase Firestore en la colección:

productos

Ejemplo de documento:

{
  "nombre": "Polera React",
  "precio": 15000,
  "imagen": "url_imagen"
}
Seguridad

Validación de firma del webhook de Stripe

Uso de variables de entorno para claves privadas

No exposición de claves sensibles en el frontend

Backend seguro y desacoplado

Autor

Pedro Basualto

📄 Licencia

MIT License
