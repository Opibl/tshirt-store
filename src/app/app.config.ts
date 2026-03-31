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
        apiKey: "AIzaSyAudhq50pgSGvcTENZIiSWlCAdU15QSsRQ",
        authDomain: "store-2f422.firebaseapp.com",
        projectId: "store-2f422",
        storageBucket: "store-2f422.firebasestorage.app",
        messagingSenderId: "916120446484",
        appId: "1:916120446484:web:b3d05b6f9ec54e3d13e901"
      })
    ),

    provideAuth(() => getAuth()),

    provideFirestore(() => getFirestore())
  ]
};