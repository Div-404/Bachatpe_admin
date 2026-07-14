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
  selector: 'app-credit-transaction',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule, NgbDropdownModule, NgbTooltipModule],
  templateUrl: './credit-transaction.component.html',
  styleUrl: './credit-transaction.component.scss'
})
export class CreditTransactionComponent {
  depositForm: any = FormGroup;
  transferForm: any = FormGroup;
  transactionForm: any = FormGroup;
  depRef: any;
  tranRef: any;
  searchValue: string = '';
  selectedSearchType: number = 0;
  filteredUsers: any[] = [];
  selectedUserProfileID: any;
  selectedUsername: any;
  selecteduserPhone: any;
  creditTransData: any = []
  activeClass: any = 0;
  oFilter: any = 1
  selectedFilterType: any = 0
  searchVal: any = ''
  showStatement: any = 0
  constructor(
    private router: Router,
    private api: ApiService,
    private toster: ToastrService,
    private shared: SharedService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private pagination: PaginationService

  ) {


  }

  ngOnInit(): void {
    this.shared.setSidebrActiveClass('credit-container')
    this.initializeForms();
    this.showDateRange(1)
  }

  initializeForms(): void {
    this.depositForm = this.formBuilder.group({
      amount: ['', Validators.required],
      remarks: ['', Validators.required],
    });

    this.transferForm = this.formBuilder.group({
      amount: ['', Validators.required],
      remarks: ['', Validators.required],
      autoDebit: [false], // Binding for Auto Debit checkbox
      searchType: [0, Validators.required],

    });
    this.transactionForm = this.formBuilder.group({

      dtFrom: ['', Validators.required],
      dtTo: ['', Validators.required],

    });
  }

  openDeposit(content: any) {
    this.depRef = this.modalService.open(content, { size: 'md modalone', centered: true, windowClass: 'flip-modal' });
  }

  openTransfer(content2: any) {
    this.transferForm.reset()
    this.searchValue = ''
    this.errorMessage = ''
    this.balance = 0.0
    this.transferForm.patchValue({
      searchType: 0
    })
    this.tranRef = this.modalService.open(content2, { size: 'md modalone', centered: true, windowClass: 'flip-modal' });
  }

  closeDeposit() {
    this.depRef.close();
    this.resetDepositForm();
  }

  closeTransfer() {
    this.page = 1
    this.tranRef.close();
    this.selectedUserProfileID = ''
    this.selectedSearchType = 0
    this.resetTransferForm();
  }

  resetDepositForm() {
    if (this.depositForm) {
      this.depositForm.reset(); // Resets all fields in the deposit form to their default values
    }
  }

  // Method to reset the transfer form
  resetTransferForm() {
    if (this.transferForm) {
      this.transferForm.reset(); // Resets all fields in the transfer form to their default values
    }

    // Additional reset for specific variables, if necessary
    this.selectedSearchType = 0; // Reset the search type selection
    this.searchValue = ''; // Reset the search input value
    this.filteredUsers = []; // Clear the filtered user list
  }
  MAKE_CREDIT_TRANS_DEPT() {
    const formData = this.depositForm.value;
    let obj = {
      Key: '',
      CreditBy: window.sessionStorage.getItem('agentID'),
      oTrans: {
        Amount: formData.amount,
        Remarks: formData.remarks,
      },
    };

    this.shared.loader(true);
    this.api.MAKE_CREDIT_TRANS_DEPT(obj).subscribe((data: any) => {
      this.shared.loader(false);
      if (data.Result === true) {
        this.toster.success('Credit Deposit done successfully.');
        this.closeDeposit()
        this.GET_ADM_CREDIT_TRANS(1, 10)
      } else {
        this.closeDeposit()
        this.toster.error('Something went wrong. Please try again.');
      }
    });
  }
  isUserSelected: boolean = false; // Initialize to false

