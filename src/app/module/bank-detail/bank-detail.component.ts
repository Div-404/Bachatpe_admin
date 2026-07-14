import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../servies/api.service';
import { SharedService } from '../../servies/shared/shared.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-bank-detail',
  standalone: true,
  imports: [CommonModule, NgbAccordionModule],
  templateUrl: './bank-detail.component.html',
  styleUrl: './bank-detail.component.scss'
})
export class BankDetailComponent implements OnInit{

  profileId: any
  bankdetailList: any

  constructor(private api: ApiService, private shared: SharedService, private toster: ToastrService,
    private route: ActivatedRoute
  ) {

  }

  ngOnInit(): void {
    this.route.parent?.params.subscribe((params: any) => {
      this.profileId = params['profileId'];
      console.log('Profile ID:', this.profileId);
      // Use profileId to fetch user details here
    });
    this.getBank(this.profileId)
  }


  getBank(val: any) {

    let obj= {
      oProfileId: Number(val)
    }
    // this.shared.loader(true)
    this.api.getUserbank(obj).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        this.bankdetailList = res
        console.log("here is res from bank list", this.bankdetailList);

      }, error: (err: any) => {
        this.shared.loader(false)
        this.toster.error("Something went wrong", "Error")
      }
    })
  }

}
