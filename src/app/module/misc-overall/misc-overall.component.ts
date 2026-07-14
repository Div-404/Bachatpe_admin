import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../servies/shared/shared.service';
import { ApiService } from '../../servies/api.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule, DatePipe, formatDate } from '@angular/common';
import { PaginationService } from '../../servies/pagination.service';
import { ActivatedRoute } from '@angular/router';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CommonmoduleModule } from '../../common/commonmodule.module';

@Component({
  selector: 'app-misc-overall',
  standalone: true,
  imports: [CommonModule, NgbTooltipModule, FormsModule, CommonmoduleModule],
  templateUrl: './misc-overall.component.html',
  styleUrl: './misc-overall.component.scss'
})
export class MiscOverallComponent implements OnInit{

   selectedTab: any = "tab3"
   activeName: any= 'Overall'
   
     miscList: any
     userData: any
     idRoute: boolean = false
   
     constructor(private api: ApiService, private toster: ToastrService, private shared: SharedService,
       private pagination: PaginationService, private datePipe: DatePipe, private route: ActivatedRoute
     ) { }
   
     ngOnInit(): void {
       this.userData = JSON.parse(localStorage.getItem('userData') || "{}")
   
       // this.route.queryParams.subscribe((param:any)=>{
       //   this.advProfile= param
       //   console.log("here is quary param id", this.advProfile)
       // })
   
       this.route.params.subscribe(params => {
         this.ServiceId = params['id'];
         if (this.ServiceId) {
          this.shared.activeName$.subscribe((activeName: string) => {
            this.activeName = activeName;
            if (activeName == null){
              this.activeName= localStorage.getItem("activeName")
            }else {
            localStorage.setItem('activeName', activeName)
          }
          });
           this.idRoute = true
           this.shared.setSidebrActiveClass('misc-overall/' + this.ServiceId)
           console.log('Profile ID:', this.ServiceId);
           this.clearFiltersOnly()
           this.dateChange()
           this.selectTab('tab3')
          //  this.getRecntRechBookUtiMis(1, 10);
         }else {
          this.idRoute = false
          this.ServiceId= '0'
          this.shared.setSidebrActiveClass('misc-overall')
          this.clearFiltersOnly()
          this.dateChange()
            this.selectTab('tab1')
          // this.getRecntRechBookUtiMis(1, 10);
         }
       });
      //  if (!this.idRoute) {
      //    this.getRecntRechBookUtiMis(1, 10)
      //  } else {
      //    this.dateChange()
      //    this.getRecBookUtiMisDetail(1, 10)
      //  }
       this.getSource()
      
     }


       selectTab(tab: any) {
    this.selectedTab = tab
    if (this.selectedTab == 'tab1') {
      this.getSummList()
    } else if (this.selectedTab == 'tab3' && !this.idRoute) {
      this.idRoute = false
      this.ServiceId = '0'
      this.clearFiltersOnly()
      this.dateChange()
      this.shared.setSidebrActiveClass('misc-overall')
      this.getRecntRechBookUtiMis(1, 10);
    }
    else if (this.selectedTab == 'tab3' && this.idRoute == true) {
      // this.ServiceId= '0'
      this.clearFiltersOnly()
      this.dateChange()
      // this.shared.setSidebrActiveClass('recharge-overall')
      this.getRecntRechBookUtiMis(1, 10);
    }
  }


  //  =============================================================== summary list ===================================================

