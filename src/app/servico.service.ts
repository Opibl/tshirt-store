import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ServicoService {

  // 🔹 URL del backend
  //private servidor = 'http://localhost:3000';

  // 🔹 En producción usar esto:
  private servidor = 'https://back-store-mu.vercel.app';

  constructor(private http: HttpClient) {}

  // 🔹 Obtener productos
  obtenerDatos(): Observable<any> {

    return this.http
      .get(`${this.servidor}/productos`)
      .pipe(
        catchError(this.manejarError)
      );

  }

  // 🔹 Crear sesión Stripe Checkout
  stripe(productos: any[]): Observable<any> {

    return this.http
      .post(`${this.servidor}/create-checkout-session`, {
        productos: productos
      })
      .pipe(
        catchError(this.manejarError)
      );

  }

  // 🔹 Manejo centralizado de errores
  private manejarError(error: any) {

    console.error('Error en el servicio:', error);

    return throwError(() => error);

  }

}