import { CommonmoduleModule } from './../../common/commonmodule.module';
import { ValueObject } from 'immutable';
import { Component } from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule, DatePipe, formatDate } from '@angular/common';
import { ApiService } from '../../servies/api.service';
import { SharedService } from '../../servies/shared/shared.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-api-reports',
  standalone: true,
  imports: [NgbTooltipModule, NgbDropdownModule, CommonModule, FormsModule, CommonmoduleModule],
  templateUrl: './api-reports.component.html',
  styleUrl: './api-reports.component.scss'
})
export class ApiReportsComponent {
  SelectedTab: any = ""
  tiemStampList: any = []
  selectedDate: Date = new Date();


  constructor(private modalService: NgbModal, private api: ApiService, private toster: ToastrService,
    private shared: SharedService, private datePipe: DatePipe) { }
  openLg2(content2: any) {
    this.modalService.open(content2, { size: 'md modalone', centered: true, windowClass: 'flip-modal' });
  }

  ngOnInit(): void {
    this.updatedDates = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd');
    this.tabChange('tab1')
    this.shared.setSidebrActiveClass('api-reports');
    // this.getApi()

  }

  tabChange(tab: any) {

    this.SelectedTab = tab
    this.serviceType = 1
    // if (this.SelectedTab == 'tab1') {

    // } else {
    //   // this.dateChange()
    //   this.getUserTime()
    // }

    if (this.SelectedTab == 'tab2') {
      this.apiID = "0"
      this.userProfile = '0'
      this.userType = '0'
      this.ChangeToggle('1')

      // this.dateChange()
      // this.getUserTime()
    } else {
      // this.getApi()
      this.apiID = "0"
      this.userProfile = '0'
      this.userType = '0'
      this.getApi()
      this.getUserOverAll()
      // this.dateChange()

    }
  }

