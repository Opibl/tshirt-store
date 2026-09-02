import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { CARRITOService } from '../carrito.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy {

  usuarioLogueado: boolean = false;
  menuAbierto: boolean = false;
  cerrandoSesion: boolean = false;
  cantidadCarrito: number = 0;

  private usuarioSubscription?: Subscription;
  private carritoSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private carritoService: CARRITOService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usuarioSubscription = this.authService.usuario$.subscribe(usuario => {
      this.usuarioLogueado = !!usuario;
    });

    this.carritoSubscription = this.carritoService.cantidadTotal$.subscribe(cantidad => {
      this.cantidadCarrito = cantidad;
    });
  }

  async cerrarSesion(): Promise<void> {
    try {
      this.cerrandoSesion = true;

      await this.authService.logout();

      this.usuarioLogueado = false;
      this.menuAbierto = false;

      await this.router.navigate(['/']);

    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      this.cerrandoSesion = false;
    }
  }

  ngOnDestroy(): void {
    this.usuarioSubscription?.unsubscribe();
    this.carritoSubscription?.unsubscribe();
  }
}
