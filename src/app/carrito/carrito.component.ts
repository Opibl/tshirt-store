import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { loadStripe } from '@stripe/stripe-js';

import { CARRITOService } from '../carrito.service';
import { ServicoService } from '../servico.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.scss'],
})
export class CarritoComponent implements OnInit {

  productos: any[] = [];
  total: number = 0;

  constructor(
    private carrito: CARRITOService,
    private router: Router,
    private servicio: ServicoService
  ) {}

  ngOnInit(): void {

    // 🔹 Cargar carrito desde localStorage (FORMA SEGURA)
    if (typeof window !== 'undefined' && window.localStorage) {
      const productosJSON = window.localStorage.getItem('carrito');
      if (productosJSON) {
        this.productos = JSON.parse(productosJSON);
      }
    }

    // 🔹 Normalizar cantidades
    this.productos.forEach(p => {
      if (!p.cantidad || p.cantidad < 1) {
        p.cantidad = 1;
      }
    });

    // 🔹 Calcular total inicial
    this.calcularTotal();
  }

  // ❌ Eliminar producto
  eliminarDelCarrito(index: number) {
    this.productos.splice(index, 1);
    window.localStorage.setItem('carrito', JSON.stringify(this.productos));
    this.calcularTotal();
  }

  // 🔢 Actualizar cantidades manuales
  actualizarCantidad() {
    this.productos.forEach(p => {
      if (!p.cantidad || p.cantidad < 1) {
        p.cantidad = 1;
      }
    });

    window.localStorage.setItem('carrito', JSON.stringify(this.productos));
    this.calcularTotal();
  }

  // 💰 Calcular total general
  calcularTotal() {
    this.total = this.productos.reduce(
      (sum, p) => sum + Number(p.precio) * p.cantidad,
      0
    );
  }

  // 💳 FINALIZAR COMPRA (STRIPE CORRECTO)
  async terminarCompra() {

    if (!this.productos.length) return;

    // 🔹 AGRUPAR POR id + talla
    const productosAgrupados: any[] = [];

    this.productos.forEach(p => {
      const existente = productosAgrupados.find(
        x => x.id === p.id && x.talla === p.talla
      );

      if (existente) {
        existente.cantidad += p.cantidad;
      } else {
        productosAgrupados.push({ ...p });
      }
    });

    // 🔹 Enviar SOLO productos agrupados a Stripe
    this.servicio.stripe(productosAgrupados).subscribe(async (response: any) => {

      const stripe = await loadStripe(
        'pk_test_51QB27JLN0Hr2xNnZ4HgbiEBQMEXwZbTiRL3uf5nUwNzj85O2ZG2p0Zw8qKwg9cbcvbXrVgKRj93CfQs5mnXjdbLv007JzJB6HW'
      );

      if (stripe && response.id) {
        const { error } = await stripe.redirectToCheckout({
          sessionId: response.id
        });

        if (error) {
          console.error('Error en la redirección:', error);
        }
      }
    });
  }
}
