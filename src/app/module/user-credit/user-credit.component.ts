import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-user-credit',
  standalone: true,
  imports: [NgbDropdownModule, CommonModule ],
  templateUrl: './user-credit.component.html',
  styleUrl: './user-credit.component.scss'
})
export class UserCreditComponent {
  libuysellTab: any = "tab1"

  libuysell(tab: any) {
      this.libuysellTab = tab
    }
  constructor(private modalService: NgbModal){}
  openLg(content: any) {
    this.modalService.open(content, { size: 'md modalone', centered: true, windowClass: 'flip-modal' } );
  }

  openLg2(content2: any) {
    this.modalService.open(content2, { size: 'md modalone', centered: true, windowClass: 'flip-modal' } );
  }

  openLg3(content3: any) {
    this.modalService.open(content3, { size: 'md modalone', centered: true, windowClass: 'flip-modal' } );
  }
}
