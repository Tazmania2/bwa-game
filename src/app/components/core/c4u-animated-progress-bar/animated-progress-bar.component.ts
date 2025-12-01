import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  ViewChildren,
} from '@angular/core';

@Component({
  selector: 'animated-progress-bar',
  templateUrl: './animated-progress-bar.component.html',
  styleUrls: ['./animated-progress-bar.component.scss'],
})
export class animatedProgressBarComponent implements OnChanges {
  elementsIndex: number[] = [20, 40, 60, 80, 100];
  pointMarkElements: Array<ElementRef> = [];
  @ViewChildren('pointMark') elements: Array<ElementRef> = [];

  @Input()
  tooltip: string = '';

  @Input()
  percent: number = 0;

  @Input()
  theme: 'red' | 'gold' | 'green' = 'red';

  ngOnChanges() {
    this.pointMarkElements = this.elements;
  }
}
