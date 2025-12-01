import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppComponent } from './app.component';
import { TranslateProvider } from '@providers/translate.provider';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { LoadingProvider } from '@providers/loading.provider';
import { SystemParamsService } from '@services/system-params.service';
import { Title } from '@angular/platform-browser';
import { SystemInitService } from '@services/system-init.service';
import { TranslateModule } from '@ngx-translate/core';

describe('AppComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
      HttpClientTestingModule,
      TranslateModule.forRoot()
    ],
    declarations: [AppComponent],
    providers: [
      TranslateProvider,
      MatIconRegistry,
      DomSanitizer,
      LoadingProvider,
      SystemParamsService,
      Title,
      SystemInitService
    ]
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have translateReady property', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.translateReady).toBeDefined();
  });

  it('should have paramReady property', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.paramReady).toBeDefined();
  });
});
