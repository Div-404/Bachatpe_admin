import { CommonModule, DatePipe, formatDate, Location } from '@angular/common';
import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../servies/api.service';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../servies/shared/shared.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { PaginationService } from '../../servies/pagination.service';
import { CommonmoduleModule } from '../../common/commonmodule.module';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-credit-list',
  standalone: true,
  imports: [CommonModule, CommonmoduleModule, FormsModule],
  templateUrl: './credit-list.component.html',
  styleUrl: './credit-list.component.scss'
})
export class CreditListComponent {

  selectedTab: any = "tab1"
    OverAllList: any = []
    creditListData: any = []
    profileId: any = ''
    userHeadDeatial: any
    private dashboardRoute: string = '/user-list';
    previousUrl: any
      selectedDate: Date = new Date();
  
  
    constructor(private modalService: NgbModal, private api: ApiService, private toster: ToastrService,
      private shared: SharedService, private router: Router, private route: ActivatedRoute, private datePipe: DatePipe,
      private pagination: PaginationService, private location: Location
    ) { }
    openLg2(content2: any) {
      this.modalService.open(content2, { size: 'md modalone', centered: true, windowClass: 'flip-modal' });
    }
  
    ngOnInit(): void {
         this.updatedDates = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd');
      // this.shared.setSidebrActiveClass('reportcredit-main/report-user')
      this.route.queryParams.subscribe((param: any) => {
        if (param.id) {
          // this.selectedTab= 'tab2'
          this.profileId = param.id
          this.shared.setReportTab(this.profileId)
          this.dateclear= '7'
          this.selectDate('7')
          // this.headerHide= true
          // this.getReportCreditUserId(1, 10)
          console.log("here param id work");
  
        }
        else {
         this.shared.setSidebrActiveClass('reportcredit-main/credit-list')
          this.profileId = ''
          this.shared.setReportTab(this.profileId)
          this.page= 1
          this.dateChange()
          this.creditList(1, 10)
        }
      })
  
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
  
    // changeTab(tab: any) {
    //   this.selectedTab = tab
    //   if (this.selectedTab == 'tab1') {
    //     this.getReportOverall(1, 1000)
    //   } else {
    //     this.creditList(1, 1000)
    //   }
    // }
  
    // ================================================================== get report overall ===============================================================
  
    overAllHead: any
    totalHead: any
    Count: any = 0
  
  
    // ============================================================== get report user ===============================================
  
    creditList(Initial: any, MaxCount: any) {
      this.pageOfItems2 = []
      this.creditListData = []
      let data = {
        "Field1": this.userProfile,  //userid
    "Field2": (!this.lastDaysDate ? this.updatedDates : this.lastDaysDate) + " " + '00:00:01',    //dtFrom   //dtFrom
    "Field3": (!this.updatedDate ? this.updatedDates : this.updatedDate) + " " + '23:59:59',  //dtTo
    "Field4": Initial,  //Initial
    "Field5": MaxCount //Maxcount
      }
      this.shared.loader(true)
  
      this.api.getCreditList(data).subscribe({
        next: (res: any) => {
          this.shared.loader(false)
        
          this.Count = res.Count
          this.pager = this.pagination.getPager(this.Count, this.page, this.numRecord);
            this.creditListData = res.lstStat
          this.overAllHead = res.oStat
          this.totalHead = res.oStatTtl
  
          console.log("here is user data list", this.creditListData);
  
        }, error: (err: any) => {
          this.toster.error(err)
        }
      })
    }

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
    this.creditList(1, 10)
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
        this.page = 1
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
      this.creditList(1, 10)
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
        this.page = 1
        this.dateSelect = Number(ev.target?.value || '7')
        this.dateChange()
        // this.getPayoutReq(0,10, 'nos')
        this.creditList(1, 10)
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
  
  
    // ============================================================== route ===================================================
  
    goToRoute(val: any) {
      console.log("here is val", val);
      // this.router.navigateByUrl("reports-penalty" + "/" + val.oSnap.ProfileID)
      this.router.navigateByUrl(`/reportcredit-main/report-user?id=${val.oUser.ProfileID}`);
    }
  
    // ============================================================= adv filter ================================================
  
      advType: any = 0
    selecAdType(ev: any, type: any) {
      this.advVal = ''
      this.advList = []
      this.errorMessage1 = ''
      this.advType = ev.target.value
      console.log("md type", this.advType);
      // }
  // this.creditList(1, 10)
  
    }
  
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
  
      selectName: any = ''
    selectCode: any = ''
    selectPhone: any = ''
    selectedUser: any = []
    filterVal: any = 0
    advProfile: any = 0
    userType: any = 0
    userProfile: any = 0
    onSelectUser(val: any, srType: any) {
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
  this.creditList(1, 10)
  
    }
  
    searchId: any= '0'
      clear() {
      this.page = 1
      // this.serviceType = 1
      // this.userType = 0
      this.userProfile = 0
      this.crossIcon = false
      // this.searchVal = ''
      this.searchId = 0
      this.advVal = ''
      this.advType = 0
      // this.statusVal = 0
      // this.advProfile = 0
      // this.ServiceId = 0
      // this.getUserRange()
  
      this.customDate = 7
      this.dateclear = '7'
      this.dateSelect = 7
      this.dateChange()
  
  
  this.creditList(1, 10)
    }
  
  
    // =========================================================== pagination for user ==========================================
  
    pageOfItems2?: Array<any>;
    onChangePage2(pageOfItems: Array<any>) {
  
      this.pageOfItems2 = pageOfItems;
    }
  
    // =========================================================== pagination for user id ===============================================
  
  
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
  
        // if (!this.profileId) {
          this.pagedItems = this.creditListData.slice(((this.pageRecord * page) - this.pageRecord + 1), this.pageRecord * page);
          this.creditList(((this.pageRecord * page) - this.pageRecord + 1), this.pageRecord * page,)
        // }
        //  else {
        //   this.pagedItems = this.UserIdList.slice(((this.pageRecord * page) - this.pageRecord + 1), this.pageRecord * page);
        //   this.getReportCreditUserId(((this.pageRecord * page) - this.pageRecord + 1), this.pageRecord * page,)
        // }
      }
    }
  

}
