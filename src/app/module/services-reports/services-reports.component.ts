
import { Component } from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule, DatePipe, formatDate } from '@angular/common';
import { ApiService } from '../../servies/api.service';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../servies/shared/shared.service';
import { FormsModule } from '@angular/forms';
import { CommonmoduleModule } from '../../common/commonmodule.module';

@Component({
  selector: 'app-services-reports',
  standalone: true,
  imports: [NgbTooltipModule, NgbDropdownModule, CommonModule, FormsModule, CommonmoduleModule],
  templateUrl: './services-reports.component.html',
  styleUrl: './services-reports.component.scss'
})
export class ServicesReportsComponent {
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
    this.shared.setSidebrActiveClass('service-reports');


  }

  firstTabChange: boolean= false
  tabChange(tab: any) {
    this.firstTabChange= true
    this.SelectedTab = tab
    // if (this.SelectedTab == 'tab1') {

    // } else {
    //   // this.dateChange()
    //   this.getUserTime()
    // }

    if (this.SelectedTab == 'tab2') {
      this.serviceType = 1
      this.ChangeToggle('1')
    } else if (this.SelectedTab == 'tab3') {
      this.customDate = ' '
      this.serviceType = 1
      this.dateclear = '7'
      this.dateSelect= '7'
      // this.selectDate('7')
      this.dateChange()
      this.getSource()
      // this.getTransService()

    }
    else {
      this.serviceType = 1
      this.getUserOverAll()


    }
  }

  toggle: any = 1
  ChangeToggle(val: any) {
    this.serviceType = 1
    this.toggle = val
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
      // this.getUserTime()
      // this.getSummWeek(1)

    } else {
      this.lastDaysDate = null
      this.updatedDate = null
      this.SelectedTab = 'tab2'
      // this.serviceName = 'Money Transfer'
      this.selectedDate = new Date();
      this.lastDaysDate = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd');
      this.updatedDates = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd');
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

  timeListing: any
  timeList: any
  getUserTime() {
    this.pageOfItems = []
    this.timeListing = []
    let data = {
      "Key": "",
      "Field1": String(this.serviceType),  //  ServiceType  // all mendatoty >0
      "Field2": (!this.lastDaysDate ? this.updatedDates : this.lastDaysDate) + " " + '00:00:01',    //dtFrom
      "Field3": (!this.updatedDate ? this.updatedDates : this.updatedDate) + " " + '23:59:59',
    }
    this.shared.loader(true)
    this.api.getReportServiceTime(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        this.timeList = res
        this.timeList.forEach((ele: any) => {
          if (ele) {
            this.timeListing = ele.lstOvl
            this.overTimeList = ele.lstOvl
          }

        });
        console.log("here is overall list?????????????????????????????", this.timeListing);


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

    if (this.SelectedTab == 'tab2') {
      this.getUserTime()
    } else if (this.SelectedTab == 'tab3') {
      this.getTransService()
    }

    // this.dateFrom= ""
    // this.dateTo= ""

  }

  selectDate(ev: any) {
    this.firstTabChange= false
    // this.userName= ''
    // this.oFilter= '0'
    this.customDate = ev.target?.value || '7';
    if (this.customDate == 'custom') {
      //  this.updatedDate= ''
      //  this.lastDaysDate= ''
      console.log("here is updated date", this.updatedDate, this.lastDaysDate);

    } else if (this.customDate != 'custom' && this.SelectedTab != 'tab3') {
      // this.page = 1
      this.dateSelect = Number(ev.target?.value || '7')
      this.dateChange()
      // this.getPayoutReq(0,10, 'nos')
      this.getUserTime()
    }
    else if (this.customDate != 'custom' && this.SelectedTab == 'tab3' && !this.firstTabChange) {
      // this.page = 1
      this.dateSelect = Number(ev.target?.value || '7')
        this.dateChange()
      // this.getSource()
      this.getTransService()
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



  // =============================================================== overall api ===========================================================

  overTimeList: any = []
  overallListing: any = []
  serviceType: any = '0'
  overAllList: any = []
  getUserOverAll() {
    this.overallListing = []
    let data = {
      "Key": "",
      "Field1": String(this.serviceType)  //  ServiceType  //mendatory  >0
    }
    this.shared.loader(true)
    this.api.getReportServiceOverall(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        this.overAllList = res.lstOvl
        // this.overAllList?.forEach((ele: any) => {
        //   if (ele) {
        //     this.overallListing = ele
        //     this.overTimeList= ele
        //   }

        // });
        console.log("here is overall list?????????????????????????????", this.overAllList);

      }, error: (err: any) => {
        this.toster.error("Something went wrong", 'Error')
      }
    })

  }

  // ======================================== for service tab 3 ===============================================

  serviceId: any = ''
  getTransService() {
    this.pageOfItems = []
    this.timeListing = []
    let data = {
      "Key": "",
      "Field1": String(this.serviceType),  //  ServiceType  // all mendatoty >0
      "Field2": this.serviceId,
      "Field3": (!this.lastDaysDate ? this.updatedDates : this.lastDaysDate) + " " + '00:00:01',    //dtFrom
      "Field4": (!this.updatedDate ? this.updatedDates : this.updatedDate) + " " + '23:59:59',
    }
    this.shared.loader(true)
    this.api.getTransactionService(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        this.timeListing = res
        this.timeListing = res.sort((a: any, b: any) => {
  return new Date(b.oTime.Tm_Str).getTime() - new Date(a.oTime.Tm_Str).getTime(); // Adjust field
});
        // this.timeList.forEach((ele: any) => {
        //   if (ele) {
        //     this.timeListing = ele.lstOvl
        //     this.overTimeList= ele.lstOvl
        //   }

        // });
        console.log("here is overall list?????????????????????????????", this.timeListing);


      }, error: (err: any) => {
        this.toster.error("Something went wrong", 'Error')
      }
    })

  }

  // ============================================================= get services =============================================================
  sourceList: any = []
  serviceList: any
  Money: any = []
  getSource() {
    this.Money = []
    this.api.getSource().subscribe({
      next: (res: any) => {

        this.sourceList = res
        console.log("here is source list", this.sourceList);

        this.sourceList.forEach((ele: any) => {
          if (ele.Type == this.serviceType) {
            this.serviceList = ele.lstSource
            this.selectService(ele.lstSource[0].SourceId)
            console.log("service list", this.serviceList);
          }

        });

      }, error: (err: any) => {
        this.shared.loader(false)
        this.toster.error("Something went wrong", "Error")

      }
    })
  }
  // =============================================== select service ====================================

  selectService(ev: any) {
    this.serviceId = ev.target?.value ? ev.target?.value : ev
    if (this.SelectedTab == 'tab3' && this.serviceId) {
      this.getTransService()
    }
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
    } else if (this.SelectedTab == 'tab3') {
      this.getSource()
      // this.getTransService()
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
