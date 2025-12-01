import { Component, Input } from '@angular/core';

@Component({
  selector: 'c4u-nivel-meta',
  templateUrl: './c4u-nivel-meta.html',
  styleUrls: ['./c4u-nivel-meta.scss'],
})
export class C4uNivelMeta {
  @Input()
  value: number | string = 0;

  @Input()
  stars: number = 0;

  @Input()
  theme: 'red' | 'gold' | 'green' = 'red';

  protected readonly Array = Array;

  showStar(n: any) {
    return this.stars > n;
  }

  protected readonly indexedDB = indexedDB;
}
