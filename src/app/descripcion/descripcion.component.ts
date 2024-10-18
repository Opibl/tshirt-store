import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ServicoService } from '../servico.service';
import { CARRITOService } from '../carrito.service';
import Swal from 'sweetalert2';
import { loadStripe } from '@stripe/stripe-js';


@Component({
  selector: 'app-descripcion',
  standalone: true,
  imports: [HttpClientModule],
  templateUrl: './descripcion.component.html',
  styleUrls: ['./descripcion.component.scss']
})
export class DescripcionComponent implements OnInit {
  id: string | null = null;
  precio: number = 0;
  descripcion: string = '';
  nombre:string = '';
  productos:any[] = [];
  constructor(private route: ActivatedRoute, private servicio: ServicoService,private carrito: CARRITOService) { }

  ngOnInit(): void {
    // Obtener el parámetro de la ruta
    this.id = this.route.snapshot.paramMap.get('id');

    if (this.id) {
      // Llamada al servicio para obtener los datos solo si el ID es válido
      this.servicio.obtenerDatos().subscribe(
        (datos: any[]) => {  // Asumo que 'datos' es un array de objetos
          const producto = datos.find(item => item.id === this.id);  // Encuentra el producto
          this.productos.push(producto)
          if (producto) {
            this.precio = producto.precio;
            this.descripcion = producto.descripcion;
            this.nombre = producto.nombre
          } else {
            console.error('Producto no encontrado');
          }
        },
        (error: any) => {
          console.error('Error al obtener los datos:', error); // Manejo de errores
        }
      );
    } else {
      console.error('ID no válido');
    }
  }

  addToCart(nombre:any,precio:any) {
    
    // Crear un objeto con las propiedades nombre y precio
    const product = {
      id:this.id,
      nombre: nombre,
      precio: precio,
    };
    
    console.log('Producto agregado:', product);
    // Llamar al método Agregar del servicio
    // Mostrar una alerta bonita con SweetAlert2
    Swal.fire({
      title: '¡Producto Agregado!',
      text: `${nombre} ha sido añadido al carrito.`,
      icon: 'success',
      confirmButtonText: 'Aceptar',
      background: '#fff',
      color: '#333',
      showCloseButton: true,
    });
    this.carrito.Agregar(product);
    // Mostrar una alerta bonita
   
  }

  comprarAhora(){
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

