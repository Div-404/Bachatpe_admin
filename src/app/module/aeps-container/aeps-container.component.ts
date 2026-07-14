import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SharedService } from '../../servies/shared/shared.service';

@Component({
  selector: 'app-aeps-container',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './aeps-container.component.html',
  styleUrls: ['./aeps-container.component.scss'],
})
export class AepsContainerComponent {
  currentTab: string = 'aeps-ledger'; // Set the default landing tab

  constructor(
    private router: Router,
    private shared: SharedService,
  ) {
    this.shared.setSidebrActiveClass('aeps-container');

    // Optional: You can subscribe to activeClass$ if needed
    this.shared.activeClass$.subscribe((activeClass: string) => {
      console.log('Current active class in ServicesComponent:', activeClass);
    });
  }

  navigate(val: string) {
    this.currentTab = val;
    this.router.navigateByUrl('aeps-container/' + val);
  }
}
