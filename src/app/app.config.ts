import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    importProvidersFrom(HttpClientModule),
    provideHttpClient(withFetch()),
    provideAnimations(),

    provideFirebaseApp(() =>
      initializeApp({
        apiKey: "AIzaSyAkI8E7sZ2H_PrpF2AcVdPEZOjswMTbBpU",
        authDomain: "backend-shop-c8558.firebaseapp.com",
        projectId: "backend-shop-c8558",
        storageBucket: "backend-shop-c8558.firebasestorage.app",
        messagingSenderId: "560913379940",
        appId: "1:560913379940:web:ed46c8cd8e59b9e4da2571"
      })
    ),

    provideAuth(() => getAuth()),

    provideFirestore(() => getFirestore())
  ]
};