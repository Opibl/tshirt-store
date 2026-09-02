import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CARRITOService } from '../carrito.service';
import { ServicoService } from '../servico.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.scss'],
})
export class CarritoComponent implements OnInit {

  productos: any[] = [];
  total: number = 0;
  cargando: boolean = false;

  constructor(
    private carrito: CARRITOService,
    private router: Router,
    private servicio: ServicoService
  ) {}

  ngOnInit(): void {

    // 🔹 Cargar carrito desde localStorage
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

    this.calcularTotal();
  }

  // ❌ Eliminar producto
  eliminarDelCarrito(index: number) {

    this.productos.splice(index, 1);

    window.localStorage.setItem(
      'carrito',
      JSON.stringify(this.productos)
    );

    this.carrito.sincronizar();
    this.calcularTotal();
  }

  // 🔢 Actualizar cantidades manuales
  actualizarCantidad() {

    this.productos.forEach(p => {
      if (!p.cantidad || p.cantidad < 1) {
        p.cantidad = 1;
      }
    });

    window.localStorage.setItem(
      'carrito',
      JSON.stringify(this.productos)
    );

    this.carrito.sincronizar();
    this.calcularTotal();
  }

  // 💰 Calcular total
  calcularTotal() {

    this.total = this.productos.reduce(
      (sum, p) => sum + Number(p.precio) * p.cantidad,
      0
    );
  }

  // 💳 FINALIZAR COMPRA
  terminarCompra() {

    if (!this.productos.length) return;

    this.cargando = true;

    // 🔹 Agrupar productos por id + talla
    const productosAgrupados: any[] = [];

    this.productos.forEach(p => {

      const existente = productosAgrupados.find(
        x => x.id === p.id && x.talla === p.talla
      );

      if (existente) {
        existente.cantidad += p.cantidad;
      } else {
        productosAgrupados.push({
          id: p.id,
          nombre: p.nombre,
          precio: p.precio,
          talla: p.talla,
          cantidad: p.cantidad
        });
      }

    });

    console.log("Productos enviados a Stripe:", productosAgrupados);

    // 🔹 Llamar backend
    this.servicio.stripe(productosAgrupados)
      .subscribe({

        next: (response: any) => {

          console.log("Respuesta Stripe:", response);

          if (response.url) {

            // ✅ REDIRECCIÓN CORRECTA
            window.location.href = response.url;

          } else {

            console.error("Stripe no devolvió URL");
            this.cargando = false;

          }

        },

        error: (error) => {

          console.error("Error llamando backend:", error);
          this.cargando = false;

        }

      });

  }

}