  get isTransferFormValid(): boolean {
    // Check that the form is valid, search value is not empty, and a user is selected
    return this.transferForm.valid &&
      this.searchValue &&
      this.searchValue.trim() !== '' &&
      this.isUserSelected; // Include the user selection check
  }
  MAKE_CREDIT_TRANS_TRANSFER() {
    const formData = this.transferForm.value;
    let obj = {
      Key: '',
      Profile: this.selectedUserProfileID,
      CreditBy: window.sessionStorage.getItem('agentID'),
      oTrans: {
        Amount: formData.amount,
        Remarks: formData.remarks,
        Auto_Debit: formData.autoDebit ? 1 : 0, // Enable = 1, Disable = 0
      },
    };

    this.shared.loader(true);
    this.api.MAKE_CREDIT_TRANS_TRANSFER(obj).subscribe((data: any) => {
      this.shared.loader(false);
      if (data.Result === true) {
        this.closeTransfer()
        this.GET_ADM_CREDIT_TRANS(1, 10)
        this.toster.success('Credit Transfer done successfully.');
      } else {
        this.toster.error('Something went wrong. Please try again.');
        this.closeTransfer()
      }
    });
  }

  onSearchTypeChange(event: any): void {
    this.searchValue= ''
    this.filteredUsers= []
    this.errorMessage= ''
    this.selectedSearchType = event.target.value;
  }
  errorMessage: string = '';
  onSearchInput(event: any): void {
    const searchValue = event.target.value;
    this.isUserSelected = false;
    this.errorMessage = '';

    if (searchValue.length >= 2) {
      const currentDate = new Date();
      const oneYearBack = new Date();
      oneYearBack.setFullYear(oneYearBack.getFullYear() - 1);

      const formattedCurrentDate = currentDate.toISOString().split('T')[0];
      const formattedOneYearBackDate = oneYearBack.toISOString().split('T')[0];

      const obj = {
        oType: this.selectedSearchType,
        Value: searchValue,
        Reserve1: '',
        Reserve2: 1,
        Reserve3: '',
        Initial: 1,
        MaxCount: 100,
        dtFrom: formattedOneYearBackDate,
        dtTo: formattedCurrentDate,
      };

      this.api.GET_PROFILE_BY_FILTER(obj).subscribe((data: any) => {
        if (data) {
          this.filteredUsers = data;
          this.isUserSelected = data.length > 0;

          if (!this.isUserSelected) {
            this.errorMessage = 'No users found. Please refine your search.';
          }
        } else {
          this.filteredUsers = [];
          this.errorMessage = 'No users found. Please refine your search.';
        }
      });
    } else {
      this.userSel= false
      this.filteredUsers = [];
      this.errorMessage = '';
    }

    if (!this.isUserSelected) {
      this.selectedUserProfileID = null;
    }
  }

  userSel: boolean = false
  onUserSelect(user: any): void {
    this.userSel = true
    this.selectedUsername = user.Name;
    this.selecteduserPhone = user.Phone;
    this.selectedUserProfileID = user.ProfileID;
    this.getUserBalance(user.ProfileID)
    // Update the searchValue with the selected user's details
    this.searchValue = `${user.Code} - ${user.Name} - ${user.Phone}`;
    this.filteredUsers = [];
    this.errorMessage = ''; // Clear the error message if any user is selected
  }
  allowNumbersOnly(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
    // Check if the charCode is a digit (0-9) or allows special keys like backspace, delete, etc.
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
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
    this.page= 1
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
    this.GET_ADM_CREDIT_TRANS(1, 10);
    // Call your API with the updated date range

  }
  // onFilterChange(event: any): void {
  //   // Set the selected filter type from the dropdown
  //   this.selectedFilterType = event.target.value;

  //   // Reset the search value when the filter type changes
  //   this.searchVal = '';


  // }

  search() {
    this.filteredUsers1= []
    this.page= 1
    this.GET_ADM_CREDIT_TRANS(1, 10)
  }

