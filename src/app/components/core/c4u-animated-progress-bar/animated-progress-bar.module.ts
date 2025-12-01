import { NgModule } from '@angular/core';

import { SharedModule } from '../../../shared.module';
import { animatedProgressBarComponent } from './animated-progress-bar.component';
import { ProgressMarkModule } from '../progress-mark/progress-mark.module';

@NgModule({
  declarations: [animatedProgressBarComponent],
  exports: [animatedProgressBarComponent],
  imports: [SharedModule, ProgressMarkModule],
})
export class animatedProgressBarModule {}
