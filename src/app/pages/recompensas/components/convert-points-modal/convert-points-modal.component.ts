import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-convert-points-modal',
  templateUrl: './convert-points-modal.component.html',
  styleUrls: ['./convert-points-modal.component.scss']
})
export class ConvertPointsModalComponent {
  @Input() price: number = 1; // Fator de conversão (pontos por moeda)
  points: number = 0; // Pontos disponíveis
  coins: number = 0; // Moedas disponíveis
  amountToConvert: number = 0; // Quantidade de pontos a converter
  min: number = 0;
  max: number = 0;

  constructor(public activeModal: NgbActiveModal) {
    this.loadData();
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.points = parseInt(localStorage.getItem('points') || '0', 10);
    this.coins = parseInt(localStorage.getItem('coins') || '0', 10);
    this.max = this.points;
    this.amountToConvert = 0; // Começa zerado
  }

  onInputChange(value: string) {
    let val = parseInt(value.replace(/\D/g, ''), 10) || 0;
    if (val > this.max) val = this.max;
    if (val < this.min) val = this.min;
    this.amountToConvert = val;
  }

  onSliderChange(event: any) {
    this.amountToConvert = event.target.valueAsNumber;
  }

  formatNumber(n: number) {
    return n.toLocaleString('pt-BR');
  }

  getCoinsToReceive(): number {
    if (!this.price || this.price <= 0) return 0;
    return Math.floor(this.amountToConvert / this.price);
  }

  swapPointsForCoins() {
    const coinsToReceive = this.getCoinsToReceive();
    const pointsToSpend = coinsToReceive * this.price;
    if (coinsToReceive > 0 && pointsToSpend <= this.points) {
      this.points -= pointsToSpend;
      this.coins += coinsToReceive;
      localStorage.setItem('points', this.points.toString());
      localStorage.setItem('coins', this.coins.toString());
      this.activeModal.close('converted');
    }
  }

  close() {
    this.activeModal.dismiss();
  }

  getInputValue(event: Event): string {
    return (event.target && (event.target as HTMLInputElement).value) || '';
  }
}
