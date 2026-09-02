import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';

export interface Producto {

  id: any;
  nombre: any;
  precio: any;
  talla: any;
  cantidad: number;
  imagen?: string;

}

@Injectable({
  providedIn: 'root'
})
export class CARRITOService {

  private productos: Producto[] = [];

  private cantidadTotal = new BehaviorSubject<number>(0);

  // 🔔 Cantidad total de unidades en el carrito, para el badge del menú
  readonly cantidadTotal$ = this.cantidadTotal.asObservable();

  constructor() {

    this.cargarDesdeLocalStorage();
    this.emitirCantidad();

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
    this.emitirCantidad();

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

    this.emitirCantidad();

  }


  // ❌ ELIMINAR PRODUCTO INDIVIDUAL (OPCIONAL PERO RECOMENDADO)
  Eliminar(index: number): void {

    this.productos.splice(index, 1);

    this.guardarEnLocalStorage();
    this.emitirCantidad();

  }


  // 🔄 Releer localStorage y notificar — usar cuando el carrito
  // se modifica por fuera del servicio (ver CarritoComponent)
  sincronizar(): void {

    this.cargarDesdeLocalStorage();
    this.emitirCantidad();

  }


  private emitirCantidad(): void {

    const total = this.productos.reduce(
      (sum, p) => sum + (Number(p.cantidad) || 0),
      0
    );

    this.cantidadTotal.next(total);

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
