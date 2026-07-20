import {
  Component,
  OnInit,
  TemplateRef,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  AfterViewInit,
} from '@angular/core';

import {
  NgbDropdownModule,
  NgbModal,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule, DatePipe, formatDate } from '@angular/common';
import { ApiService } from '../../servies/api.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../servies/shared/shared.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { environment } from '../../../environments/environment';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgModule } from '@angular/core';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { finalize, map, Subscription } from 'rxjs';
import { ngxCsv } from 'ngx-csv/ngx-csv';
import * as XLSX from 'xlsx';
import { PaginationService } from '../../servies/pagination.service';
@Component({
  selector: 'app-wallet-and-ledger',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    NgSelectModule,
    NgbDropdownModule,
    NgbTooltipModule,
  ],
  templateUrl: './wallet-and-ledger.component.html',
  styleUrl: './wallet-and-ledger.component.scss',
})
export class WalletAndLedgerComponent implements OnInit {
  items = Array(8).fill(0);
  ledgerData: any = [];
  ledgerForm: any = FormGroup;
  selectedReserve1: string = 'BALANCE';
  constructor(
    private api: ApiService,
    private toster: ToastrService,
    private shared: SharedService,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private pagination: PaginationService,
  ) {}

  ngOnInit(): void {
    this.shared.setSidebrActiveClass('balance-container/wallet-and-ledger');
    this.ledgerForm = this.formBuilder.group({
      dtFrom: ['', Validators.required],
      dtTo: ['', Validators.required],
    });
    this.showDateRange(1);
  }

  Count: any = 0;
  // GET_ADM_LEDGER_BY_TAG(initial:any,maxCount:any) {
  //   this.Count= 0
  //   let obj = {
  //     "Key": "",
  //     "Reserve1": this.selectedReserve1, // Use the selectedReserve1 value
  //     "Reserve2": "",
  //     "Reserve3": "",
  //     "Initial": initial,
  //     "MaxCount": maxCount,
  //     "dtFrom": this.ledgerForm.value.dtFrom ? this.ledgerForm.value.dtFrom + " 00:00:01" : "",
  //     "dtTo": this.ledgerForm.value.dtTo ? this.ledgerForm.value.dtTo + " 23:59:59" : ""
  //   };

