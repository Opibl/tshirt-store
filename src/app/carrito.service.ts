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
  Agregar(producto: Producto) {

    // 🔎 Buscar si ya existe el mismo producto + talla
    const existente = this.productos.find(
      item =>
        item.id === producto.id &&
        item.talla === producto.talla
    );

    if (existente) {
      // ✅ Si existe, sumar cantidad
      existente.cantidad += producto.cantidad;
    } else {
      // ✅ Si no existe, agregar nuevo
      this.productos.push(producto);
    }

    this.guardarEnLocalStorage();
    return producto;
  }

  // 👀 CONSULTAR CARRITO
  Consultar(): Observable<Producto[]> {
    return of(this.productos);
  }

  // 💾 GUARDAR EN LOCALSTORAGE
  guardarEnLocalStorage(): void {
    localStorage.setItem('carrito', JSON.stringify(this.productos));
  }

  // 📦 CARGAR DESDE LOCALSTORAGE
  cargarDesdeLocalStorage(): void {
    if (typeof window !== 'undefined' && localStorage) {
      const productosJSON = localStorage.getItem('carrito');
      if (productosJSON) {
        this.productos = JSON.parse(productosJSON);
      }
    }
  }
}
