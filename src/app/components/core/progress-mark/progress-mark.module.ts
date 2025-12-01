import { NgModule } from '@angular/core';

import { SharedModule } from '../../../shared.module';
import { ProgressMarkComponent } from './progress-mark.component';

@NgModule({
  declarations: [ProgressMarkComponent],
  exports: [ProgressMarkComponent],
  imports: [SharedModule],
})
export class ProgressMarkModule {}
