import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { SideBarComponent } from './side-bar/side-bar.component';
import { LoaderComponent } from './loader/loader.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { PaginationComponent } from './pagination/pagination.component';
import { Router } from 'express';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    // HeaderComponent,
     SideBarComponent, LoaderComponent, PaginationComponent],
  imports: [
    CommonModule, NgbDropdownModule,RouterModule
  ],
  exports:[
    // HeaderComponent,
    SideBarComponent, LoaderComponent, PaginationComponent
  ]
})
export class CommonmoduleModule { }
