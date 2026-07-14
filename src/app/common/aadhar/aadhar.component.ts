import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-aadhar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './aadhar.component.html',
  styleUrl: './aadhar.component.scss'
})
export class AadharComponent {
  libuysellTab: any = "tab1"

  libuysell(tab: any) {
    this.libuysellTab = tab
  }
}
