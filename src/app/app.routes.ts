import { Routes } from '@angular/router';
import { PagInicioComponent } from './pag-inicio/pag-inicio.component';
import { DescripcionComponent } from './descripcion/descripcion.component';
import { NosotrosComponent } from './nosotros/nosotros.component';
import { CarritoComponent } from './carrito/carrito.component';
import { SuccessComponent } from './success/success.component';
import { CancelComponent } from './cancel/cancel.component';

export const routes: Routes = [
    {path:'',component:PagInicioComponent},
    {path:'descripcion/:id',component:DescripcionComponent},
    {path:'nosotros',component:NosotrosComponent},
    {path:'carrito',component:CarritoComponent},
    {path:'success',component:SuccessComponent},
    {path:'cancel',component:CancelComponent},
];
