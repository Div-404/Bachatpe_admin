import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SharedService } from '../../servies/shared/shared.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-business-main',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './business-main.component.html',
  styleUrl: './business-main.component.scss'
})
export class BusinessMainComponent {

   selectedTab: any = 'business-main'
    headerHide: any = ''
  
    constructor(private router: Router, private shared: SharedService) { }
  
    ngOnInit(): void {
      this.shared.setSidebrActiveClass('business-main')
      this.shared.activeClass$.subscribe((activeClass: string) => {
        console.log('Current active class in ServicesComponent:', activeClass);
        this.selectedTab = activeClass
        // this.navigate(activeClass)
      });
  
      this.shared.reportTabStatus$.subscribe((status: any) => {
        this.headerHide = status
        // if (this.headerHide != '' || this.headerHide != null || this.headerHide != booleanAttribute) {
        //   this.headerHide == 'route'
        // }
        // if (this.headerHide == 'route') {
        //   this.navigated(this.selectedTab)
        // }
  
      })
  
      // this.navigate(this.selectedTab)
  
    }
  
  
    navigated(val: string) {
      this.selectedTab = val;
      this.shared.setSidebrActiveClass('business-main/' + val)
      this.router.navigateByUrl('business-main/' + val);
    }

}
