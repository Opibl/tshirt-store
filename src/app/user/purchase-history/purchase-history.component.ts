import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Auth, onAuthStateChanged, Unsubscribe } from '@angular/fire/auth';
import {
  Firestore,
  collection,
  collectionData
} from '@angular/fire/firestore';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-purchase-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './purchase-history.component.html',
  styleUrls: ['./purchase-history.component.scss']
})
export class PurchaseHistoryComponent implements OnInit, OnDestroy {

  compras: any[] = [];
  cargando = true;

  private authUnsubscribe?: Unsubscribe;
  private comprasSubscription?: Subscription;

  constructor(
    private auth: Auth,
    private firestore: Firestore
  ) {
    console.log('🔥 Proyecto Firebase:', this.firestore.app.options.projectId);
  }

  ngOnInit(): void {
    this.obtenerCompras();
  }

  ngOnDestroy(): void {
    this.authUnsubscribe?.();
    this.comprasSubscription?.unsubscribe();
  }

  obtenerCompras(): void {
    console.log('🔍 Esperando usuario...');

    this.authUnsubscribe = onAuthStateChanged(this.auth, (usuario) => {
      console.log('👤 Usuario autenticado:', usuario);

      if (!usuario) {
        console.log('❌ No hay usuario autenticado');
        this.compras = [];
        this.cargando = false;
        return;
      }

      const emailBuscado = usuario.email?.trim().toLowerCase();

      console.log('📧 Email actual:', emailBuscado);
      console.log('🆔 UID actual:', usuario.uid);

      if (!emailBuscado) {
        console.warn('❌ Usuario sin email');
        this.compras = [];
        this.cargando = false;
        return;
      }

      const comprasRef = collection(this.firestore, 'compras');

      this.comprasSubscription?.unsubscribe();

      this.comprasSubscription = collectionData(comprasRef, {
        idField: 'id'
      }).subscribe({
        next: (data: any[]) => {
          console.log('🔥 Todas las compras:', data);

          this.compras = data.filter(compra =>
            compra.email?.trim().toLowerCase() === emailBuscado
          );

          console.log('✅ Compras filtradas:', this.compras);
          console.log('📦 Cantidad:', this.compras.length);

          this.cargando = false;
        },
        error: (error) => {
          console.error('❌ Error Firestore:', error);
          this.compras = [];
          this.cargando = false;
        }
      });
    });
  }
}