import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CARRITOService } from '../carrito.service';

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './success.component.html',
  styleUrl: './success.component.scss'
})
export class SuccessComponent implements OnInit {

  constructor(private carrito: CARRITOService) {}

  ngOnInit(): void {
    this.carrito.Vaciar();
  }
}