  Count: any
  GET_ADM_CREDIT_TRANS(initial: any, maxCount: any) {
    this.Count = 0
    // Get the values from the form and filters
    const dtFrom = this.transactionForm.get('dtFrom')?.value;
    const dtTo = this.transactionForm.get('dtTo')?.value;
    const oType = this.selectedFilterType || 0; // Default to 0 if not selected
    const value = this.searchVal || ''; // Use the search value or an empty string if not provided

    let obj = {
      "oType": oType, // Use the selected filter type
      "Value": value, // Use the entered search value
      "Initial": initial,
      "MaxCount": maxCount,
      "dtFrom": dtFrom ? `${dtFrom} 00:00:01` : '', // Format dtFrom to include time
      "dtTo": dtTo ? `${dtTo} 23:59:59` : '' // Format dtTo to include time
    };
   
    this.shared.loader(true);
    this.api.GET_ADM_CREDIT_TRANS(obj).subscribe((data: any) => {
      this.shared.loader(false);
      this.Count = data.Count
      if (data.lstTrans) {
        this.creditTransData = data.lstTrans;
        this.showStatement = 1
        this.pager = this.pagination.getPager(this.Count, this.page, this.numRecord);
      } else {
        this.creditTransData = [];
        this.showStatement = 0
      }
    });
  }
  resetFilters(): void {
    // Reset selected filter type
    this.page = 1
    this.selectedFilterType = 0; // Reset to default (assuming 0 is the default option)
    this.selectedUserProfileID = ''
    this.selectedSearchType = 0
    // Reset search value
    this.searchVal = '';

    // Optionally reset other filters here if needed
    this.oFilter = 1; // Reset the date filter to its default state

    // Reset the active class for custom date picker
    this.activeClass = 0;

    // Optionally call the default date range if needed
    this.showDateRange(1);
  }
  onFilterChange(event: any): void {
    this.searchVal = ''
    this.errorMessage1 = ''
    this.filteredUsers1= []
    this.selectedFilterType = event.target.value;
    // this.loadFilteredUsers(); // Load users based on the selected filter type
  }
  filteredUsers1: any = []
  errorMessage1: any = ''
  loadFilteredUsers(event: any): void {
    if (!this.selectedFilterType) {
      this.errorMessage = 'Please select a filter type.';
      return;
    }
    const search = event.target.value
    const currentDate = new Date();
    const oneYearBack = new Date();
    oneYearBack.setFullYear(oneYearBack.getFullYear() - 1);

    const formattedCurrentDate = currentDate.toISOString().split('T')[0];
    const formattedOneYearBackDate = oneYearBack.toISOString().split('T')[0];

    const obj = {
      oType: this.selectedFilterType,
      Value: search, // Optionally pass an initial value if required
      Reserve1: '',
      Reserve2: 1,
      Reserve3: '',
      Initial: 1,
      MaxCount: 100,
      dtFrom: formattedOneYearBackDate,
      dtTo: formattedCurrentDate,
    };

    this.api.GET_PROFILE_BY_FILTER(obj).subscribe((data: any) => {
      if (data) {
        this.filteredUsers1 = data;
        this.errorMessage1 = data.length > 0 ? '' : 'No users found.';
      } else if(!data) {
        this.userSel= false
        this.filteredUsers1 = [];
        this.errorMessage1 = 'No users found.';
      } 
    });
  }

  onUserSelect1(user: any): void {
    this.page= 1
    // Handle user selection logic here
    console.log('Selected user:', user);
    // Reset the filtered users after selection if necessary
    if (this.selectedFilterType == 1) {
      // return this.fullName.split(' ')[0];
      this.searchVal = user.Name.split(' ')[0];
    }
    // else if(this.selectedFilterType == 2){
    //   this.searchVal = user.Email;
    // }
    else if (this.selectedFilterType == 7) {
      this.searchVal = user.Phone;
    }
    else if (this.selectedFilterType == 8) {
      this.searchVal = user.Code;
    }
    this.filteredUsers1 = [];
  }
  balance: any
  currency: any
  getUserBalance(val: any): void {
    const profileId = 1000; // Replace this with the dynamic profile ID if available
    const tag = 'balance';
    let obj = {
      profileId: val,
      balance: 'BALANCE'
    }
    this.api.GET_USER_ACCOUNT_BY_TAG(obj).subscribe(
      (data: any) => {
        if (data) {
          this.balance = data.Balance;
          this.currency = data.Currency;
        } else {
          this.errorMessage = 'Unable to fetch balance data.';
        }
      },
      (error) => {
        this.errorMessage = 'Error fetching balance data.';
        console.error('Error:', error);
      }
    );
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
      this.pagedItems = this.creditTransData.slice(((this.pageRecord * page) - this.pageRecord + 1), this.pageRecord * page);
      //  this.getLedger(((this.pageRecord*page)-this.pageRecord+1), this.pageRecord*page)
      this.GET_ADM_CREDIT_TRANS(((this.pageRecord * page) - this.pageRecord + 1), this.pageRecord * page,)

    }
  }
}
