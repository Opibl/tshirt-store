import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ServicoService } from '../servico.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CARRITOService} from '../carrito.service';

@Component({
  selector: 'app-pag-inicio',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './pag-inicio.component.html',
  styleUrl: './pag-inicio.component.scss'
})
export class PagInicioComponent implements OnInit {

  productos: any[] = [];
  terminoBusqueda: string = '';

  // 🔔 Toast
  mostrarToast = false;
  mensajeToast = '';

  constructor(
    private servicio: ServicoService,
    private carritoService: CARRITOService
  ) {}

  ngOnInit(): void {
    this.servicio.obtenerDatos().subscribe(
      (datos: any[]) => {
        this.productos = datos;
      }
    );
  }

  /* 🔍 FILTRO */
  get productosFiltrados() {
    return this.productos.filter(producto =>
      producto.nombre
        .toLowerCase()
        .includes(this.terminoBusqueda.toLowerCase())
    );
  }
}
