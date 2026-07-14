import { CommonModule } from '@angular/common';
import { booleanAttribute, Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SharedService } from '../../servies/shared/shared.service';

@Component({
  selector: 'app-penality-main',
  standalone: true,
  imports: [CommonModule, RouterOutlet,],
  templateUrl: './penality-main.component.html',
  styleUrl: './penality-main.component.scss'
})
export class PenalityMainComponent implements OnInit {
  selectedTab: any = 'reports-penality'
  headerHide: any = ''

  constructor(private router: Router, private shared: SharedService) { }

  ngOnInit(): void {
    this.shared.setSidebrActiveClass('penality-main')
    this.shared.activeClass$.subscribe((activeClass: string) => {
      console.log('Current active class in ServicesComponent:', activeClass);
      this.selectedTab = activeClass
       console.log('here is selected tab behalf of shared', this.selectedTab);
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

      console.log("here is report credit main tab value header hide.........................", this.headerHide);

    })

    // this.navigate(this.selectedTab)

  }


  navigated(val: string) {
    this.selectedTab= ''
    this.selectedTab = val;
    this.shared.setSidebrActiveClass('penality-main/' + val)
    this.router.navigateByUrl('penality-main/' + val);
    console.log('here is selrcted tab', this.selectedTab);
    
  }

}
