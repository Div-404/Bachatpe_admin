import { Component, OnInit } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { ApiService } from '../../servies/api.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { SharedService } from '../../servies/shared/shared.service';
import { CommonModule, DatePipe, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationService } from '../../servies/pagination.service';
import { map, finalize } from 'rxjs';

@Component({
  selector: 'app-user-ledger',
  standalone: true,
  imports: [NgSelectModule, FormsModule, CommonModule],
  templateUrl: './user-ledger.component.html',
  styleUrl: './user-ledger.component.scss',
})
export class UserLedgerComponent implements OnInit {
  ledgerList: any;
  ProfileId: any;
  accList: any;
  First: any;
  Last: any;
  Code: any;
  Phone: any;

  constructor(
    private api: ApiService,
    private toster: ToastrService,
    private route: ActivatedRoute,
    private shared: SharedService,
    private datePipe: DatePipe,
    private pagination: PaginationService,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((param: any) => {
      console.log('here is param', param.id);
      this.ProfileId = param.id;
      sessionStorage.getItem;
      this.First = sessionStorage.getItem('First');
      this.Last = sessionStorage.getItem('Last');
      this.Code = sessionStorage.getItem('Code');
      this.Phone = sessionStorage.getItem('Phone');
      // this.type= param.type
      this.dateChange();
      this.getAccount();
    });
  }

  // ==================================================================== get user ledger =========================================================

  Count: any;
  OpenBalance: any = 0;
  OpenPending: any = 0;
  totalCredit: any = 0;
  totalDebit: any = 0;
  ledgerCalcList: any = [];
  CloseBalance: any = 0;
  getUserLedger(Initial: any, MaxCount: any) {
    this.Count = 0;
    // this.totalCredit = 0;
    // this.totalDebit = 0;
    let data = {
      Key: '',
      Profile: Number(this.ProfileId),
      Account: this.accNum,
      dtFrom: this.lastDaysDate + ' ' + '00:00:01',
      dtTo: this.updatedDate + ' ' + '23:59:59',
      Initial: Initial,
      MaxCount: MaxCount,
      //"Callback_URL":""
    };

    this.shared.loader(true);
    this.api.getUserLedger(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false);

        this.ledgerList = res.lstLedger || [];
        this.ledgerCalcList = res.lstLedger || []; // full page data

        this.OpenBalance = res.OpenBalance;
        this.CloseBalance = res.CloseBalance;
        this.OpenPending = res.OpenPending;
        this.Count = res.Count;

        this.pager = this.pagination.getPager(
          this.Count,
          this.page,
          this.numRecord,
        );

        if (this.ledgerList.length > 0) {
          // ===== OPENING OBJECT =====
          const openingObj = {
            Amount: null,
            Balance: res.OpenBalance,
            CreatedOn: this.ledgerList[0].CreatedOn,
            Reference: '',
            Remarks_Trans: 'Opening Balance',
            Trans_type: 1,
            Status: 2,
          };

          const closingObj = {
            Amount: null,
            Balance: res.CloseBalance,
            CreatedOn: this.ledgerList[this.ledgerList.length - 1].CreatedOn,
            Reference: '',
            Remarks_Trans: 'Closing',
            Trans_type: 1,
            Status: 2,
          };

          // ===== INSERT ONLY WHERE NEEDED =====
          if (this.page === 1) {
            this.ledgerList.unshift(openingObj);
          }

          if (this.page === this.pager.totalPages) {
            this.ledgerList.push(closingObj);
          }
        }

        // ===== GRAND TOTAL CALCULATION =====
        // this.calculateTotals(res.lstLedger);
      },
      error: (err: any) => {
        this.shared.loader(false);
        this.toster.error('Something went wrong', 'Error');
      },
    });
  }
  isLedgerTotalsLoading = false;

