import { CommonmoduleModule } from './../../common/commonmodule.module';
import { Component, OnInit } from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule, DatePipe, formatDate, Location } from '@angular/common';
import { SharedService } from '../../servies/shared/shared.service';
import { ApiService } from '../../servies/api.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { PaginationService } from '../../servies/pagination.service';

@Component({
  selector: 'app-reports-tax',
  standalone: true,
  imports: [NgbTooltipModule, NgbDropdownModule, CommonModule, FormsModule, CommonmoduleModule],
  templateUrl: './reports-tax.component.html',
  styleUrl: './reports-tax.component.scss'
})
export class ReportsTaxComponent implements OnInit {
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
    this.shared.setSidebrActiveClass('tax')
    this.updatedDates = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd');
    this.dateChange()

    this.route.queryParams.subscribe((param: any) => {
      if (param.id) {
        this.crossIcon= false
        this.SelectedTab= ''
        this.queryParam = true
        this.First = localStorage.getItem('First')
        this.Phone = localStorage.getItem('Phone')
        this.Code = localStorage.getItem('Code')
        this.userProfile = param.id
        // this.userProfile = localStorage.setItem('userProfile', this.userProfile)
        // this.shared.setReportTab(this.profileId)
        this.dateclear= '15'
        this.dateSelect= 15
        this.dateChange()
        // this.tabChange('tab2')
        this.getUserToggleList(param.id)
        console.log("here param id work");

      }
      else if (!this.queryParam &&  this.SelectedTab == 'tab1'){
        this.queryParam = false
        this.userProfile = '0'
        // this.shared.setReportTab(this.profileId)
        this.getReportTaxOverall()
      }
       else if (!this.queryParam &&  this.SelectedTab == 'tab2'){
        this.queryParam = false
        this.userProfile = '0'
        // this.shared.setReportTab(this.profileId)
        this.getTaxTime(1, 10)
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
      this.queryParam= false
      // this.tabChange('tab2')
      this.crossIcon = false
    this.searchVal = ''
    this.searchId = 0
    this.advVal = ''
    this.advType = 0
    this.advProfile = 0
    this.userProfile = 0
      this.location.back();
      this.tabChange('tab2')
    } else {
      console.log('Cannot go back from the dashboard route');
    }
  }

  tabChange(tab: any) {
    this.crossIcon = false
    this.SelectedTab = tab
    this.userProfile = localStorage.getItem('userProfile')
    if (this.SelectedTab == 'tab2') {
      this.customDate = ' '
      // this.dateclear= '7'
      this.userProfile = '0'
      this.userType = '0'
      this.page= 1
      this.getTaxTime(1, 10)
      // this.ChangeToggle('1')
      // this.dateChange()
      // this.getTaxTime()
    } else if (this.queryParam && tab == 'tab1') {
      this.dateChange()
      this.customDate = ' '
      this.dateclear = '7'
      this.userType = '0'
      this.getReportTaxOverall()
    }
    else {
      this.customDate = ' '
      this.dateclear = '7'
      this.userProfile = '0'
      this.userType = '0'
      this.clear()
      // this.dateChange()
      // this.getReportTaxOverall()
      // this.dateChange()

    }
  }


  toggle: any = 1
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
  //     this.selectDate(7, 'tab2')
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
  //     this.selectDate('7', 'tab2')

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
  //     this.getTaxTime(1, 10)
  //   }


  // }

  // =============================================================== overall api ===========================================================

  totalGst: any
  totalTds: any
  overAllList: any = []
  getReportTaxOverall() {
    this.pageOfItems = []
    this.overAllList = []
    let data = {
      "Key": "",
      "Field1": this.lastDaysDate + " " + '00:00:01',    //dtFrom
      "Field2": this.updatedDate + " " + '23:59:59',
      // "Field3": this.userProfile   //ProfileID
    }
    this.shared.loader(true)
    this.api.getTaxesOverall(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        this.overAllList = res.lstTaxes
        this.overAllList = res.lstTaxes.sort((a: any, b: any) => {
          return new Date(b.oLast.Tm_Str).getTime() - new Date(a.oLast.Tm_Str).getTime();  // Adjust field
        });
        this.overGst= res.Ovl_GST
        this.overTds= res.Ovl_TDS
        this.totalGst = res.Total_GST
        this.totalTds = res.Total_TDS
        console.log("here is overall list?????????????????????????????", this.overAllList);

      }, error: (err: any) => {
        this.toster.error("Something went wrong", 'Error')
      }
    })

  }

  // ================================================================ get timestamp ===================================================================




  // ============================================================ list behalf ===============================================
  overGst: any
  overTds: any
  tiemStampList: any = []
  Count: any = 0
  getTaxTime(Initial: any, MaxCount: any) {
    this.Count = 0
    this.tiemStampList = []
    let data = {
      "Key": "",
      "Field1": this.userProfile,    //dtFrom
      "Field2": Initial,
      'Field3': MaxCount

      // "Key": "",
      //   "Field1": this.userProfile,    //dtFrom
      // "Field2": String(Initial),
      // 'Filed3': String(MaxCount)
      // "Field1": (!this.lastDaysDate ? this.updatedDates : this.lastDaysDate) + " " + '00:00:01',    //dtFrom
      // "Field2": (!this.updatedDate ? this.updatedDates : this.updatedDate) + " " + '23:59:59',
    }
    this.shared.loader(true)
    this.api.getTaxesUser(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        this.tiemStampList = res.lstTaxes
        this.Count = res.Count
        this.pager = this.pagination.getPager(this.Count, this.page, this.numRecord);
        // this.tiemStampList = res.lstTaxes.sort((a: any, b: any) => {
        //   return new Date(b.oLast.Tm_Str).getTime() - new Date(a.oLast.Tm_Str).getTime();  // Adjust field
        // });

        this.totalGst = res.Total_GST
        this.totalTds = res.Total_TDS
        this.overGst = res.Ovl_GST
        this.overTds = res.Ovl_TDS
        console.log("here is tmestamp list", this.tiemStampList);

      }, error: (err: any) => {
        this.toster.error("Something went wrong", 'Error')
      }
    })

  }

  serviceType: any = '1'
  getUserToggleList(id: any) {
    this.tiemStampList = []
    this.pageOfItems2= []
    let data = {
      "Key": "",
      "Field1": (!this.lastDaysDate ? this.updatedDates : this.lastDaysDate) + " " + '00:00:01',    //dtFrom

      "Field2": (!this.updatedDate ? this.updatedDates : this.updatedDate) + " " + '23:59:59',
      "Field3": id || this.userProfile
    }
    this.shared.loader(true)
    this.api.getTaxList(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        this.tiemStampList = res.lstTaxes
         this.totalGst = res.Total_GST
        this.totalTds = res.Total_TDS

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
    // }
    if (this.advType == 0 && this.SelectedTab == 'tab1') {
      this.userProfile = '0'
      this.userType = '0'
      this.getReportTaxOverall()
    } else if (this.advType == 0 && this.SelectedTab == 'tab2') {
      this.userProfile = '0'
      this.userType = '0'
      // this.getta()
    }

    console.log("its is adv type", this.advType);


  }



  selectName: any = ''
  selectCode: any = ''
  selectPhone: any = ''
  selectedUser: any = []
  filterVal: any = 0
  advProfile: any = 0
  userType: any = 0

  onSelectUser(val: any) {
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
    // if (srType == 2)  {
    //   if (this.dateclear == 'custom') {
    //     // this.getTaxTime()
    //   } else {
    //     this.dateChange()
    //     // this.getTaxTime()
    //   }
    // } 
    if (this.SelectedTab == 'tab1') {
      this.getReportTaxOverall()
    } else if (this.SelectedTab == 'tab2') {
      this.page = 1
      this.getTaxTime(1, 10)
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
    this.getTaxTime(1, 10)
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
      this.dateCustom()
    }
    // if (tab == 'tab1' && val == 'to') {
    //   this.getReportTaxOverall()
    // } else if (tab == 'tab2' && val == 'to'){
    //   this.getTaxTime()
    // }
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
    // this.getTaxTime()
    // this.dateFrom= ""
    // this.dateTo= ""
    if (this.toggle != '3' && this.SelectedTab == 'tab2' && !this.queryParam) {
      this.getTaxTime(1, 10)
    } else if (this.toggle == '3' && this.SelectedTab == 'tab2' && !this.queryParam) {
      // this.getUserToggleList()
    }
    else if (this.SelectedTab == 'tab1' && !this.queryParam) {
      this.getReportTaxOverall()
    } else if (this.queryParam){
      this.crossIcon= false
      this.getUserToggleList(this.userProfile)
    }

  }

  selectDate(ev: any, tab: any) {
    // this.userName= ''
    // this.oFilter= '0'
    this.customDate = ev.target?.value || '7';
    if (this.customDate == 'custom') {
      //  this.updatedDate= ''
      //  this.lastDaysDate= ''
      console.log("here is updated date", this.updatedDate, this.lastDaysDate);

    } else if (this.customDate != 'custom' && tab == 'tab1' && !this.queryParam) {
      // this.page = 1
      this.dateSelect = Number(ev.target?.value || '7')
      this.dateChange()
      this.getReportTaxOverall()
      // this.getPayoutReq(0,10, 'nos')

    } else if (tab == 'tab2' && this.customDate != 'custom' && this.toggle != '3' && !this.queryParam) {
      this.dateSelect = Number(ev.target?.value || '7')
      this.dateChange()
      this.getTaxTime(1, 10)
    }
    else if (this.toggle == '3' && this.customDate != 'custom' && !this.queryParam)  {
      this.dateSelect = Number(ev.target?.value || '7')
      this.dateChange()

      // this.getUserToggleList()
    }
      else if (this.queryParam) {
      this.dateSelect = Number(ev.target?.value || '7')
      this.dateChange()
      this.getUserToggleList(this.userProfile)

      // this.getUserToggleList()
    }
    // if (tab == 'tab1' && this.customDate != 'custom') {
    //   this.getReportTaxOverall()
    // } else if (tab == 'tab2' && this.customDate != 'custom') {
    //   this.getTaxTime()
    // }
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
    // this.getTaxTime()

    this.customDate = 7
    this.dateclear = '7'
    this.dateSelect = 7
    this.dateChange()
    if (this.SelectedTab == 'tab1') {
      this.getReportTaxOverall()
    } else if (this.SelectedTab == 'tab2') {
      this.getTaxTime(1, 10)
    }
  }

  // ============================================================== route ===================================================

  goToRoute(val: any) {
    console.log("here is val", val);
    this.First = localStorage.setItem('First', val.oUser.Name)
    this.Code = localStorage.setItem('Code', val.oUser.Code)
    this.Phone = localStorage.setItem('Phone', val.oUser.Phone)
    // this.router.navigateByUrl("reports-penalty" + "/" + val.oSnap.ProfileID)
    this.router.navigateByUrl(`/tax?id=${val.oUser.ProfileID}`);
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
      this.pagedItems = this.tiemStampList.slice(((this.pageRecord * page) - this.pageRecord + 1), this.pageRecord * page);
      //  this.getLedger(((this.pageRecord*page)-this.pageRecord+1), this.pageRecord*page)
      this.getTaxTime(((this.pageRecord * page) - this.pageRecord + 1), this.pageRecord * page,)

    }
  }
}
