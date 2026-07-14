import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { KycComponent } from './kyc.component';
import { AadharComponent } from '../../common/aadhar/aadhar.component';

const routes: Routes = [
  {
    path: '',
    component: KycComponent, children:[
        {
            path:"",
            component:AadharComponent

        }
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class KYCPageRoutingModule { }