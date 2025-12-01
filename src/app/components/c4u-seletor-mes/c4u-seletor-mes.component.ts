import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import {SessaoProvider} from '@providers/sessao/sessao.provider';
import * as moment from "moment";

import {TemporadaDashboard} from 'src/app/model/temporadaDashboard.model';
import {SeasonDatesService} from "@services/season-dates.service";

@Component({
    selector: 'c4u-seletor-mes',
    templateUrl: './c4u-seletor-mes.component.html',
    styleUrls: ['./c4u-seletor-mes.component.scss']
})
export class C4uSeletorMesComponent implements OnInit, OnChanges {
  private PREV_MONTHS: number = 0;
    private IS_TESTER = false;

    @Output()
    onSelectedMonth = new EventEmitter();

    @Input()
    seasonData: TemporadaDashboard | null = null;

    months: Array<any> = []
    selected: number = 0;
    prevEnabled = true;
    nextEnabled = false;
    isLoading = true;

    constructor(
      private sessao: SessaoProvider,
      private seasonDatesService: SeasonDatesService
    ) {}

    async ngOnInit() {
      await this.initializeMonths();
    }

    ngOnChanges(): void {
        // const slaDate =
        //   moment(moment().diff(this.seasonData?.datas.dataInicio)).month() + 1;
        // const slaDate = this.PREV_MONTHS;
        this.months = [];
        this.isLoading = true;
        this.populateFields(this.PREV_MONTHS);
    }

    private async initializeMonths() {
      try {
        this.isLoading = true; // Ativa loading
        
        // Verifica se o usuário é ADMIN
        if (this.sessao.isAdmin()) {
          this.PREV_MONTHS = 6;
        } else {
          // this.PREV_MONTHS = 10 - (moment().month()); //ENQUANTO ESTIVERMOS EM AUDITORIA, NÃO PERMITIR ACESSO A MESES ANTERIORES
          const month = await this.seasonDatesService.getMonthsSinceSeasonStart();
          if (month > 0) {
            this.PREV_MONTHS = month;
          } else {
            // Se a temporada ainda não começou, mostra pelo menos 1 mês
            this.PREV_MONTHS = 1;
          }
        }

        this.populateFields(this.PREV_MONTHS);
      } catch (error) {
        console.error('Erro ao inicializar meses:', error);
        // Fallback para valores padrão
        this.PREV_MONTHS = 1;
        this.populateFields(this.PREV_MONTHS);
      } finally {
        // Garante que loading seja desativado mesmo em caso de erro
        setTimeout(() => {
          this.isLoading = false;
        }, 100);
      }
    }

    private populateFields(value: number) {
        this.months = []; // Limpa meses anteriores
        
        if (value && value > 0) {
            Array(value).fill(0).forEach((_, i) => {
                const month = moment().subtract(i, 'months');
                this.months.push({id: i, name: month.format("MMM/YY").toUpperCase()});
            });
        } else {
            // Fallback: pelo menos um mês
            const currentMonth = moment();
            this.months.push({id: 0, name: currentMonth.format("MMM/YY").toUpperCase()});
        }

        setTimeout(() => {
            this.onChange();
            this.isLoading = false; // Garante que loading seja desativado após popular
        }, 150);
    }

    getPrevMonth() {
        if (this.prevEnabled && this.months.length > 0 && this.selected < this.months.length - 1) {
            return this.months[this.selected + 1].name;
        } else {
            return moment().subtract(this.PREV_MONTHS, 'months').format("MMM/YY").toUpperCase();
        }
    }

    getNextMonth() {
        if (this.nextEnabled && this.months.length > 0 && this.selected > 0) {
            return this.months[this.selected - 1].name;
        } else {
            return moment().add(1, 'months').format("MMM/YY").toUpperCase();
        }
    }

    onChange() {
        if (this.months.length > 0) {
            this.prevEnabled = (this.selected !== this.months.length - 1);
            this.nextEnabled = (this.selected !== 0);
            this.onSelectedMonth.emit(this.selected);
        }
    }

    goLeft() {
        if ((this.prevEnabled || this.IS_TESTER) && this.months.length > 0 && this.selected < this.months.length - 1) {
            this.selected++;
            this.onChange();
        }
    }

    goRight() {
        if ((this.nextEnabled || this.IS_TESTER) && this.months.length > 0 && this.selected > 0) {
            this.selected--;
            this.onChange();
        }
    }
}
