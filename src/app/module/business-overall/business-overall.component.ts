import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../servies/api.service';
import { SharedService } from '../../servies/shared/shared.service';
import { ToastrService } from 'ngx-toastr';
import { PaginationService } from '../../servies/pagination.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-business-overall',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './business-overall.component.html',
  styleUrl: './business-overall.component.scss'
})
export class BusinessOverallComponent implements OnInit{

    userProfile: any = 0

  constructor(private api: ApiService, private shared: SharedService, private toster: ToastrService, 
    private pagination: PaginationService
  ) {}

  ngOnInit(): void {
    this.shared.setSidebrActiveClass('business-main/business-overall')
    this.getBusinessOvl(1, 10)
  }

    // =============================================================== overall api ===========================================================

  Count: any = 0
  overAllList: any = []
  getBusinessOvl(Initial: any, Maxcount: any) {
    this.Count = 0
    let data = {
      "Field1": this.userProfile,   //ProfileID
      "Field2": Initial,
      "Field3": Maxcount,

    }
    this.shared.loader(true)
    this.api.getBusinessOverall(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        this.overAllList = res.lstBusiness
        this.Count = res.Count
        this.pager = this.pagination.getPager(this.Count, this.page, this.numRecord);
        console.log("here is overall list?????????????????????????????", this.overAllList);

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

  crossIcon: boolean= false
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
      this.getBusinessOvl(1, 10)
    } else if (this.advType == 0 && type == 'tab2') {
      this.userProfile = '0'
      this.userType = '0'
      // this.getta()
    }

  }



  selectName: any = ''
  selectCode: any = ''
  selectPhone: any = ''
  selectedUser: any = []
  filterVal: any = 0
  advProfile: any = 0
  userType: any = 0
  onSelectUser(val: any, srType: any) {
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
    
      this.page = 1
      this.getBusinessOvl(1, 10)

  }

  searchId: any= 0
    clear() {
    // this.page = 1
    this.crossIcon = false
    // this.searchVal = ''
    this.searchId = 0
    this.advVal = ''
    this.advType = 0
    this.advProfile = 0
    this.userProfile = 0
    // this.ServiceId = 0
    this.getBusinessOvl(1, 10)
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
      this.pagedItems = this.overAllList.slice(((this.pageRecord * page) - this.pageRecord + 1), this.pageRecord * page);
      //  this.getLedger(((this.pageRecord*page)-this.pageRecord+1), this.pageRecord*page)
      this.getBusinessOvl(((this.pageRecord * page) - this.pageRecord + 1), this.pageRecord * page,)

    }
  }


}
