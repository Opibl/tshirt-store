import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  email: string = '';
  password: string = '';
  cargando: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  async login(): Promise<void> {

    if (!this.email || !this.password) {
      alert('Completa todos los campos');
      return;
    }

    this.cargando = true;

    try {

      const credenciales = await this.authService.login(
        this.email,
        this.password
      );

      console.log('Login exitoso:', credenciales.user);

      alert('Inicio de sesión exitoso');

      this.router.navigate(['/']);

    } catch (error: any) {

      console.error('Error login:', error);

      switch (error.code) {
        case 'auth/user-not-found':
          alert('Usuario no encontrado');
          break;

        case 'auth/wrong-password':
          alert('Contraseña incorrecta');
          break;

        case 'auth/invalid-email':
          alert('Correo inválido');
          break;

        default:
          alert('Correo o contraseña incorrectos');
      }

    } finally {
      this.cargando = false;
    }
  }

  async loginConGoogle(): Promise<void> {

    if (this.cargando) return;

    this.cargando = true;

    try {

      const resultado = await this.authService.loginConGoogle();

      console.log('✅ Google login:', resultado.user);

      await this.router.navigate(['/']);

    } catch (error: any) {
      console.error('❌ Error Google:', error);

      if (error.code !== 'auth/popup-closed-by-user') {
        alert('No se pudo iniciar con Google');
      }

    } finally {
      this.cargando = false;
    }
  }
}
