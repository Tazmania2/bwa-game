import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  ViewChild,
  ViewChildren,
} from '@angular/core';

@Component({
  selector: 'progress-mark',
  templateUrl: './progress-mark.component.html',
  styleUrls: ['./progress-mark.component.scss'],
})
export class ProgressMarkComponent implements OnChanges {
  @Input()
  percent: number = 0;

  @Input()
  elements: Array<ElementRef> = [];

  @ViewChild('progressMark') containerElement: ElementRef | any;
  animatedIcon = '';

  @ViewChildren('pointMark') elementsasdvhbj: Array<ElementRef> = [];

  OnChanges(): void {
    const element = this.elements.length ? this.elements[0].nativeElement : {};
    const markElement = this.containerElement.nativeElement;

    markElement.scrollTo({
      top: element.getBoundingClientRect().top,
      left: element.getBoundingClientRect().left,
    });
  }

  ngOnChanges() {
    const element = this.elements.length ? this.elements[0].nativeElement : {};
    const markElement = this.containerElement.nativeElement;

    markElement.scrollTo({
      top: element.getBoundingClientRect().top,
      left: element.getBoundingClientRect().left,
    });
  }
}
