import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SharedService } from '../../servies/shared/shared.service';

@Component({
  selector: 'app-money-main',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './money-main.component.html',
  styleUrl: './money-main.component.scss'
})
export class MoneyMainComponent {
selectedTab: any= 'money-main'

constructor(private router: Router, private shared: SharedService) { 
    // this.shared.setSidebrActiveClass('money-main')
    this.shared.activeClass$.subscribe((activeClass: string) => {
      console.log('Current active class in ServicesComponent:', activeClass);
      this.selectedTab = activeClass
      // this.navigate(activeClass)
    });

    // this.shared.reportTabStatus$.subscribe((status: any) => {
    //   this.headerHide = status
      

    //   console.log("here is report credit main tab value header hide.........................", this.headerHide);

    // })

  
  }


  navigated(val: string) {
    this.selectedTab = val;
    this.shared.setSidebrActiveClass(val)
    this.router.navigateByUrl('money-main/' + val);
  }
}
