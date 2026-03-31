import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import {
  Auth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence
} from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  email: string = '';
  password: string = '';
  cargando: boolean = false;

  constructor(
    private router: Router,
    private auth: Auth
  ) {}

  async login(): Promise<void> {

    if (!this.email || !this.password) {
      alert('Completa todos los campos');
      return;
    }

    this.cargando = true;

    try {
      // 🔥 mantener sesión después de refresh
      await setPersistence(
        this.auth,
        browserLocalPersistence
      );

      const credenciales = await signInWithEmailAndPassword(
        this.auth,
        this.email,
        this.password
      );

      console.log('✅ Login exitoso:', credenciales.user);

      localStorage.setItem(
        'usuario',
        credenciales.user.email || ''
      );

      alert('Inicio de sesión exitoso');

      this.router.navigate(['/']);

    } catch (error: any) {
      console.error('❌ Error login:', error);

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
    this.cargando = true;

    try {
      // 🔥 guardar sesión en navegador
      await setPersistence(
        this.auth,
        browserLocalPersistence
      );

      const provider = new GoogleAuthProvider();

      const resultado = await signInWithPopup(
        this.auth,
        provider
      );

      console.log('✅ Google login:', resultado.user);

      localStorage.setItem(
        'usuario',
        resultado.user.email || ''
      );

      alert('Inicio con Google exitoso');

      this.router.navigate(['/']);

    } catch (error) {
      console.error('❌ Error Google:', error);
      alert('No se pudo iniciar con Google');

    } finally {
      this.cargando = false;
    }
  }
}