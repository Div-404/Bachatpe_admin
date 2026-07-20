import {
  Component,
  OnInit,
  TemplateRef,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  AfterViewInit,
} from '@angular/core';

import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
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
import { forkJoin, Subscription } from 'rxjs';
import jsPDF from 'jspdf';
import { ngxCsv } from 'ngx-csv/ngx-csv';
import { HttpClient } from '@angular/common/http';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { PaginationService } from '../../servies/pagination.service';

import * as XLSX from 'xlsx';

// Reconcile Server URL
const RECONCILE_API = 'https://metiadigital.com:8200/api';

interface BankOption {
  BankID: number;
  BankName: string;
  AccountName: string;
  AccountNumber: string;
  IFSC: string;
  Status: number;
}

interface ExcelTransaction {
  TransTm: string;
  Remarks: string;
  UTR: string;
  Amt: number;
}

interface ColumnMapping {
  transactionTime: string;
  remarks: string;
  utr: string;
  amount: string;
  status: string;
}

interface VerifyResponse {
  Amount: number;
  BankID: number;
  Reference: string;
  RemarkID: number;
  Status: number;
  UTR: string;
  UserID: number;
  // Client-side matching fields
  PendingAmount?: number;
  AmountMatch?: boolean;
}

@Component({
  selector: 'app-deposit-request',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    NgSelectModule,
    NgbDropdownModule,
    NgbTooltipModule,
  ],
  templateUrl: './deposit-request.component.html',
  styleUrl: './deposit-request.component.scss',
})
export class DepositRequestComponent implements OnInit {
  @ViewChild('chatBoxBody', { static: false }) chatBoxBody!: ElementRef;

  // Existing properties
  manRecList: any;
  modalRef: any;
  status: any = Number;
  dropval1: any = 0;
  searchVal: any = '';
  crossIcon: boolean = false;
  dropSec: boolean = false;
  byManualAdminForm: any = FormGroup;
  chatForm: any = FormGroup;
  statusUpdateForm: any = FormGroup;
  statusFilter: any = 0;
  payId: any;
  statusReference: any;
  agtId: any;
  execPermissions: any;
  public remark: string = '';

  // ==================== Bank Filter Properties ====================
  bankList: BankOption[] = [];
  selectedBank: BankOption | null = null;
  isBankListLoading: boolean = false;
  filteredManualData: any[] = [];

  // ==================== Excel Upload Properties ====================
  showUploadSection: boolean = false;
  uploadStep: number = 1; // 1: Upload, 2: Map, 3: Preview, 4: Results

  excelFile: File | null = null;
  excelFileName: string = '';
  excelHeaders: string[] = [];
  excelData: any[] = [];
  excelSheets: string[] = [];
  selectedSheet: string = '';

  columnMapping: ColumnMapping = {
    transactionTime: '',
    remarks: '',
    utr: '',
    amount: '',
    status: ''
  };

  mappedTransactions: ExcelTransaction[] = [];
  verifyResults: VerifyResponse[] = [];
  isProcessing: boolean = false;
  successCount: number = 0;
  failedCount: number = 0;

  // Track matched UTRs to show tick mark on main table
  matchedUTRs: Set<string> = new Set();

  // 8200 API job tracking
  currentJobId: string = '';

  constructor(
    private api: ApiService,
    private toster: ToastrService,
    private shared: SharedService,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private pagination: PaginationService,
    private http: HttpClient,  // Add HttpClient for 8200 API calls
  ) {
    this.shared.setSidebrActiveClass('balance-container/deposit-request');
    this.shared.activeClass$.subscribe((activeClass: string) => {
      console.log('Current active class:', activeClass);
    });
  }

