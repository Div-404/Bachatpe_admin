import { Component } from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule, DatePipe, formatDate } from '@angular/common';
import { SharedService } from '../../servies/shared/shared.service';
import { ApiService } from '../../servies/api.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { PaginationService } from '../../servies/pagination.service';

@Component({
  selector: 'app-reports-commission',
  standalone: true,
  imports: [NgbTooltipModule, NgbDropdownModule, CommonModule, FormsModule],
  templateUrl: './reports-commission.component.html',
  styleUrl: './reports-commission.component.scss'
})
export class ReportsCommissionComponent {
  SelectedTab: any = "tab1"
  selectedDate: Date = new Date();

  // libuysell(tab: any) {
  //     this.SelectedTab = tab
  //   }
  constructor(private modalService: NgbModal, private shared: SharedService, private api: ApiService,
    private toster: ToastrService, private datePipe: DatePipe, private pagination: PaginationService
  ) { }
  openLg2(content2: any) {
    this.modalService.open(content2, { size: 'md modalone', centered: true, windowClass: 'flip-modal' });
  }

  ngOnInit(): void {
    this.shared.setSidebrActiveClass('reports-commission')
    this.updatedDates = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd');
    this.dateChange()
    this.getCommOverall(1, 10)
  }

  tabChange(tab: any) {
    this.page= 1
    this.SelectedTab = tab
    this.searchId = '0'
    this.advType = 0
    this.advVal = ''
    if (this.SelectedTab == 'tab2') {

      this.customDate = ' '
      // this.dateclear= '7'
      this.userProfile = '0'
      this.userType = '0'
      this.ChangeToggle('1')
      // this.dateChange()
      // this.getCommTime()
    } else {

      this.customDate = ' '
      this.dateclear = '7'
      this.userProfile = '0'
      this.userType = '0'
      this.clear()
      // this.dateChange()
      // this.getCommOverall()
      // this.dateChange()

    }
  }


  toggle: any = 1
  ChangeToggle(val: any) {
    this.toggle = val
    this.dateclear = '0'
    this.customDate = ' '
    // this.toggle= !this.toggle
    console.log('val', val);
    if (val == '2') {
      this.lastDaysDate = null
      this.updatedDate = null
      this.selectedDate = new Date();
      this.updatedDates = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd');
      this.dateclear = '7'
      this.SelectedTab = 'tab2'
      // this.serviceName = 'Money Transfer'
      this.selectDate(7, 'tab2')
      // this.getCommTime()
      // this.getSummWeek(1)

    } else {
      this.dateclear = ' '
      this.lastDaysDate = null
      this.updatedDate = null
      this.SelectedTab = 'tab2'
      // this.serviceName = 'Money Transfer'
      this.selectedDate = new Date();
      this.lastDaysDate = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd');
      this.updatedDates = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd');
      // this.dateChange()
      this.page2 = 1;
    this.getCommTime()
    }


  }

  // =============================================================== overall api ===========================================================

  Count: any = 0
  totalComm: any
  overAllList: any = []
  getCommOverall(Initial: any, Maxcount: any) {
    this.Count = 0
    let data = {
      "Key": "",
      // "Field1": this.lastDaysDate + " " + '00:00:01',    //dtFrom
      // "Field2": this.updatedDate + " " + '23:59:59',
      "Field1": this.userProfile,   //ProfileID
      // "Field2": this.lastDaysDate + " " + '00:00:01',    //dtFrom
      // "Field3": this.updatedDate + " " + '23:59:59',
      "Field2": Initial,
      "Field3": Maxcount,

    }
    this.shared.loader(true)
    this.api.getCommOverall(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        this.overAllList = res.lstTaxes
        this.totalComm = res.Ttl_Comm
        this.overComm = res.Ovl_Comm
        this.overPenComm = res.Ovl_Pending_Comm
        this.overSettComm = res.Ovl_Settle_Comm
        this.Count = res.Count
        this.pager = this.pagination.getPager(this.Count, this.page, this.numRecord);
        console.log("here is overall list?????????????????????????????", this.overAllList);

      }, error: (err: any) => {
        this.toster.error("Something went wrong", 'Error')
      }
    })

  }

  // ================================================================ get timestamp ===================================================================

  totalTimeList: any
  overComm: any
  overPenComm: any
  overSettComm: any
  tiemStampList: any = []
//   getCommTime(Initial: any, MaxCount: any) {
//     console.log("init", Initial, "Max", MaxCount)
// this.count2 = 0
//     let data = {

