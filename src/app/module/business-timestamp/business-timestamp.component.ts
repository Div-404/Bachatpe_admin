import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../servies/shared/shared.service';
import { ApiService } from '../../servies/api.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule, DatePipe, formatDate } from '@angular/common';
import { CommonmoduleModule } from '../../common/commonmodule.module';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-business-timestamp',
  standalone: true,
  imports: [CommonModule, CommonmoduleModule, FormsModule],
  templateUrl: './business-timestamp.component.html',
  styleUrl: './business-timestamp.component.scss'
})
export class BusinessTimestampComponent implements OnInit{

   selectedDate: Date = new Date();

  constructor(private shared: SharedService, private api: ApiService, private toster: ToastrService, 
    private datePipe: DatePipe
  ){

  }


  ngOnInit(): void {
    this.shared.setSidebrActiveClass('business-main/business-timestamp')
      this.updatedDates = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd');
      this.ChangeToggle(1)
  }

    // ================================================================ get timestamp ===================================================================


      toggle: any = 1
  ChangeToggle(val: any) {
    this.toggle = val
     this.dateclear= '0'
    this.customDate= ' '
    console.log('val', val);
    if (val == '2') {
      this.lastDaysDate = null
      this.updatedDate = null
      this.selectedDate = new Date();
      this.updatedDates = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd');
      this.dateclear = '7'
      // this.dateSelect= 7
      this.selectDate(7)
    }
    else {
      this.lastDaysDate = null
      this.updatedDate = null
      // this.serviceName = 'Money Transfer'
      this.selectedDate = new Date();
      this.lastDaysDate = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd');
      this.updatedDates = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd');
      // this.dateChange()
      this.getBusinessTimestamp()
    }


  }

  
ovlBussiness: any
  overGst: any
  overTds: any
  tiemStampList: any = []
  getBusinessTimestamp() {
    this.pageOfItems= []
    this.tiemStampList= []
    let data = {
      "Field1": (!this.lastDaysDate ? this.updatedDates : this.lastDaysDate) + " " + '00:00:01',    //dtFrom

      "Field2": (!this.updatedDate ? this.updatedDates : this.updatedDate) + " " + '23:59:59',
    }
    this.shared.loader(true)
    this.api.getBusinessTime(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        this.tiemStampList = res.lstAmtTm
        this.overTds= res.lstAmtTm
        this.ovlBussiness= res.Amt
        console.log("here is tmestamp list", this.tiemStampList);

      }, error: (err: any) => {
        this.toster.error("Something went wrong", 'Error')
      }
    })

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
      this.getBusinessTimestamp()
    }
  
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
        console.log("here is updated date", this.updatedDate);
  this.dateCustom()
      }
      // if (tab == 'tab1' && val == 'to') {
      //   this.getReportTaxOverall()
      // } else if (tab == 'tab2' && val == 'to'){
      //   this.getBusinessTimestamp()
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
this.getBusinessTimestamp()
  
    }
  
    selectDate(ev: any) {
      // this.userName= ''
      // this.oFilter= '0'
      this.customDate = ev.target?.value || '7';
      if (this.customDate == 'custom') {
        //  this.updatedDate= ''
        //  this.lastDaysDate= ''
        console.log("here is updated date", this.updatedDate, this.lastDaysDate);
  
      } else if (this.customDate != 'custom' ) {
        // this.page = 1
        this.dateSelect = Number(ev.target?.value || '7')
        this.dateChange()
        this.getBusinessTimestamp()
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

        // ============================================================ pagination ==================================================

    items: any = [];
    pageOfItems?: Array<any>;
    sortProperty: string = 'id';
    onChangePage(pageOfItems: Array<any>) {
  
      this.pageOfItems = pageOfItems;
    }
  

}
