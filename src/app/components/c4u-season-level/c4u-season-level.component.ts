import { Component, Input } from '@angular/core';
import { PlayerMetadata } from '@model/gamification-dashboard.model';

@Component({
  selector: 'c4u-season-level',
  templateUrl: './c4u-season-level.component.html',
  styleUrls: ['./c4u-season-level.component.scss']
})
export class C4uSeasonLevelComponent {
  @Input() level: number = 0;
  @Input() playerName: string = '';
  @Input() metadata: PlayerMetadata = {
    area: '',
    time: '',
    squad: ''
  };
}
