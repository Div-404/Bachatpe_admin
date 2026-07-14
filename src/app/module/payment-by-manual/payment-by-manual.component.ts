import { Component, OnInit, TemplateRef, ElementRef, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';

import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule, DatePipe, formatDate } from '@angular/common';
import { ApiService } from '../../servies/api.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../servies/shared/shared.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { environment } from '../../../environments/environment';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgModule } from '@angular/core';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import jsPDF from 'jspdf';
// import 'jspdf-autotable';
import { ngxCsv } from 'ngx-csv/ngx-csv';
import { HttpClient } from '@angular/common/http';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { PaginationService } from '../../servies/pagination.service';
// import { success } from '../../../../node_modulesss/log-symbols';
import { info } from 'console';
interface StatusLookup {
  [key: number]: string;
}
@Component({
  selector: 'app-payment-by-manual',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, NgSelectModule, NgbDropdownModule, NgbTooltipModule],
  templateUrl: './payment-by-manual.component.html',
  styleUrl: './payment-by-manual.component.scss'
})
export class PaymentByManualComponent implements OnInit, AfterViewInit {
  @ViewChild('chatBoxBody', { static: false }) chatBoxBody!: ElementRef;
  manRecList: any
  status: any = Number;
  dropval1: any = 0
  searchVal: any = ""
  crossIcon: boolean = false
  dropSec: boolean = false
  byManualAdminForm: any = FormGroup
  chatForm: any = FormGroup;
  statusUpdateForm: any = FormGroup
  statusFilter: any = 0
  payId: any
  statusReference: any
  constructor(private api: ApiService, private toster: ToastrService, private shared: SharedService, private formBuilder: FormBuilder,
    private datePipe: DatePipe, private modalService: NgbModal, private cdr: ChangeDetectorRef, private pagination: PaginationService
  ) {
    this.shared.setSidebrActiveClass('balance-container/payment-by-manual');

    // Optional: You can subscribe to activeClass$ if needed
    this.shared.activeClass$.subscribe((activeClass: string) => {
      console.log('Current active class in ServicesComponent:', activeClass);
    });
  }

  ngOnInit(): void {
    this.byManualAdminForm = this.formBuilder.group({

      dtFrom: ['', Validators.required],
      dtTo: ['', Validators.required],

    });
    this.chatForm = this.formBuilder.group({
      message: ['', Validators.required],
      showAdmin: [0]
    })
    this.statusUpdateForm = this.formBuilder.group({
      PayID: [this.payId],
      Amount: ['', Validators.required],
      Reference: [this.statusReference],
      Waive_Fee: [0], // Default to 0 (Disabled)
      Status: [0, Validators.required]
    })
    // this.dateChange()
    // this.getManRec()
    this.showDateRange(1)
  }
  ngAfterViewChecked() {
    this.scrollToBottom();
    this.cdr.detectChanges()
  }
  ngAfterViewInit() {
    this.scrollToBottom();
  }
  selctDrop1(ev: any) {
    console.log("here is ev", ev.target.value);

    this.dropval1 = ev.target.value
    if (this.dropval1 == 6) {
      this.dropSec = true
    } else if (this.dropval1 != 6) {
      this.dropSec = false
    }

  }

  selctDrop2(ev: any) {
    console.log("here is ev", ev.target.value);
    this.searchVal = ev.target.value
  }

  // ====================================================== get manual reciept ==================================================

