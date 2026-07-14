import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SharedService } from '../../servies/shared/shared.service';

@Component({
  selector: 'app-balance-contaniner',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './balance-contaniner.component.html',
  styleUrls: ['./balance-contaniner.component.scss'],
})
export class BalanceContaninerComponent {
  currentTab: string = 'balance-container'; // Set the default tab here
  // currentTab: string = 'balance-container'; // Set the default tab here

  constructor(
    private router: Router,
    private shared: SharedService,
  ) {
    this.shared.setSidebrActiveClass('balance-container');

    // Optional: You can subscribe to activeClass$ if needed
    this.shared.activeClass$.subscribe((activeClass: string) => {
      this.currentTab = activeClass;
      console.log('Current active class in ServicesComponent:', activeClass);
    });
  }

  navigate(val: string) {
    this.currentTab = val;
    this.router.navigateByUrl('balance-container' + '/' + val);
  }
}
