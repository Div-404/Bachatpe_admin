import { Component } from '@angular/core';
import { NgbDropdownModule, NgbModal, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../servies/api.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { CommonModule, DatePipe, formatDate, Location } from '@angular/common';
import { SharedService } from '../../servies/shared/shared.service';
import { FormsModule } from '@angular/forms';
import { CommonmoduleModule } from '../../common/commonmodule.module';

@Component({
  selector: 'app-transactionuser-md',
  standalone: true,
  imports: [NgbTooltipModule, NgbDropdownModule, CommonModule, FormsModule, CommonmoduleModule],
  templateUrl: './transactionuser-md.component.html',
  styleUrl: './transactionuser-md.component.scss'
})
export class TransactionuserMdComponent {


  SelectedTab: any = ""
  tiemStampList: any = []
  selectedDate: Date = new Date();
  queryParam: boolean = false
  private dashboardRoute: string = '/user-list';
  previousUrl: any
  First: any = ''
  Last: any = ''
  Code: any = ''
  Phone: any = ''


  constructor(private modalService: NgbModal, private api: ApiService, private toster: ToastrService,
    private shared: SharedService, private datePipe: DatePipe, private route: ActivatedRoute,
    private router: Router, private location: Location) { }
  openLg2(content2: any) {
    this.modalService.open(content2, { size: 'md modalone', centered: true, windowClass: 'flip-modal' });
  }

  ngOnInit(): void {
    this.updatedDates = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd');

    this.shared.setSidebrActiveClass('m-distributor');

    this.route.queryParams.subscribe({
      next: (param: any) => {
        if (param.id) {
          console.log("here is param", param);
          this.First = localStorage.getItem('First')
          this.Last = localStorage.getItem('Last')
          this.Code = localStorage.getItem('Code')
          this.Phone = localStorage.getItem('Phone')
          this.userProfile = param.id
          localStorage.setItem('userProfile', this.userProfile)
          this.userType = param.type
          localStorage.setItem('userType', this.userType)
          this.queryParam = true
          this.serviceType = 1
          this.getUserRange()
        } else {
          this.serviceType = 1
          this.getUserRange()
        }
      }
    })
    // this.serviceType = 1
    // this.getUserRange()

    //////////////// for back button //////////////////////
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.previousUrl = event.url;
      }
    });

  }

  // tabChange(tab: any) {

  //   this.searchId = '0'
  //   this.advVal = ''
  //   this.advType = 0
  //   this.SelectedTab = tab
  //   this.serviceType = 1
  //   this.crossIcon = false
  //   // if (this.SelectedTab == 'tab1') {

  //   // } else {
  //   //   // this.dateChange()
  //   //   this.getUserRange()
  //   // }

  //   if (this.SelectedTab == 'tab2' && !this.queryParam) {
  //     this.userProfile = '0'
  //     this.userType = '0'
  //     this.ChangeToggle('1')
  //     // this.dateChange()
  //     // this.getUserRange()
  //   } else if (this.queryParam == true && this.SelectedTab == 'tab1') {
  //     this.userProfile = localStorage.getItem('userProfile')
  //     this.userType = localStorage.getItem('userType')
  //     this.getUserOverAll()
  //   }
  //   else if (this.queryParam == true && this.SelectedTab == 'tab2') {
  //     this.userProfile = localStorage.getItem('userProfile')
  //     this.userType = localStorage.getItem('userType')
  //     this.ChangeToggle('1')
  //     this.getUserRange()
  //   }
  //   else {
  //     this.userProfile = '0'
  //     this.userType = '0'
  //     this.getUserOverAll()
  //     // this.dateChange()

  //   }
  // }

  goBack() {
    if (this.previousUrl !== this.dashboardRoute) {
      this.location.back();
    } else {
      console.log('Cannot go back from the dashboard route');
    }
  }

  toggle: any = 1
  ChangeToggle(val: any) {
    this.serviceType = 1
    this.searchId = '0'
    this.advVal = ''
    this.advType = 0
    this.toggle = val

    this.dateclear = '0'
    this.customDate = ' '
    this.crossIcon = false
    // this.toggle= !this.toggle
    console.log('val', val);
    if (val == '2' && !this.queryParam) {
      this.userProfile = '0'
      this.userType = '0'
      this.lastDaysDate = null
      this.updatedDate = null
      this.selectedDate = new Date();
      this.updatedDates = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd');
      this.dateclear = '7'
      this.SelectedTab = 'tab2'
      // this.serviceName = 'Money Transfer'
      this.selectDate(7)
      // this.getUserRange()
      // this.getSummWeek(1)

    } else if (val == '2' && this.queryParam) {
      this.userProfile = localStorage.getItem('userProfile')
      this.userType = localStorage.getItem('userType')
      this.lastDaysDate = null
      this.updatedDate = null
      this.selectedDate = new Date();
      this.updatedDates = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd');
      this.dateclear = '7'
      this.SelectedTab = 'tab2'
      this.selectDate(7)
    }
    else if (val == '1' && this.queryParam) {
      this.userProfile = localStorage.getItem('userProfile')
      this.userType = localStorage.getItem('userType')
      this.lastDaysDate = null
      this.updatedDate = null
      this.SelectedTab = 'tab2'
      // this.serviceName = 'Money Transfer'
      this.selectedDate = new Date();
      this.lastDaysDate = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd');
      this.updatedDates = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd');
      this.getUserRange()
    }
    else {
      this.userProfile = '0'
      this.userType = '0'
      this.lastDaysDate = null
      this.updatedDate = null
      this.SelectedTab = 'tab2'
      // this.serviceName = 'Money Transfer'
      this.selectedDate = new Date();
      this.lastDaysDate = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd');
      this.updatedDates = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd');
      this.getUserRange()
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
    this.getUserRange()
  }

  // ================================================================ get timestamp ===================================================================


  overTimeList: any = []
  getUserRange() {
    this.tiemStampList = []
    this.pageOfItems2 = []
    let data = {
      "Key": "",
      "Field1": this.serviceType,  //  ServiceType //mendatory >0
      "Field2": this.userType,  //UserType
      "Field3": this.userProfile,   //UserID

      "Field4": (!this.lastDaysDate ? this.updatedDates : this.lastDaysDate) + " " + '00:00:01',    //dtFrom

      "Field5": (!this.updatedDate ? this.updatedDates : this.updatedDate) + " " + '23:59:59',
    }
    this.shared.loader(true)
    this.api.getReportsUserTime(data).subscribe({
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
    // this.crossIcon = true
    this.searchEnable = false
    //  this.lastDaysDate= this.lastDaysDate + " " + "00:00:01"
    this.lastDaysDate = this.lastDaysDate
    // this.updatedDate= this.updatedDate + " " + "23:59:59"
    this.updatedDate = this.updatedDate
    console.log("lastday date", this.lastDaysDate);
    console.log("update date", this.updatedDate);
    this.getUserRange()
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
      this.getUserRange()
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


  // statusVal: any = 0
  // selectSataus(ev: any) {
  //   console.log("here is date value", this.dateclear);

  //   // this.page = 1
  //   this.statusVal = ev.target.value

  //   if (this.dateclear == 'custom') {
  //     this.getUserRange()
  //   } else {
  //     this.dateChange()
  //     this.getUserRange()
  //   }
  // }

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
      this.getUserOverAll()
    } else if (this.advType == 0 && type == 'tab2') {
      this.userProfile = '0'
      this.userType = '0'
      this.getUserRange()
    }

  }

  search() {
    // this.page = 1
    this.getUserRange()
    this.crossIcon = true
    this.searchIcon = false
  }


  clear() {
    // this.page = 1
    this.serviceType = 1
    this.userType = 0
    this.userProfile = 0
    this.crossIcon = false
    this.searchVal = ''
    this.searchId = 0
    this.advVal = ''
    this.advType = 0
    // this.statusVal = 0
    this.advProfile = 0
    // this.ServiceId = 0
    // this.getUserRange()

    this.customDate = 7
    this.dateclear = '7'
    this.dateSelect = 7


    if (this.SelectedTab == 'tab1') {
      this.dateChange()
      this.getUserOverAll()
    } else if (this.SelectedTab == 'tab2' && this.toggle == 2) {
      this.dateChange()
      this.getUserRange()
    }
    else {
      this.getUserRange()
    }

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
        "oReptType": 1,                //MD=1,DI=2,RE=3
        "oType": this.advType,                    //NONE=0,NAME=1,EMAIL=2,PHONE=7,USER_CODE=8  
        "Value": this.advVal

        // "Key": "",
        // "FilterType": this.advType,     //1-Name, 2-Phone, 3- Code
        // "Value": this.advVal
      }

      // this.shared.loader(true)
      this.api.filterMdDsRi(data).subscribe({
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
    this.userProfile = val.ProfileId
    console.log("here is val", val);
    this.filterVal = val.ProfileId
    this.selectedUser.push(val)
    // this.loader = false
    if (this.selectedUser.length > 0) {
      this.advList = []
      if (this.advType == "1") {
        this.advVal = val.Name
      } else if (this.advType == "7") {
        this.advVal = val.Phone
      } else if (this.advType == "8") {
        this.advVal = val.Code
      }
    }
    console.log("selected user", this.selectedUser);
    this.advProfile = this.selectedUser[0].Profile
    this.crossIcon = true
    if (srType == 2) {
      if (this.dateclear == 'custom' || this.toggle == 1) {
        this.getUserRange()
      } else {
        this.dateChange()
        this.getUserRange()
      }
    } else {
      this.getUserOverAll()
    }

  }


  // =============================================================== overall api ===========================================================

  serviceType: any = '1'
  overAllList: any = []
  getUserOverAll() {
    this.overAllList = []
    this.pageOfItems = []
    let data = {
      "Key": "",
      "Field1": this.serviceType,  //  ServiceType  //send it as 0 
      "Field2": this.userType,  //UserType
      "Field3": this.userProfile   //UserID
      // "Field4":"",   //dtFrom
      // "Field5":""    //dtTo
    }
    this.shared.loader(true)
    this.api.getReportsUserOverall(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        this.overAllList = res.lstOvl
        this.overTimeList = res.lstOvl
        console.log("here is overall list", this.overAllList);

      }, error: (err: any) => {
        this.toster.error("Something went wrong", 'Error')
      }
    })

  }



  checkService(ev: any, type: any) {

    console.log(ev.target.checked, type);


    if (ev.target.checked && type == 1) {
      this.serviceType = type
      // this.getUserRange()
    } else if (!ev.target.checked && type == 1) {
      this.serviceType = type
    } else if (ev.target.checked && type == 2) {
      this.serviceType = type
      // this.getUserRange()
    } else if (!ev.target.checked && type == 2) {
      this.serviceType = type
    } else if (ev.target.checked && type == 3) {
      this.serviceType = type
      // this.getUserRange()
    } else if (!ev.target.checked && type == 3) {
      this.serviceType = type
    } else if (ev.target.checked && type == 4) {
      this.serviceType = type
      // this.getUserRange()
    } else if (!ev.target.checked && type == 4) {
      this.serviceType = type
    } else if (ev.target.checked && type == 5) {
      this.serviceType = type
      // this.getUserRange()
    } else if (!ev.target.checked && type == 5) {
      this.serviceType = type
    }

    if (this.SelectedTab == 'tab1') {
      this.getUserOverAll()
    } else {
      this.getUserRange()
    }

  }

  // ============================================================ pagination ==================================================

  items: any = [];
  pageOfItems?: Array<any>;
  sortProperty: string = 'id';
  onChangePage(pageOfItems: Array<any>) {

    this.pageOfItems = pageOfItems;
  }

  pageOfItems2?: Array<any>;

  onChangePage2(pageOfItems: Array<any>) {

    this.pageOfItems2 = pageOfItems;
  }

  ngOnDestroy() {
    localStorage.removeItem('First');
    localStorage.removeItem('Last');
    localStorage.removeItem('Code');
    localStorage.removeItem('Phone');
    localStorage.removeItem('userProfile')
    localStorage.removeItem('userType')
  }

}
