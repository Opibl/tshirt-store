import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ServicoService {

  // ✅ URL de tu backend en Vercel
  servidor = "https://back-store-mu.vercel.app/";

  constructor(private http: HttpClient) { }


  // ✅ Obtener productos desde backend
  obtenerDatos(): Observable<any> {

    return this.http.get(`${this.servidor}productos`)
      .pipe(
        catchError(error => {
          console.error("Error obteniendo productos:", error);
          return throwError(() => error);
        })
      );

  }


  // ✅ Crear sesión Stripe (CORREGIDO)
  stripe(data: any): Observable<any> {

    /*
      data debe ser:
      {
        productos: [...],
        envio: {...}
      }
    */

    return this.http.post(
      `${this.servidor}create-checkout-session`,
      data
    )
    .pipe(

      catchError(error => {

        console.error("Error creando sesión Stripe:", error);

        if (error.status === 0) {
          alert("No se pudo conectar al servidor");
        }

        if (error.status === 500) {
          alert("Error interno del servidor");
        }

        return throwError(() => error);

      })

    );

  }

}
