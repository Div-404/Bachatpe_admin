import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SharedService } from '../../servies/shared/shared.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-balance-dwmain',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './balance-dwmain.component.html',
  styleUrl: './balance-dwmain.component.scss'
})
export class BalanceDwmainComponent {

    selectedTab: any= 'dwmain'
      headerHide: any= ''
    
      constructor(private router: Router, private shared: SharedService) {
    
      // ngOnInit(): void {
        this.shared.setSidebrActiveClass('dwmain')
        this.shared.activeClass$.subscribe((activeClass: string) => {
          this.selectedTab= activeClass
          console.log('Current active class in ServicesComponent///////////////////////:', activeClass);
        });
      
      }
    
    
      navigate(val: string) {
        this.selectedTab = val;
        this.shared.setSidebrActiveClass('dwmain/' + val)
        this.router.navigateByUrl('dwmain/' + val);
        // this.router.navigateByUrl(val);

        console.log(this.selectedTab);
        
      }
  

}