  updatedDate: any
  getManRec() {
    let data = {
      oType: this.dropval1,                    //        NONE=0,NAME=1,EMAIL=2,RESERVE1(AgentID)=5,RESERVE2(Source)=6,PHONE=7
      Value: this.searchVal,
      Initial: 0,
      MaxCount: 100,
      dtFrom: this.lastDaysDate + " " + "00:00:01",
      dtTo: this.updatedDate + " " + "23:59:59"
    }
    if (this.searchVal != "") {
      this.crossIcon = true
    }
    this.shared.loader(true)
    this.api.getManualTranRec(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        this.manRecList = res.oTrans
        console.log("here is manual reaciept", this.manRecList);

      }, error: (err: any) => {
        this.shared.loader(false)
        this.toster.error("Soemthing went wrong", "Error")
      }
    })
  }



  clear() {
    this.searchVal = ""
    this.dropval1 = 0
    this.crossIcon = false
    this.getManRec()
  }

  // ============================================================= date filter ========================================================

  dateFrom: any = ''
  dateTo: any = ''
  dateSelectFromTO(ev: any, val: any) {
    if (val == 'from') {
      this.dateFrom = ev.target.value
      this.lastDaysDate = ev.target.value
    } else if (val == 'to') {
      this.dateTo = ev.target.value
      this.updatedDate = ev.target.value
    }
  }

  dateCustom() {
    // this.page= 1
    this.customDate = ''
    //  this.lastDaysDate= this.lastDaysDate + " " + "00:00:01"
    this.lastDaysDate = this.lastDaysDate
    // this.updatedDate= this.updatedDate + " " + "23:59:59"
    this.updatedDate = this.updatedDate
    console.log("lastday date", this.lastDaysDate);
    console.log("update date", this.updatedDate);
    this.getManRec()
    // this.dateFrom= ""
    // this.dateTo= ""

  }


  transformDate() {
    const date = new Date();
    // this.updatedDate= this.datePipe.transform(date, 'yyyy-MM-dd HH:mm:ss');
    // this.updatedDate= this.datePipe.transform(date, 'yyyy-MM-dd 23:59:59');
    this.updatedDate = this.datePipe.transform(date, 'yyyy-MM-dd');

    console.log("here is date", this.updatedDate);

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


  updateManTran(ev: any, val: any) {

    console.log("here is ev: any", ev.target.value);

    let data = {
      Key: "",
      Field1: String(val.PayId),          //PayID
      Field2: String(ev.target.value)               //Status //            PENDING = 1,CANCELLED=2,REJECTED=3,IN_PROCESS=4,SUCCESS=5,FREEZE=6
    }

    Swal.fire({
      title: "Are you sure?",
      text: "You want to change status",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes!"
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.shared.loader(true)
        this.api.updateManTranRec(data).subscribe({
          next: (res: any) => {
            this.shared.loader(false)
            if (res.Result == true) {
              this.toster.success(res.MSG_USER, "Success")
              this.getManRec()
            }
            else {
              this.toster.error(res.MSG_USER, "Error")
            }
          }, error: (err: any) => {
            this.shared.loader(false)
            this.toster.error("Something went wrong", "Error")
          }
        })

      } else {
        this.getManRec()
      }
    })
  }

  activeClass: any = 0;
  oFilter: any = 1;
  showDateRange(event: any): void {
    this.page = 1
    const selectedOption = event;
    const today = new Date();
    let dtStart: string;
    let dtEnd: string = this.getCurrentDate(); // Get current date

    if (selectedOption === 1) { // Last 1 Week
      this.activeClass = 0;
      const oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(today.getDate() - 6); // Adjust to include today as the last day
      dtStart = this.formatDate(oneWeekAgo);
    }
    else if (selectedOption === 2) { // Last 1 month
      this.activeClass = 0;
      const oneMonthAgo = new Date(today);
      oneMonthAgo.setDate(today.getDate() - 29); // Adjust to include today as the last day
      dtStart = this.formatDate(oneMonthAgo);
    }
    else if (selectedOption === 3) { // Last 3 Months
      this.activeClass = 0;
      const threeMonthsAgo = new Date(today);
      threeMonthsAgo.setMonth(today.getMonth() - 3);
      threeMonthsAgo.setDate(today.getDate()); // Ensure the day is consistent
      dtStart = this.formatDate(threeMonthsAgo);
    }
    else if (selectedOption === 4) { // Last 1 year
      this.activeClass = 0;
      const oneYearAgo = new Date(today);
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      oneYearAgo.setDate(today.getDate()); // Ensure the day is consistent
      dtStart = this.formatDate(oneYearAgo);
    }
    else if (selectedOption === 5) { // Custom Date
      this.activeClass = 1;
      return;
    } else {
      return;
    }

    // Now you can set dtFrom and dtTo in your statementForm
    this.byManualAdminForm.patchValue({
      dtFrom: dtStart,
      dtTo: dtEnd
    });
    // this.page=1
    this.GET_PG_MG_ADM_MANUAL_RECPT(1, 10);
    // Call your API with the updated date range

  }

  search(){
    this.page= 1
      this.GET_PG_MG_ADM_MANUAL_RECPT(1, 10);
  }
  
  getCurrentDate(): string {
    const today = new Date();
    return this.formatDate(today);
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  searchValue: any
  selectedFilter: any = 0;
  count: any
  byManualData: any = []

  GET_PG_MG_ADM_MANUAL_RECPT(initialCount: any, maxCount: any) {
    this.Count = 0
    const dtFrom = this.byManualAdminForm.value.dtFrom + " 00:00:01";
    const dtTo = this.byManualAdminForm.value.dtTo + " 23:59:59";
    let obj = {

      "dtFrom": dtFrom,
      "dtTo": dtTo,
      "Value": this.searchValue,
      "oType": this.selectedFilter,               //Website=1,Email=2,UserId=3
      "Initial": initialCount,
      "MaxCount": maxCount,
      "Reserve1": this.statusFilter,
      "Reserve2": "1",

    }

    this.shared.loader(true);
    this.api.getManualTranRec(obj).subscribe((data: any) => {
      if (data.oTrans != '') {
        let allTransactions = data.oTrans;

        // Filter the transactions based on the selected status
        this.byManualData = allTransactions;
        this.Count = data.Count
        this.pager = this.pagination.getPager(this.Count, this.page, this.numRecord);
        this.sortLedgerData(() => {
          // Sorting completed, stop the loader
          this.shared.loader(false);
        });
        // this.pager = this.pagination.getPager(this.count, this.page, 10);
        // this.cdr.detectChanges()
        // this.showStatement=1;
        // this.cdr.detectChanges()
        this.shared.loader(false);
      }
      else if (data.oTrans == '') {
        this.byManualData = [];
        // this.showStatement=0;
        this.shared.loader(false);
      }
    })
  }
  // Filter transactions based on selected status
  filterTransactionsByStatus(transactions: any[]): any[] {
    if (this.statusFilter === 4) {
      // If status is 'Overall', return all transactions
      return transactions;
    } else {
      // Otherwise, filter by the selected status (Pending = 1, Approved = 2, Rejected = 3)
      return transactions.filter((transaction: any) => transaction.Status === this.statusFilter);
    }
  }
  sortLedgerData(callback: () => void) {
    // Ensure byManualData is defined and is an array
    if (Array.isArray(this.byManualData)) {
      // Sort the ledgerData array in descending order based on Timestamp
      this.byManualData.sort((a: any, b: any) => {
        return new Date(b.dtCreated).getTime() - new Date(a.dtCreated).getTime();
      });
    } else {
      console.error('byManualData is undefined or not an array.');
    }

    // Invoke the callback function to indicate sorting completion
    callback();
  }
  selectedSearchType: any
  onSearchTypeChange(event: any): void {
    this.searchValue = ''
    this.errorMessage = ''
    this.selectedSearchType = event
  }
  filteredUsers: any = []
  errorMessage: any = ''
  onSearchInput(event: any): void {
    const searchValue = event.target.value;

    if (searchValue.length >= 2) { // Trigger search after 2 characters
      const obj = {
        oType: this.selectedSearchType,
        Value: searchValue,
        Reserve1: "",
        Reserve2: 1, // Assuming source is Admin (1)
        Reserve3: "",
        Initial: 1,
        MaxCount: 100,
        dtFrom: '',
        dtTo: ''
      };

      this.api.GET_PROFILE_BY_FILTER(obj).subscribe((data: any) => {
        if (data) {
          this.filteredUsers = data; // Store the filtered users for dropdown display
          this.errorMessage = data.length > 0 ? '' : 'No users found.';
        }
      });
    } else {
      this.filteredUsers = []; // Clear the dropdown if less than 2 characters
      this.errorMessage = 'No users found.';
    }
  }

  // Event handler when a user selects an item from the dropdown
  selectedUsername: any
  selecteduserPhone: any
  selectedUserProfileID: any
  onUserSelect(user: any): void {
    console.log("useruseruser", user)
    this.selectedUsername = user.Name
    this.selecteduserPhone = user.Phone
    this.selectedUserProfileID = user.ProfileID;
    if (this.selectedFilter == 1) {
      this.searchValue = user.Name.split(' ')[0];
    }
    else if (this.selectedFilter == 2) {
      this.searchValue = user.Email;
    }
    else if (this.selectedFilter == 7) {
      this.searchValue = user.Phone;
    }
    else if (this.selectedFilter == 8) {
      this.searchValue = user.Code;
    }
    // Set the input to the selected user's name
    this.filteredUsers = []; // Hide the dropdown after selection
    // this.fetchUsersByProfileID(this.selectedUserProfileID);
    // this.typeFilter(this.selectedFilter)
  }
  searching: boolean = true
  Count: any = 0
  typeFilter(val: any): void {
    this.selectedFilter = val;
    this.page=1
    const dtFrom = this.byManualAdminForm.value.dtFrom + " 00:00:01";
    const dtTo = this.byManualAdminForm.value.dtTo + " 23:59:59";
    let obj = {
      "dtFrom": dtFrom,
      "dtTo": dtTo,
      "Value": this.searchValue,
      "oType": this.selectedFilter,               //Website=1,Email=2,UserId=3
      "Initial": 1,
      "MaxCount": 10,
      "Reserve1": this.statusFilter,
      "Reserve2": "1",
    }
    this.shared.loader(true);
    this.searching = false;
    this.api.getManualTranRec(obj).subscribe((data: any) => {
      this.Count = data.Count
      if (data.Count > 0) {
        this.byManualData = data.oTrans;
        this.pager = this.pagination.getPager(this.Count, this.page, this.numRecord);
        this.sortLedgerData(() => {
          // Sorting completed, stop the loader
          this.shared.loader(false);
        });
        // this.cdr.detectChanges()
        // this.showStatement=1;

        this.shared.loader(false);
      }
      else {
        this.byManualData = [];
        // this.showStatement=0;
        this.shared.loader(false);
      }
    })
  }
  clearSearch() {
    this.searching = true;
    this.searchValue = ''
    this.selectedFilter = 0;
    // this.oFilter=1;
    // this.statusFilter=4
    this.GET_PG_MG_ADM_MANUAL_RECPT(1, 10);

  }
  onStatusChange(event: any) {
    this.page = 1
    this.statusFilter = event;  // Get the selected status value
    this.GET_PG_MG_ADM_MANUAL_RECPT(1, 10);  // Trigger the API call
  }
 
  openLg2(content2: any) {
    this.modalService.open(content2, { size: 'lg modalone', centered: true, windowClass: 'flip-modal' });
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
      Waive_Fee: 0 // Patch Waive_Fee to 0 when closing the modal
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
    // this.cdr.detectChanges()
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
        this.chatForm.reset()
        this.cdr.detectChanges()
        this.GET_USERREMARKS(this.remarksID)
      }
      else {
        this.toster.error("Message could not be sent. Please try again.")
      }
    })
  }
  modRef: any
  profileID: any
  agentID: any
  openLg3(content3: any, val: any) {
    this.modRef = this.modalService.open(content3, { size: 'md modalone', centered: true, windowClass: 'flip-modal' });
    this.payId = val.PayId
    this.statusReference = val.Reference
    this.statusUpdateForm.patchValue({
      Reference: this.statusReference,
      PayID: this.payId
    })
    this.profileID = val.UserID
    this.agentID = sessionStorage.getItem('agentID')
  }
  closeModal() {
    this.modRef.close()
    this.statusUpdateForm.reset();
    this.statusUpdateForm.patchValue({
      Waive_Fee: 0 // Patch Waive_Fee to 0 when closing the modal
    });
  }
  getStatusText(status: number): string {
    switch (status) {
      case 1:
        return 'Pending';
      case 5:
        return 'Success';
      case 3:
        return 'Reject';
      default:
        return '';
    }
  }
  onKeyPress(event: any) {
    // Get the current input value
    const input = event.target as HTMLInputElement;
    const inputValue = input.value;
    const key = event.key;

    // Define a regex pattern to match the whole input
    const regex = /^[0-9]+(\.[0-9]{0,2})?$/;

    // Test if the input matches the pattern
    if (!regex.test(inputValue + key)) {
      event.preventDefault(); // Prevent the keypress if it doesn't match the regex
    }
  }
  onCheckboxChange(event: any) {
    const checked = event.target.checked;
    console.log("Checked:", checked);
    this.statusUpdateForm.patchValue({
      Waive_Fee: checked ? 1 : 0
    });
    // Optional: You can add any additional logic here if needed
    // The form control will still be managed by Angular automatically.
  }
  UPDATE_TRANS_MANUAL_TRANS_RECEIPT() {
    let obj = {
      "Key": "",
      "PayID": this.payId,
      "Amount": this.statusUpdateForm.value.Amount,            //            
      "Reference": this.statusReference,
      "Waive_Fee": this.statusUpdateForm.value.Waive_Fee,               //Enable=1,Disable=0       
      //"Field5":"",
      "Status": this.statusUpdateForm.value.Status,
      "Profile": this.profileID,
      "AgentID": this.agentID
    }
    this.shared.loader(true)
    this.api.UPDATE_TRANS_MANUAL_TRANS_RECEIPT(obj).subscribe((data: any) => {
      if (data.Result == true) {
        this.shared.loader(false)
        this.toster.success("Status Updated successfully.")
        this.GET_PG_MG_ADM_MANUAL_RECPT(1, 10)
        this.statusUpdateForm.reset()
        this.closeModal()
      }
      else {
        this.toster.error("Something went wrong. Please try again.")
        this.shared.loader(false)
        this.statusUpdateForm.reset()
        this.closeModal()
        this.GET_PG_MG_ADM_MANUAL_RECPT(1, 10)
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
    this.toster.success('Reference copied successfully.', "Success");
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
      this.pagedItems = this.byManualData.slice(((this.pageRecord * page) - this.pageRecord + 1), this.pageRecord * page);
      //  this.getLedger(((this.pageRecord*page)-this.pageRecord+1), this.pageRecord*page)
      this.GET_PG_MG_ADM_MANUAL_RECPT(((this.pageRecord * page) - this.pageRecord + 1), this.pageRecord * page,)

    }
  }

}
