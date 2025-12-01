import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'c4u-accordion-item',
  templateUrl: './c4u-accordion-item.component.html',
  styleUrls: ['./c4u-accordion-item.component.scss']
})
export class C4uAccordionItemComponent {
  @Input()
  itemTitle: string | undefined = '';

  @Input()
  open: boolean = false;

  @Output()
  openChange = new EventEmitter<boolean>();

  // Generate unique ID for accessibility
  accordionId: string = 'accordion-' + Math.random().toString(36).substr(2, 9);

  toggleAccordion() {
    this.open = !this.open;
    this.openChange.emit(this.open);
  }
}
