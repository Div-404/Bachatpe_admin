import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { DatePipe } from '@angular/common';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({eventCoalescing: true}),provideRouter(routes, withHashLocation()), provideClientHydration(), provideToastr(), DatePipe,
    importProvidersFrom(),provideAnimationsAsync(), provideHttpClient(withFetch(),)

  ]
};
