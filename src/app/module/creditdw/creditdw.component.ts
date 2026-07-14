import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SharedService } from '../../servies/shared/shared.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-creditdw',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './creditdw.component.html',
  styleUrl: './creditdw.component.scss'
})
export class CreditdwComponent {

  selectedTab: any = 'creditDw'
 
  constructor(private router: Router, private shared: SharedService) {


    this.shared.setSidebrActiveClass('creditDw')
    this.shared.activeClass$.subscribe((activeClass: string) => {
      this.selectedTab = activeClass
      console.log('Current active class in ServicesComponent///////////////////////:', activeClass);
    });

  }


  navigate(val: string) {
    this.selectedTab = val;
    this.shared.setSidebrActiveClass('creditDw/' + val)
    this.router.navigateByUrl('creditDw/' + val);
    // this.router.navigateByUrl(val);

    console.log(this.selectedTab);

  }


}
