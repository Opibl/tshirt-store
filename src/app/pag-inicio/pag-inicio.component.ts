import { Component,OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ServicoService } from '../servico.service';
import { CommonModule } from '@angular/common';  // Importa CommonModule

@Component({
  selector: 'app-pag-inicio',
  standalone: true,
  imports: [RouterModule,CommonModule],
  templateUrl: './pag-inicio.component.html',
  styleUrl: './pag-inicio.component.scss'
})
export class PagInicioComponent {
  id: string | null = null;
  precio: number = 0;
  descripcion: string = '';
  nombre:string = '';
  productos:any[] = [];

  constructor(private servicio: ServicoService) { }
  ngOnInit(): void {
   
      
   
    this.servicio.obtenerDatos().subscribe(
      (datos: any[]) => {  // Asumo que 'datos' es un array de objetos
      this.productos = datos;  
    });

    
    
  }
}


