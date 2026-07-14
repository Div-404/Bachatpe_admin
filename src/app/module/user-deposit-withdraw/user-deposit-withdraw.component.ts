import { ChangeDetectorRef, Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule, DatePipe, formatDate, Location } from '@angular/common';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../servies/api.service';
import { subscribe } from 'diagnostics_channel';
import { ToastrService } from 'ngx-toastr';
import { PaginationService } from '../../servies/pagination.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedService } from '../../servies/shared/shared.service';
@Component({
  selector: 'app-user-deposit-withdraw',
  standalone: true,
  imports: [NgbDropdownModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './user-deposit-withdraw.component.html',
  styleUrl: './user-deposit-withdraw.component.scss'
})
export class UserDepositWithdrawComponent implements OnInit {

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('chatBoxBody', { static: false }) chatBoxBody!: ElementRef;

  libuysellTab: any = "tab1"
  dwList: any = []
  Count: any = 0
  First: any
  Last: any
  Phone: any
  Code: any
  userId: any
  chatForm: any = FormGroup;
  private dashboardRoute: string = '/user-list';
  previousUrl: any

  depositForm: any = FormGroup

  adminProfile: any

  libuysell(tab: any) {
    this.libuysellTab = tab
  }
  constructor(private modalService: NgbModal, private api: ApiService, private toster: ToastrService, private pagination: PaginationService,
    private datePipe: DatePipe, private fb: FormBuilder, private shared: SharedService, private cdr: ChangeDetectorRef, private location: Location
  ) { }
  openLg(content: any) {
    this.getBank()
    this.getUserBalance()
    this.depositForm.reset()
    this.depositForm.patchValue({
      BankID: "",
      UTR: '',
      Source: 1,
      Remarks: ''
    })
    this.imageVal = ''
    this.modalService.open(content, { size: 'md modalone', centered: true, windowClass: 'flip-modal' });
  }

  openLg2(content2: any) {
    this.modalService.open(content2, { size: 'md modalone', centered: true, windowClass: 'flip-modal' });
  }

  openLg3(content3: any) {
    this.modalService.open(content3, { size: 'md modalone', centered: true, windowClass: 'flip-modal' });
  }

  closeMd() {
    this.modalService.dismissAll()
  }


  ngOnInit(): void {
    this.adminProfile = sessionStorage.getItem('agentID')
    this.First = localStorage.getItem('First')
    this.Last = localStorage.getItem('Last')
    this.Phone = localStorage.getItem('Phone')
    this.Code = localStorage.getItem('Code')
    this.userId = localStorage.getItem('Profile')

    this.depositForm = this.fb.group({
      UserID: [''],
      BankID: ['', Validators.required],
      Amount: ['', Validators.required],
      Currency: [''],   //fixed
      UTR: ['', Validators.required],
      Receipt: ['', Validators.required],
      Remarks: ['', Validators.required],
      Agent: [''],  //exec id
      Source: ['']   //     
    })

    this.chatForm = this.fb.group({
      message: ['', Validators.required],
      showAdmin: [0]
    })

    this.dateChange()
    this.getDw(1, 10)
    this.shared.setSidebrActiveClass('dwmain/balance')
  }

  goBack() {
    if (this.previousUrl !== this.dashboardRoute) {
      this.location.back();
    } else {
      console.log('Cannot go back from the dashboard route');
    }
  }

    ngAfterViewChecked() {
    this.scrollToBottom();
    this.cdr.detectChanges()
  }
  ngAfterViewInit() {
    this.scrollToBottom();
  }

  getDw(Initial: any, MaxCount: any) {
    this.Count = 0
    let data = {
      "Field1": this.adminProfile,   //Agent (in case)
      "Field2": Initial,   //Initial
      "Field3": MaxCount,   //MaxCount
      "Field4": 1,  //Bal_Cre //1-Balance 2-Credit
      "Field5": (this.lastDaysDate) + " " + '00:00:01',    //dtFrom
      "Field6": (this.updatedDate) + " " + '23:59:59',
    }
    this.shared.loader(true)
    this.api.getBalanceDw(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        this.dwList = res.lstTrans
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
    const tag = 'balance';
    let obj = {
      profileId: this.userId,
      balance: 'BALANCE'
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

  // ============================================================= get bank list ===========================================

  bankList: any
  getBank() {
    // this.shared.loader(true)
    this.api.getTranBank().subscribe({
      next: (res: any) => {
        // this.shared.loader(false)
        this.bankList = res
        console.log("here is res from bank list", this.bankList);
        // this.showStatement = 1
      }, error: (err: any) => {
        this.shared.loader(false)
        // this.showStatement = 0
        this.toster.error("Something went wrong", "Error")
      }
    })
  }


  bankId: any
  selectBank(ev: any) {
    this.bankId = ev.target.value
    this.depositForm.patchValue({
      BankID: this.bankId
    })
    console.log("here is bank id", this.bankId);

  }

  sourceId: any
  selectSource(ev: any) {
    this.sourceId = ev.target.value
    this.depositForm.patchValue({
      Source: this.sourceId
    })
    console.log("here is bank id", this.sourceId);
  }

  reasonVal: any
  selectReason(ev: any) {
    this.reasonVal = ev.target.value
    this.depositForm.patchValue({
      Remarks: this.reasonVal
    })
    console.log("here is bank id", this.sourceId);
  }

  // ============================================================= make deposit =============================================

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
    data.Currency = "INR"
    data.UserID = this.userId
    data.Agent = this.adminProfile
    data.Source = 1

    if (Number(data.Amount) < 1) {
      this.toster.error("Amount must be greater then 0")
      return;
    }

    this.api.makeBalanceDw(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        if (res.Result == true) {
          this.closeMd()
          this.page= 1
          this.getDw(1, 10)
          this.toster.success("Balance deposited successfully.", "Success")
        } else {
          this.toster.error("Please check transaction limit", "Error")
        }
      }
    })
  }


  // =================================================== upload image =========================================================

  imageVal: any = ''
  bannerImage: any = ''
  onFileSelected(ev: any) {

    const fileInput = ev.target;

    this.imageVal = fileInput.files[0].name

    if (fileInput.files && fileInput.files[0]) {
      const file: File = fileInput.files[0];
      const reader = new FileReader();

      reader.readAsDataURL(file);
      reader.onload = () => {
        const data = {
          "base64Image": reader.result,
          "AppName": "digisuite"
        };

        this.shared.loader(true)
        this.api.uploadImg(data).subscribe({
          next: (res: any) => {
            this.shared.loader(false)
            this.depositForm.patchValue({
              Receipt: res.url
            })
            this.bannerImage = res.url
            this.toster.success("Image uploaded successfully", "Success");
            // this.kyacStage = this.kyacStage + 1

            this.fileInput.nativeElement.value = '';// Reset the file input field after upload
          },
          error: (err: any) => {
            this.shared.loader(false)
            this.toster.error("Something went wrong", "Error");
          }
        });
      };
    }
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
    this.getDw(1, 10)
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
      this.getDw(1, 10)
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

  // ================================================================ chat part ==============================================================

  formatTimestamp(timestamp: string): string {
    // return this.timestampDisplayService.convertServerTimeToLocal(timestamp);
    return timestamp;
  }

  showChat: boolean = false;
  chatID: any;
  referenceID: any;
  remarksID: any = 0;
  chatAdmin(val: any) {
    this.showChat = true;
    // this.cdr.detectChanges()
    console.log("valvalvalchat", val)
    this.referenceID = val.Reference;
    // this.cdr.detectChanges()
    this.remarksID = val.RemarkID
    // this.cdr.detectChanges()
    this.GET_USERREMARKS(val.RemarkID);

  }

  closeChat() {
    this.showChat = false;
    // this.cdr.detectChanges()
    this.chatForm.reset();

    this.chatForm.patchValue({
      showAdmin: 0
    });
    this.chatHistory = []
    // this.cdr.detectChanges()
  }
  chatHistory: any = []
  isLoadingMessages: boolean = false;
  GET_USERREMARKS(val: any) {
    this.isLoadingMessages = true;
    let obj = {

      "Key": "",
      "RemarkID": val,
      "Admin_Client": 0


    }

    this.api.GET_USERREMARKS(obj).subscribe((data: any) => {
      console.log("message data", data)
      if (data.lstMesaage != '') {
        this.isLoadingMessages = false;
        this.chatHistory = data.lstMesaage
        this.cdr.detectChanges()
        this.scrollToBottom()

      }
      else {
        this.isLoadingMessages = false;
        this.chatHistory = [];
        // this.cdr.detectChanges()

      }
      ((error: any) => {
        this.isLoadingMessages = false; // Set loading state to false if there's an error
        console.error('Error fetching user remarks:', error);
      });
    })
  }
  scrollToBottom(): void {
    if (this.chatBoxBody) {
      try {
        this.chatBoxBody.nativeElement.scrollTop = this.chatBoxBody.nativeElement.scrollHeight;
      } catch (err) {
        console.error('Scroll to bottom error:', err);
      }
    } else {
      console.warn('chatBoxBody is not yet defined');
    }
    this.cdr.detectChanges()
  }
  ADD_USER_REMARKS() {
    let obj = {
      "RemarkID": this.remarksID,
      "Message": this.chatForm.value.message,
      "Attachment": "",
      "CreatedBy": 0,         //      USER = 1,ADMIN = 0
      "ReadFlag": this.chatForm.value.showAdmin,
    }
    this.api.ADD_USERREMARKS(obj).subscribe((data: any) => {
      if (data.Result == true) {
        console.log("remarks", data)
        this.chatForm.patchValue({
          message: '',
          showAdmin: 0
        })
        // this.chatForm.reset()
        this.cdr.detectChanges()
        this.GET_USERREMARKS(this.remarksID)
      }
      else {
        this.toster.error("Message could not be sent. Please try again.")
      }
    })
  }

  onCheckboxChange2(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.chatForm.patchValue({
      showAdmin: isChecked ? 1 : 0
    })
  }
  imgPreview: any;
  modref1: any
  previewImg(uploadimagepreview: TemplateRef<any>, val: any) {
    this.modref1 = this.modalService.open(uploadimagepreview, { centered: true });
    this.imgPreview = val.Receipt;
  }
  closeImagePreview() {
    this.modref1.close()
  }
  copyDetails(val: any) {
    let detailsText = val;



    const dummyInput = document.createElement('textarea');
    dummyInput.style.position = 'absolute';
    dummyInput.style.left = '-9999px';
    document.body.appendChild(dummyInput);
    dummyInput.value = detailsText;
    dummyInput.select();
    document.execCommand('copy');
    document.body.removeChild(dummyInput);
    this.toster.success('Success', 'Reference no. copied.');
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

  blockSpecialChars(event: KeyboardEvent) {
    const regex = /^[a-zA-Z0-9]*$/;
    const key = String.fromCharCode(event.keyCode || event.which);
    if (!regex.test(key)) {
      event.preventDefault();
    }
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
      this.pagedItems = this.dwList.slice(((this.pageRecord * page) - this.pageRecord + 1), this.pageRecord * page);
      this.getDw(((this.pageRecord * page) - this.pageRecord + 1), this.pageRecord * page,)

    }
  }

  ngOnDestroy(): void {
    // Remove the item from localStorage
    // localStorage.removeItem('Profile')
    // localStorage.removeItem('First');
    // localStorage.removeItem('Last');
    // localStorage.removeItem('Code');
    // localStorage.removeItem('Phone');
    console.log('Item removed from localStorage');
  }

}
