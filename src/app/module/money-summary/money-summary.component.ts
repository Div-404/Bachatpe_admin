import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../servies/api.service';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../servies/shared/shared.service';
import { PaginationService } from '../../servies/pagination.service';
import { CommonModule, DatePipe, formatDate } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-money-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './money-summary.component.html',
  styleUrl: './money-summary.component.scss'
})
export class MoneySummaryComponent implements OnInit {


  libuysellTab: any = "tab1"

  libuysell(tab: any) {
    this.libuysellTab = tab
  }
  moneyTransList: any
  userData: any
  idRoute: boolean = false
  activeName: any = 'Overall'


  constructor(private api: ApiService, private toster: ToastrService, private shared: SharedService,
    private pagination: PaginationService, private datePipe: DatePipe, private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.userData = JSON.parse(localStorage.getItem('userData') || "{}")


   
    // this.getSource()
    this.shared.setSidebrActiveClass('money-summary')
    this.getSummList()
  }

  Count: any = 0
  summList: any
  getSummList() {
    this.shared.loader(true)
    // this.detailApi = false
    this.moneyTransList = []
    this.Count = 0
    let data = {
      "Key": "",
      "Field1": "1"   //servicetype   MT=1,Recharge=2,booking=3,utility=4,miscellaneous=5
    }

    this.api.getSummary(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        this.summList = res
        this.Count = res.Count
       
        console.log("here is res from money transfer", this.moneyTransList);

      }, error: (err: any) => {
        this.shared.loader(false)
        this.toster.error("Something went wrong", "Error")
      }
    })
  }

  // ============================================================= get services =============================================================
  sourceList: any = []
  Money: any = []
  getSource() {
    // alert("dfgfdhgfhgfjhgjg")
    this.Money = []

    // this.shared.loader(true)
    this.api.getSource().subscribe({
      next: (res: any) => {
        // this.shared.loader(false)
        this.sourceList = res
        console.log("here is source list", this.sourceList);

        this.sourceList.forEach((ele: any) => {
          if (ele.Type == 1) {
            this.Money = ele.lstSource
            console.log("money list", this.Money);
          }
          // else if (ele.Type == 2) {
          //   this.Recharge = ele.lstSource
          //   console.log("recharge list", this.Recharge);
          // }

        });

      }, error: (err: any) => {
        this.shared.loader(false)
        this.toster.error("Something went wrong", "Error")

      }
    })
  }



}
