import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Producto {
  id:any;
  nombre: any;
  precio: any;
}

@Injectable({
  providedIn: 'root'
})
export class CARRITOService {

  producto:any;
  private productos: Producto[] = []; // Array para almacenar los productos en el carrito


  constructor() {
    this.cargarDesdeLocalStorage(); 
  }


  Agregar(producto:any){
    this.productos.push(producto);

    this.guardarEnLocalStorage();
    // Usar 'of()' para devolver el valor dentro de un Observable
    console.log("lo agregue",this.producto.nombre,this.producto.precio)
    return producto;
  }

  Consultar(): Observable<any> {
    console.log("Producto consultado:", this.producto);
    // Usar 'of()' para devolver el valor dentro de un Observable
    return of(this.producto); 
  }

  guardarEnLocalStorage(): void {
    localStorage.setItem('carrito', JSON.stringify(this.productos)); // Guardar el carrito en el localStorage
  }

  cargarDesdeLocalStorage(): void {
    if (typeof window !== 'undefined' && localStorage) { // Comprobar si localStorage está disponible
      const productosJSON = localStorage.getItem('carrito');
      if (productosJSON) {
        this.productos = JSON.parse(productosJSON); // Cargar productos existentes desde localStorage
      }
    }
  }
}
