import {Component, EventEmitter, Input, Output} from '@angular/core';
import {
    catchError,
    debounceTime,
    distinctUntilChanged,
    map,
    merge,
    Observable,
    of,
    OperatorFunction,
    Subject,
    switchMap,
    tap
} from "rxjs";

@Component({
    selector: 'c4u-typeahead',
    templateUrl: './c4u-typeahead.component.html',
    styleUrls: ['./c4u-typeahead.component.scss']
})
export class C4uTypeaheadComponent {
    private _service!: (term: string) => Observable<any>;

    @Input()
    set service(value: (term: string) => Observable<any>) {
        this._service = value;
        if (value != undefined) {
            this.setSearch();
        }
    }

    private setSearch() {
        this.search = (text$: Observable<string>) =>
            merge(text$, this.$focus).pipe(
                debounceTime(100),
                distinctUntilChanged(),
                tap(() => (this.searching = true)),
                switchMap((term) =>
                    this._service(term).pipe(
                        tap(() => (this.searchFailed = false)),
                        catchError(() => {
                            this.searchFailed = true;
                            return of([]);
                        }),
                    ),
                ),
                map((results) => {
                    // Filtrar usuários ativos se necessário
                    if (this.filterActiveUsers && Array.isArray(results)) {    
                        return results.filter((item: any) => {
                            // Verifica se o campo deactivated_at é null (usuário ativo)
                            return item[this.activeField] === null || item[this.activeField] === undefined;
                        });
                    }
                    return results;
                }),
                tap(() => (this.searching = false)),
            );
    }

    @Input()
    placeholder = '';

    @Input()
    label = '';

    @Input()
    nameField = 'name';

    @Input()
    filterActiveUsers = false;

    @Input()
    activeField = 'deactivated_at';

    @Output()
    selected = new EventEmitter<any>();

    $focus = new Subject<string>();

    get service(): (term: string) => Observable<any> {
        return this._service;
    }

    get model(): any {
        return this._model;
    }

    set model(value: any) {
        if (value != this.model) {
            this.selected.emit(value);
        }
        this._model = value;
    }

    private _model: any;
    searchFailed = false;
    searching = false;
    search!: OperatorFunction<string, readonly { id: number; name: string }[]>;
    formatter = (item: any) => {
        return item[this.nameField];
    };

    blur(event: any) {
        this.searching = false;
        event.target.value = (this._model || {})[this.nameField] || '';
    }

    focusInput(input: HTMLInputElement) {
        input.focus();
    }

}
