import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-user-wise-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-wise-reports.component.html',
  styleUrl: './user-wise-reports.component.scss'
})
export class UserWiseReportsComponent {
  libuysellTab: any = "tab1"

  libuysell(tab: any) {
      this.libuysellTab = tab
    }
}
