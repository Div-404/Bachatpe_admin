import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, formatDate, Location } from '@angular/common';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../servies/api.service';
import { ToastrService } from 'ngx-toastr';
import { PaginationService } from '../../servies/pagination.service';
import { SharedService } from '../../servies/shared/shared.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';


@Component({
  selector: 'app-credit-deposit',
  standalone: true,
  imports: [NgbDropdownModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './credit-deposit.component.html',
  styleUrl: './credit-deposit.component.scss'
})
export class CreditDepositComponent implements OnInit {
  libuysellTab: any = "tab1"

  Count: any = 0
  First: any
  Last: any
  Phone: any
  Code: any
  userId: any
  adminProfile: any
  depositList: any
  depositForm: any = FormGroup
  private dashboardRoute: string = '/user-list';
  previousUrl: any
  today: any

  libuysell(tab: any) {
    this.libuysellTab = tab
  }
  constructor(private modalService: NgbModal, private api: ApiService, private toster: ToastrService, private pagination: PaginationService,
    private datePipe: DatePipe, private fb: FormBuilder, private shared: SharedService, private cdr: ChangeDetectorRef, private DatePipe: DatePipe,
    private location: Location
  ) { }
  openLg(content: any) {
    this.getUserBalance()
    this.depositForm.reset()
    this.autoDebit= 2
    // this.depositForm.patchValue({
    //   Auto_Debit: 2
    // })
    
    this.modalService.open(content, { size: 'md modalone', centered: true, windowClass: 'flip-modal' });
  }

  openLg2(content2: any) {
    this.modalService.open(content2, { size: 'md modalone', centered: true, windowClass: 'flip-modal' });
  }

  openLg3(content3: any) {
    this.modalService.open(content3, { size: 'md modalone', centered: true, windowClass: 'flip-modal' });
  }

  ngOnInit(): void {
    const now = new Date();
  this.today = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    this.shared.setSidebrActiveClass('creditDw/credit-deposit')

    this.userId = localStorage.getItem('Profile')
    this.adminProfile = sessionStorage.getItem('agentID')

    this.First = localStorage.getItem('First')
    this.Last = localStorage.getItem('Last')
    this.Phone = localStorage.getItem('Phone')
    this.Code = localStorage.getItem('Code')
    this.userId = localStorage.getItem('Profile')

    this.depositForm = this.fb.group({
      Key: [''],
      UserID: [''],
      Amount: ['', Validators.required],
      Remarks: [''],
      ValidTill: ['', Validators.required],
      AgentID: [''],  //exec id
      Auto_Debit: ['2']   //     
    })

    this.dateChange()
    this.getCreditDeposit(1, 10)
  }

  goBack() {
    if (this.previousUrl !== this.dashboardRoute) {
      this.location.back();
    } else {
      console.log('Cannot go back from the dashboard route');
    }
  }

  closeMd() {
    this.modalService.dismissAll()
  }

  getCreditDeposit(Initial: any, MaxCount: any) {
    this.Count = 0
    let data = {
      "Field1": this.adminProfile,   //Agent (in case)
      "Field2": Initial,   //Initial
      "Field3": MaxCount,   //MaxCount
      "Field4": 2,  //Bal_Cre //1-Balance 2-Credit
      "Field5": (this.lastDaysDate) + " " + '00:00:01',    //dtFrom
      "Field6": (this.updatedDate) + " " + '23:59:59',
    }
    this.shared.loader(true)
    this.api.getBalanceDw(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        this.depositList = res.lstTrans
        this.Count = res.Count
        this.pager = this.pagination.getPager(this.Count, this.page, this.numRecord);
      }, error: (err: any) => {
        this.toster.error("Someting went wrong", "Error")
      }
    })
  }

    // ============================================================= for balance ===========================================

  balance: any
  currency: any
  getUserBalance(): void {
    const profileId = 1000; // Replace this with the dynamic profile ID if available
    const tag = 'credit';
    let obj = {
      profileId: this.userId,
      balance: 'CREDIT'
    }
    this.api.GET_USER_ACCOUNT_BY_TAG(obj).subscribe({
      next: (data: any) => {
        if (data) {
          this.balance = data.Balance;
          this.currency = data.Currency;
        }
        // else {
        //   this.errorMessage = 'Unable to fetch balance data.';
        // }
      }, error: (err: any) => {
        this.toster.error("Someting went wrong", "Error")
      }
    })
  }

  // ============================================================== make deposit ===========================================================

  makeDeposit() {
    // let data= {
    //     "UserID": 1028,
    // "BankID": this.depositForm.value.BankID,
    // "Amount": this.depositForm.value.Amount,
    // "Currency": "INR",   //fixed
    // "UTR":"fsdfdsf",
    // "Receipt":"https://onetwo.com",
    // "Remarks":"sdf",
    // "Agent":100,   //exec id
    // "Source":1
    // }
    let data = this.depositForm.value
    data.UserID = Number(this.userId)
    data.AgentID = Number(this.adminProfile)
    data.Amount = Number(this.depositForm.value.Amount)
    data.Auto_Debit = Number(this.depositForm.value.Auto_Debit) || this.autoDebit
    // data.UserID= this.userId
    // data.AgentID= this.adminProfile
    data.Key = ''

    if (data.Remarks == null){
      data.Remarks= ''
    }

    if (Number(data.Amount) < 1) {
      this.toster.error("Amount must be greater then 0")
      return;
    }

    this.api.makeCreditDeposit(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        if (res.Result == true) {
          this.closeMd()
          this.page= 1
          this.getCreditDeposit(1, 10)
          this.toster.success("Credit transaction completed successfully", "Success")
        } else {
          this.toster.error("Please check transaction limit", "Error")
        }
      }, error: (err: any) => {
        this.toster.error("Something went wrong", "Error")
      }
    })
  }

  autoDebit: any = 2
  selectDebit(ev: any) {
    if (ev.target.checked) {
      this.autoDebit = 1
      this.depositForm.patchValue({
        Auto_Debit: this.autoDebit
      })
    } else {
      this.autoDebit = 2
      this.depositForm.patchValue({
        Auto_Debit: this.autoDebit
      })
    }
  }

  Displaydate: any = ''
  selectValidTill(ev: any) {
    console.log('here is event', ev.target);

    const dateInput = ev.target.value; // format will be "yyyy-MM-dd"
    const date = new Date(dateInput);

    // Set a default time if needed
    // date.setHours(12, 0, 0); // 12:00:00

    // // Format to "yyyy-MM-dd HH:mm:ss"
    // let formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;

    this.depositForm.patchValue({
      ValidTill: formattedDate
    })

    this.Displaydate = formattedDate ? formattedDate.slice(0, 10) : '';

    console.log('Formatted date:', formattedDate);

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
      this.page = 1
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
    this.getCreditDeposit(1, 10)
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
      this.getCreditDeposit(1, 10)
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
    this.updatedDate = this.DatePipe.transform(date, 'yyyy-MM-dd');

    console.log("here is date", this.updatedDate);

  }

  numericMessage: boolean = false
  numberOnly(event: any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      this.numericMessage = true;
      return false;
    }
    this.numericMessage = false;
    return true;
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
      this.pagedItems = this.depositList.slice(((this.pageRecord * page) - this.pageRecord + 1), this.pageRecord * page);
      this.getCreditDeposit(((this.pageRecord * page) - this.pageRecord + 1), this.pageRecord * page,)

    }
  }
}
