import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SharedService } from '../../servies/shared/shared.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reports-balance-main',
  standalone: true,
  imports: [ RouterOutlet, CommonModule],
  templateUrl: './reports-balance-main.component.html',
  styleUrl: './reports-balance-main.component.scss'
})
export class ReportsBalanceMainComponent {
selectedTab: any= 'reportbalance-main'
    headerHide: any=''
  
    constructor(private router: Router, private shared: SharedService) {}
  
    ngOnInit(): void {
      // this.shared.setSidebrActiveClass('reportBalance-main')
      this.shared.activeClass$.subscribe((activeClass: string) => {
        this.selectedTab= activeClass
        console.log('Current active class in ServicesComponent:', activeClass);
        // this.navigate(activeClass)
      });

      this.shared.reportTabStatus$.subscribe((status: any)=>{
        this.headerHide= status
        console.log("here is report credit main tab value...................", status);
        
      })
     
    }
  
  
    navigate(val: string) {
      this.selectedTab = val;
      // this.shared.setSidebrActiveClass('reportBalance-main')
      this.router.navigateByUrl('reportbalance-main/' + val);
    }



}