  ngOnInit(): void {
    this.execPermissions = JSON.parse(sessionStorage.getItem('execDetails') || '{}');
    this.agtId = JSON.parse(sessionStorage.getItem('agentID') || '{}');
    this.byManualAdminForm = this.formBuilder.group({
      dtFrom: ['', Validators.required],
      dtTo: ['', Validators.required],
    });
    this.chatForm = this.formBuilder.group({
      message: ['', Validators.required],
      showAdmin: [0],
    });
    this.statusUpdateForm = this.formBuilder.group({
      PayID: [this.payId],
      Amount: ['', Validators.required],
      Reference: [this.statusReference],
      Waive_Fee: [0],
      Status: [0, Validators.required],
    });

    // Load bank list from API
    this.getBankList();

    this.showDateRange(3);
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
    // this.cdr.detectChanges();
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  // ==================== BANK FILTER METHODS ====================

  /**
   * Fetch bank list from GET_TRANS_BANK API
   */
  getBankList(): void {
    this.isBankListLoading = true;
    this.api.getTransBank().subscribe({
      next: (response: any[]) => {
        this.isBankListLoading = false;
        if (response && response.length > 0) {
          this.bankList = response.map((item: any) => ({
            BankID: item.BankInfo.BankID,
            BankName: item.BankInfo.Bank,
            AccountName: item.BankInfo.Account_Name,
            AccountNumber: item.BankInfo.Account_Number,
            IFSC: item.BankInfo.Account_IFSC,
            Status: item.BankInfo.Status
          }));
          // Sort by bank name
          this.bankList.sort((a, b) => a.BankName.localeCompare(b.BankName));
        }
      },
      error: (err: any) => {
        this.isBankListLoading = false;
        console.error('Error fetching bank list:', err);
        this.toster.error('Failed to load bank list', 'Error');
      }
    });
  }

  onBankSelect(bank: BankOption | null): void {
    this.selectedBank = bank;
    // Clear matched UTRs when switching banks
    this.clearMatchedUTRs();
    // Re-fetch transactions with the selected bank's Reserve3
    this.GET_PG_MG_ADM_MANUAL_RECPT(1, 10);
    if (this.showUploadSection) {
      this.resetUploadState();
    }
  }

  clearBankFilter(): void {
    this.selectedBank = null;
    // Clear matched UTRs
    this.clearMatchedUTRs();
    // Re-fetch transactions with Reserve3 = 0
    this.GET_PG_MG_ADM_MANUAL_RECPT(1, 10);
    this.resetUploadState();
  }

  // ==================== EXCEL UPLOAD METHODS ====================
  private startReconLoader(): void {
    this.isProcessing = true;
    this.shared.loader(true);
  }

  private stopReconLoader(): void {
    this.isProcessing = false;
    this.shared.loader(false);
  }
  private resetUploadDataOnly(): void {
    this.showUploadSection = false;
    this.uploadStep = 1;
    this.excelFile = null;
    this.excelFileName = '';
    this.excelHeaders = [];
    this.excelData = [];
    this.excelSheets = [];
    this.selectedSheet = '';
    this.columnMapping = {
      transactionTime: '',
      remarks: '',
      utr: '',
      amount: '',
      status: ''
    };
    this.mappedTransactions = [];
    this.verifyResults = [];
    this.successCount = 0;
    this.failedCount = 0;
    this.currentJobId = '';

    const fileInput = document.getElementById('excelFileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    this.page = 1
    this.GET_PG_MG_ADM_MANUAL_RECPT(1, 10);
  }
  private getSelectedSheetIndex(): number {
    const idx = this.excelSheets.findIndex(s => s === this.selectedSheet);
    return idx >= 0 ? idx : 0;
  }
  triggerFileUpload(): void {
    if (!this.selectedBank) {
      this.toster.warning('Please select a bank first', 'Bank Required');
      return;
    }
    const fileInput = document.getElementById('excelFileInput') as HTMLInputElement;
    if (fileInput) {
      // Reset file input value so same file can be selected again
      fileInput.value = '';
      fileInput.click();
    }
  }

  resetUploadState(): void {
    this.stopReconLoader();
    this.resetUploadDataOnly();
    this.clearMatchedUTRs()
    // keep matched UTRs intact intentionally
  }

  onFileSelect(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      this.toster.error('Please upload a valid Excel file (.xlsx, .xls, .csv)', 'Invalid File');
      return;
    }

    this.excelFile = file;
    this.excelFileName = file.name;

    this.uploadExcelToServer(file);
  }

  /**
   * Upload Excel file to 8200 reconcile server
   */
  uploadExcelToServer(file: File): void {
    this.startReconLoader();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'excel');

    this.http.post<any>(`${RECONCILE_API}/upload`, formData).subscribe({
      next: (response) => {
        if (response.jobs && response.jobs.length > 0 && response.jobs[0].jobId) {
          this.currentJobId = response.jobs[0].jobId;
          console.log('Job created:', this.currentJobId);

          // do NOT open upload section here
          this.pollJobStatus(this.currentJobId);
        } else {
          this.stopReconLoader();
          this.resetUploadDataOnly();
          console.error('Upload response:', response);
          this.toster.error('Failed to upload file to server', 'Error');
        }
      },
      error: (err) => {
        this.stopReconLoader();
        this.resetUploadDataOnly();
        console.error('Upload error:', err);
        this.toster.error('Failed to upload file to server', 'Error');
      }
    });
  }

  /**
   * Poll job status until complete (with timeout)
   */
  pollJobStatus(jobId: string): void {
    let pollCount = 0;
    const maxPolls = 180;
    const pollInterval = 1000;

    const poll = () => {
      pollCount++;

      if (pollCount > maxPolls) {
        this.stopReconLoader();
        this.resetUploadDataOnly();
        this.toster.error('Failed to process preview request! Try again later.', 'Error');
        console.error(`Polling stopped after ${maxPolls} attempts`);
        return;
      }

      if (pollCount % 10 === 0) {
        console.log(`Polling attempt ${pollCount}/${maxPolls}...`);
      }

      this.http.get<any>(`${RECONCILE_API}/job/${jobId}`).subscribe({
        next: (job) => {
          console.log(`Job status [${pollCount}]:`, job.processingStatus);

          if (job.processingStatus === 'COMPLETED') {
            this.extractJobData(job);
          } else if (job.processingStatus === 'FAILED') {
            this.stopReconLoader();

            // if upload section is not yet opened, keep user on same page
            if (!this.showUploadSection) {
              this.resetUploadDataOnly();
            }

            this.toster.error('Failed to process preview request! Try again later.', 'Error');
          } else {
            setTimeout(poll, pollInterval);
          }
        },
        error: (err) => {
          this.stopReconLoader();

          if (!this.showUploadSection) {
            this.resetUploadDataOnly();
          }

          console.error('Poll error:', err);
          this.toster.error('Failed to process preview request! Try again later.', 'Error');
        }
      });
    };

    poll();
  }

  /**
   * Extract headers, data, and auto-mapping from completed job
   */
  extractJobData(job: any): void {
    try {
      const result = job.result;

      if (!result || !result.sheets || result.sheets.length === 0) {
        this.stopReconLoader();
        this.resetUploadDataOnly();
        this.toster.error('Failed to process preview request! Try again later.', 'Error');
        return;
      }

      this.excelSheets = result.sheets.map((s: any) => s.name);
      this.selectedSheet = this.excelSheets[0];

      const firstSheet = result.sheets[0];
      this.excelHeaders = firstSheet.headers || [];
      this.excelData = firstSheet.rows || [];

      if (result.normalized && result.normalized.length > 0) {
        const mapping = result.normalized[0].mapping;
        if (mapping) {
          this.columnMapping = {
            transactionTime: mapping.date?.header || '',
            utr: mapping.utr?.header || '',
            amount: mapping.amount?.header || '',
            remarks: mapping.remarks?.header || '',
            status: mapping.status?.header || ''
          };
          console.log('Auto-detected mapping:', this.columnMapping);
        } else {
          this.autoDetectColumns();
        }
      } else {
        this.autoDetectColumns();
      }

      // show section only after successful extraction
      this.showUploadSection = true;
      this.uploadStep = 2;

      this.stopReconLoader();
    } catch (err) {
      console.error('Extract data error:', err);
      this.stopReconLoader();
      this.resetUploadDataOnly();
      this.toster.error('Failed to process preview request! Try again later.', 'Error');
    }
  }

