import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../servies/shared/shared.service';
import { ApiService } from '../../servies/api.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule, DatePipe, formatDate } from '@angular/common';
import { CommonmoduleModule } from '../../common/commonmodule.module';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-pref-overall',
  standalone: true,
  imports: [CommonmoduleModule, FormsModule, CommonModule],
  templateUrl: './pref-overall.component.html',
  styleUrl: './pref-overall.component.scss'
})
export class PrefOverallComponent implements OnInit {

  prefList: any = []
  Count: any = 0
  PrefNumber: any = 1
  ttlCount: any = 9

  constructor(private shared: SharedService, private api: ApiService, private toster: ToastrService,
    private datePipe: DatePipe, private route: ActivatedRoute
  ) { }


  ngOnInit(): void {

    this.route.queryParams.subscribe((params: any) => {
      const id = params['id'];
      if (id) {
        this.ttlCount = 9
        this.PrefNumber = Number(id);
        const fullTab = `pref-creditmain/pref-overall?id=${id}`;
        this.shared.setSidebrActiveClass(fullTab);  // will update activeTab in sidebar
        console.log('Profile ID:', this.PrefNumber);
        localStorage.setItem('PerfNumber', this.PrefNumber)
      } else if (localStorage.getItem('PerfNumber')) {
        this.ttlCount = 9
        this.PrefNumber = Number(localStorage.getItem('PerfNumber'));
        const fullTab = `pref-creditmain/pref-overall?id=${id}`;
        this.shared.setSidebrActiveClass(fullTab);  // will update activeTab in sidebar
        console.log('Profile ID:', this.PrefNumber);
      }

      this.dateChange();
      this.prefOverall();
    });

  }

  changeCount(ev: any) {
    this.ttlCount = Number(ev.target.value)
    this.prefOverall()
  }


  prefOverall() {
    this.pageOfItems = []
    this.prefList = []
    let data = {
      "oPerform": this.PrefNumber,  //     CREDIT = 1,BALANCE = 2,DEPOSIT = 3,COMMISSION = 4,BUSINESS = 5
      "Count": this.ttlCount,
      "Filter": 1,  //  overall=1,custom=2
      // "dtFrom": (this.lastDaysDate) + " " + '00:00:01',    //dtFrom   //dtFrom
      // "dtTo": (this.updatedDate) + " " + '23:59:59',  //dtTo
    }
    this.shared.loader(true)

    this.api.getCreditPref(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        this.prefList = res
        this.Count = res.Count
        console.log("here is user data list", this.prefList);

      }, error: (err: any) => {
        this.toster.error(err)
      }
    })
  }

  // ============================================================= weekly date =================================================

  dateclear: any = '7'
  dateFrom: any = ''
  dateTo: any = ''
  searchEnable: boolean = false
  crossIcon: boolean = false
  dateSelectFromTO(ev: any, val: any) {
    // this.page= 1
    if (val == 'from') {
      this.dateFrom = ev.target.value
      this.lastDaysDate = ev.target.value
    } else if (val == 'to') {
      this.searchEnable = true
      this.dateTo = ev.target.value
      this.updatedDate = ev.target.value
      // this.page = 1
      this.dateCustom()
    }
  }

  dateCustom() {
    // this.page= 1
    this.customDate = ''
    this.crossIcon = true
    this.searchEnable = false
    //  this.lastDaysDate= this.lastDaysDate + " " + "00:00:01"
    this.lastDaysDate = this.lastDaysDate
    // this.updatedDate= this.updatedDate + " " + "23:59:59"
    this.updatedDate = this.updatedDate
    console.log("lastday date", this.lastDaysDate);
    console.log("update date", this.updatedDate);
    this.prefOverall()
    // this.dateFrom= ""
    // this.dateTo= ""

  }

  selectDate(ev: any) {
    // this.userName= ''
    // this.oFilter= '0'
    this.customDate = ev.target?.value || '7';
    if (this.customDate == 'custom') {
      //  this.updatedDate= ''
      //  this.lastDaysDate= ''
      console.log("here is updated date", this.updatedDate, this.lastDaysDate);

    } else if (this.customDate != 'custom') {
      // this.page = 1
      this.dateSelect = Number(ev.target?.value || '7')
      this.dateChange()
      // this.getPayoutReq(0,10, 'nos')
      this.prefOverall()
    }
    console.log("here is selected date", this.dateSelect);
  }

  customDate: any
  dateSelect: any = 7
  lastDaysDate: any
  dateChange() {
    // const lastDaysDates = any
    const currentDate = new Date();

    for (let i = 0; i < this.dateSelect; i++) {
      const previousDate = new Date();
      previousDate.setDate(currentDate.getDate() - i);

      // const formattedDate = formatDate(previousDate, 'yyyy-MM-dd HH:mm:ss', 'en-US');
      // const formattedDate = formatDate(previousDate, 'yyyy-MM-dd 00:00:01', 'en-US');
      const formattedDate = formatDate(previousDate, 'yyyy-MM-dd', 'en-US');
      this.lastDaysDate = formattedDate;
    }
    this.transformDate()
    return this.lastDaysDate;

  }

  updatedDate: any
  transformDate() {
    const date = new Date();
    // this.updatedDate= this.datePipe.transform(date, 'yyyy-MM-dd HH:mm:ss');
    // this.updatedDate= this.datePipe.transform(date, 'yyyy-MM-dd 23:59:59');
    this.updatedDate = this.datePipe.transform(date, 'yyyy-MM-dd');

    console.log("here is date", this.updatedDate);

  }

  pageOfItems?: Array<any>;
  onChangePage(pageOfItems: Array<any>) {

    this.pageOfItems = pageOfItems;
  }


  // ngOnDestroy() {
  //   localStorage.removeItem('PerfNumber')
  // }
}
