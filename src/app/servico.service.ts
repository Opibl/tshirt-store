import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServicoService {

  servidor = "https://back-store-8f9mwpx20-opibls-projects.vercel.app";

  constructor(private servicio:HttpClient) { }

  Consultar():Observable<any>{

    return this.servicio.get(`${this.servidor}`);
   
  }

  obtenerDatos(): Observable<any> {
    return this.servicio.get(`${this.servidor}productos`);
  }

  stripe(productos: any): Observable<any> {
    return this.servicio.post(`${this.servidor}create-checkout-session`, { productos })
      .pipe(
        catchError(error => {
          console.error('Error en la sesión de Stripe:', error);
          return throwError(error);
        })
      );
  }
  
}
