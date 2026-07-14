import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SharedService } from '../../servies/shared/shared.service';

@Component({
  selector: 'app-credit-container',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './credit-container.component.html',
  styleUrls: ['./credit-container.component.scss']
})
export class CreditContainerComponent {
  currentTab: string = 'credit-request'; // Set the default landing tab

  constructor(private router: Router,private shared: SharedService) {
    this.shared.setSidebrActiveClass('credit-request');

    // Optional: You can subscribe to activeClass$ if needed
    this.shared.activeClass$.subscribe((activeClass: string) => {
      console.log('Current active class in ServicesComponent:', activeClass);
    });
    this.navigate(this.currentTab)
  }

  navigate(val: string) {
    this.currentTab = val;
    this.router.navigateByUrl('credit-container/' + val);
  }
}
