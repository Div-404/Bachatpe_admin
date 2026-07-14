import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../servies/api.service';
import { SharedService } from '../../servies/shared/shared.service';
import { PaginationService } from '../../servies/pagination.service';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule, DatePipe, formatDate, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-penality',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './user-penality.component.html',
  styleUrl: './user-penality.component.scss'
})
export class UserPenalityComponent implements OnInit{

    selectedTab: any = "tab1"
   OverAllList: any= []
   profileId: any= ''
   headerHide: boolean= false
   userHeadDeatial: any
   private dashboardRoute: string = '/user-list';
   previousUrl: any
   First: any = ''
   Last: any = ''
   Code: any = ''
   Phone: any = ''
  
    libuysell(tab: any) {
        this.selectedTab = tab
      }
    constructor(private modalService: NgbModal, private api: ApiService, private shared: SharedService,
      private toster: ToastrService, private pagination: PaginationService, private router: Router,
      private route: ActivatedRoute, private datePipe: DatePipe, private location: Location
    ){}
    openLg2(content2: any) {
      this.modalService.open(content2, { size: 'md modalone', centered: true, windowClass: 'flip-modal' } );
    }
  
    ngOnInit(): void {
      this.route.queryParams.subscribe((param: any) => {
        if (param.id) {
          // this.selectedTab= 'tab2'
          this.profileId= param.id
          this.shared.setReportTab(true)
          this.First = localStorage.getItem('First')
          this.Last = localStorage.getItem('Last')
          this.Code = localStorage.getItem('Code')
          this.Phone = localStorage.getItem('Phone')
          this.page= 1
          this.headerHide= true
          this.dateclear= '7'
          this.selectDate('7')
          // this.getPenalityUserId(1, 10)
         console.log("here param id work");
         
        }
        else {
          this.profileId= ''
          // this.router.navigateByUrl('penality-main')
          this.shared.setSidebrActiveClass('penality-main/user-penality')
          this.page =1
          this.shared.setReportTab(this.profileId)
          this.getPenalityUser(1, 10)
          
        }
      })
      
      // this.changeTab('tab1')
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
    //     this.getPenalityOverall(1, 10)
    //   } else {
    //     this.getPenalityUser(1, 10)
    //     // this.getReportUser(1, 1000)
    //   }
    // }
  
      // ================================================================== get penality overall ===============================================================
  
      overAllHead: any
      headDetail: any
      Count: any = 0
    //   getPenalityOverall(Initial: any, MaxCount: any) {
    //     this.Count= 0
    //     // this.pageOfItems= []
    // this.OverAllList= []
    //     let data = {
    //       "Field1": "0",   
    //       "Field2": Initial,   //Initial
    //       "Field3": MaxCount,  //Maxcount 
    //     }
    //     this.shared.loader(true)
    
    //     this.api.getReportPenOverall(data).subscribe({
    //       next: (res: any) => {
    //         this.shared.loader(false)
    //         this.OverAllList = res.lstPenality
    //         this.Count= res.Count
    //         this.pager = this.pagination.getPager(this.Count, this.page, this.numRecord);
    //         this.headDetail= res
    //       }, error: (err: any) => {
    //         this.toster.error(err)
    //       }
    //     })
    //   }
  
      // ================================================================== get user wise ==================================================
  
      userWiseList: any= []
      getPenalityUser(Initial: any, MaxCount: any) {
        this.Count= 0
        // this.pageOfItems= []
    this.userWiseList= []
        let data = {
          "Field1": "0",   
          "Field2": Initial,   //Initial
          "Field3": MaxCount,  //Maxcount 
        }
        this.shared.loader(true)
    
        this.api.getReportPenUser(data).subscribe({
          next: (res: any) => {
            this.shared.loader(false)
            this.userWiseList = res.lstPenality
            this.Count= res.Count
            this.pager = this.pagination.getPager(this.Count, this.page, this.numRecord);
            this.headDetail= res
          }, error: (err: any) => {
            this.toster.error(err)
          }
        })
      }

      backRoute() {
        this.router.navigateByUrl('/penality-main/user-penality')
      }

      // ================================================================ ueser id api ===================================================


      UserIdList: any= []
      getPenalityUserId(Initial: any, MaxCount: any) {
        this.Count= 0
        this.userWiseList= []
        // this.pageOfItems= []
    this.OverAllList= []
        let data = {
          "Field1": this.profileId,   //UserID
          "Field2": Initial,  //Initial  
          "Field3": MaxCount,  //Maxcount 
          "Field4": this.lastDaysDate  + " " + '00:00:01', //dtFrom
          "Field5": this.updatedDate  + " " + '23:59:59', //dtTo
        }
        this.shared.loader(true)
    
        this.api.getPenalityUserId(data).subscribe({
          next: (res: any) => {
            this.shared.loader(false)
            this.userWiseList = res.lstPenality
            this.userHeadDeatial= res.lstPenality[0]?.oSnap
            this.Count= res.Count
            this.pager = this.pagination.getPager(this.Count, this.page, this.numRecord);
            this.headDetail= res
          }, error: (err: any) => {
            this.toster.error(err)
          }
        })
      }
  
      // ============================================================== route ===================================================
  
      goToRoute(val: any) {
  console.log("here is val", val);
    this.First = localStorage.setItem('First', val.oSnap.Name)
          this.Code = localStorage.setItem('Code', val.oSnap.Code)
          this.Phone = localStorage.setItem('Phone', val.oSnap.Phone)
  // this.router.navigateByUrl("reports-penalty" + "/" + val.oSnap.ProfileID)
  this.router.navigateByUrl(`/penality-main/user-penality?id=${val.oSnap.ProfileID}`);
      }

      // ============================================================ date setting ==============================================

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
            this.page= 1
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
          this.getPenalityUserId(1, 10)
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
            this.getPenalityUserId(1, 10)
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
        if (!this.profileId){
          this.pagedItems = this.userWiseList.slice(((this.pageRecord * page) - this.pageRecord + 1), this.pageRecord * page);
          this.getPenalityUser(((this.pageRecord * page) - this.pageRecord + 1), this.pageRecord * page,)
        }else {
          this.pagedItems = this.userWiseList.slice(((this.pageRecord * page) - this.pageRecord + 1), this.pageRecord * page);
          this.getPenalityUserId(((this.pageRecord * page) - this.pageRecord + 1), this.pageRecord * page,)
        }
      
  
      }
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
