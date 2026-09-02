import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  Auth,
  User,
  authState,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signOut
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // 🔹 Estado de sesión reactivo: null = no logueado.
  // Fuente única de verdad — nada de duplicarlo en localStorage.
  readonly usuario$: Observable<User | null>;

  constructor(private auth: Auth) {
    this.usuario$ = authState(this.auth);
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  loginConGoogle() {
    return signInWithPopup(this.auth, new GoogleAuthProvider());
  }

  registrar(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    return signOut(this.auth);
  }

  // 🔒 Token para llamadas autenticadas al backend (ver ServicoService.obtenerCompras)
  async obtenerToken(): Promise<string | null> {
    const usuario = this.auth.currentUser;
    return usuario ? usuario.getIdToken() : null;
  }
}
