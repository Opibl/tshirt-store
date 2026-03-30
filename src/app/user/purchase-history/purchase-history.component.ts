import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Auth } from '@angular/fire/auth';
import {
  Firestore,
  collection,
  collectionData,
  query,
  where
} from '@angular/fire/firestore';

@Component({
  selector: 'app-purchase-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './purchase-history.component.html',
  styleUrls: ['./purchase-history.component.scss']
})
export class PurchaseHistoryComponent implements OnInit {

  compras: any[] = [];
  cargando: boolean = true;

  constructor(
    private auth: Auth,
    private firestore: Firestore
  ) {}

  ngOnInit(): void {
    this.obtenerCompras();
  }

  obtenerCompras(): void {

    const usuario = this.auth.currentUser;

    if (!usuario?.email) {
      this.cargando = false;
      return;
    }

    const comprasRef = collection(this.firestore, 'compras');

    const q = query(
      comprasRef,
      where('email', '==', usuario.email.toLowerCase())
    );

    collectionData(q, { idField: 'id' }).subscribe({
      next: (data) => {
        this.compras = data;
        this.cargando = false;

        console.log('Compras:', data);
      },

      error: (error) => {
        console.error('Error obteniendo compras:', error);
        this.cargando = false;
      }
    });
  }
}