/// <reference types="@angular/localize" />

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// Register pt-BR locale for number and date pipes
registerLocaleData(localePt, 'pt-BR');

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