//       "Key": "",
//       "Field1": (!this.lastDaysDate ? this.updatedDates : this.lastDaysDate) + " " + '00:00:01',    //dtFrom
//       "Field2": (!this.updatedDate ? this.updatedDates : this.updatedDate) + " " + '23:59:59',
//       Field4: Initial,
//       Field5: Number(MaxCount),
//     }
//     this.shared.loader(true)
//     this.api.getCommTime(data).subscribe({
//       next: (res: any) => {
//         this.shared.loader(false)
//         this.tiemStampList = res.lstTaxes
//         this.totalTimeList = res
//         this.overComm = res.Ovl_Comm
//         this.overPenComm = res.Ovl_Pending_Comm
//         this.overSettComm = res.Ovl_Settle_Comm
//         this.totalComm = res.Ttl_Comm
//         this.count2 = res.lstTaxes.length;

//   // ✅ ADD THIS
//   this.pager2 = this.pagination.getPager(
//     this.count2,
//     this.page2,
//     this.numRecord
//   );
//         console.log("here is tmestamp list", this.tiemStampList);
//         console.log("here is tmestamp list000", this.count2);

//       }, error: (err: any) => {
//         this.toster.error("Something went wrong", 'Error')
//       }
//     })

//   }
getCommTime() {
  this.shared.loader(true);

  const data = {
    Key: "",
    Field1: (!this.lastDaysDate ? this.updatedDates : this.lastDaysDate) + " 00:00:01",
    Field2: (!this.updatedDate ? this.updatedDates : this.updatedDate) + " 23:59:59",
  };

  this.api.getCommTime(data).subscribe({
    next: (res: any) => {
      this.shared.loader(false);

      this.tiemStampList = res.lstTaxes;   // FULL DATA
      this.totalTimeList = res;

      this.overComm = res.Ovl_Comm;
      this.overPenComm = res.Ovl_Pending_Comm;
      this.overSettComm = res.Ovl_Settle_Comm;
      this.totalComm = res.Ttl_Comm;

      // ✅ FRONTEND PAGINATION INIT
      this.count2 = this.tiemStampList.length;
      this.page2 = 1;

      this.pager2 = this.pagination.getPager(
        this.count2,
        this.page2,
        this.numRecord
      );

      this.pagedItems2 = this.tiemStampList.slice(0, this.numRecord);
    },
    error: () => this.toster.error("Something went wrong")
  });
}

  // =============================================================== adv fil api =================================================

  errorMessage1: any = ''
  advList: any
  advVal: any = ''
  getAdvanceFil(ev: any) {

    if (this.advVal == '') {
      this.advList = []
      this.errorMessage1 = ''
      return
    } else if (this.advVal.length > 1) {


      let data = {

        "Key": "",
        "FilterType": this.advType,     //1-Name, 2-Phone, 3- Code
        "Value": this.advVal
      }

      // this.shared.loader(true)
      this.api.advFilType(data).subscribe({
        next: (res: any) => {
          // this.shared.loader(false)
          this.advList = res

          if (this.advList.length < 1) {
            this.errorMessage1 = "No data found"
          }
          // console.log("here is res from user list", this.riList);

        }, error: (err: any) => {
          // this.shared.loader(false)
          this.toster.error("Something went wrong", "Error")
        }
      })
    }
  }

  advType: any = 0
  selecAdType(ev: any, type: any) {
    this.advVal = ''
    this.advList = []
    this.errorMessage1 = ''
    this.advType = ev.target.value
    console.log("md type", this.advType);
    // }
    if (this.advType == 0 && type == 'tab1') {
      this.userProfile = '0'
      this.userType = '0'
      this.getCommOverall(1, 10)
    } else if (this.advType == 0 && type == 'tab2') {
      this.userProfile = '0'
      this.userType = '0'
      // this.getta()
    }

  }



  selectName: any = ''
  selectCode: any = ''
  selectPhone: any = ''
  selectedUser: any = []
  filterVal: any = 0
  advProfile: any = 0
  userType: any = 0
  userProfile: any = 0
  onSelectUser(val: any, srType: any) {
    this.crossIcon = true
    this.selectedUser = []
    this.errorMessage1 = ''
    this.advVal = val
    this.userType = val.Type
    this.userProfile = val.Profile
    console.log("here is val", val);
    this.filterVal = val.ProfileId
    this.selectedUser.push(val)
    // this.loader = false
    if (this.selectedUser.length > 0) {
      this.advList = []
      if (this.advType == "1") {
        this.advVal = val.Name
      } else if (this.advType == "2") {
        this.advVal = val.Phone
      } else if (this.advType == "3") {
        this.advVal = val.Code
      }
    }
    console.log("selected user", this.selectedUser);
    this.advProfile = this.selectedUser[0].Profile
    this.crossIcon = true
    if (srType == 2) {
      if (this.dateclear == 'custom') {
        // this.getCommTime()
      } else {
        this.dateChange()
        // this.getCommTime()
      }
    } else {
      this.page = 1
      this.getCommOverall(1, 10)
    }

  }

  searchVal: any = ''
  searchId: any = 0
  searchIcon: boolean = false
  selectUser(ev: any) {
    this.searchIcon = true
    console.log("here is ev", ev.target.value);
    this.searchId = Number(ev.target.value)
    console.log("serach type", this.searchId);
    this.searchVal = ''
  }

  // ============================================================= weekly date =================================================

  updatedDates: any
  changeDate(action: string) {
    if (action === 'add') {
      this.selectedDate.setDate(this.selectedDate.getDate() + 1);
    } else if (action === 'sub') {
      this.selectedDate.setDate(this.selectedDate.getDate() - 1);
    }
    // Refresh the Date object reference
    this.selectedDate = new Date(this.selectedDate);
    this.updatedDates = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd');
    this.lastDaysDate = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd');
    console.log("here is selected date", this.selectedDate);
    console.log("here is updated date", this.updatedDates);
    // this.getTransSumm(this.SelectedTab)
    this.page2 = 1;
    this.getCommTime()
  }

  dateclear: any = '7'
  dateFrom: any = ''
  dateTo: any = ''
  searchEnable: boolean = false
  crossIcon: boolean = false
  dateSelectFromTO(ev: any, val: any, tab: any) {
    // this.page= 1
    if (val == 'from') {
      this.dateFrom = ev.target.value
      this.lastDaysDate = ev.target.value
    } else if (val == 'to') {
      this.searchEnable = true
      this.dateTo = ev.target.value
      this.updatedDate = ev.target.value
      console.log("here is updated date", this.updatedDate);

    }
    if (tab == 'tab1' && val == 'to') {
      this.getCommOverall(1, 10)
    } else if (tab == 'tab2' && val == 'to') {
      this.page2 = 1;
    this.getCommTime()
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
    // this.getCommTime()
    // this.dateFrom= ""
    // this.dateTo= ""

  }

  selectDate(ev: any, tab: any) {
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

    }
    if (tab == 'tab1' && this.customDate != 'custom') {
      this.getCommOverall(1, 10)
    } else if (tab == 'tab2' && this.customDate != 'custom') {
      this.page2 = 1;
    this.getCommTime()
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

  clear() {
    // this.page = 1
    this.crossIcon = false
    this.searchVal = ''
    this.searchId = 0
    this.advVal = ''
    this.advType = 0
    this.advProfile = 0
    this.userProfile = 0
    // this.ServiceId = 0
    // this.getCommTime()

    this.customDate = 7
    this.dateclear = '7'
    this.dateSelect = 7
    this.dateChange()
    this.getCommOverall(1, 10)
  }

  // =========================================================== pagination ===============================================


  numRecord: any = 10
  pageRecord: any = 10;
  pageRecordNum: any = ""
  pager: any = [];

  pagedItems: any;
  pages: any = "";
  page: any = 1;
  onPageSizeChange() {
    this.page = 1;
    this.pageRecord = this.numRecord;
    this.setPage(1);
  }
  setPage(page: number) {
    this.page = page

    if ((page >= 1) && (page <= this.pager.totalPages)) {
      this.pager = this.pagination.getPager(this.Count, this.pageRecord, this.numRecord);
      this.pagedItems = this.overAllList.slice(((this.pageRecord * page) - this.pageRecord + 1), this.pageRecord * page);
      //  this.getLedger(((this.pageRecord*page)-this.pageRecord+1), this.pageRecord*page)
      this.getCommOverall(((this.pageRecord * page) - this.pageRecord + 1), this.pageRecord * page,)

    }
  }
  pagedItems2: any;
  pager2: any = [];
  pages2: any = "";
  page2: any = 1;
  count2:any;
  setPage2(page: number) {
  if (page < 1 || page > this.pager2.totalPages) {
    return;
  }

  this.page2 = page;

  // ✅ THIS LINE IS THE FIX
  this.pager2.currentPage = page;

  this.pagedItems2 = this.tiemStampList.slice(
    (page - 1) * this.numRecord,
    page * this.numRecord
  );
}


}
