import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { loadStripe } from '@stripe/stripe-js';
import { ServicoService } from '../servico.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {

  productos: any[] = [];

  envio = {
    nombre: '',
    email: '',
    direccion: '',
    ciudad: '',
    region: '',
    codigoPostal: '',
    telefono: ''
  };

  constructor(
    private servicio: ServicoService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.cargarCarritoSeguro();

  }


  // ✅ cargar carrito de forma segura
  cargarCarritoSeguro(): void {

    try {

      const storage = globalThis?.localStorage;

      if (!storage) {
        console.warn("localStorage no disponible");
        return;
      }

      const data = storage.getItem('carrito');

      if (data) {
        this.productos = JSON.parse(data);
      }

    } catch (error) {

      console.warn("No se pudo acceder a localStorage:", error);
      this.productos = [];

    }

  }


  // ✅ botón volver al carrito
  volverCarrito(): void {

    this.router.navigate(['/carrito']);

  }


  // ✅ pagar con Stripe
  async pagar(): Promise<void> {

    if (!this.productos.length) {

      alert("Carrito vacío");
      return;

    }

    if (
      !this.envio.nombre ||
      !this.envio.email ||
      !this.envio.direccion ||
      !this.envio.telefono
    ) {

      alert("Completa los datos de envío");
      return;

    }

    this.servicio.stripe({
      productos: this.productos,
      envio: this.envio
    })
    .subscribe({

      next: async (response: any) => {

        const stripe = await loadStripe(
          'pk_test_51QB27JLN0Hr2xNnZ4HgbiEBQMEXwZbTiRL3uf5nUwNzj85O2ZG2p0Zw8qKwg9cbcvbXrVgKRj93CfQs5mnXjdbLv007JzJB6HW'
        );

        if (!stripe) {

          alert("Error cargando Stripe");
          return;

        }

        const { error } = await stripe.redirectToCheckout({

          sessionId: response.id

        });

        if (error) {

          console.error("Stripe error:", error);
          alert("Error redirigiendo al pago");

        }

      },

      error: err => {

        console.error("Error backend:", err);
        alert("Error en el pago");

      }

    });

  }

}