  /**
   * Change selected sheet and reload data
   */
  onSheetChange(sheetName: string): void {
    if (!this.currentJobId) return;

    this.selectedSheet = sheetName;
    this.startReconLoader();

    this.http.get<any>(`${RECONCILE_API}/job/${this.currentJobId}`).subscribe({
      next: (job) => {
        const result = job.result;
        const sheet = result?.sheets?.find((s: any) => s.name === sheetName);

        if (!sheet) {
          this.stopReconLoader();
          this.uploadStep = 2;
          this.toster.error('Failed to process preview request! Try again later.', 'Error');
          return;
        }

        this.excelHeaders = sheet.headers || [];
        this.excelData = sheet.rows || [];

        const normalized = result.normalized?.find((n: any) => n.sheet === sheetName);
        if (normalized?.mapping) {
          this.columnMapping = {
            transactionTime: normalized.mapping.date?.header || '',
            utr: normalized.mapping.utr?.header || '',
            amount: normalized.mapping.amount?.header || '',
            remarks: normalized.mapping.remarks?.header || '',
            status: normalized.mapping.status?.header || ''
          };
        } else {
          this.autoDetectColumns();
        }

        this.uploadStep = 2;
        this.stopReconLoader();
      },
      error: (err) => {
        this.stopReconLoader();
        this.uploadStep = 2;
        console.error('Sheet change error:', err);
        this.toster.error('Failed to process preview request! Try again later.', 'Error');
      }
    });
  }

  autoDetectColumns(): void {
    const headerLower = this.excelHeaders.map(h => h.toLowerCase());

    const timePatterns = ['date', 'time', 'timestamp', 'transtm', 'txn date', 'transaction date', 'value date'];
    const timeIndex = headerLower.findIndex(h => timePatterns.some(p => h.includes(p)));
    if (timeIndex !== -1) this.columnMapping.transactionTime = this.excelHeaders[timeIndex];

    const utrPatterns = ['utr', 'reference', 'ref', 'txn ref', 'ref no', 'rrn'];
    const utrIndex = headerLower.findIndex(h => utrPatterns.some(p => h.includes(p)));
    if (utrIndex !== -1) this.columnMapping.utr = this.excelHeaders[utrIndex];

    const amtPatterns = ['amount', 'amt', 'credit', 'debit', 'value'];
    const amtIndex = headerLower.findIndex(h => amtPatterns.some(p => h.includes(p)));
    if (amtIndex !== -1) this.columnMapping.amount = this.excelHeaders[amtIndex];

    const remarkPatterns = ['remark', 'remarks', 'description', 'narration', 'particulars'];
    const remarkIndex = headerLower.findIndex(h => remarkPatterns.some(p => h.includes(p)));
    if (remarkIndex !== -1) this.columnMapping.remarks = this.excelHeaders[remarkIndex];

    const statusPatterns = ['status', 'txn status', 'state'];
    const statusIndex = headerLower.findIndex(h => statusPatterns.some(p => h.includes(p)));
    if (statusIndex !== -1) this.columnMapping.status = this.excelHeaders[statusIndex];
  }

  isColumnMappingValid(): boolean {
    return !!(this.columnMapping.transactionTime && this.columnMapping.utr && this.columnMapping.amount);
  }
  proceedToPreview(): void {
    if (!this.isColumnMappingValid()) {
      this.toster.warning('Please map Transaction Time, UTR, and Amount columns', 'Mapping Required');
      return;
    }

    const hasTransactions = this.mapTransactions();
    if (!hasTransactions) {
      return;
    }

    this.uploadStep = 3;
  }


  mapTransactions(): boolean {
    this.mappedTransactions = [];

    for (const row of this.excelData) {
      const transTime = this.parseDateTime(row[this.columnMapping.transactionTime]);
      const utr = String(row[this.columnMapping.utr] || '').trim();
      const amount = this.parseAmount(row[this.columnMapping.amount]);
      const remarks = String(row[this.columnMapping.remarks] || '').trim();

      if (!utr || amount <= 0) continue;

      this.mappedTransactions.push({
        TransTm: transTime,
        UTR: utr,
        Amt: amount,
        Remarks: remarks
      });
    }

    if (this.mappedTransactions.length === 0) {
      this.toster.warning('No valid transactions found', 'Warning');
      return false;
    }

    return true;
  }
  parseDateTime(value: any): string {
    if (!value) return '';
    if (value instanceof Date) return this.formatDateTimeForApi(value);

    const dateStr = String(value).trim();
    const parsed = new Date(dateStr);
    return !isNaN(parsed.getTime()) ? this.formatDateTimeForApi(parsed) : dateStr;
  }

