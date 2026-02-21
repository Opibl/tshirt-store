Tshirt Store – Ecommerce de Poleras de Programación

Descripción

Tshirt Store es una aplicación de ecommerce desarrollada para la venta de poleras inspiradas en lenguajes de programación. El frontend fue construido con Angular y el backend con Node.js y Express.

El sistema permite visualizar productos almacenados en Firebase Firestore, realizar pagos seguros mediante Stripe Checkout y enviar correos electrónicos automáticos utilizando Resend cuando una compra es completada exitosamente mediante Stripe Webhooks.

Arquitectura

Frontend

Angular

Consume API REST del backend

Redirige a Stripe Checkout

Backend

Node.js

Express

Firebase Firestore (productos)

Stripe API (pagos)

Stripe Webhooks (confirmación de pagos)

Resend API (envío de emails)

Servicios externos

Stripe para procesamiento de pagos

Firebase Firestore como base de datos de productos

Resend para envío de correos electrónicos

Funcionalidades principales

Obtener productos desde Firebase Firestore

Crear sesiones de pago con Stripe Checkout

Calcular costo de envío automáticamente

Procesar eventos checkout.session.completed mediante Stripe Webhook

Enviar email al administrador con detalles de la compra

Enviar email de confirmación al cliente

Manejo seguro de variables de entorno

Estructura del proyecto

tshirt-store/

frontend/
Aplicación Angular

backend/
Servidor Express
Integración con Stripe
Integración con Firebase
Webhook de Stripe
Integración con Resend

Endpoints del backend

GET /productos

Obtiene la lista de productos desde Firebase Firestore

POST /create-checkout-session

Crea una sesión de pago en Stripe Checkout

Body esperado:

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

POST /stripe-webhook

Endpoint que recibe eventos desde Stripe

Procesa el evento:

checkout.session.completed

Acciones realizadas:

Obtiene detalles de la compra desde Stripe

Obtiene productos comprados

Obtiene información del cliente

Envía email al administrador

Envía email de confirmación al cliente

Variables de entorno requeridas

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

RESEND_API_KEY=your_resend_api_key
EMAIL_TO=admin@email.com

FIREBASE_API_KEY=your_firebase_key
FIREBASE_AUTH_DOMAIN=your_domain
FIREBASE_PROJECT_ID=your_project
FIREBASE_STORAGE_BUCKET=your_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

PORT=3000

Instalación

Instalar dependencias

npm install

Ejecutar servidor

npm run dev

o

node server.js

Servidor disponible en:

http://localhost:3000

Stripe Webhook en desarrollo

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
nombre: "Polera React",
precio: 15000,
imagen: "url_imagen"
}

Seguridad

Validación de firma del webhook de Stripe

Uso de variables de entorno para claves privadas

No exposición de claves en el frontend

Autor

Pedro Basualto

Licencia

MIT
