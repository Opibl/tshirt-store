import { Component, OnInit } from '@angular/core';
import { CARRITOService } from '../carrito.service';

@Component({
  selector: 'app-success',
  standalone: true,
  template: `<h2>Pago realizado con éxito 🎉</h2>`
})
export class SuccessComponent implements OnInit {

  constructor(private carrito: CARRITOService) {}

  ngOnInit(): void {
    this.carrito.Vaciar();
  }
}