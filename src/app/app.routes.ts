import { Routes } from '@angular/router';
import { PagInicioComponent } from './pag-inicio/pag-inicio.component';
import { DescripcionComponent } from './descripcion/descripcion.component';
import { NosotrosComponent } from './nosotros/nosotros.component';
import { CarritoComponent } from './carrito/carrito.component';
import { SuccessComponent } from './success/success.component';
import { CancelComponent } from './cancel/cancel.component';

// NUEVOS IMPORTS
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { PurchaseHistoryComponent } from './user/purchase-history/purchase-history.component';
import { OrderTrackingComponent } from './user/order-tracking/order-tracking.component';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
    { path: '', component: PagInicioComponent },
    { path: 'descripcion/:id', component: DescripcionComponent },
    { path: 'nosotros', component: NosotrosComponent },
    { path: 'carrito', component: CarritoComponent },
    { path: 'success', component: SuccessComponent },
    { path: 'cancel', component: CancelComponent },

    // NUEVAS RUTAS
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },

    // 🔒 RUTAS PRIVADAS: requieren sesión iniciada
    { path: 'history', component: PurchaseHistoryComponent, canActivate: [authGuard] },
    { path: 'tracking', component: OrderTrackingComponent, canActivate: [authGuard] }
];