getFullLedgerTotals() {
  const data = {
    Key: '',
    Profile: Number(this.ProfileId),
    Account: this.accNum,
    dtFrom: this.lastDaysDate + ' 00:00:01',
    dtTo: this.updatedDate + ' 23:59:59',
    Initial: 1,
    MaxCount: 1000000,
  };

  this.isLedgerTotalsLoading = true;

  this.api.getUserLedger(data)
    .pipe(
      map((res: any) => {
        const list = res?.lstLedger || [];
        let debit = 0;
        let credit = 0;

        for (const row of list) {
          const amt = Number(row?.Amount || 0);
          if (row?.Trans_type === 1) debit += amt;
          else if (row?.Trans_type === 2) credit += amt;
        }

        return { debit, credit };
      })
    )
    .subscribe({
      next: (totals) => {
        this.totalDebit = totals.debit;
        this.totalCredit = totals.credit;
        this.isLedgerTotalsLoading = false;
      },
      error: (err) => {
        console.error('Calculation failed', err);
        this.totalDebit = 0;
        this.totalCredit = 0;
        this.isLedgerTotalsLoading = false;
      }
    });
}
  // ================================================================ get account number ==========================================================

  getAccount() {
    let data = {
      Profile: this.ProfileId,
    };

    this.shared.loader(true);
    this.api.getUserAcc(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false);
        this.accList = res;
        this.accNum = this.accList[1].Account;
        // this.getUserLedger(1, 10);
        this.getUserLedger(1, 10);
        this.getFullLedgerTotals();
        console.log('here is res from user list', this.accList[0].Account);
      },
      error: (err: any) => {
        this.shared.loader(false);
        this.toster.error('Something went wrong', 'Error');
      },
    });
  }

  accNum: any;
  selectAcc(ev: any) {
    this.accNum = ev;
    this.page = 1;
    this.getUserLedger(1, 10);
    this.getFullLedgerTotals();
  }

  // ====================================================================== date filter ============================================================

  selectDate(ev: any) {
    // this.userName= ''
    // this.oFilter= '0'
    this.customDate = ev.target.value;
    if (this.customDate == 'custom') {
      //  this.updatedDate= ''
      //  this.lastDaysDate= ''
      console.log('here is updated date', this.updatedDate, this.lastDaysDate);
    } else if (this.customDate != 'custom') {
      this.page = 1;
      this.dateSelect = Number(ev.target.value);
      this.dateChange();
      // this.getPayoutReq(0,10, 'nos')
      this.getUserLedger(1, 10);
      this.getFullLedgerTotals();
    }
    console.log('here is selected date', this.dateSelect);
  }

  customDate: any;
  dateSelect: any = 7;
  lastDaysDate: any;
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
    this.transformDate();
    return this.lastDaysDate;
  }

  updatedDate: any;
  transformDate() {
    const date = new Date();
    this.updatedDate = this.datePipe.transform(date, 'yyyy-MM-dd HH:mm:ss');
    this.updatedDate = this.datePipe.transform(date, 'yyyy-MM-dd 23:59:59');
    this.updatedDate = this.datePipe.transform(date, 'yyyy-MM-dd');

    console.log('here is date', this.updatedDate);
  }

  dateclear: any = '7';
  clearFilter() {
    // this.crossIcon= false
    // this.searchEnable= false
    this.customDate = 7;
    this.dateclear = '7';
    this.dateSelect = 7;
    // this.bankVal= 0
    // this.statusval= 0
    // this.searchIs= false
    // this.oFilter= '0'
    //  this.userName= ''
    this.dateChange();
    this.getUserLedger(1, 10);
  }

  dateFrom: any = '';
  dateTo: any = '';
  searchEnable: boolean = false;
  crossIcon: boolean = false;
  dateSelectFromTO(ev: any, val: any) {
    if (val == 'from' && ev.target.value) {
      this.dateFrom = ev.target.value;
      this.lastDaysDate = ev.target.value;
      this.updatedDate = null;
    } else if (val == 'to' && ev.target.value) {
      {this.page = 1;
      this.searchEnable = true;
      this.dateTo = ev.target.value;
      this.updatedDate = ev.target.value;
      this.getUserLedger(1, 10);
      this.getFullLedgerTotals();}
    }
  }

  // ==================================================================== copy text =============================================================

  copyToClipboard(item: string) {
    // Use the Clipboard API for a more modern approach
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(item)
        .then(() => {
          console.log('Reference copied successfully:', item);
          this.toster.success('Reference copied successfully.');
        })
        .catch((err) => {
          console.error('Error copying text: ', err);
        });
    }
    //  else {
    //   // Fallback for browsers that do not support the Clipboard API
    //   document.addEventListener('copy', (e: ClipboardEvent) => {
    //     if (e.clipboardData) {
    //       e.clipboardData.setData('text/plain', item);
    //       e.preventDefault();
    //     }
    //   });
    //   document.execCommand('copy');
    //   console.log('Text copied to clipboard:', item);
    // }
  }

  ngOnDestroy(): void {
    // Remove the item from localStorage
    sessionStorage.removeItem('First');
    sessionStorage.removeItem('Last');
    sessionStorage.removeItem('Code');
    sessionStorage.removeItem('Phone');
    console.log('Item removed from localStorage');
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
      this.pagedItems = this.ledgerList.slice(
        this.pageRecord * page - this.pageRecord + 1,
        this.pageRecord * page,
      );
      //  this.getLedger(((this.pageRecord*page)-this.pageRecord+1), this.pageRecord*page)
      this.getUserLedger(
        this.pageRecord * page - this.pageRecord + 1,
        this.pageRecord * page,
      );
    }
  }
}
