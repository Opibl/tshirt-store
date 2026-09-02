import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription, switchMap, of, from } from 'rxjs';

import { AuthService } from '../../auth/auth.service';
import { ServicoService } from '../../servico.service';

@Component({
  selector: 'app-purchase-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './purchase-history.component.html',
  styleUrls: ['./purchase-history.component.scss']
})
export class PurchaseHistoryComponent implements OnInit, OnDestroy {

  compras: any[] = [];
  cargando = true;
  error = false;

  private comprasSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private servicio: ServicoService
  ) {}

  ngOnInit(): void {
    this.obtenerCompras();
  }

  ngOnDestroy(): void {
    this.comprasSubscription?.unsubscribe();
  }

  obtenerCompras(): void {

    this.comprasSubscription = this.authService.usuario$.pipe(

      switchMap(usuario => {

        if (!usuario) {
          return of(null);
        }

        // 🔒 El backend valida este token y solo devuelve
        // las compras del usuario autenticado (no las de todos).
        return from(usuario.getIdToken()).pipe(
          switchMap(token => this.servicio.obtenerCompras(token))
        );
      })

    ).subscribe({
      next: (data) => {
        this.compras = data ?? [];
        this.cargando = false;
      },
      error: (error) => {
        console.error('❌ Error obteniendo compras:', error);
        this.compras = [];
        this.cargando = false;
        this.error = true;
      }
    });
  }
}
