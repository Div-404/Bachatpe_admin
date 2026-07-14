import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedService } from '../../servies/shared/shared.service';
import { ApiService } from '../../servies/api.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule, DatePipe, formatDate, Location } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonmoduleModule } from '../../common/commonmodule.module';
import { PaginationService } from '../../servies/pagination.service';

@Component({
  selector: 'app-business-user',
  standalone: true,
  imports: [CommonModule, FormsModule, CommonmoduleModule],
  templateUrl: './business-user.component.html',
  styleUrl: './business-user.component.scss'
})
export class BusinessUserComponent implements OnInit {

  SelectedTab: any = "tab1"
  selectedDate: Date = new Date();
  private dashboardRoute: string = '/user-list';
  previousUrl: any
  First: any = ''
  Last: any = ''
  Phone: any = ''
  Code: any = ''
  userProfile: any = '0'
  queryParam: boolean = false

  // libuysell(tab: any) {
  //     this.SelectedTab = tab
  //   }
  constructor(private modalService: NgbModal, private shared: SharedService, private api: ApiService,
    private toster: ToastrService, private datePipe: DatePipe, private route: ActivatedRoute,
    private router: Router, private location: Location, private pagination: PaginationService
  ) { }
  openLg2(content2: any) {
    this.modalService.open(content2, { size: 'md modalone', centered: true, windowClass: 'flip-modal' });
  }

