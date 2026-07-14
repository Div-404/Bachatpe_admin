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

@Component({
  selector: 'app-aeps-transaction',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule,NgSelectModule,NgbDropdownModule,NgbTooltipModule],
  templateUrl: './aeps-transaction.component.html',
  styleUrl: './aeps-transaction.component.scss'
})
export class AepsTransactionComponent {
  items = Array(8).fill(0);
  transactionData:any=[]
  showStatement:any=0
  activeClass:any=0
  transactionForm:any=FormGroup
  depositTransactionForm:any=FormGroup
  selectedFilterType:any=0; 
  oFilter:any=1;
  executiveList: any[] = [];
    bankList: any[] = [];
    userList: any[] = [];
    selectedExecutive: any; // To store selected executive
    selectedBank: any; // To store selected bank
    selectedUser: any; // To store selected user
    lastFilteredValue: any;
    selectedSearchType: number = 0; // For By Name, Email, Phone, Code
    searchValue: string = '';
  constructor(private api: ApiService, private toster: ToastrService, private shared: SharedService, private formBuilder:FormBuilder,
    private datePipe: DatePipe,private modalService: NgbModal, private cdr:ChangeDetectorRef, private pagination: PaginationService
  ) { }

  ngOnInit(): void {
   
    this.transactionForm = this.formBuilder.group({

      dtFrom: ['', Validators.required],
      dtTo: ['', Validators.required],

    });
   
      this.showDateRange(1)
    
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
  showDateRange(event: any): void {
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
    this.transactionForm.patchValue({
      dtFrom: dtStart,
      dtTo: dtEnd
    });
    // this.page=1
    this.callTransactionApi(this.selectedFilterType);
    // Call your API with the updated date range
  
  }
  getInitials(name: string): string {
    const names = name.split(' ');
    const initials = names.map(n => n.charAt(0).toUpperCase()).join('');
    return initials;
}
 
onFilterChange(event: Event): void {
  this.selectedBank= ''
  this.selectedExecutive= ''
  const target = event.target as HTMLSelectElement; // Ensure the target is an HTML element
  this.selectedFilterType = +target.value; // Cast target to HTMLSelectElement to access value safely

  switch (this.selectedFilterType) {
    case 3: // Executive selected
      this.fetchExecutives();
      this.searchValue=''
      this.selectedSearchType=0
      this.selectedBankDetails = false
      break;
    case 1: // Bank selected
      this.fetchBanks();
      this.searchValue=''
      this.selectedSearchType=0
      this.selectedExecutiveDetails = false
      break;
    case 2: // User selected
      // this.fetchUsers(); // Assuming you have a method to fetch users
      this.selectedExecutiveDetails = false
      this.selectedBankDetails = false
      this.filteredUsers = []
      this.selectedUsername=''
  this.selecteduserPhone=''
      break;
    default:
      break;
  }
}


fetchExecutives(): void {
  let obj = {
    "ExecID": 0
  }
  this.api.GET_EXECUTIVE(obj).subscribe((data:any) => {
    if(data != ''){
      this.executiveList = data; // Store the executive list
    }
    else{
      this.executiveList=[]
    }
  });
}

fetchBanks(): void {
  this.api.getTranBank().subscribe((data:any) => {
    if(data != ''){
      this.bankList = data; // Store the bank list
    }
    else{
      this.bankList=[]
    }
  });
}

fetchUsers(): void {
  const dtFrom = this.transactionForm.get('dtFrom').value ? this.transactionForm.get('dtFrom').value + " 00:00:01" : '';
  const dtTo = this.transactionForm.get('dtTo').value ? this.transactionForm.get('dtTo').value + " 23:59:59" : '';
  
  let obj = {
    "oType": this.selectedSearchType, // Update to use selected search type
    "Value": this.searchValue, // Pass the text input value
    "Reserve1": "", // Status
    "Reserve2": 1, // Source (1- Admin, 2- Client)
    "Reserve3": "",
    "Initial": 1,
    "MaxCount": 10,
    "dtFrom": dtFrom,
    "dtTo": dtTo
  }
this.api.GET_PROFILE_BY_FILTER(obj).subscribe((data:any)=>{
console.log("user Data", data)
if (data ) {
  // Call the second API with the Profile ID
  this.GET_ADM_WAL_BAL_TRANS(1, data[0].ProfileID, 10);
}
})
}
maskAccountNumber(accountNumber: string): string {
  // Assuming the account number is in a valid format
  const maskedPart = accountNumber.slice(0, -4).replace(/\d/g, '*'); // Mask all but last 4 digits
  const lastFourDigits = accountNumber.slice(-4); // Get last 4 digits
  return `${maskedPart}${lastFourDigits}`; // Return masked account number
}

selectedExecutiveDetails: { name: string; email: string } | any = null; 
onExecutiveSelect(event: Event): void {
  const target = event.target as HTMLSelectElement;
  this.selectedExecutive = +target.value; // Store the selected executive ID
  console.log("Selected Executive ID:", this.selectedExecutive);

  // Update the last filtered value with the selected executive
  this.lastFilteredValue = this.selectedExecutive;

  // Find the selected executive details based on the selected ID
  const selectedExecutive = this.executiveList.find(executive => executive.ExecID === this.selectedExecutive);
  
  // Store the selected executive's name and email
  if (selectedExecutive) {
    this.selectedExecutiveDetails = {
      name: selectedExecutive.Name,
      email: selectedExecutive.Email
    };
  } else {
    this.selectedExecutiveDetails = null; // Reset if not found
  }
  
  // Call the API with the selected filter type
  this.callTransactionApi(this.selectedFilterType);
}

// Event handler when a bank is selected
selectedBankDetails: { bankName: string; accountNumber: string } | any = null;
// onBankSelect(event: Event): void {
//   const target = event.target as HTMLSelectElement;
//   this.selectedBank = target.value; // Store the selected bank ID
//   console.log("Selected Bank ID:", this.selectedBank);
  
//   // Update the last filtered value with the selected bank
//   this.lastFilteredValue = this.selectedBank;
  
//   // Call the API with the selected filter type
//   this.callTransactionApi(this.selectedFilterType);
// }
onBankSelect(event: Event): void {
  const target = event.target as HTMLSelectElement;
  this.selectedBank = +target.value; // Store the selected bank ID
  console.log("Selected Bank ID:", this.selectedBank);
  
  // Update the last filtered value with the selected bank
  this.lastFilteredValue = this.selectedBank;

  // Find the selected bank details based on the selected ID
  const selectedBank = this.bankList.find(bank => bank.BankInfo.BankID === this.selectedBank);
  
  // Store the selected bank's name and account number
  if (selectedBank) {
    this.selectedBankDetails = {
      bankName: selectedBank.BankInfo.Bank,
      accountNumber: selectedBank.BankInfo.Account_Number
    };
  } else {
    this.selectedBankDetails = null; // Reset if not found
  }
  
  // Call the API with the selected filter type
  this.callTransactionApi(this.selectedFilterType);
}

// Function to call the transaction API with the selected filter type
callTransactionApi(filterType: number): void {
  const maxCount = 10;
  let value: any = this.lastFilteredValue || null; // Use the stored filter value

  if (filterType == 1) { // Bank filter
    value = this.selectedBank;
  } else if (filterType == 3) { // Executive filter
    value = this.selectedExecutive;
  }
  else if (filterType == 2) { // Executive filter
    value = this.selectedUser;
  }

  console.log("Value being sent to GET_ADM_WAL_BAL_TRANS:", value); // Debug log
  this.GET_ADM_WAL_BAL_TRANS(1, value, maxCount);
}
Count: any= 0
GET_ADM_WAL_BAL_TRANS(initial: any, value: any, maxCount: any): void {
  // Make sure that date values are fetched from the form
  const dtFrom = this.transactionForm.get('dtFrom').value ? this.transactionForm.get('dtFrom').value + " 00:00:01" : '';
  const dtTo = this.transactionForm.get('dtTo').value ? this.transactionForm.get('dtTo').value + " 23:59:59" : '';
  
  console.log("API called with Value:", value);

  const obj = {
    oFilter: this.selectedFilterType, // Pass the selected filter type
    Value: value ? Number(value) : this.selectedBank || this.selectedExecutive || this.selectedUserProfileID, // Set to selected BankID, ExecID, or null
    Inital: initial,
    MaxCount: maxCount,
    dtFrom: dtFrom,
    dtTo: dtTo
  };

  this.shared.loader(true);
  this.api.GET_ADM_WAL_BAL_TRANS(obj).subscribe((data: any) => {
    console.log("Transaction Data:", data);
    this.shared.loader(false);
    this.Count= data.Count
    if (data.lstTrans && data.lstTrans.length > 0) {
      this.transactionData = data.lstTrans;
      this.pager = this.pagination.getPager(this.Count, this.pageRecord, this.numRecord);
      this.showStatement = 1;
    } else {
      this.transactionData = [];
      this.showStatement = 0;
    }
  });
}
resetFilters(){
  this.selectedBank = null;
  this.selectedExecutive = null;
  this.lastFilteredValue = null;
  this.selectedFilterType = 0;
  this.activeClass=0
  this.oFilter=1
  this.searchValue=''
  this.selectedSearchType=0
  this.selectedExecutiveDetails=null
  this.selectedBankDetails=null
  this.showDateRange(1)
}
onSearchTypeChange(event: any): void {
  this.searchValue= ''
  this.filteredUsers= []
  this.selectedSearchType = event.target.value;
}
filteredUsers: any[] = [];
selectedUserProfileID: any;

// Event handler for the search input to fetch matching users as the user types
errorMessage:any
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
      MaxCount: 10,
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
selectedUsername:any
selecteduserPhone:any
onUserSelect(user: any): void {
  console.log("useruseruser",user)
  this.selectedUsername=user.Name
  this.selecteduserPhone=user.Phone
  this.selectedUserProfileID = user.ProfileID;
  if(this.selectedSearchType == 1){
    this.searchValue = user.Name;
  }
  else if(this.selectedSearchType == 2){
    this.searchValue = user.Email;
  }
  else if(this.selectedSearchType == 7){
    this.searchValue = user.Phone;
  }
  else if(this.selectedSearchType == 8){
    this.searchValue = user.Code;
  }
  // Set the input to the selected user's name
  this.filteredUsers = []; // Hide the dropdown after selection
  this.fetchUsersByProfileID(this.selectedUserProfileID);
}

// Method to fetch user details based on the selected Profile ID
fetchUsersByProfileID(profileID: number): void {
  const dtFrom = this.transactionForm.get('dtFrom').value ? this.transactionForm.get('dtFrom').value + " 00:00:01" : '';
  const dtTo = this.transactionForm.get('dtTo').value ? this.transactionForm.get('dtTo').value + " 23:59:59" : '';

  let obj = {
    oFilter: this.selectedFilterType,
    Value: profileID,
    Inital: 1,
    MaxCount: 10,
    dtFrom: dtFrom,
    dtTo: dtTo
  };

  this.shared.loader(true);
  this.api.GET_ADM_WAL_BAL_TRANS(obj).subscribe((data: any) => {
    this.shared.loader(false);
    if (data.lstTrans && data.lstTrans.length > 0) {
      this.transactionData = data.lstTrans;
      this.showStatement = 1;
    } else {
      this.transactionData = [];
      this.showStatement = 0;
    }
  });
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
      this.pagedItems = this.transactionData.slice(((this.pageRecord * page) - this.pageRecord + 1), this.pageRecord * page);
      //  this.getLedger(((this.pageRecord*page)-this.pageRecord+1), this.pageRecord*page)
      this.GET_ADM_WAL_BAL_TRANS(((this.pageRecord * page) - this.pageRecord + 1),0, this.pageRecord * page,)

    }
  }
}
