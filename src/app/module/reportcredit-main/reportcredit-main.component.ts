import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SharedService } from '../../servies/shared/shared.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reportcredit-main',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './reportcredit-main.component.html',
  styleUrl: './reportcredit-main.component.scss'
})
export class ReportcreditMainComponent {
  selectedTab: any= 'reportcredit-main'
    headerHide: any= ''
  
    constructor(private router: Router, private shared: SharedService) {}
  
    ngOnInit(): void {
      this.shared.setSidebrActiveClass('reportcredit-main')
      this.shared.activeClass$.subscribe((activeClass: string) => {
        this.selectedTab= activeClass
      // this.navigate2(this.selectedTab)
      });
      // this.navigate(this.selectedTab)
      this.shared.reportTabStatus$.subscribe((status: any)=>{
        this.headerHide= status

      })
      // if (!this.headerHide) {
      // this.navigate(this.selectedTab)
      // }
    }
  
  
    navigate(val: string) {
      this.selectedTab = val;
      this.shared.setSidebrActiveClass('reportcredit-main/' + val)
      this.router.navigateByUrl('reportcredit-main/' + val);
      // this.router.navigateByUrl(val);
    }

}
