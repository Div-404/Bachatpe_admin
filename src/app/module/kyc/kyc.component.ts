import { Component } from '@angular/core';
import { AadharComponent } from '../../common/aadhar/aadhar.component';
import { PanDetailsComponent } from '../../common/pan-details/pan-details.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-kyc',
  standalone: true,
  imports: [RouterOutlet, AadharComponent, PanDetailsComponent],
  templateUrl: './kyc.component.html',
  styleUrl: './kyc.component.scss'
})
export class KycComponent {

}
