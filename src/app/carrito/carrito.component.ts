import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

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

    this.cargarCarrito();

  }


  // ✅ Cargar carrito desde localStorage
  cargarCarrito(): void {

    if (typeof window !== 'undefined' && window.localStorage) {

      const productosJSON = window.localStorage.getItem('carrito');

      if (productosJSON) {

        this.productos = JSON.parse(productosJSON);

      } else {

        this.productos = [];

      }

    }

    this.normalizarCantidades();

    this.calcularTotal();

  }


  // ✅ Normalizar cantidades
  normalizarCantidades(): void {

    this.productos.forEach(p => {

      if (!p.cantidad || p.cantidad < 1) {

        p.cantidad = 1;

      }

    });

  }


  // ❌ Eliminar producto
  eliminarDelCarrito(index: number): void {

    this.productos.splice(index, 1);

    window.localStorage.setItem(
      'carrito',
      JSON.stringify(this.productos)
    );

    this.calcularTotal();

  }


  // 🔢 Actualizar cantidades manuales
  actualizarCantidad(): void {

    this.normalizarCantidades();

    window.localStorage.setItem(
      'carrito',
      JSON.stringify(this.productos)
    );

    this.calcularTotal();

  }


  // 💰 Calcular total
  calcularTotal(): void {

    this.total = this.productos.reduce(

      (sum, producto) => sum + Number(producto.precio) * producto.cantidad,

      0

    );

  }


  // 🧾 Ir a checkout (pagina envio)
  terminarCompra(): void {

    if (!this.productos || this.productos.length === 0) {

      alert("Tu carrito está vacío");
      return;

    }

    // redirigir a pagina checkout
    this.router.navigate(['/checkout']);

  }


}
