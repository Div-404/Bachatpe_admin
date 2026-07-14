import { NgModule } from '@angular/core';
import { ThousandPipe } from '../customePipe/thousand.pipe';
import { HeaderComponent } from './header/header.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
@NgModule({
  declarations: [ThousandPipe, HeaderComponent],
  imports: [
    ReactiveFormsModule, NgbDropdownModule, CommonModule
  ], exports: [ThousandPipe, HeaderComponent]
})
export class SharedModule { }
