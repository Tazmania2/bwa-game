import { Component, Input } from '@angular/core';

@Component({
  selector: 'c4u-mostrador-progresso',
  templateUrl: './c4u-mostrador-progresso.component.html',
  styleUrls: ['./c4u-mostrador-progresso.component.scss'],
})
export class C4uMostradorProgressoComponent {
  @Input()
  description: string = '';

  @Input()
  theme: 'red' | 'gold' | 'green' = 'red';

  @Input()
  stars: number = 0;

  @Input()
  level: number | string = 0;

  @Input()
  subtitle: string = '';

  @Input()
  icon: string = '';

  @Input()
  max: number | string = 0;

  @Input()
  percent: number = 0;

  @Input()
  title: string = '';

  @Input()
  isAnimatedBar: boolean = false;

  @Input()
  tooltipPercent: string | number | null = null;
}
