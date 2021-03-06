import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DataTableDemoComponent, AVGPipe } from './data-table-demo.component';
import { RebirthUIModule } from '../../exports/rebirth-ui.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [CommonModule, RebirthUIModule, FormsModule],
  exports: [DataTableDemoComponent],
  declarations: [DataTableDemoComponent, AVGPipe],
  providers: [],
  entryComponents: [DataTableDemoComponent]
})
export class DataTableDemoModule {
}
