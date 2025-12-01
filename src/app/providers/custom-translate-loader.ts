import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';

export class CustomTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return new Observable<any>((s) => {
      lang = this.getLang(lang);
      import(`../../assets/i18n/${lang}.json`).then((lang) => {
        s.next(lang);
        s.complete();
      });
    });
  }

  private getLang(lang: string) {
    if (lang.includes('en')) return 'en-US';
    if (lang.includes('pt')) return 'pt-BR';

    return 'pt-BR';
  }
}
