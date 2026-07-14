import { Component } from '@angular/core';
import { SharedService } from '../../servies/shared/shared.service';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-perf-credit-main',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './perf-credit-main.component.html',
  styleUrl: './perf-credit-main.component.scss'
})
export class PerfCreditMainComponent {

  selectedTab: any= 'pref-creditmain'

  constructor(private shared: SharedService, private router: Router,
    private route: ActivatedRoute
  ) {
//  this.shared.setSidebrActiveClass('pref-creditmain')
    // this.shared.activeClass$.subscribe((activeClass: string) => {
    //   console.log('Current active class in ServicesComponent:', activeClass);
    //   this.selectedTab = activeClass
    //   // this.navigate(activeClass)
    // });

    // this.shared.prefVal.subscribe((res: any) =>{
    //   console.log('prefVal', res);
      
    // })


//  this.route.firstChild?.params.subscribe(params => {
//     const childRoute = this.router.url.split('?')[0].split('/').pop(); // 'pref-overall' or 'pref-range'
//     this.selectedTab = childRoute;
//   });

//   this.shared.activeClass$.subscribe((activeClass: string) => {
//     this.selectedTab = activeClass.split('?')[0].split('/').pop(); // Normalize 'pref-creditmain/pref-overall?id=1'
//   });

//  this.router.events.subscribe(() => {
//     const childRoute = this.router.url.split('?')[0].split('/').pop(); // Get last part of the route
//     this.selectedTab = childRoute; // Should be 'pref-overall' or 'pref-range'
//   });

//   this.shared.activeClass$.subscribe((activeClass: string) => {
//     const tab = activeClass.split('?')[0].split('/').pop();
//     this.selectedTab = tab; // Ensure it's 'pref-overall' or 'pref-range'
//   });

this.router.events.subscribe(() => {
    const cleanPath = this.router.url.split('?')[0];
    this.selectedTab = cleanPath.split('/').pop();  // pref-overall or pref-range
  });



  }
navigated(val: string) {
  this.selectedTab = val;
  this.shared.setSidebrActiveClass('pref-creditmain/' + val); // <-- dynamic path
  this.router.navigate(['pref-creditmain', val]);
}
}
