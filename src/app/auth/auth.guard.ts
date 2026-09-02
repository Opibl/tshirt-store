import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';

import { AuthService } from './auth.service';

// 🔒 Bloquea rutas privadas (historial, tracking) a usuarios no autenticados
export const authGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.usuario$.pipe(
    take(1),
    map(usuario => {

      if (usuario) {
        return true;
      }

      router.navigate(['/login']);
      return false;

    })
  );

};
