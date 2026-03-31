import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ServicoService } from '../servico.service';
import { CARRITOService } from '../carrito.service';

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
  filtroPrecio: string = '';
  ordenPrecio: string = '';

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

  // 🔍 FILTROS AUTOMÁTICOS
  get productosFiltrados(): any[] {
    let productos = [...this.productos];

    // búsqueda por nombre
    if (this.terminoBusqueda) {
      productos = productos.filter(producto =>
        producto.nombre
          .toLowerCase()
          .includes(this.terminoBusqueda.toLowerCase())
      );
    }

    // filtro por precio
    if (this.filtroPrecio) {
      productos = productos.filter(producto =>
        producto.precio <= Number(this.filtroPrecio)
      );
    }

    // ordenar
    if (this.ordenPrecio === 'asc') {
      productos.sort((a, b) => a.precio - b.precio);
    }

    if (this.ordenPrecio === 'desc') {
      productos.sort((a, b) => b.precio - a.precio);
    }

    return productos;
  }
}