import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

import { ServicoService } from '../servico.service';
import { CARRITOService } from '../carrito.service';

@Component({
  selector: 'app-descripcion',
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule],
  templateUrl: './descripcion.component.html',
  styleUrls: ['./descripcion.component.scss']
})
export class DescripcionComponent implements OnInit {

  // 🔹 Datos del producto
  id: string | null = null;
  nombre: string = '';
  descripcion: string = '';
  precio: number = 0;

  // 🔹 Tallas y cantidad
  tallas: string[] = ['S', 'M', 'L', 'XL'];
  tallaSeleccionada: string | null = null;
  cantidadSeleccionada: number = 1;

  // 🔹 Producto para Stripe
  productos: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private servicio: ServicoService,
    private carrito: CARRITOService,
    private router: Router
  ) {}

  ngOnInit(): void {

    // Obtener ID desde la ruta
    this.id = this.route.snapshot.paramMap.get('id');

    if (!this.id) {
      console.error('ID de producto no válido');
      return;
    }

    // Obtener producto desde el servicio
    this.servicio.obtenerDatos().subscribe({
      next: (datos: any[]) => {
        const producto = datos.find(item => item.id == this.id);

        if (!producto) {
          console.error('Producto no encontrado');
          return;
        }

        this.nombre = producto.nombre;
        this.descripcion = producto.descripcion;
        this.precio = Number(producto.precio);

        this.productos = [producto];
      },

      error: (error) => {
        console.error('Error al obtener producto:', error);
      }
    });
  }

  // 🛒 AGREGAR AL CARRITO
  addToCart(): void {

    console.log('CLICK addToCart');

    if (!this.tallaSeleccionada) {
      Swal.fire('Selecciona una talla', '', 'warning');
      return;
    }

    if (!this.cantidadSeleccionada || this.cantidadSeleccionada < 1) {
      this.cantidadSeleccionada = 1;
    }

    const productoCarrito = {
      id: this.id,
      nombre: this.nombre,
      precio: this.precio,
      talla: this.tallaSeleccionada,
      cantidad: this.cantidadSeleccionada
    };

    this.carrito.Agregar(productoCarrito);

    console.log('Producto agregado:', productoCarrito);

    Swal.fire({
      title: 'Producto agregado',
      text: `${this.nombre} - Talla ${this.tallaSeleccionada} (x${this.cantidadSeleccionada})`,
      icon: 'success',
      confirmButtonText: 'Aceptar'
    });
  }

  // 💳 COMPRAR AHORA (STRIPE CORREGIDO)
  comprarAhora(): void {

    if (!this.tallaSeleccionada) {
      Swal.fire('Selecciona una talla', '', 'warning');
      return;
    }

    if (!this.cantidadSeleccionada || this.cantidadSeleccionada < 1) {
      this.cantidadSeleccionada = 1;
    }

    const productosCheckout = [{
      id: this.id,
      nombre: this.nombre,
      precio: this.precio,
      talla: this.tallaSeleccionada,
      cantidad: this.cantidadSeleccionada
    }];

    console.log('Enviando a Stripe:', productosCheckout);

    this.servicio.stripe(productosCheckout).subscribe({
      next: (response: any) => {

        console.log('Respuesta Stripe:', response);

        if (response.url) {
          window.location.href = response.url;
        } else {
          console.error('Stripe no devolvió URL');
          Swal.fire(
            'Error',
            'No se pudo iniciar el pago',
            'error'
          );
        }
      },

      error: (error) => {
        console.error('Error Stripe:', error);

        Swal.fire(
          'Error',
          'Hubo un problema al conectar con Stripe',
          'error'
        );
      }
    });
  }
}