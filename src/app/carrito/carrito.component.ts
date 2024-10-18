import { Component, OnInit } from '@angular/core';
import { CARRITOService } from '../carrito.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ServicoService } from '../servico.service';
import { loadStripe } from '@stripe/stripe-js';


@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.scss'],
})
export class CarritoComponent implements OnInit {
  id: string | null = null;
  precio: number = 0;
  descripcion: string = '';
  productos: any[] = [];
  total: number = 0;

  constructor(private carrito: CARRITOService,private router: Router,private servicio: ServicoService) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && localStorage) {
      const productosJSON = localStorage.getItem('carrito');
      if (productosJSON) {
        this.productos = JSON.parse(productosJSON);
      }
    }

    if (this.productos && Array.isArray(this.productos)) {
      this.productos.forEach(prod => {
        console.log(`Producto: ${prod.nombre}, Precio: ${prod.precio}`);
        this.total += Number(prod.precio);
      });
    } else {
      console.log('No hay productos en el carrito');
    }
    console.log(this.productos);
  }

  eliminarDelCarrito(index: number) {
    this.productos.splice(index, 1); // Eliminar el producto del array
    localStorage.setItem('carrito', JSON.stringify(this.productos)); // Actualizar localStorage
    this.calcularTotal(); // Recalcular el total
  }

  calcularTotal() {
    this.total = this.productos.reduce((sum, prod) => sum + Number(prod.precio), 0);
  }

  async terminarCompra() {
    // Llama a tu servicio para obtener la sesión de Stripe
    this.servicio.stripe(this.productos).subscribe(async (response: any) => {
      const stripe = await loadStripe('pk_test_51QB27JLN0Hr2xNnZ4HgbiEBQMEXwZbTiRL3uf5nUwNzj85O2ZG2p0Zw8qKwg9cbcvbXrVgKRj93CfQs5mnXjdbLv007JzJB6HW');
  
      if (stripe && response.id) {
        // Redirige al usuario a la página de pago de Stripe
        const { error } = await stripe.redirectToCheckout({
          sessionId: response.id
        });
  
        if (error) {
          console.error('Error en la redirección al checkout:', error);
        }
      }
    });
  }
  
}