  toggle: any = 3
  fisrtToggleClick: boolean= false
  ChangeToggle(val: any) {
    this.fisrtToggleClick= true
    this.serviceType = 1
    this.apiID = '0'
    this.toggle = val
    this.userType = '0'
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
      this.selectDate(7)
      this.getApi()
      // this.getUserTime()
      // this.getSummWeek(1)

    } else if (val == 3) {
      this.lastDaysDate = null
      this.updatedDate = null
      this.selectedDate = new Date();
      this.updatedDates = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd');
      this.updatedDates = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd');
      this.dateclear = '7'
      this.SelectedTab = 'tab2'
      this.getApi()
      this.dateChange()
      // this.selectDate(7)

      // this.getUserToggleList()
    }
    else {
      this.lastDaysDate = null
      this.updatedDate = null
      this.SelectedTab = 'tab2'

      // this.serviceName = 'Money Transfer'
      this.selectedDate = new Date();
      this.lastDaysDate = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd');
      this.updatedDates = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd');

      this.apiID = '0'
      this.getApi()
      this.getUserTime()
    }


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
    this.getUserTime()
  }

  // ================================================================ get timestamp ===================================================================



  getUserTime() {

    let data = {
      "Key": "",
      "Field1": this.serviceType,  //  ServiceType //mendatory >0
      // "Field2": '0',  //UserType
      "Field3": this.apiID,   //APIID

      "Field4": (!this.lastDaysDate ? this.updatedDates : this.lastDaysDate) + " " + '00:00:01',    //dtFrom

      "Field5": (!this.updatedDate ? this.updatedDates : this.updatedDate) + " " + '23:59:59',
    }
    this.shared.loader(true)
    this.api.getReportTransByapiTime(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        this.tiemStampList = res.lstOvl
        this.overTimeList = res.lstOvl
        console.log("here is tmestamp list", this.tiemStampList);

      }, error: (err: any) => {
        this.toster.error("Something went wrong", 'Error')
      }
    })

  }

  // ============================================================ list behalf ===============================================

  getUserToggleList() {

    let data = {
      "Key": "",
      "Field1": this.serviceType,  //  ServiceType //mendatory >0
      // "Field2": '0',  //UserType
      "Field2": this.apiID,   //APIID

      "Field3": (!this.lastDaysDate ? this.updatedDates : this.lastDaysDate) + " " + '00:00:01',    //dtFrom

      "Field4": (!this.updatedDate ? this.updatedDates : this.updatedDate) + " " + '23:59:59',
    }
    this.shared.loader(true)
    this.api.toggleList(data).subscribe({
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
    if (this.toggle == '2') {
      this.getUserTime()
    } else if (this.toggle == '3') {
      this.getUserToggleList()
    }

    // this.dateFrom= ""
    // this.dateTo= ""

  }

  selectDate(ev: any) {
    this.fisrtToggleClick= false
    // this.userName= ''
    // this.oFilter= '0'
    this.customDate = ev.target?.value || '7';
    if (this.customDate == 'custom') {
      //  this.updatedDate= ''
      //  this.lastDaysDate= ''
      console.log("here is updated date", this.updatedDate, this.lastDaysDate);

    } else if (this.customDate != 'custom' && this.toggle != '3') {
      // this.page = 1
      this.dateSelect = Number(ev.target?.value || '7')
      this.dateChange()
      // this.getPayoutReq(0,10, 'nos')
      this.getUserTime()
    }
    else if (this.toggle == '3' && this.customDate != 'custom' && !this.fisrtToggleClick) {
      this.dateSelect = Number(ev.target?.value || '7')
      this.dateChange()
      // this.getApi()
      this.getUserToggleList()
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


  statusVal: any = 0
  selectSataus(ev: any) {
    console.log("here is date value", this.dateclear);

    // this.page = 1
    this.statusVal = ev.target.value

    if (this.dateclear == 'custom') {
      this.getUserTime()
    } else {
      this.dateChange()
      this.getUserTime()
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

  // diVal: any = ''
  // diType: any = 0
  // mdType: any = 0
  advType: any = 0
  selecAdType(ev: any) {
    this.advVal = ''
    this.errorMessage1 = ''
    this.advType = ev.target.value
    console.log("md type", this.advType);
    // }

  }

  apiID: any = '0'
  selectApi(ev: any, tab: any) {
    this.apiID = ev.target?.value ? ev.target?.value : ev
    console.log("here is api id", this.apiID);
    if (this.apiID && tab == 'tab1') {
      this.getUserOverAll()
    }
    else if (this.apiID && tab == 'tab2' && this.toggle != '3') {
      this.getUserTime()
    }
    else if (this.apiID && tab == 'tab2' && this.toggle == '3') {
      this.getUserToggleList()
    }

  }

  search() {
    // this.page = 1
    this.getUserTime()
    this.crossIcon = true
    this.searchIcon = false
  }


  clear() {
    // this.page = 1
    this.crossIcon = false
    this.searchVal = ''
    this.searchId = 0
    this.advVal = ''
    this.advType = 0
    this.statusVal = 0
    this.advProfile = 0
    // this.ServiceId = 0
    // this.getUserTime()

    this.customDate = 7
    this.dateclear = '7'
    this.dateSelect = 7
    this.dateChange()
    this.getUserTime()
  }

  // =============================================================== adv fil api =================================================
  apiList: any = []
  errorMessage1: any = ''
  advList: any
  advVal: any = ''
  getApi() {

    // if (this.advVal == '') {
    //   this.advList = []
    //   this.errorMessage1 = ''
    //   return
    // } else if (this.advVal.length > 1) {


    let data = {
      "Field1": "0",
      "Key": ""
    }

    // this.shared.loader(true)
    this.api.getApiCon(data).subscribe({
      next: (res: any) => {
        // this.shared.loader(false)
        this.apiList = res
        if (this.toggle == '3' && this.SelectedTab == 'tab2') {
          this.selectApi(this.apiList[0].oConfig.APIID, this.SelectedTab)
        }
        // if (this.SelectedTab == 'tab1') {
        //   this.selectApi(this.apiList[0].oConfig.APIID, this.SelectedTab)
        // }
        // else {
        //   this.selectApi(this.apiList[0].oConfig.APIID, this.SelectedTab)
        // }
        // console.log("here is res from apilist", this.apiList);


      }, error: (err: any) => {
        // this.shared.loader(false)
        this.toster.error("Something went wrong", "Error")
      }
    })
    // }
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
    if (srType == 2) {
      if (this.dateclear == 'custom') {
        this.getUserTime()
      } else {
        this.dateChange()
        this.getUserTime()
      }
    } else {
      this.getUserOverAll()
    }

  }


  // =============================================================== overall api ===========================================================

  overTimeList: any = []
  serviceType: any = '1'
  overAllList: any = []
  getUserOverAll() {

    let data = {
      "Key": "",
      "Field1": this.serviceType,  //  ServiceType  //send it as 0 
      "Field2": this.apiID, //APIID  
      // "Field3": this.userProfile   //UserID
      // "Field4":"",   //dtFrom
      // "Field5":""    //dtTo
    }
    this.shared.loader(true)
    this.api.getReportTransByapiOverall(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        this.overAllList = res
        this.overTimeList = res
        console.log("here is overall list?????????????????????????????", this.tiemStampList);

      }, error: (err: any) => {
        this.toster.error("Something went wrong", 'Error')
      }
    })

  }

  checkService(ev: any, type: any) {

    console.log(ev.target.checked, type);


    if (ev.target.checked && type == 1) {
      this.serviceType = type
    } else if (!ev.target.checked && type == 1) {
      this.serviceType = type
    } else if (ev.target.checked && type == 2) {
      this.serviceType = type
    } else if (!ev.target.checked && type == 2) {
      this.serviceType = type
    } else if (ev.target.checked && type == 3) {
      this.serviceType = type
    } else if (!ev.target.checked && type == 3) {
      this.serviceType = type
    } else if (ev.target.checked && type == 4) {
      this.serviceType = type
    } else if (!ev.target.checked && type == 4) {
      this.serviceType = type
    } else if (ev.target.checked && type == 5) {
      this.serviceType = type
    } else if (!ev.target.checked && type == 5) {
      this.serviceType = type
    }

    if (this.SelectedTab == 'tab1') {
      this.getUserOverAll()
    } else if (this.toggle == '3' && this.SelectedTab == 'tab2') {
      // this.getApi()
      this.getUserToggleList()
    }
    else {
      this.getUserTime()
    }

  }

  // ============================================================ pagination ==================================================

  items: any = [];
  pageOfItems?: Array<any>;
  sortProperty: string = 'id';
  onChangePage(pageOfItems: Array<any>) {

    this.pageOfItems = pageOfItems;
  }
}
