import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../servies/api.service';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../servies/shared/shared.service';
import { CommonmoduleModule } from '../../common/commonmodule.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-report-credit-overall',
  standalone: true,
  imports: [CommonmoduleModule, CommonModule],
  templateUrl: './report-credit-overall.component.html',
  styleUrl: './report-credit-overall.component.scss'
})
export class ReportCreditOverallComponent implements OnInit{

   selectedTab: any = "tab1"
    OverAllList: any = []
    userList: any= []
  
  
    constructor(private modalService: NgbModal, private api: ApiService, private toster: ToastrService,
      private shared: SharedService,
    ) { }
    openLg2(content2: any) {
      this.modalService.open(content2, { size: 'md modalone', centered: true, windowClass: 'flip-modal' });
    }
  
    ngOnInit(): void {
      this.shared.setSidebrActiveClass('report-overall')
      this.getReportOverall(1, 1000)
    }
  
    // changeTab(tab: any) {
    //   this.selectedTab = tab
    //   if (this.selectedTab == 'tab1') {
    //     this.getReportOverall(1, 1000)
    //   } else {
    //     this.getReportUser(1, 1000)
    //   }
    // }
  
    // ================================================================== get report overall ===============================================================
  
    overAllHead: any
    totalHead: any
    Count: any = 0
    getReportOverall(Initial: any, MaxCount: any) {
      this.pageOfItems= []
  this.OverAllList= []
      let data = {
        "Field1": Initial,   //Initial
        "Field2": MaxCount   //Max count
      }
      this.shared.loader(true)
  
      this.api.getReportCreditOverall(data).subscribe({
        next: (res: any) => {
          this.shared.loader(false)
          this.OverAllList = res.lstStat
          this.Count = res.lstStat.length
          this.overAllHead= res.oStatOVL
          this.totalHead= res.oStatTtl
        }, error: (err: any) => {
          this.toster.error(err)
        }
      })
    }
  
    // ============================================================== get report user ===============================================
  
    getReportUser(Initial: any, MaxCount: any) {
      this.pageOfItems2= []
      this.userList= []
      let data = {
        "Field1": Initial,   //Initial
        "Field2": MaxCount   //Max count
      }
      this.shared.loader(true)
  
      this.api.getReportCreditUser(data).subscribe({
        next: (res: any) => {
          this.shared.loader(false)
          this.userList = res.lstStat
          this.Count = res.Count
          this.overAllHead= res.oStatOVL
          this.totalHead= res.oStatTtl
  
          console.log("here is user data list", this.userList);
          
        }, error: (err: any) => {
          this.toster.error(err)
        }
      })
    }
  
    routeOnId(id: any) {
  
    }
  
    // ============================================================ pagination ==================================================
  
    items: any = [];
    pageOfItems?: Array<any>;
    sortProperty: string = 'id';
    onChangePage(pageOfItems: Array<any>) {
  
      this.pageOfItems = pageOfItems;
    }
  
    // =========================================================== pagination for user ==========================================
  
    pageOfItems2?: Array<any>;
    onChangePage2(pageOfItems: Array<any>) {
  
      this.pageOfItems2 = pageOfItems;
    }
  

}
