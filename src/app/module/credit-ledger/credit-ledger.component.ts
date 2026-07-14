import { Component, OnInit, TemplateRef, ElementRef, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';

import { NgbDropdownModule, NgbModal, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
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
import { PaginationService } from '../../servies/pagination.service';

@Component({
  selector: 'app-credit-ledger',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule,NgSelectModule,NgbDropdownModule,NgbTooltipModule],
  templateUrl: './credit-ledger.component.html',
  styleUrl: './credit-ledger.component.scss'
})
export class CreditLedgerComponent {
  items = Array(8).fill(0);
  ledgerData:any=[]
  ledgerForm:any=FormGroup
  selectedReserve1: string = 'CREDIT';
  constructor(private api: ApiService, private toster: ToastrService, private shared: SharedService, private formBuilder:FormBuilder,
    private datePipe: DatePipe,private modalService: NgbModal, private cdr:ChangeDetectorRef, private pagination: PaginationService
  ) { }

ngOnInit(): void {
  this.shared.setSidebrActiveClass('credit-container')
  this.ledgerForm = this.formBuilder.group({

    dtFrom: ['', Validators.required],
    dtTo: ['', Validators.required],

  });
  this.showDateRange(1)
}
  
Count: any= 0
OpenBalance: any = 0;
CloseBalance: any = 0;
totalCredit: any = 0;
totalDebit: any = 0;
isLedgerTotalsLoading = false;

getFullLedgerTotals() {
  const obj = {
    Key: '',
    Reserve1: this.selectedReserve1,
    Reserve2: '',
    Reserve3: '',
    Initial: 1,
    MaxCount: 1000000, // fetch all for totals
    dtFrom: this.ledgerForm.value.dtFrom ? this.ledgerForm.value.dtFrom + ' 00:00:01' : '',
    dtTo: this.ledgerForm.value.dtTo ? this.ledgerForm.value.dtTo + ' 23:59:59' : ''
  };

  this.isLedgerTotalsLoading = true;

  this.api.GET_ADM_LEDGER_BY_TAG(obj).subscribe({
    next: (res: any) => {
      const list = res?.lstLedgerADM || [];
      let debit = 0;
      let credit = 0;

      for (const row of list) {
        // Adjust according to your payload structure:
        // Amount is probably row.oTrans?.Amount
        const amt = Number(row?.oTrans?.Amount || row?.Amount || 0);

        // In your table you are using Trans_Source for debit/credit (1=debit, 2=credit)
        const transSource = Number(row?.oTrans?.Trans_Source ?? row?.Trans_Source ?? 0);

        if (transSource === 1) debit += amt;
        else if (transSource === 2) credit += amt;
      }

      this.totalDebit = debit;
      this.totalCredit = credit;

      // optional: if API returns these in full response and you want to trust full response values
      this.OpenBalance = res?.OpenBalance ?? this.OpenBalance;
      this.CloseBalance = res?.CloseBalance ?? this.CloseBalance;

      this.isLedgerTotalsLoading = false;
    },
    error: (err: any) => {
      console.error('Admin ledger total calculation failed', err);
      this.totalDebit = 0;
      this.totalCredit = 0;
      this.isLedgerTotalsLoading = false;
    }
  });
}

GET_ADM_LEDGER_BY_TAG(initial: any, maxCount: any, isStart?:boolean) {
  this.Count = 0;
  if(isStart) {this.page=1; this.getFullLedgerTotals()}
  const obj = {
    Key: "",
    Reserve1: this.selectedReserve1,
    Reserve2: "",
    Reserve3: "",
    Initial: initial,
    MaxCount: maxCount,
    dtFrom: this.ledgerForm.value.dtFrom ? this.ledgerForm.value.dtFrom + " 00:00:01" : "",
    dtTo: this.ledgerForm.value.dtTo ? this.ledgerForm.value.dtTo + " 23:59:59" : ""
  };

  this.shared.loader(true);

  this.api.GET_ADM_LEDGER_BY_TAG(obj).subscribe({
    next: (data: any) => {
      const rawList = data?.lstLedgerADM || [];

      // keep raw list first
      this.ledgerData = [...rawList];

      this.Count = Number(data?.Count || 0);
      this.OpenBalance = Number(data?.OpenBalance || 0);
      this.CloseBalance = Number(data?.CloseBalance || 0);

      // pager first
      this.pager = this.pagination.getPager(this.Count, this.page, this.numRecord);

      // inject opening / closing rows only when actual data exists
      if (this.ledgerData.length > 0) {
        // opening row
        const openingRow = {
          isOpeningRow: true,
          isClosingRow: false,
          Remarks_Trans: 'Opening Balance',
          Email: '',
          Balance: this.OpenBalance,
          oTrans: {
            CreatedOn: this.ledgerData[0]?.oTrans?.CreatedOn || '-',
            Reference: '',
            Amount: null,
            Trans_Source: 0
          }
        };

        // closing row
        const closingRow = {
          isOpeningRow: false,
          isClosingRow: true,
          Remarks_Trans: 'Closing Balance',
          Email: '',
          Balance: this.CloseBalance,
          oTrans: {
            CreatedOn: this.ledgerData[this.ledgerData.length - 1]?.oTrans?.CreatedOn ||'-',
            Reference: '',
            Amount: null,
            Trans_Source: 0
          }
        };

        // add opening only on first page
        if (Number(this.page) === 1) {
          this.ledgerData.unshift(openingRow);
        }

        // add closing only on last page
        if (this.pager?.totalPages && Number(this.page) === Number(this.pager.totalPages)) {
          this.ledgerData.push(closingRow);
        }
      }

      this.shared.loader(false);
    },
    error: (error) => {
      console.error(error);
      this.ledgerData = [];
      this.shared.loader(false);
    }
  });
}

getInitials(name: string): string {
  if (!name) {
    return '';
  }
  const nameParts = name.trim().split(' ');
  const initials = nameParts.map(part => part.charAt(0).toUpperCase()).join('');
  return initials;
}
getStatusText(statusCode: number): string {
  switch (statusCode) {
    case 1:
      return 'PENDING';
    case 3:
      return 'REJECTED';
       case 2:
      return 'SUCCESS';
    default:
      return 'UNKNOWN';
  }
}
getTransTypeText(statusCode: number): string {
  switch (statusCode) {
    case 1:
      return 'SEND';
    case 2:
      return 'RECEIVE';
       case 3:
      return 'DEPOSIT';
      case 4:
      return 'WITHDRAW';
    default:
      return 'UNKNOWN';
  }
}

getSourceText(statusCode: number): string {
  switch (statusCode) {
    case 3:
      return 'BANK';
    case 5:
      return 'UPI';
       case 6:
      return 'CASH';
    default:
      return 'UNKNOWN';
  }
}
getTransSourceText(statusCode: number): string {
  switch (statusCode) {
    case 1:
      return 'DEBIT';
    case 2:
      return 'CREDIT';
     
    default:
      return 'UNKNOWN';
  }
}

activeClass:any=0;
  oFilter:any=1;
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

    // Update the form values for dtFrom and dtTo
    this.ledgerForm.patchValue({
        dtFrom: dtStart,
        dtTo: dtEnd
    });

    // Trigger the API call with the updated date range
    this.GET_ADM_LEDGER_BY_TAG(1,10);
    this.getFullLedgerTotals();
    this.page=1;
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
updateReserve1(value: string): void {
  this.selectedReserve1 = value;
  this.page = 1;
  this.GET_ADM_LEDGER_BY_TAG(1,10);
  this.getFullLedgerTotals();
}
  copyDetails(val:any) {
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
        this.pagedItems = this.ledgerData.slice(((this.pageRecord * page) - this.pageRecord + 1), this.pageRecord * page);
        //  this.getLedger(((this.pageRecord*page)-this.pageRecord+1), this.pageRecord*page)
        this.GET_ADM_LEDGER_BY_TAG(((this.pageRecord * page) - this.pageRecord + 1), this.pageRecord * page,)
  
      }
    }
}
