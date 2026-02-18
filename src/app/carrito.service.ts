import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Producto {

  id: any;
  nombre: any;
  precio: any;
  talla: any;
  cantidad: number;

}

@Injectable({
  providedIn: 'root'
})
export class CARRITOService {

  private productos: Producto[] = [];

  constructor() {

    this.cargarDesdeLocalStorage();

  }


  // 🛒 AGREGAR PRODUCTO (SIN DUPLICAR)
  Agregar(producto: Producto): Producto {

    const existente = this.productos.find(item =>

      item.id === producto.id &&
      item.talla === producto.talla

    );

    if (existente) {

      existente.cantidad += producto.cantidad;

    }
    else {

      this.productos.push(producto);

    }

    this.guardarEnLocalStorage();

    return producto;

  }


  // 👀 CONSULTAR CARRITO
  Consultar(): Observable<Producto[]> {

    return of(this.productos);

  }


  // ❌ ELIMINAR TODO EL CARRITO (AGREGADO)
  Vaciar(): void {

    this.productos = [];

    if (typeof window !== 'undefined') {

      localStorage.removeItem('carrito');

    }

  }


  // ❌ ELIMINAR PRODUCTO INDIVIDUAL (OPCIONAL PERO RECOMENDADO)
  Eliminar(index: number): void {

    this.productos.splice(index, 1);

    this.guardarEnLocalStorage();

  }


  // 💾 GUARDAR EN LOCALSTORAGE
  guardarEnLocalStorage(): void {

    if (typeof window !== 'undefined') {

      localStorage.setItem(
        'carrito',
        JSON.stringify(this.productos)
      );

    }

  }


  // 📦 CARGAR DESDE LOCALSTORAGE
  cargarDesdeLocalStorage(): void {

    if (typeof window !== 'undefined') {

      const productosJSON = localStorage.getItem('carrito');

      if (productosJSON) {

        this.productos = JSON.parse(productosJSON);

      }

    }

  }

}
