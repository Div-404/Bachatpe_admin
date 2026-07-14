import { Component, OnInit } from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../servies/api.service';
import { SharedService } from '../../servies/shared/shared.service';
import { ToastrService } from 'ngx-toastr';
import { PaginationService } from '../../servies/pagination.service';
import { CommonmoduleModule } from '../../common/commonmodule.module';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-reports-penality',
  standalone: true,
  imports: [NgbTooltipModule, NgbDropdownModule, CommonModule, CommonmoduleModule, RouterModule, FormsModule],
  templateUrl: './reports-penality.component.html',
  styleUrl: './reports-penality.component.scss'
})
export class ReportsPenalityComponent implements OnInit{
  selectedTab: any = "tab1"
 OverAllList: any= []
 profileId: any= ''

  libuysell(tab: any) {
      this.selectedTab = tab
    }
  constructor(private modalService: NgbModal, private api: ApiService, private shared: SharedService,
    private toster: ToastrService, private pagination: PaginationService, private router: Router,
    private route: ActivatedRoute
  ){}
  openLg2(content2: any) {
    this.modalService.open(content2, { size: 'md modalone', centered: true, windowClass: 'flip-modal' } );
  }

  ngOnInit(): void {
    // this.route.params.subscribe((param: any) => {
    //   if (param.id) {
    //     // this.selectedTab= 'tab2'
    //     this.profileId= param.id
    //    console.log("here param id work");
       
    //   }
    // })
    this.shared.setSidebrActiveClass('reports-penality')
    this.getPenalityOverall(1, 10)
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
    getPenalityOverall(Initial: any, MaxCount: any) {
      this.Count= 0
      // this.pageOfItems= []
  this.OverAllList= []
      let data = {
        "Field1": Initial,   //Initial
        "Field2": MaxCount,  //Maxcount 
      }
      this.shared.loader(true)
  
      this.api.getReportPenOverall(data).subscribe({
        next: (res: any) => {
          this.shared.loader(false)
          this.OverAllList = res.lstPenality
          this.Count= res.Count
          this.pager = this.pagination.getPager(this.Count, this.page, this.numRecord);
          this.headDetail= res
        }, error: (err: any) => {
          this.toster.error(err)
        }
      })
    }

    // ================================================================== get user wise ==================================================

  //   userWiseList: any= []
  //   getPenalityUser(Initial: any, MaxCount: any) {
  //     this.Count= 0
  //     // this.pageOfItems= []
  // this.userWiseList= []
  //     let data = {
  //       "Field1": "0",   
  //       "Field2": Initial,   //Initial
  //       "Field3": MaxCount,  //Maxcount 
  //     }
  //     this.shared.loader(true)
  
  //     this.api.getReportPenUser(data).subscribe({
  //       next: (res: any) => {
  //         this.shared.loader(false)
  //         this.userWiseList = res.lstPenality
  //         this.Count= res.Count
  //         this.pager = this.pagination.getPager(this.Count, this.page, this.numRecord);
  //         this.headDetail= res
  //       }, error: (err: any) => {
  //         this.toster.error(err)
  //       }
  //     })
  //   }

    // ============================================================== route ===================================================

    goToRoute(val: any) {
console.log("here is val", val);
this.router.navigateByUrl("reports-penalty" + "/" + val.oSnap.ProfileID)
// this.router.navigateByUrl(`reports-penalty?diProfile=${val.oSnap.ProfileID}`);
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
      this.pagedItems = this.OverAllList.slice(((this.pageRecord * page) - this.pageRecord + 1), this.pageRecord * page);
      this.getPenalityOverall(((this.pageRecord * page) - this.pageRecord + 1), this.pageRecord * page,)

    }

  // else {
  //   if ((page >= 1) && (page <= this.pager.totalPages)) {
  //     this.pager = this.pagination.getPager(this.Count, this.pageRecord, this.numRecord);
  //     this.pagedItems = this.userWiseList.slice(((this.pageRecord * page) - this.pageRecord + 1), this.pageRecord * page);
  //     this.getPenalityUser(((this.pageRecord * page) - this.pageRecord + 1), this.pageRecord * page,)

  //   }
  // }
  }

}
