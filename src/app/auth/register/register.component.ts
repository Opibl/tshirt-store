import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  nombre: string = '';
  email: string = '';
  password: string = '';
  confirmarPassword: string = '';

  cargando: boolean = false;

  constructor(
    private router: Router,
    private auth: Auth
  ) {}

  async registrar(): Promise<void> {

    if (!this.nombre || !this.email || !this.password || !this.confirmarPassword) {
      alert('Completa todos los campos');
      return;
    }

    if (this.password !== this.confirmarPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (this.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    this.cargando = true;

    try {

      const credenciales = await createUserWithEmailAndPassword(
        this.auth,
        this.email,
        this.password
      );

      console.log('Usuario registrado:', credenciales.user);

      alert('Cuenta creada correctamente');

      this.router.navigate(['/login']);

    } catch (error: any) {

      console.error(error);

      switch (error.code) {
        case 'auth/email-already-in-use':
          alert('El correo ya está registrado');
          break;

        case 'auth/invalid-email':
          alert('Correo inválido');
          break;

        case 'auth/weak-password':
          alert('Contraseña demasiado débil');
          break;

        default:
          alert('Error al crear la cuenta');
      }

    } finally {
      this.cargando = false;
    }
  }
}