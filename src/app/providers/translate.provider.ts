import {Injectable} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";

export let translate: (str: string, param?: any) => string;

@Injectable({providedIn: 'root'})
export class TranslateProvider {
    constructor(public t: TranslateService) {
        translate = (str: string, param?: any) => t.instant(str, param);
    }
}
