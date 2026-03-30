import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Auth, onAuthStateChanged, signOut } from '@angular/fire/auth';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy {

  usuarioLogueado: boolean = false;
  menuAbierto: boolean = false;

  private unsubscribeAuth: (() => void) | null = null;

  constructor(private auth: Auth) {}

  ngOnInit(): void {
    this.verificarSesion();
  }

  verificarSesion(): void {
    this.unsubscribeAuth = onAuthStateChanged(
      this.auth,
      (user) => {
        this.usuarioLogueado = !!user;
        console.log('Usuario actual:', user);
      }
    );
  }

  async cerrarSesion(): Promise<void> {
    try {
      await signOut(this.auth);

      localStorage.removeItem('usuario');

      this.usuarioLogueado = false;
      this.menuAbierto = false;

    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  ngOnDestroy(): void {
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
    }
  }
}