import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-executive-deposit-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './executive-deposit-reports.component.html',
  styleUrl: './executive-deposit-reports.component.scss'
})
export class ExecutiveDepositReportsComponent {
  libuysellTab: any = "tab1"

  libuysell(tab: any) {
      this.libuysellTab = tab
    }
}
