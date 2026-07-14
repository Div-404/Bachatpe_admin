import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-money-transfer-payout',
  standalone: true,
  imports: [],
  templateUrl: './money-transfer-payout.component.html',
  styleUrl: './money-transfer-payout.component.scss'
})
export class MoneyTransferPayoutComponent implements OnInit{

  ProfileId: any
  constructor(private route: ActivatedRoute) {

  }

  ngOnInit(): void {

    this.route.params.subscribe((param: any) => {
      console.log("here is param", param.id);
      this.ProfileId = param.id
      // sessionStorage.getItem
      // this.First = sessionStorage.getItem("First")
      // this.Last = sessionStorage.getItem("Last")
      // this.Code = sessionStorage.getItem("Code")
      // this.Phone = sessionStorage.getItem('Phone')
      // // this.type= param.type
      // this.dateChange()
      // this.getAccount()
    })
    
  }

}
