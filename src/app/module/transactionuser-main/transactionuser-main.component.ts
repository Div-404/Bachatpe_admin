import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SharedService } from '../../servies/shared/shared.service';

@Component({
  selector: 'app-transactionuser-main',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './transactionuser-main.component.html',
  styleUrl: './transactionuser-main.component.scss'
})
export class TransactionuserMainComponent {
  SelectedTab: any= 'user-main'

constructor(private router: Router, private shared: SharedService) {
   this.shared.setSidebrActiveClass('user-main')

    this.shared.activeClass$.subscribe((activeClass: string) => {
      console.log('Current active class in ServicesComponent:', activeClass);
      this.SelectedTab = activeClass
      console.log("active class", activeClass);
      
      //  this.shared.setSidebrActiveClass(activeClass)
      // this.navigate(activeClass)
    });

}

navigate(tab: any) {
  this.SelectedTab = tab
  this.shared.setSidebrActiveClass('user-main/' + tab)
  this.router.navigateByUrl('user-main/' + tab);

}
}
