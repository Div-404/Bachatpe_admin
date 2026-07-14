import { FormsModule } from '@angular/forms';
import { PaginationService } from './../../servies/pagination.service';
import { subscribe } from 'diagnostics_channel';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../servies/api.service';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../servies/shared/shared.service';

@Component({
  selector: 'app-credit-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './credit-request.component.html',
  styleUrl: './credit-request.component.scss'
})
export class CreditRequestComponent implements OnInit {

  creditList: any = []
  modalVal: any
  loginId: any
  Count: any= 0
  execPermissions: any

  constructor(private api: ApiService, private toster: ToastrService, private shared: SharedService,
    private modalService: NgbModal, private pagination: PaginationService
  ) { }

  ngOnInit(): void {
     this.execPermissions = JSON.parse(sessionStorage.getItem("execDetails") || '{}')
    this.shared.setSidebrActiveClass('credit-container')
    this.loginId = JSON.parse(sessionStorage.getItem("isloggedIn") || "{}")
    this.getCreditReq(1, 10)
  }

  modalClose() {
    this.modalService.dismissAll()
  }

  openLg(content: any, val: any) {
     if (this.execPermissions?.some((permit: any) => permit.Master === 'Finance' && permit.SubMasters.some((sub: any) => sub.SubMaster === 'Transaction' && sub.Edit === 0))) {

      this.toster.error('You dont have permission to approve request', 'Permission Denied');
      return;
    } else{
    this.statsuSub= false
    this.modalVal = val
    this.autoDebVal= this.modalVal.oTrans.Auto_Debit
    this.statusVal= this.modalVal.Status
    this.modalService.open(content, { size: 'md modalone', centered: true, windowClass: 'flip-modal' });
    }
  }
  
  // =========================================================== get credit req ==============================================================

  getCreditReq(Initial: any, MaxCount: any) {
    this.Count= 0
    let data = {
      "oType": this.searchId,          //        NONE=0,NAME=1,PHONE=7,USER_CODE=8
      "Value": this.searchVal,
      "Initial": Initial,
      "MaxCount": MaxCount
    }
    this.shared.loader(true)

    this.api.getCreditReq(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        this.creditList = res.lstTrans
        this.Count= res.Count
        this.pager = this.pagination.getPager(this.Count, this.page, this.numRecord);
        console.log("here is credit list", this.creditList);


      }, error: (err: any) => {
        this.toster.error("Something went wrong", "Error")
      }
    })
  }

  selectUser(ev: any) {
    this.crossIcon = false
    console.log("here is ev", ev.target.value);
    this.searchId = ev.target.value
    this.searchVal = ""
    if (this.searchId === "0") {
      this.getCreditReq(1, 10)
    }
  }

  statusVal: any = 0
  selectSatus(ev: any) {
    this.page= 1
    this.statusVal = ev.target.value
    this.getCreditReq(1, 10)
  }

  search() {
    this.page= 1
    this.crossIcon = true
    this.getCreditReq(1, 10)
  }

  searchId: any= 0
  crossIcon: boolean= false
  searchVal: any=''
  clear() {
    this.page= 1
    this.searchVal = ''
    this.searchId = 0
    this.crossIcon = false
    this.statusValFil = 0
    this.getCreditReq(1, 10)
  }

  // ============================================================================ update ========================================================
  statsuSub: boolean= false
autoDebVal: any= 0
statusValFil: any= 0
  radioChange(val: any) {
    
if (val > 0 && val < 2) {
this.autoDebVal= val
} else if (val > 1) {
  // this.statsuSub= true
  this.autoDebVal= val
}
  }

  statusChange(val: any) {
    this.statsuSub= true
if (val == 2){
this.statusVal= val
}else {
  this.statusVal= val
}
  }

  updateModal() {

    let data = {
      "Key": "",
      "CreditID": this.modalVal.oTrans.CreditID,
      "ApproveBy": this.loginId.Result,          //admin profileID
      "Amt":  this.modalVal.oTrans.Amount,
      "ValidTill": this.modalVal.oTrans.ValidTill,
      "AutoDebit": this.autoDebVal,           //0-Enable, 1-Disable
      "Status": this.statusVal           //        NONE=0,PENDING=1,CANCELLED=2,REJECTED=3,IN_PROCESS=4,SUCCESS=5,FREEZE=6,PARTIAL_PROCESS=7
    }
    this.api.updateCreditReq(data).subscribe({next: (res: any)=>{
      console.log("here is res from update", res);
      if (res.Result == true) {
        this.page= 1
        this.modalClose()
        this.getCreditReq(1, 10)
        this.toster.success(res.MSG_USER, "Success")
      } else {
        this.toster.error(res.MSG_USER, "Error")
      }
      

    }, error: (err: any) =>{
      this.toster.error("Somwting went wrong", "Error")
    }})

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
        this.pagedItems = this.creditList.slice(((this.pageRecord * page) - this.pageRecord + 1), this.pageRecord * page);
        //  this.getLedger(((this.pageRecord*page)-this.pageRecord+1), this.pageRecord*page)
        this.getCreditReq(((this.pageRecord * page) - this.pageRecord + 1), this.pageRecord * page,)
  
      }
    }

}