  summList: any
  getSummList() {
    this.shared.loader(true)
    // this.detailApi = false
    this.Count = 0
    let data = {
      "Key": "",
      "Field1": "5"   //servicetype   MT=1,Recharge=2,booking=3,utility=4,miscellaneous=5
    }

    this.api.getSummary(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        this.summList = res
        this.Count = res.Count

      }, error: (err: any) => {
        this.shared.loader(false)
        this.toster.error("Something went wrong", "Error")
      }
    })
  }
   
     Count: any = 0
     getRecntRechBookUtiMis(Initial: any, MaxCount: any) {
      this.pageOfItems= []
      this.miscList= []
      this.detailApi= false
       this.Count = 0
       let data = {
         "Key": "",
         //"dtFrom":"",
         //"dtTo":"",
         "Initial": Initial,
         "MaxCount": 500,
         "ServiceType": 5,
         "ServiceID": this.ServiceId,
         "Count": 500
       }
       this.shared.loader(true)
   
       this.shared.loader(true)
       this.api.getRecntRechBookUtiMis(data).subscribe({
         next: (res: any) => {
           this.shared.loader(false)
           this.miscList = res.lstTrans
           this.Count = res.Count
           this.pager = this.pagination.getPager(this.Count, this.page, this.numRecord);
           console.log("here is res from money transfer", this.miscList);
   
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
   
       this.shared.loader(true)
       this.api.getSource().subscribe({
         next: (res: any) => {
           this.shared.loader(false)
           this.sourceList = res
           console.log("here is source list", this.sourceList);
   
           this.sourceList.forEach((ele: any) => {
             if (ele.Type == 5) {
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
   
     ServiceId: any = 0
     SelectService(ev: any) {
       this.ServiceId = ev.target.value
       console.log("here is service val", this.ServiceId);
       this.page= 1
      //  this.dateChange()
      //  this.getRecBookUtiMisDetail(1, 10)

       if (this.dateclear == 'custom') {
        this.getRecBookUtiMisDetail(1, 10)
        }else {
          this.dateChange()
        this.getRecBookUtiMisDetail(1, 10)
        }
   
     }
   
   
     // ============================================================= refrence copy ===========================================================
   
     copyToClipboard(item: string) {
       // Use the Clipboard API for a more modern approach
       if (navigator.clipboard) {
         navigator.clipboard.writeText(item).then(() => {
           console.log('Text copied to clipboard:', item);
           this.toster.success('Reference copied successfully.')
         }).catch((err) => {
           console.error('Error copying text: ', err);
         });
       }
     }
   
   
     // ======================================================= get details ============================================================
   
   
   
   detailApi: boolean= false
     summDetailList: any
     getRecBookUtiMisDetail(Initial: any, MaxCount: any) {
      this.pageOfItems= []
      this.miscList= []
      this.detailApi= true
       this.Count= 0
       // this.summRec = false
       let data = {
         "Key": "",
         "Type": this.filterType,
         "ProfileID": this.advProfile,
         "ServiceType": 5,
         "ServiceID": this.ServiceId,
         "Status": Number(this.statusVal),
         "dtFrom": this.lastDaysDate + " " + "00:00:01",
         "dtTo": this.updatedDate + " " + '23:59:59',
         "Initial": Initial,
         "MaxCount": MaxCount
   
       }
       this.shared.loader(true)
       this.api.getRecBookUtiMisDetail(data).subscribe({
         next: (res: any) => {
           this.shared.loader(false)
   
           this.Count = res.Count
           this.pager = this.pagination.getPager(this.Count, this.page, this.numRecord);
           this.miscList = res.lstTrans
   
           console.log('here is summ list', this.miscList);
   
         }, error: (err: any) => {
           this.toster.error("Something went wrong", "Error")
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
       this.page= 1
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
      //  this.crossIcon = true
       this.searchEnable = false
       //  this.lastDaysDate= this.lastDaysDate + " " + "00:00:01"
       this.lastDaysDate = this.lastDaysDate
       // this.updatedDate= this.updatedDate + " " + "23:59:59"
       this.updatedDate = this.updatedDate
       console.log("lastday date", this.lastDaysDate);
       console.log("update date", this.updatedDate);
       this.getRecBookUtiMisDetail(1, 10)
       // this.dateFrom= ""
       // this.dateTo= ""
   
     }
   
     selectDate(ev: any) {
       // this.userName= ''
       // this.oFilter= '0'
       this.customDate = ev.target.value
       if (this.customDate == 'custom') {
         //  this.updatedDate= ''
         //  this.lastDaysDate= ''
         console.log("here is updated date", this.updatedDate, this.lastDaysDate);
   
       } else if (this.customDate != 'custom') {
         this.page= 1
         this.dateSelect = Number(ev.target.value)
         this.dateChange()
         // this.getPayoutReq(0,10, 'nos')
         this.getRecBookUtiMisDetail(1, 10)
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
       this.page= 1
       this.statusVal = ev.target.value
      //  this.dateChange()
      //  this.getRecBookUtiMisDetail(1, 10)
      if (this.dateclear == 'custom') {
        this.getRecBookUtiMisDetail(1, 10)
        }else {
          this.dateChange()
        this.getRecBookUtiMisDetail(1, 10)
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
   
     search() {
       this.page= 1
       this.getRecBookUtiMisDetail(1, 10)
       this.crossIcon = true
       this.searchIcon = false
     }

     clearFiltersOnly(){
      this.page = 1
      this.crossIcon = false
      this.searchVal = ''
      this.searchId = 0
      this.advVal = ''
      this.advType = 0
      this.statusVal = 0
      this.advProfile = 0
      // this.ServiceId = 0
      // this.getMoneyDeatail(1, 10)
    
      this.customDate = 7
      this.dateclear = '7'
      this.dateSelect = 7
      this.dateChange()
      // this.getMoneyDeatail(1, 10)
    }
   
   
     clear() {
       this.page= 1
       if (!this.idRoute) {
        this.ServiceId= 0
      }
      this.filterType= 0
       this.crossIcon = false
       this.searchVal = ''
       this.searchId = 0
       this.advVal = ''
       this.advType = 0
       this.statusVal = 0
       this.advProfile = 0
       // this.getRecBookUtiMisDetail(1, 10)
   
       this.customDate = 7
       this.dateclear = '7'
       this.dateSelect = 7
       this.dateChange()
       this.getRecBookUtiMisDetail(1, 10)
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
           // "Key": "",
           // "oReptType": 2,                //MD=1,DI=2,RE=3
           // "oType": this.advType,                    //NONE=0,NAME=1,EMAIL=2,PHONE=7,USER_CODE=8  
           // "Value": this.advVal
   
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
     filterType:any=0
     onSelectUser(val: any) {
      this.page= 1
       this.selectedUser = []
       this.errorMessage1 = ''
       this.filterType= val.Type
       // this.advVal= ''
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
      //  this.dateChange()
      //  this.getRecBookUtiMisDetail(1, 10)

      if (this.dateclear == 'custom') {
        this.getRecBookUtiMisDetail(1, 10)
        }else {
          this.dateChange()
        this.getRecBookUtiMisDetail(1, 10)
        }
   
     }
   
   
   
     // =========================================================== pagination ===============================================
   
      pageOfItems?: Array<any>;
  onChangePage(pageOfItems: Array<any>) {

    this.pageOfItems = pageOfItems;
  }
   
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
         this.pagedItems = this.miscList.slice(((this.pageRecord * page) - this.pageRecord + 1), this.pageRecord * page);
         //  this.getLedger(((this.pageRecord*page)-this.pageRecord+1), this.pageRecord*page)
         if (this.detailApi) {
          this.getRecBookUtiMisDetail(((this.pageRecord * page) - this.pageRecord + 1), this.pageRecord * page,)
         }else {
          this.getRecntRechBookUtiMis(((this.pageRecord * page) - this.pageRecord + 1), this.pageRecord * page,)
         }
        
   
       }
     }
   

}
