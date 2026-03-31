import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Auth, onAuthStateChanged, Unsubscribe } from '@angular/fire/auth';
import {
  Firestore,
  collection,
  collectionData,
  query,
  where
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
  ) {}

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
        console.log('⏳ Esperando restauración de sesión...');
        return;
      }

      const emailBuscado = usuario.email?.toLowerCase();

      console.log('📧 Email actual:', emailBuscado);
      console.log('🆔 UID actual:', usuario.uid);

      if (!emailBuscado) {
        console.warn('❌ Usuario sin email');
        this.cargando = false;
        return;
      }

      console.log('🔎 Buscando compras para:', emailBuscado);

      const comprasRef = collection(this.firestore, 'compras');

      const comprasQuery = query(
        comprasRef,
        where('email', '==', emailBuscado)
      );

      this.comprasSubscription?.unsubscribe();

      this.comprasSubscription = collectionData(comprasQuery, {
        idField: 'id'
      }).subscribe({
        next: (data) => {
          console.log('✅ Compras encontradas:', data);
          console.log('📦 Cantidad:', data.length);

          this.compras = data;
          this.cargando = false;
        },
        error: (error) => {
          console.error('❌ Error Firestore:', error);
          console.error('📝 Mensaje:', error.message);

          this.compras = [];
          this.cargando = false;
        }
      });
    });
  }
}