  formatDateTimeForApi(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ms = String(date.getMilliseconds()).padStart(3, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${ms}`;
  }

  parseAmount(value: any): number {
    if (typeof value === 'number') return Math.abs(value);
    const str = String(value || '').replace(/[₹$,\s]/g, '').replace(/\(([^)]+)\)/, '-$1');
    const num = parseFloat(str);
    return isNaN(num) ? 0 : Math.abs(num);
  }

  goBack(): void {
    if (this.uploadStep > 1) this.uploadStep--;
  }

  // Store all pending requests for matching (not just current page)
  allPendingRequests: any[] = [];
  isFetchingAllPending: boolean = false;

  /**
   * Fetch ALL pending requests for matching (ignores pagination)
   */
  fetchAllPendingRequests(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const dtFrom = this.byManualAdminForm.value.dtFrom + ' 00:00:01';
      const dtTo = this.byManualAdminForm.value.dtTo + ' 23:59:59';

      const obj = {
        dtFrom,
        dtTo,
        Value: '',
        oType: 0,
        Initial: 1,
        MaxCount: 10000, // Fetch all records
        Reserve1: 1,
        Reserve2: '1',
        Reserve3: this.selectedBank ? this.selectedBank.BankID : 0
      };

      this.api.getManualTranRec(obj).subscribe({
        next: (data: any) => {
          if (data.oTrans && data.oTrans.length > 0) {
            this.allPendingRequests = data.oTrans;
            console.log(`Fetched ${this.allPendingRequests.length} pending requests for matching`);
            resolve(this.allPendingRequests);
          } else {
            this.allPendingRequests = [];
            resolve([]);
          }
        },
        error: (err) => {
          console.error('Error fetching all pending requests:', err);
          reject(err);
        }
      });
    });
  }

  submitTransactions(): void {
    if (!this.currentJobId) {
      this.toster.error('No job ID available', 'Error');
      return;
    }

    if (!this.selectedBank) {
      this.toster.error('No bank selected', 'Error');
      return;
    }

    this.startReconLoader();

    this.fetchAllPendingRequests().then((allPending) => {
      if (allPending.length === 0) {
        this.stopReconLoader();
        this.toster.warning('No pending transactions found', 'Warning');
        return;
      }

      this.performBackendMatching(allPending);
    }).catch((err) => {
      this.stopReconLoader();
      console.error('Error fetching all pending requests:', err);
      this.toster.error('Failed to fetch pending requests', 'Error');
    });
  }

  /**
   * Call backend /api/job/:id/match endpoint for matching
   * This processes ALL Excel rows on the server, not just preview rows
   */
  performBackendMatching(allPending: any[]): void {
    const payload = {
      pendingTransactions: allPending.map(p => ({
        UTR: p.UTR,
        Amount: p.Amount,
        Reference: p.Reference,
        PayId: p.PayId,
        UserID: p.UserID,
        RemarkID: p.RemarkID
      })),
      columnMapping: {
        utr: this.columnMapping.utr,
        amount: this.columnMapping.amount,
        date: this.columnMapping.transactionTime,
        remarks: this.columnMapping.remarks,
        status: this.columnMapping.status
      },
      sheetIndex: this.getSelectedSheetIndex()
    };

    console.log('Calling backend matching with', {
      jobId: this.currentJobId,
      pendingCount: allPending.length,
      columnMapping: payload.columnMapping,
      sheetIndex: payload.sheetIndex
    });

    this.http.post<any>(`${RECONCILE_API}/job/${this.currentJobId}/match`, payload).subscribe({
      next: (response) => {
        this.verifyResults = [];
        this.matchedUTRs.clear();

        for (const match of response.matched || []) {
          const excelUTR = (match.excel?.UTR || '').toLowerCase().trim();
          this.matchedUTRs.add(excelUTR);

          this.verifyResults.push({
            Amount: match.excel?.Amount || 0,
            BankID: this.selectedBank!.BankID,
            Reference: match.pending?.Reference || '',
            RemarkID: match.pending?.RemarkID || 0,
            Status: 2,
            UTR: match.excel?.UTR || '',
            UserID: match.pending?.UserID || 0,
            PendingAmount: match.pending?.Amount,
            AmountMatch: match.amountMatch
          });
        }

        for (const notFound of response.notFound || []) {
          this.verifyResults.push({
            Amount: notFound.Amount || 0,
            BankID: this.selectedBank!.BankID,
            Reference: '-',
            RemarkID: 0,
            Status: 1,
            UTR: notFound.UTR || '',
            UserID: 0
          });
        }

        this.successCount = response.summary?.matched || 0;
        this.failedCount = response.summary?.notFound || 0;

        this.uploadStep = 4;
        this.stopReconLoader();

        if (this.successCount > 0) {
          this.toster.success(`${this.successCount} transaction(s) matched`, 'Success');
        }
        if (this.failedCount > 0) {
          this.toster.warning(`${this.failedCount} transaction(s) not found`, 'Warning');
        }

        console.log('Backend matching results:', {
          totalExcelRows: response.summary?.totalExcelRows,
          totalPending: response.summary?.totalPendingTransactions,
          matched: this.successCount,
          notFound: this.failedCount,
          processingTimeMs: response.summary?.processingTimeMs,
          matchedUTRs: Array.from(this.matchedUTRs)
        });
      },
      error: (err) => {
        console.error('Backend matching error:', err);
        this.toster.warning('Backend matching failed, using client-side matching', 'Warning');
        this.performClientSideMatching(allPending);
      }
    });
  }

  /**
   * Fallback: Perform client-side matching with duplicate handling
   * Used when backend matching fails or for small files
   */
  performClientSideMatching(allPending: any[]): void {
    this.verifyResults = [];
    this.matchedUTRs.clear();

    const matchedPendingIds = new Set<string>();

    for (const excelTxn of this.mappedTransactions) {
      const excelUTR = excelTxn.UTR.toLowerCase().trim();
      const excelAmount = excelTxn.Amt;

      const matchedRequest = allPending.find((pending: any) => {
        const pendingUTR = (pending.UTR || '').toLowerCase().trim();
        const pendingId = pending.Reference || pending.PayId;
        return pendingUTR === excelUTR && !matchedPendingIds.has(pendingId);
      });

      if (matchedRequest) {
        const pendingId = matchedRequest.Reference || matchedRequest.PayId;
        matchedPendingIds.add(pendingId);

        const amountMatches = Math.abs(excelAmount - matchedRequest.Amount) < 0.01;

        this.verifyResults.push({
          Amount: excelAmount,
          BankID: this.selectedBank!.BankID,
          Reference: matchedRequest.Reference || '',
          RemarkID: matchedRequest.RemarkID || 0,
          Status: 2,
          UTR: excelTxn.UTR,
          UserID: matchedRequest.UserID || 0,
          PendingAmount: matchedRequest.Amount,
          AmountMatch: amountMatches
        });

        this.matchedUTRs.add(excelUTR);
      } else {
        this.verifyResults.push({
          Amount: excelAmount,
          BankID: this.selectedBank!.BankID,
          Reference: '-',
          RemarkID: 0,
          Status: 1,
          UTR: excelTxn.UTR,
          UserID: 0
        });
      }
    }

    this.successCount = this.verifyResults.filter(r => r.Status === 2).length;
    this.failedCount = this.verifyResults.filter(r => r.Status === 1).length;

    this.uploadStep = 4;
    this.stopReconLoader();

    if (this.successCount > 0) {
      this.toster.success(`${this.successCount} transaction(s) matched`, 'Success');
    }
    if (this.failedCount > 0) {
      this.toster.warning(`${this.failedCount} transaction(s) not found`, 'Warning');
    }

    console.log('Client-side matching results:', {
      totalExcel: this.mappedTransactions.length,
      totalPending: allPending.length,
      matched: this.successCount,
      notFound: this.failedCount,
      matchedUTRs: Array.from(this.matchedUTRs),
      matchedPendingIds: Array.from(matchedPendingIds)
    });
  }

  /**
   * Check if a transaction's UTR was matched in Excel verification
   */
  isTransactionMatched(utr: string): boolean {
    if (!utr) return false;
    return this.matchedUTRs.has(utr.toLowerCase().trim());
  }

  /**
   * Clear all matched UTRs (e.g., when switching banks)
   */
  clearMatchedUTRs(): void {
    this.matchedUTRs.clear();
  }

  getVerifyStatusText(status: number): string {
    switch (status) {
      case 2: return 'Matched';      // Status 2 = Success
      case 1: return 'Not Found';    // Status 1 = Pending/Not Found
      default: return 'Pending';
    }
  }

  getVerifyStatusClass(status: number): string {
    switch (status) {
      case 2: return 'badge-soft-success';   // Status 2 = Success (green)
      case 1: return 'badge-soft-danger';    // Status 1 = Not Found (red)
      default: return 'badge-soft-warning';
    }
  }
  onResultsDone(): void {
    let message = '';
    let icon: 'warning' | 'question' = 'question';

    if (this.successCount > 0) {
      message =
        'Please make sure you have updated the matched transactions.Continuing will reset the current screen.';
      icon = 'warning';
    } else {
      message =
        'No matched transactions were found in this statement. Do you want to proceed with uploading a new statement?';
      icon = 'question';
    }

    Swal.fire({
      title: 'Confirmation',
      text: message,
      icon,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Continue',
      cancelButtonText: 'Cancel',
      allowOutsideClick: false,
    }).then((result: any) => {
      // successCount > 0
      if (this.successCount > 0) {
        if (result.isConfirmed) {
          // Yes => stay on same screen, only close Swal
          this.closeUploadSection();
          return;
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          // No => reset whole component

        }
        return;
      }

      // successCount === 0
      if (result.isConfirmed) {
        // Yes => reset whole component
        this.closeUploadSection();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // No => stay where you are, only close Swal
        return;
      }
    });
  }
  closeUploadSection(): void {
    this.resetUploadState();
  }

  // ==================== EXISTING METHODS ====================

  selctDrop1(ev: any) {
    this.dropval1 = ev.target.value;
    this.dropSec = this.dropval1 == 6;
  }

  selctDrop2(ev: any) {
    this.searchVal = ev.target.value;
  }

  updatedDate: any;
  getManRec() {
    this.page = 1;
    let data = {
      oType: this.dropval1,
      Value: this.searchVal,
      Initial: 0,
      MaxCount: 100,
      dtFrom: this.lastDaysDate + ' 00:00:01',
      dtTo: this.updatedDate + ' 23:59:59',
    };
    if (this.searchVal != '') this.crossIcon = true;
    this.shared.loader(true);
    this.api.getManualTranRec(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false);
        this.manRecList = res.oTrans;
      },
      error: (err: any) => {
        this.shared.loader(false);
        this.toster.error('Something went wrong', 'Error');
      },
    });
  }

  clear() {
    this.searchVal = '';
    this.dropval1 = 0;
    this.crossIcon = false;
    this.getManRec();
  }

  dateFrom: any = '';
  dateTo: any = '';
  dateSelectFromTO(ev: any, val: any) {
    if (val == 'from') {
      this.dateFrom = ev.target.value;
      this.lastDaysDate = ev.target.value;
    } else {
      this.dateTo = ev.target.value;
      this.updatedDate = ev.target.value;
    }
  }

  dateCustom() {
    this.customDate = '';
    this.getManRec();
  }

  transformDate() {
    const date = new Date();
    this.updatedDate = this.datePipe.transform(date, 'yyyy-MM-dd');
  }

  customDate: any;
  dateSelect: any = 7;
  lastDaysDate: any;
  dateChange() {
    const currentDate = new Date();
    for (let i = 0; i < this.dateSelect; i++) {
      const previousDate = new Date();
      previousDate.setDate(currentDate.getDate() - i);
      this.lastDaysDate = formatDate(previousDate, 'yyyy-MM-dd', 'en-US');
    }
    this.transformDate();
    return this.lastDaysDate;
  }

  updateManTran(ev: any, val: any) {
    let data = { Key: '', Field1: String(val.PayId), Field2: String(ev.target.value) };
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to change status',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes!',
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.shared.loader(true);
        this.api.updateManTranRec(data).subscribe({
          next: (res: any) => {
            this.shared.loader(false);
            if (res.Result) {
              this.toster.success(res.MSG_USER, 'Success');
              this.getManRec();
            } else {
              this.toster.error(res.MSG_USER, 'Error');
            }
          },
          error: () => {
            this.shared.loader(false);
            this.toster.error('Something went wrong', 'Error');
          },
        });
      } else {
        this.getManRec();
      }
    });
  }

  customSear: boolean = false;
  activeClass: any = 0;
  oFilter: any = 1;
  showDateRange(event: any): void {
    const selectedOption = event;
    const today = new Date();
    let dtStart: string;
    let dtEnd: string = this.getCurrentDate();

    if (selectedOption === 1) {
      this.page = 1; this.activeClass = 0;
      const d = new Date(today); d.setDate(today.getDate() - 6);
      dtStart = this.formatDate(d);
    } else if (selectedOption === 2) {
      this.page = 1; this.activeClass = 0;
      const d = new Date(today); d.setDate(today.getDate() - 29);
      dtStart = this.formatDate(d);
    } else if (selectedOption === 3) {
      this.page = 1; this.activeClass = 0;
      const d = new Date(today); d.setMonth(today.getMonth() - 3);
      dtStart = this.formatDate(d);
    } else if (selectedOption === 4) {
      this.page = 1; this.activeClass = 0;
      const d = new Date(today); d.setFullYear(today.getFullYear() - 1);
      dtStart = this.formatDate(d);
    } else if (selectedOption === 5) {
      this.activeClass = 1; this.customSear = true;
      return;
    } else {
      return;
    }

    this.byManualAdminForm.patchValue({ dtFrom: dtStart, dtTo: dtEnd });
    this.GET_PG_MG_ADM_MANUAL_RECPT(1, 10);
  }

  getCurrentDate(): string {
    return this.formatDate(new Date());
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  searchValue: any;
  selectedFilter: any = 0;
  count: any = 0;
  byManualData: any = [];
  totalAccountPending: any = 0;
  Count: any = 0;

  GET_PG_MG_ADM_MANUAL_RECPT(initialCount: any, maxCount: any) {
    this.Count = 0;
    this.totalAccountPending = 0;
    const dtFrom = this.byManualAdminForm.value.dtFrom + ' 00:00:01';
    const dtTo = this.byManualAdminForm.value.dtTo + ' 23:59:59';

    if (this.customSear) { this.page = 1; this.customSear = false; }
    console.log("this.searchValuethis.searchValue", this.searchValue)
    let obj = {
      dtFrom, dtTo,
      Value: this.searchValue,
      oType: this.selectedFilter,
      Initial: initialCount,
      MaxCount: maxCount,
      Reserve1: 1,
      Reserve2: '1',
      Reserve3: this.selectedBank ? this.selectedBank.BankID : 0  // BankID filter
    };

    this.shared.loader(true);
    this.api.getManualTranRec(obj).subscribe((data: any) => {
      if (data.oTrans != '') {
        this.byManualData = data.oTrans;
        this.filteredManualData = data.oTrans; // Display all returned data
        this.Count = data.Count;
        this.pager = this.pagination.getPager(this.Count, this.page, this.numRecord);
        this.sortLedgerData(() => this.shared.loader(false));
        this.totalAccountPending = data.Pending;
        this.shared.loader(false);
      } else {
        this.byManualData = [];
        this.filteredManualData = [];
        this.shared.loader(false);
      }
    });
  }

  filterTransactionsByStatus(transactions: any[]): any[] {
    if (this.statusFilter === 4) return transactions;
    return transactions.filter((t: any) => t.Status === this.statusFilter);
  }

  sortLedgerData(callback: () => void) {
    if (Array.isArray(this.byManualData)) {
      this.byManualData.sort((a: any, b: any) => new Date(b.dtCreated).getTime() - new Date(a.dtCreated).getTime());
    }
    callback();
  }

  selectedSearchType: any;
  onSearchTypeChange(event: any): void {
    this.searchValue = '';
    this.errorMessage = '';
    this.selectedSearchType = event;
  }

  filteredUsers: any = [];
  errorMessage: any = '';

  onSearchInput(event: any): void {
    const searchValue = event.target.value;

    if (searchValue.length >= 2) {
      // Trigger search after 2 characters
      const obj = {
        oType: this.selectedSearchType,
        Value: searchValue,
        Reserve1: '',
        Reserve2: 1, // Assuming source is Admin (1)
        Reserve3: '',
        Initial: 1,
        MaxCount: 100,
        dtFrom: '',
        dtTo: '',
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

  searching: boolean = true;

  typeFilter(filterType: any): void {
    this.searching = false;
    this.GET_PG_MG_ADM_MANUAL_RECPT(1, 10);
  }

  clearSearch(): void {
    this.searchValue = '';
    this.selectedFilter = 0;
    this.searching = true;
    this.GET_PG_MG_ADM_MANUAL_RECPT(1, 10);
  }

  showChat: boolean = false;
  referenceID: any;
  remarksID: any;
  chatHistory: any = [];
  isLoadingMessages: boolean = false;

  chatAdmin(val: any): void {
    this.showChat = true;
    this.referenceID = val.Reference;
    this.remarksID = val.RemarkID;
    this.GET_USERREMARKS(val.RemarkID);
  }

  closeChat(): void {
    this.showChat = false;
    this.chatHistory = [];
  }

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
      } catch (err) { }
    }
  }

  ADD_USER_REMARKS(myIdFromStatus?: any): void {
    let obj = {
      RemarkID: this.remarksID || myIdFromStatus,
      Message: this.chatForm.value.message || this.remark,
      Attachment: '',
      CreatedBy: 0,
      ReadFlag: this.chatForm.value.showAdmin || 0,
    };
    this.api.ADD_USERREMARKS(obj).subscribe((data: any) => {
      if (data.Result) {
        this.chatForm.patchValue({ message: '', showAdmin: 0 });
        this.cdr.detectChanges();
        this.GET_USERREMARKS(this.remarksID);
      } else {
        this.toster.error('Message could not be sent.');
      }
    });
  }

  modRef: any;
  profileID: any;
  agentID: any;
  transAmount: any;
  userName: any;
  userEmail: any;
  UserCode: any;
  UserID: any;
  openLg3(content3: any, val: any): void {
    if (this.execPermissions?.some((p: any) => p.Master === 'Finance' && p.SubMasters.some((s: any) => s.SubMaster === 'Transaction' && s.Edit === 0))) {
      this.toster.error('Permission Denied', 'Error');
      return;
    }
    this.modRef = this.modalService.open(content3, { size: 'md modalone', centered: true, windowClass: 'flip-modal' });
    this.payId = val.PayId;
    this.statusReference = val.Reference;
    this.transAmount = val.Amount;
    this.userName = val.UserName;
    this.UserCode = val.UserCode;
    this.UserID = val.UserID;
    this.userEmail = val.Email;
    this.statusUpdateForm.patchValue({ Reference: this.statusReference, PayID: this.payId, Amount: this.transAmount, Waive_Fee: 0, Status: 0 });
    this.agentID = val.Agent;
    this.profileID = val.UserID;
  }

  closeModal(): void {
    this.modRef.close();
    this.statusUpdateForm.reset();
    this.userName = '';
    this.userEmail = '';
    this.statusUpdateForm.patchValue({ Waive_Fee: 0 });
  }

  getStatusText(status: number): string {
    switch (status) {
      case 1: return 'Pending';
      case 5: return 'Success';
      case 3: return 'Reject';
      default: return '';
    }
  }

  onKeyPress(event: any): void {
    const input = event.target as HTMLInputElement;
    const regex = /^[0-9]+(\.[0-9]{0,2})?$/;
    if (!regex.test(input.value + event.key)) event.preventDefault();
  }

  onCheckboxChange(event: any): void {
    this.statusUpdateForm.patchValue({ Waive_Fee: event.target.checked ? 1 : 0 });
  }

  // UPDATE_TRANS_MANUAL_TRANS_RECEIPT(): void {
  //   if (this.statusUpdateForm.value.Status == 3 && (!this.remark || !this.remark.trim())) return;
  //   let obj = {
  //     Key: '',
  //     PayID: this.payId,
  //     Amount: this.statusUpdateForm.value.Amount,
  //     Reference: this.statusReference,
  //     Waive_Fee: this.statusUpdateForm.value.Waive_Fee,
  //     Status: Number(this.statusUpdateForm.value.Status),
  //     Profile: this.profileID,
  //     AgentID: this.agtId,
  //   };
  //   const removedRow = this.byManualData.find((item: any) => item.Reference == this.statusReference);
  //   const updatedStatus = Number(this.statusUpdateForm.value.Status);
  //   const memberUserCode = this.UserID;
  //   const memberAmount = obj.Amount;

  //   this.shared.loader(true);
  //   this.api.UPDATE_TRANS_MANUAL_TRANS_RECEIPT(obj).subscribe((data: any) => {
  //     if (data.Result) {
  //       this.page = 1
  //       this.shared.loader(false);
  //       this.toster.success('Status Updated successfully.');
  //       this.ADD_USER_REMARKS(removedRow.RemarkID);

  //       // Trigger member activation if approved
  //       if (updatedStatus === 5 && memberUserCode) {
  //         this.api.activeMemberWithoutToken(memberUserCode, memberAmount).subscribe({
  //           next: (activeRes: any) => {
  //             console.log('Member activation response:', activeRes);
  //             // this.toster.success('Member activation process completed.', 'Success');
  //           },
  //           error: (activeErr: any) => {
  //             console.error('Member activation error:', activeErr);
  //             // this.toster.error('Failed to trigger member activation.', 'Activation Error');
  //           }
  //         });
  //       }

  //       this.GET_PG_MG_ADM_MANUAL_RECPT(1, 10);
  //       this.statusUpdateForm.reset();
  //       this.closeModal();
  //     } else {
  //       this.toster.error('Something went wrong.');
  //       this.shared.loader(false);
  //       this.statusUpdateForm.reset();
  //       this.closeModal();
  //       this.GET_PG_MG_ADM_MANUAL_RECPT(1, 10);
  //     }
  //   });
  // }
  // UPDATE_TRANS_MANUAL_TRANS_RECEIPT(): void {

  //   if (
  //     this.statusUpdateForm.value.Status == 3 &&
  //     (!this.remark || !this.remark.trim())
  //   ) return;

  //   let obj = {
  //     Key: '',
  //     PayID: this.payId,
  //     Amount: this.statusUpdateForm.value.Amount,
  //     Reference: this.statusReference,
  //     Waive_Fee: this.statusUpdateForm.value.Waive_Fee,
  //     Status: Number(this.statusUpdateForm.value.Status),
  //     Profile: this.profileID,
  //     AgentID: this.agtId,
  //   };

  //   const removedRow = this.byManualData.find(
  //     (item: any) => item.Reference == this.statusReference
  //   );

  //   const updatedStatus = Number(
  //     this.statusUpdateForm.value.Status
  //   );

  //   const memberUserCode = this.UserID;

  //   const memberAmount = obj.Amount;

  //   this.shared.loader(true);

  //   // Main update API
  //   const updateApi =
  //     this.api.UPDATE_TRANS_MANUAL_TRANS_RECEIPT(obj);

  //   // Member activation API
  //   const memberApi =
  //     updatedStatus === 5 && memberUserCode
  //       ? this.api.activeMemberWithoutToken(
  //         memberUserCode,
  //         memberAmount
  //       )
  //       : null;

  //   // Run both simultaneously
  //   const apiCall = memberApi
  //     ? forkJoin({
  //       updateRes: updateApi,
  //       memberRes: memberApi
  //     })
  //     : forkJoin({
  //       updateRes: updateApi
  //     });

  //   apiCall.subscribe({

  //     next: (res: any) => {

  //       console.log('Update API:', res.updateRes);

  //       if (res.memberRes) {
  //         console.log(
  //           'Member Activation API:',
  //           res.memberRes
  //         );
  //       }

  //       const updateSuccess =
  //         res.updateRes?.Result === true;

  //       const memberSuccess =
  //         !res.memberRes ||
  //         res.memberRes?.code == '1';

  //       // BOTH SUCCESS
  //       if (updateSuccess && memberSuccess) {

  //         this.page = 1;

  //         this.toster.success(
  //           'Status Updated successfully.'
  //         );

  //         this.ADD_USER_REMARKS(
  //           removedRow.RemarkID
  //         );

  //         this.GET_PG_MG_ADM_MANUAL_RECPT(
  //           1,
  //           10
  //         );

  //         this.statusUpdateForm.reset();

  //         this.closeModal();

  //       } else {

  //         this.toster.error(
  //           'Something went wrong.'
  //         );
  //       }

  //       this.shared.loader(false);
  //     },

  //     error: (err: any) => {

  //       console.error('API Error:', err);

  //       this.shared.loader(false);

  //       this.toster.error(
  //         'Something went wrong.'
  //       );
  //     }

  //   });

  // }
  UPDATE_TRANS_MANUAL_TRANS_RECEIPT(): void {

    if (
      this.statusUpdateForm.value.Status == 3 &&
      (!this.remark || !this.remark.trim())
    ) return;

    let obj = {
      Key: '',
      PayID: this.payId,
      Amount: this.statusUpdateForm.value.Amount,
      Reference: this.statusReference,
      Waive_Fee: this.statusUpdateForm.value.Waive_Fee,
      Status: Number(this.statusUpdateForm.value.Status),
      Profile: this.profileID,
      AgentID: this.agtId,
    };

    const removedRow = this.byManualData.find(
      (item: any) => item.Reference == this.statusReference
    );

    const updatedStatus = Number(
      this.statusUpdateForm.value.Status
    );

    const memberUserCode = this.UserID;

    const memberAmount = obj.Amount;

    this.shared.loader(true);

    // FIRST API
    this.api.UPDATE_TRANS_MANUAL_TRANS_RECEIPT(obj)
      .subscribe({

        next: (data: any) => {

          console.log(
            'UPDATE_TRANS_MANUAL_TRANS_RECEIPT:',
            data
          );

          // FIRST API FAILED
          if (!data?.Result) {

            this.shared.loader(false);

            this.toster.error(
              'Something went wrong.'
            );

            return;
          }

          // IF STATUS IS NOT 5
          // ONLY FIRST API SUCCESS IS ENOUGH
          if (
            updatedStatus !== 5 ||
            !memberUserCode
          ) {

            this.shared.loader(false);

            this.page = 1;

            this.toster.success(
              'Status Updated successfully.'
            );

            this.ADD_USER_REMARKS(
              removedRow.RemarkID
            );

            this.GET_PG_MG_ADM_MANUAL_RECPT(
              1,
              10
            );

            this.statusUpdateForm.reset();

            this.closeModal();

            return;
          }

          // SECOND API
          this.api.activeMemberWithoutToken(
            memberUserCode,
            memberAmount
          ).subscribe({

            next: (activeRes: any) => {

              console.log(
                'activeMemberWithoutToken:',
                activeRes
              );

              const memberSuccess =
                activeRes?.code == '1';

              // SECOND API SUCCESS
              if (memberSuccess) {

                this.page = 1;

                this.toster.success(
                  'Status Updated successfully.'
                );

                this.ADD_USER_REMARKS(
                  removedRow.RemarkID
                );

                this.GET_PG_MG_ADM_MANUAL_RECPT(
                  1,
                  10
                );

                this.statusUpdateForm.reset();

                this.closeModal();

              } else {

                // SECOND API FAILED
                this.toster.error(
                  'Something went wrong.'
                );
              }

              this.shared.loader(false);
            },

            error: (err: any) => {

              console.error(
                'Member Activation Error:',
                err
              );

              this.shared.loader(false);

              this.toster.error(
                'Something went wrong.'
              );
            }

          });

        },

        error: (err: any) => {

          console.error(
            'Update Receipt Error:',
            err
          );

          this.shared.loader(false);

          this.toster.error(
            'Something went wrong.'
          );
        }

      });

  }
  onCheckboxChange2(event: Event): void {
    this.chatForm.patchValue({ showAdmin: (event.target as HTMLInputElement).checked ? 1 : 0 });
  }

  imgPreview: any;
  modref1: any;

  previewImg(uploadimagepreview: TemplateRef<any>, val: any): void {
    this.modref1 = this.modalService.open(uploadimagepreview, { centered: true });
    this.imgPreview = val.Receipt;
  }

  closeImagePreview(): void {
    this.modref1.close();
  }

  copyDetails(val: any): void {
    const dummyInput = document.createElement('textarea');
    dummyInput.style.position = 'absolute';
    dummyInput.style.left = '-9999px';
    document.body.appendChild(dummyInput);
    dummyInput.value = val;
    dummyInput.select();
    document.execCommand('copy');
    document.body.removeChild(dummyInput);
    this.toster.success('Reference copied successfully.', 'Success');
  }

  // =========================================================== export =====================================================
  private fetchAllRequests(): Promise<any[]> {
    return new Promise((resolve) => {
      const dtFrom = this.byManualAdminForm.value.dtFrom + ' 00:00:01';
      const dtTo = this.byManualAdminForm.value.dtTo + ' 23:59:59';
      const obj = {
        dtFrom, dtTo,
        Value: this.searchValue || '',
        oType: this.selectedFilter,
        Initial: 1,
        MaxCount: this.Count || 999999,
        Reserve1: 1,
        Reserve2: '1',
        Reserve3: this.selectedBank ? this.selectedBank.BankID : 0
      };
      this.api.getManualTranRec(obj).subscribe({
        next: (res: any) => resolve(res?.oTrans || []),
        error: () => resolve([]),
      });
    });
  }

  async exportCsv() {
    const items = await this.fetchAllRequests();
    const rows = items.map((item: any) => ({
      Timestamp: item.Timestamp || '',
      Code: item.UserCode || '',
      User: item.UserName || '',
      Email: item.Email || '',
      Amount: item.Amount || '',
      Bank: item.BankName || '',
      Reference: item.Reference || '',
      Status: item.Status ?? '',
      UTR: item.UTR || ''
    }));
    if (!rows.length) return;
    new ngxCsv(rows, 'DepositRequests', { headers: Object.keys(rows[0]) });
  }

  async exportExcel() {
    const items = await this.fetchAllRequests();
    const rows = items.map((item: any) => ({
      Timestamp: item.Timestamp || '',
      Code: item.UserCode || '',
      User: item.UserName || '',
      Email: item.Email || '',
      Amount: item.Amount || '',
      Bank: item.BankName || '',
      Reference: item.Reference || '',
      Status: item.Status ?? '',
      UTR: item.UTR || ''
    }));
    if (!rows.length) return;
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Requests');
    XLSX.writeFile(wb, 'DepositRequests.xlsx');
  }
  // =========================================================== pagination ======================================================

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
  setPage(page: number): void {
    this.page = page;
    if (page >= 1 && page <= this.pager.totalPages) {
      this.pager = this.pagination.getPager(this.Count, this.pageRecord, this.numRecord);
      this.pagedItems = this.byManualData.slice(this.pageRecord * page - this.pageRecord + 1, this.pageRecord * page);
      this.GET_PG_MG_ADM_MANUAL_RECPT(this.pageRecord * page - this.pageRecord + 1, this.pageRecord * page);
    }
  }
}