  ngOnInit(): void {
    this.shared.setSidebrActiveClass('business-main/business-user')
    this.updatedDates = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd');
    this.dateChange()
    this.queryParam = false
    this.userProfile = '0'
    // this.shared.setReportTab(this.profileId)
    this.getUser(1, 10)
    // this.First= localStorage.getItem('First')
    // this.Last= localStorage.getItem('Last')
    // this.Phone= localStorage.getItem('Phone')
    // this.Code= localStorage.getItem('Code')
    // this.route.queryParams.subscribe((param: any) => {
    //   if (param.id) {
    //     // this.selectedTab= 'tab2'
    //     this.queryParam = true
    //     this.userProfile = param.id
    //     this.userProfile = localStorage.setItem('userProfile', this.userProfile)
    //     // this.shared.setReportTab(this.profileId)
    //     this.dateChange()
    //     // this.tabChange('tab1')
    //     console.log("here param id work");

    //   }
    // else {
    //   this.queryParam = false
    //   this.userProfile = '0'
    //   // this.shared.setReportTab(this.profileId)
    //   this.getUser(1, 10)
    // }
    // })
    //////////////// for back button //////////////////////
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.previousUrl = event.url;
      }
    });

  }

  goBack() {
    if (this.previousUrl !== this.dashboardRoute) {
      this.location.back();
    } else {
      console.log('Cannot go back from the dashboard route');
    }
  }

  // tabChange(tab: any) {
  //   this.crossIcon = false
  //   this.SelectedTab = tab
  //   this.userProfile = localStorage.getItem('userProfile')
  //   if (this.SelectedTab == 'tab2') {
  //     this.customDate = ' '
  //     // this.dateclear= '7'
  //     this.userProfile = '0'
  //     this.userType = '0'
  //     this.ChangeToggle('1')
  //     // this.dateChange()
  //     // this.getTaxTime()
  //   } else if (this.queryParam && tab == 'tab1') {
  //     this.dateChange()
  //     this.customDate = ' '
  //     this.dateclear = '7'
  //     this.userType = '0'
  //     this.getUser(1, 10)
  //   }
  //   else {
  //     this.customDate = ' '
  //     this.dateclear = '7'
  //     this.userProfile = '0'
  //     this.userType = '0'
  //     this.clear()
  //     // this.dateChange()
  //     // this.getUser()
  //     // this.dateChange()

  //   }
  // }


  // toggle: any = 1
  // ChangeToggle(val: any) {
  //   this.toggle = val
  //   this.dateclear = '0'
  //   this.customDate = ' '
  //   this.userProfile = '0'
  //   // this.toggle= !this.toggle
  //   console.log('val', val);
  //   if (val == '2') {
  //     this.lastDaysDate = null
  //     this.updatedDate = null
  //     this.selectedDate = new Date();
  //     this.updatedDates = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd');
  //     this.dateclear = '7'
  //     this.SelectedTab = 'tab2'
  //     // this.serviceName = 'Money Transfer'
  //     this.selectDate(7)
  //     // this.getTaxTime()
  //     // this.getSummWeek(1)

  //   } else if (val == 3) {
  //     this.searchId = 0
  //     this.advType = 0
  //     this.lastDaysDate = null
  //     this.updatedDate = null
  //     this.selectedDate = new Date();
  //     this.updatedDates = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd');
  //     this.updatedDates = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd');
  //     this.dateclear = '7'
  //     this.SelectedTab = 'tab2'
  //     // this.getApi()
  //     this.selectDate('7')

  //     // this.getUserToggleList()
  //   }

  //   else {
  //     this.lastDaysDate = null
  //     this.updatedDate = null
  //     this.SelectedTab = 'tab2'
  //     // this.serviceName = 'Money Transfer'
  //     this.selectedDate = new Date();
  //     this.lastDaysDate = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd');
  //     this.updatedDates = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd');
  //     // this.dateChange()
  //     this.getTaxTime()
  //   }


  // }

  // =============================================================== overall api ===========================================================

  userList: any = []
  Count: any = 0
  getUser(Initial: any, MaxCount: any) {
    this.pageOfItems = []
    this.userList = []
    let data = {
      "Field1": this.userProfile,    //UserID
      "Field2": Initial,    // Initial
      "Field3": MaxCount,     //Maxcount
      "Field4": this.lastDaysDate + " " + '00:00:01',    //dtFrom
      "Field5": this.updatedDate + " " + '23:59:59',
    }
    this.shared.loader(true)
    this.api.getBusinessUser(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        this.userList = res.lstBusiness
        this.Count = res.Count
        this.pager = this.pagination.getPager(this.Count, this.page, this.numRecord);
        console.log("here is overall list?????????????????????????????", this.userList);

      }, error: (err: any) => {
        this.toster.error("Something went wrong", 'Error')
      }
    })

  }

  // ================================================================ get timestamp ===================================================================


  overGst: any
  overTds: any
  tiemStampList: any = []
  getTaxTime() {
    this.pageOfItems2 = []
    this.tiemStampList = []
    let data = {

      "Key": "",
      "Field1": (!this.lastDaysDate ? this.updatedDates : this.lastDaysDate) + " " + '00:00:01',    //dtFrom
      "Field2": (!this.updatedDate ? this.updatedDates : this.updatedDate) + " " + '23:59:59',
    }
    this.shared.loader(true)
    this.api.getTaxesTime(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        this.tiemStampList = res.lstTaxes
        this.overGst = res.Ovl_GST
        this.overTds = res.Ovl_TDS
        console.log("here is tmestamp list", this.tiemStampList);

      }, error: (err: any) => {
        this.toster.error("Something went wrong", 'Error')
      }
    })

  }

  // ============================================================ list behalf ===============================================
  serviceType: any = '1'
  getUserToggleList() {
    this.pageOfItems2 = []
    this.tiemStampList = []
    let data = {
      "Key": "",
      "Field1": (!this.lastDaysDate ? this.updatedDates : this.lastDaysDate) + " " + '00:00:01',    //dtFrom

      "Field2": (!this.updatedDate ? this.updatedDates : this.updatedDate) + " " + '23:59:59',
      "Field3": this.userProfile
    }
    this.shared.loader(true)
    this.api.getTaxList(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        this.tiemStampList = res
        // this.overTimeList = res.lstOvl
        console.log("here is tmestamp list", this.tiemStampList);

      }, error: (err: any) => {
        this.toster.error("Something went wrong", 'Error')
      }
    })

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
  selecAdType(ev: any) {
    this.advVal = ''
    this.advList = []
    this.errorMessage1 = ''
    this.advType = ev.target.value
    console.log("md type", this.advType);
    this.userProfile = '0'
    this.userType = '0'
    // this.getUser(1, 10)

  }



  selectName: any = ''
  selectCode: any = ''
  selectPhone: any = ''
  selectedUser: any = []
  filterVal: any = 0
  advProfile: any = 0
  userType: any = 0

  onSelectUser(val: any) {
    this.page= 1
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
    this.getUser(1, 10)
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
  // changeDate(action: string) {
  //   if (action === 'add') {
  //     this.selectedDate.setDate(this.selectedDate.getDate() + 1);
  //   } else if (action === 'sub') {
  //     this.selectedDate.setDate(this.selectedDate.getDate() - 1);
  //   }
  //   // Refresh the Date object reference
  //   this.selectedDate = new Date(this.selectedDate);
  //   this.updatedDates = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd');
  //   this.lastDaysDate = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd');
  //   console.log("here is selected date", this.selectedDate);
  //   console.log("here is updated date", this.updatedDates);
  //   // this.getTransSumm(this.SelectedTab)
  //   this.getTaxTime()
  // }

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
      this.page= 1
      this.searchEnable = true
      this.dateTo = ev.target.value
      this.updatedDate = ev.target.value
      console.log("here is updated date", this.updatedDate);
      this.dateCustom()
    }
    // if (tab == 'tab1' && val == 'to') {
    //   this.getUser()
    // } else if (tab == 'tab2' && val == 'to'){
    //   this.getTaxTime()
    // }
  }

  dateCustom() {
    // this.page= 1
    this.customDate = ''
    // this.crossIcon = true
    this.searchEnable = false
    //  this.lastDaysDate= this.lastDaysDate + " " + "00:00:01"
    this.lastDaysDate = this.lastDaysDate
    // this.updatedDate= this.updatedDate + " " + "23:59:59"
    this.updatedDate = this.updatedDate
    console.log("lastday date", this.lastDaysDate);
    console.log("update date", this.updatedDate);
    this.getUser(1, 10)

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
      this.page = 1
      this.dateSelect = Number(ev.target?.value || '7')
      this.dateChange()
      this.getUser(1, 10)
      // this.getPayoutReq(0,10, 'nos')

    }
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
    this.page = 1
    this.crossIcon = false
    this.searchVal = ''
    this.searchId = 0
    this.advVal = ''
    this.advType = 0
    this.advProfile = 0
    this.userProfile = 0
    // this.ServiceId = 0
    // this.getTaxTime()

    this.customDate = 7
    this.dateclear = '7'
    this.dateSelect = 7
    this.dateChange()
    this.getUser(1, 10)
  }

  // ============================================================ pagination ==================================================

  items: any = [];
  pageOfItems?: Array<any>;
  sortProperty: string = 'id';
  onChangePage(pageOfItems: Array<any>) {

    this.pageOfItems = pageOfItems;
  }

  // ============================================================ pagination for timestamp ===================================================

  pageOfItems2?: Array<any>;
  onChangePage2(pageOfItems: Array<any>) {

    this.pageOfItems2 = pageOfItems;
  }

  ngOnDestroy() {
    localStorage.removeItem('userProfile')
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
      this.pagedItems = this.userList.slice(((this.pageRecord * page) - this.pageRecord + 1), this.pageRecord * page);
      //  this.getLedger(((this.pageRecord*page)-this.pageRecord+1), this.pageRecord*page)
      this.getUser(((this.pageRecord * page) - this.pageRecord + 1), this.pageRecord * page,)

    }
  }

}