  //   this.shared.loader(true);
  //   this.api.GET_ADM_LEDGER_BY_TAG(obj).subscribe(
  //     (data: any) => {
  //       this.Count= data.Count
  //       this.pager = this.pagination.getPager(this.Count, this.page, this.numRecord);
  //       console.log("ledger data", data);
  //       this.page = 1
  //       if (data.lstLedgerADM) {
  //         this.ledgerData = data.lstLedgerADM;
  //         this.shared.loader(false);
  //       } else {
  //         this.ledgerData = [];
  //         this.shared.loader(false);
  //       }
  //     },
  //     (error) => {
  //       this.ledgerData = [];
  //       this.shared.loader(false);
  //     }
  //   );
  // }
  getFullLedgerTotals() {
    const obj = {
      Key: '',
      Reserve1: this.selectedReserve1,
      Reserve2: '',
      Reserve3: '',
      Initial: 1,
      MaxCount: 1000000, // fetch all
      dtFrom: this.ledgerForm.value.dtFrom
        ? this.ledgerForm.value.dtFrom + ' 00:00:01'
        : '',
      dtTo: this.ledgerForm.value.dtTo
        ? this.ledgerForm.value.dtTo + ' 23:59:59'
        : '',
    };

    // this.api.GET_ADM_LEDGER_BY_TAG(obj).subscribe((data: any) => {
    //   this.totalDebit = 0;
    //   this.totalCredit = 0;

    //   const fullList = data.lstLedgerADM || [];

    //   for (const row of fullList) {
    //     const amt = Number(row?.oTrans?.Amount || 0);

    //     if (row?.oTrans?.Trans_Source === 1) this.totalDebit += amt;

    //     if (row?.oTrans?.Trans_Source === 2) this.totalCredit += amt;
    //   }
    // });
    this.api
      .GET_ADM_LEDGER_BY_TAG(obj)
      .pipe(
        // 1. Transform the raw data into the final totals immediately
        map((data: any) => {
          const list = data?.lstLedgerADM || [];
          let debit = 0;
          let credit = 0;

          for (const row of list) {
            const amt = Number(row?.oTrans?.Amount || 0);
            if (row?.oTrans?.Trans_Source === 1) debit += amt;
            else if (row?.oTrans?.Trans_Source === 2) credit += amt;
          }
          return { debit, credit };
        }),
        // 2. Ensure loader hides even if the API or calculation crashes
        finalize(() => this.shared.loader(false)),
      )
      .subscribe({
        next: (totals) => {
          // 3. UI only updates once the work is 100% done
          this.totalDebit = totals.debit;
          this.totalCredit = totals.credit;
        },
        error: (err) => console.error('Calculation failed', err),
      });
  }
  totalCredit: any = 0;
  totalDebit: any = 0;
  GET_ADM_LEDGER_BY_TAG(initial: any, maxCount: any) {
    this.Count = 0;
    // this.totalCredit = 0;
    // this.totalDebit = 0;

    let obj = {
      Key: '',
      Reserve1: this.selectedReserve1,
      Reserve2: '',
      Reserve3: '',
      Initial: initial,
      MaxCount: maxCount,
      dtFrom: this.ledgerForm.value.dtFrom
        ? this.ledgerForm.value.dtFrom + ' 00:00:01'
        : '',
      dtTo: this.ledgerForm.value.dtTo
        ? this.ledgerForm.value.dtTo + ' 23:59:59'
        : '',
    };

    this.shared.loader(true);

    this.api.GET_ADM_LEDGER_BY_TAG(obj).subscribe(
      (data: any) => {
        this.shared.loader(false);

        this.ledgerData = data.lstLedgerADM || [];
        this.Count = data.Count;

        this.pager = this.pagination.getPager(
          this.Count,
          this.page,
          this.numRecord,
        );

        if (this.ledgerData.length > 0) {
          // ===== OPENING =====
          const openingObj = {
            isOpening: true,
            Balance: data.OpenBalance,
            CreatedOn: this.ledgerData[0]?.oTrans?.CreatedOn,
            Remarks: 'Opening Balance',
          };

          // // ===== CLOSING DATE FIX =====
          // const lastDateStr =
          //   this.ledgerData[this.ledgerData.length - 1]?.oTrans?.CreatedOn;

          // const d = new Date(lastDateStr.replace(" ", "T"));
          // d.setDate(d.getDate() - 1);
          // d.setHours(0,0,0,0);

          // const formatted =
          //   d.getFullYear()+"-"+
          //   String(d.getMonth()+1).padStart(2,'0')+"-"+
          //   String(d.getDate()).padStart(2,'0')+
          //   " 00:00";

          const closingObj = {
            isClosing: true,
            Balance: data.CloseBalance,
            CreatedOn:
              this.ledgerData[this.ledgerData.length - 1]?.oTrans?.CreatedOn,
            Remarks: 'Closing',
          };

          // insert only where needed
          if (this.page === 1) {
            this.ledgerData.unshift(openingObj);
          }

          if (this.page === this.pager.totalPages) {
            this.ledgerData.push(closingObj);
          }
          // this.totalCredit = 0;
          // this.totalDebit = 0;

          // data.lstLedgerADM.forEach((row: any) => {
          //   const amt = Number(row?.oTrans?.Amount || 0);

          //   if (row?.oTrans?.Trans_Source === 1) {
          //     this.totalDebit += amt;
          //   }

          //   if (row?.oTrans?.Trans_Source === 2) {
          //     this.totalCredit += amt;
          //   }
          // });
        }
      },
      () => {
        this.shared.loader(false);
        this.ledgerData = [];
      },
    );
  }
  getInitials(name: string): string {
    if (!name) {
      return '';
    }
    const nameParts = name.trim().split(' ');
    const initials = nameParts
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
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

  activeClass: any = 0;
  oFilter: any = 1;
  showDateRange(event: any): void {
    this.page = 1;
    const selectedOption = event;
    const today = new Date();
    let dtStart: string;
    let dtEnd: string = this.getCurrentDate(); // Get current date

    if (selectedOption === 1) {
      // Last 1 Week
      this.activeClass = 0;
      const oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(today.getDate() - 6); // Adjust to include today as the last day
      dtStart = this.formatDate(oneWeekAgo);
    } else if (selectedOption === 2) {
      // Last 1 month
      this.activeClass = 0;
      const oneMonthAgo = new Date(today);
      oneMonthAgo.setDate(today.getDate() - 29); // Adjust to include today as the last day
      dtStart = this.formatDate(oneMonthAgo);
    } else if (selectedOption === 3) {
      // Last 3 Months
      this.activeClass = 0;
      const threeMonthsAgo = new Date(today);
      threeMonthsAgo.setMonth(today.getMonth() - 3);
      threeMonthsAgo.setDate(today.getDate()); // Ensure the day is consistent
      dtStart = this.formatDate(threeMonthsAgo);
    } else if (selectedOption === 4) {
      // Last 1 year
      this.activeClass = 0;
      const oneYearAgo = new Date(today);
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      oneYearAgo.setDate(today.getDate()); // Ensure the day is consistent
      dtStart = this.formatDate(oneYearAgo);
    } else if (selectedOption === 5) {
      // Custom Date
      this.activeClass = 1;
      return;
    } else {
      return;
    }

    // Update the form values for dtFrom and dtTo
    this.ledgerForm.patchValue({
      dtFrom: dtStart,
      dtTo: dtEnd,
    });

    // Trigger the API call with the updated date range
    this.GET_ADM_LEDGER_BY_TAG(1, 10);
    this.getFullLedgerTotals();
  }

  seacrh() {
    this.page = 1;
    this.GET_ADM_LEDGER_BY_TAG(1, 10);
    this.getFullLedgerTotals();
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
    this.selectedReserve1 = value; // Update the selected value
    this.page = 1;
    this.GET_ADM_LEDGER_BY_TAG(1, 10);
    this.getFullLedgerTotals();
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
    this.toster.success('Reference copied successfully.', 'Success');
  }

  // =========================================================== export =====================================================
  private fetchAllLedger(): Promise<any[]> {
    return new Promise((resolve) => {
      const obj = {
        Key: '',
        Reserve1: this.selectedReserve1,
        Reserve2: '',
        Reserve3: '',
        Initial: 1,
        MaxCount: this.Count || 999999,
        dtFrom: this.ledgerForm.value.dtFrom ? this.ledgerForm.value.dtFrom + ' 00:00:01' : '',
        dtTo: this.ledgerForm.value.dtTo ? this.ledgerForm.value.dtTo + ' 23:59:59' : '',
      };
      this.api.GET_ADM_LEDGER_BY_TAG(obj).subscribe({
        next: (res: any) => resolve(res?.lstLedgerADM || []),
        error: () => resolve([]),
      });
    });
  }

  async exportCsv() {
    const items = await this.fetchAllLedger();
    const rows = items.map((item: any) => ({
      Date: item?.oTrans?.CreatedOn || '',
      Name: item.Name || '',
      Phone: item.Phone || '',
      Reference: item?.oTrans?.Reference || '',
      Debit: item?.oTrans?.Trans_Source === 1 ? item?.oTrans?.Amount : '',
      Credit: item?.oTrans?.Trans_Source === 2 ? item?.oTrans?.Amount : '',
      Balance: item?.Balance || '',
      Remarks: item?.oTrans?.Remarks_Admin || item?.oTrans?.Remarks_Client || item?.oTrans?.Remarks_Trans || ''
    }));
    if (!rows.length) return;
    new ngxCsv(rows, 'WalletLedger', { headers: Object.keys(rows[0]) });
  }

  async exportExcel() {
    const items = await this.fetchAllLedger();
    const rows = items.map((item: any) => ({
      Date: item?.oTrans?.CreatedOn || '',
      Name: item.Name || '',
      Phone: item.Phone || '',
      Reference: item?.oTrans?.Reference || '',
      Debit: item?.oTrans?.Trans_Source === 1 ? item?.oTrans?.Amount : '',
      Credit: item?.oTrans?.Trans_Source === 2 ? item?.oTrans?.Amount : '',
      Balance: item?.Balance || '',
      Remarks: item?.oTrans?.Remarks_Admin || item?.oTrans?.Remarks_Client || item?.oTrans?.Remarks_Trans || ''
    }));
    if (!rows.length) return;
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ledger');
    XLSX.writeFile(wb, 'WalletLedger.xlsx');
  }
  // =========================================================== pagination ===============================================

  numRecord: any = 10;
  pageRecord: any = 10;
  pageRecordNum: any = '';
  pager: any = [];

  pagedItems: any;
  pages: any = '';
  page: any = 1;
  onPageSizeChange() {
    this.page = 1;
    this.pageRecord = this.numRecord;
    this.setPage(1);
  }
  setPage(page: number) {
    this.page = page;

    if (page >= 1 && page <= this.pager.totalPages) {
      this.pager = this.pagination.getPager(
        this.Count,
        this.pageRecord,
        this.numRecord,
      );
      this.pagedItems = this.ledgerData.slice(
        this.pageRecord * page - this.pageRecord + 1,
        this.pageRecord * page,
      );
      //  this.getLedger(((this.pageRecord*page)-this.pageRecord+1), this.pageRecord*page)
      this.GET_ADM_LEDGER_BY_TAG(
        this.pageRecord * page - this.pageRecord + 1,
        this.pageRecord * page,
      );
      // this.getFullLedgerTotals();
    }
  }
}
