import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, forkJoin, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  takeUntil,
} from 'rxjs/operators';
import { ApiService } from '../../servies/api.service';
import { SharedService } from '../../servies/shared/shared.service';

// ─────────────────── Interfaces ───────────────────

export interface SearchResult {
  Code: string;
  Name: string;
  Phone: string;
  Profile: number;
  Type: number;
}

export interface UserInfo {
  First: string;
  Last: string;
  Code: string | null;
  Phone: string;
  Email: string;
  DOB: string | null;
  KYC: number;
  Login: number;
  UserType: number;
  PkgID: number;
  CreditPkgID: number;
  WorkSpaceID: number;
  Profile: number;
  Stage: number;
  LastLogin: { Tm_Str: string };
  Created: { Tm_Str: string };
  MD_INFO?: any;
  DI_INFO?: any;
  Addr: {
    DOB: string;
    oUserAddr: {
      Address: string;
      City: string;
      State: string;
      Country: string;
      Zipcode: string;
    };
  };
}

export interface BankDetail {
  Account: string;
  Account_Name: string;
  Bank: string;
  Bank_Addr: string;
  Email: string;
  IFSC: string;
  Phone: string;
  ProfileId: number;
}

export interface AccountBalance {
  Account: string;
  Balance: number;
  Currency: string;
  Pending: number;
  Tag: string;
}

export interface KycDoc {
  Details: string;
  Details2: string;
  Details3: string;
  Path: string | null;
  oKYC_DOC: {
    oKYC_Type: number;
    oStatus: number;
    ProfileId: number;
  } | null;
  oStage: number;
}

export interface CommService {
  CommisionID?: number;
  CommisisonID?: number;  // typo variant seen in API
  Service?: string;       // some API versions use "Service"
  ServiceName?: string;   // some API versions use "ServiceName"
  ServiceID: number;
  SourceType?: number;
  lstComm: CommRow[];
}

export interface CommFeeEntry {
  FeeID?: number;
  oComm?: {
    Fee: number;
    Range_Max: number;
    Range_Min: number;
    oType: number;
  };
}

export interface CommRow {
  Range_Min: number;
  Range_Max: number;
  Commission_All: number;  // total deduction commission (shown in Commission column)
  Fee?: number;
  oType: number;           // deduction type: 1=%, 2=INR
  oHierCommType?: number;  // distribution type: 1=%, 2=INR
  Commission_RL?: number;  // Retailer
  Commission_MD?: number;  // Master Distributor
  Commission_DI?: number;  // Distributor
  Commission_AM?: number;  // Admin/AM
  // TDS flags: 1=yes, 2=no  (exact field names from API)
  MD_Tds?: number;
  DI_Tds?: number;
  RL_Tds?: number;
  RL_Deduct?: number;
  TDS_RL?:any;
  TDS_AM?:any;
  TDS_DI?:any;
  TDS_MD?:any;
}

export interface PkgMaster {
  PkgID: number;
  lstSource: number[];
  oPkg: { Commission: string; Default: number };
}

// ─────────────────── Component ───────────────────

@Component({
  selector: 'app-global-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './global-search.component.html',
  styleUrl: './global-search.component.scss',
})
export class GlobalSearchComponent implements OnInit, OnDestroy {
  // Search state
  searchQuery = '';
  searchResults: SearchResult[] = [];
  noResults = false;

  // Selected user state
  selectedUser: UserInfo | null = null;
  selfieUrl: string | null = null;
  bankDetails: BankDetail[] = [];
  balances: AccountBalance[] = [];
  kycDocs: KycDoc[] = [];

  // Limits/Permissions
  customLimits: any = null; // GET_RL_ASSIGNED_PKG(profileId)
  defaultLimits: any = null; // GET_RL_PKG_WK_LMT(workspaceId)
  combinedLimits: any[] = [];

  // Commission
  selectedPkgMaster: PkgMaster | null = null;
  selectedServiceType: number | null = null;
  commServices: CommService[] = [];
  commPkgName = '';
  selectedCommServiceId: number | null = null; // sub-filter

  // Loading states
  loading = {
    search: false,
    user: false,
    bank: false,
    balance: false,
    kyc: false,
    limits: false,
    commMaster: false,
    commDetail: false,
  };

  // Active section tab
  activeSection: 'info' | 'bank' | 'limits' | 'commission' | 'snapshot' =
    'info';

  // Search stream
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // KYC types to probe (1-11), type 6 = selfie handled separately
  // private readonly KYC_TYPES = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11];
  private readonly KYC_TYPES = [1, 2, 6, 7, 8, 11];
  serviceTypeLabels: Record<number, string> = {
    1: 'Money Transfer',
    2: 'Recharge',
    3: 'Booking',
    4: 'Utility Bill',
    5: 'Miscellaneous',
  };

  kycTypeLabels: Record<number, string> = {
    1: 'PAN Card',
    2: 'Aadhaar ID',
    3: 'Address Proof',
    4: 'Bank Statement',
    5: 'Signature',
    6: 'Selfie / Video',
    7: 'Agreement',
    8: 'GST',
    9: 'Cancelled Cheque',
    10: 'Utility Bill',
    11: 'Shop Details',
  };

  constructor(
    private api: ApiService,
    private shared: SharedService,
  ) {
    this.shared.setSidebrActiveClass('globalSearch');
  }

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(400),
        // distinctUntilChanged(),
        takeUntil(this.destroy$),
        switchMap((query) => {
          const trimmed = query.trim();
          if (!trimmed || trimmed.length < 2) {
            this.searchResults = [];
            this.noResults = false;
            this.loading.search = false;
            return of([]);
          }
          this.loading.search = true;
          const filterType = this.detectFilterType(trimmed);
          return this.api
            .GET_ADM_FILTER_USER({
              Key: '',
              FilterType: filterType,
              Value: trimmed,
            })
            .pipe(catchError(() => of([])));
        }),
      )
      .subscribe((res: any) => {
        this.loading.search = false;
        this.searchResults = Array.isArray(res) ? res : [];
        console.log('this.searchResults', this.searchResults);
        this.noResults =
          this.searchResults.length === 0 &&
          this.searchQuery.trim().length >= 2;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Search ───

  onSearchChange(): void {
    // Intentionally left blank, search is triggered by button click now.
  }

  onSearchClick(): void {
    const trimmed = this.searchQuery.trim();
    if (!trimmed || trimmed.length < 2) {
      this.searchResults = [];
      this.noResults = false;
      return;
    }
    this.loading.search = true;
    this.searchResults = [];
    this.noResults = false;
    const filterType = this.detectFilterType(trimmed);
    this.api
      .GET_ADM_FILTER_USER({ Key: '', FilterType: filterType, Value: trimmed })
      .pipe(catchError(() => of([])), takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.loading.search = false;
        this.searchResults = Array.isArray(res) ? res : [];
        this.noResults = this.searchResults.length === 0;
      });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchResults = [];
    this.noResults = false;
    this.resetUserState();
  }

  private resetUserState(): void {
    this.selectedUser = null;
    this.selfieUrl = null;
    this.bankDetails = [];
    this.balances = [];
    this.kycDocs = [];
    this.customLimits = null;
    this.defaultLimits = null;
    this.combinedLimits = [];
    this.commServices = [];
    this.selectedPkgMaster = null;
    this.selectedServiceType = null;
    this.selectedCommServiceId = null;
  }

  detectFilterType(value: string): number {
    if (/^\d+$/.test(value)) return 2;
    if (/^[a-zA-Z][-a-zA-Z0-9]*\d+/.test(value) || /^[Vv]-?\d+/.test(value))
      return 3;
    return 1;
  }

  // ─── Select User ───
  rCode: any;
  selectUser(result: SearchResult): void {
    this.rCode = result.Code;
    this.resetUserState();
    this.activeSection = 'info';
    this.loadUserDetails(result.Profile);
  }

  private loadUserDetails(profileId: number): void {
    this.loading.user = true;
    this.loading.bank = true;
    this.loading.balance = true;
    this.loading.kyc = true;

    // Step 1: parallel – user info, selfie, bank, balance
    forkJoin({
      selfie: this.api
        .GET_USER_KYC_INFO_GS({ ProfileId: profileId, Key: '', oKYC_Type: 6 })
        .pipe(catchError(() => of(null))),
      bank: this.api
        .GET_DB_USER_BENE_PROFILE(profileId)
        .pipe(catchError(() => of([]))),
      balance: this.api
        .GET_USER_ACCOUNT_BY_ID_PROFILE(profileId)
        .pipe(catchError(() => of([]))),
      userInfo: this.api
        .GET_USER_INFO({ profileId })
        .pipe(catchError(() => of(null))),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ selfie, bank, balance, userInfo }) => {
        // Selfie → profile picture
        if (selfie && (selfie as any).Path) {
          try {
            JSON.parse((selfie as any).Path);
            this.kycDocs.push(JSON.parse((selfie as any).Path));
          } catch {
            this.selfieUrl = (selfie as any).Path;
          }
        }
        this.loading.bank = false;
        this.bankDetails = Array.isArray(bank) ? (bank as BankDetail[]) : [];
        this.loading.balance = false;
        this.balances = Array.isArray(balance)
          ? (balance as AccountBalance[])
          : [];
        this.loading.user = false;
        if (userInfo) {
          this.selectedUser = userInfo as UserInfo;
          this.loadLimits(profileId, this.selectedUser.WorkSpaceID);
          this.loadCommMaster(this.selectedUser.PkgID);
        }
      });

    // Step 2: KYC docs – probe each type in parallel, keep only those with data
    const kycCalls = this.KYC_TYPES.map((t) =>
      this.api
        .GET_USER_KYC_INFO_GS({ ProfileId: profileId, Key: '', oKYC_Type: t })
        .pipe(catchError(() => of(null))),
    );
    forkJoin(kycCalls)
      .pipe(takeUntil(this.destroy$))
      .subscribe((results: any[]) => {
        this.loading.kyc = false;
        this.kycDocs = results.filter(
          (r) => r !== null && r?.oKYC_DOC !== null,
        ) as KycDoc[];
      });
  }

  /** Load both custom (by profileId) and default (by workspaceId) limits simultaneously */
  private loadLimits(profileId: number, workspaceId: number): void {
    this.loading.limits = true;
    forkJoin({
      custom: this.api
        .GET_RL_ASSIGNED_PKG({ Field1: String(profileId) })
        .pipe(catchError(() => of(null))),
      def: this.api
        .GET_RL_PKG_WK_LMT({ Field1: workspaceId })
        .pipe(catchError(() => of(null))),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ custom, def }) => {
        this.loading.limits = false;
        // API returns array – extract first element
        this.customLimits = Array.isArray(custom)
          ? (custom[0] ?? null)
          : custom;
        this.defaultLimits = Array.isArray(def) ? (def[0] ?? null) : def;
        this.generateCombinedLimits();
      });
  }

  private generateCombinedLimits(): void {
    const map = new Map<number, any>();
    const hasCustom = this.hasCustomLimitData();

    const processSvc = (svc: any, isCustom: boolean) => {
      const id = svc.ServID;
      if (!map.has(id)) {
        map.set(id, {
          Serv: svc.Serv,
          ServID: id,
          oConfig: svc.oConfig,
          defLimit: null,
          cusLimit: null,
        });
      }
      const entry = map.get(id);
      // Use Lmt_RL_Sender (Total Daily sender limit) for the limits columns
      const limitVal = svc.oLimit?.Lmt_RL_Sender ?? svc.Limit ?? null;
      if (isCustom) {
        entry.cusLimit = limitVal;
        entry.oConfig = svc.oConfig; // custom config overrides
      } else {
        entry.defLimit = limitVal;
        if (entry.oConfig == null) entry.oConfig = svc.oConfig;
      }
    };

    // Always seed default services for reference (provides defLimit values)
    this.getMtServices(this.defaultLimits).forEach((s) => processSvc(s, false));
    this.getAllRbuServices(this.defaultLimits).forEach((s) => processSvc(s, false));

    // Layer custom services on top
    this.getMtServices(this.customLimits).forEach((s) => processSvc(s, true));
    this.getAllRbuServices(this.customLimits).forEach((s) => processSvc(s, true));

    let allEntries = Array.from(map.values());

    // If user has individual package, only show services present in their custom package
    if (hasCustom) {
      const customIds = new Set<number>([
        ...this.getMtServices(this.customLimits).map((s: any) => s.ServID as number),
        ...this.getAllRbuServices(this.customLimits).map((s: any) => s.ServID as number),
      ]);
      allEntries = allEntries.filter((e) => customIds.has(e.ServID));
    }

    this.combinedLimits = allEntries;
  }

  private loadCommMaster(pkgId: number): void {
    this.loading.commMaster = true;
    this.api
      .GET_USER_PKG_MASTER_GS({ Key: '', Field1: String(pkgId) })
      .pipe(
        catchError(() => of([])),
        takeUntil(this.destroy$),
      )
      .subscribe((res: any) => {
        this.loading.commMaster = false;
        const arr = Array.isArray(res) ? (res as PkgMaster[]) : [];
        this.selectedPkgMaster =
          arr.find((p) => p.PkgID === pkgId) || arr[0] || null;
      });
  }

  onServiceTypeChange(type: number): void {
    if (!this.selectedUser || !type) return;
    this.selectedServiceType = type;
    this.selectedCommServiceId = null;
    this.loading.commDetail = true;
    this.commServices = [];
    this.api
      .GET_USER_PKG_INFO_GS({
        Key: '',
        Field1: String(this.selectedUser.PkgID),
        Field2: String(type),
      })
      .pipe(
        catchError(() => of(null)),
        takeUntil(this.destroy$),
      )
      .subscribe((res: any) => {
        this.loading.commDetail = false;
        console.log('[Commission API raw response]', res); // remove after confirming
        // Real API returns lstComm at root level (same as getUserPackInfo)
        const raw = Array.isArray(res?.lstComm)
          ? res.lstComm
          : Array.isArray(res?.lstServiceComm)
            ? res.lstServiceComm
            : Array.isArray(res)
              ? res
              : [];
        this.commServices = raw as CommService[];
        this.commPkgName = res?.oPkg?.Commission || '';
      });
  }

  // ─── Limit helpers ───

  /** lstMT rows: { Serv, ServID, oConfig, oLimit: { Lmt_Account_SenderID, Lmt_RL_Account, Lmt_RL_Sender } } */
  getMtServices(pkg: any): any[] {
    if (!pkg) return [];
    return Array.isArray(pkg.lstMT) ? pkg.lstMT : [];
  }

  /** lstRBU rows: { lstSrvice: [{Serv, ServID, oConfig, Limit}], oType } */
  getRbuGroups(pkg: any): any[] {
    if (!pkg) return [];
    return Array.isArray(pkg.lstRBU) ? pkg.lstRBU : [];
  }

  getAllRbuServices(pkg: any): any[] {
    if (!pkg) return [];
    const rbu: any[] = [];
    this.getRbuGroups(pkg).forEach((group: any) => {
      if (Array.isArray(group.lstSrvice)) rbu.push(...group.lstSrvice);
    });
    return rbu;
  }

  oTypeLabel(oType: number): string {
    const m: Record<number, string> = {
      2: 'Recharge',
      3: 'Booking',
      4: 'Utility Bill',
      5: 'Miscellaneous',
    };
    return m[oType] ?? `Type ${oType}`;
  }

  hasCustomLimitData(): boolean {
    return !!(
      this.customLimits &&
      (this.getMtServices(this.customLimits).length > 0 ||
        this.getRbuGroups(this.customLimits).length > 0)
    );
  }

  getActiveLimitsPkg(): any {
    return this.hasCustomLimitData() ? this.customLimits : this.defaultLimits;
  }

  getQuickpayLimits(): { entry: number; daily: number } {
    const pkg = this.getActiveLimitsPkg();
    if (!pkg || !Array.isArray(pkg.lstMT)) return { entry: 0, daily: 0 };
    // Find the enabled QuickPay (prefer QuickPay 1 if enabled, else QuickPay)
    const services = pkg.lstMT as any[];
    const qp1 = services.find((s: any) => (s.Serv === 'Quick Pay 1' || s.Serv === 'QuickPay1') && s.oConfig === 1);
    const qp  = services.find((s: any) => s.Serv === 'Quick Pay' && s.oConfig === 1);
    const chosen = qp1 || qp || services.find((s: any) => s.Serv === 'Quick Pay 1' || s.Serv === 'Quick Pay');
    console.log("sedgsdfgsdfgsdfg",{
      entry: chosen?.oLimit?.Lmt_Account_SenderID ?? 0,
      daily: chosen?.oLimit?.Lmt_RL_Sender ?? 0,
    });
    return {
      entry: chosen?.oLimit?.Lmt_Account_SenderID ?? 0,
      daily: chosen?.oLimit?.Lmt_RL_Sender ?? 0,
    };
  }

  // ─── Permission helpers ───

  /** Flatten all services (MT + all RBU lstSrvice groups) for oConfig display */
  getPermissionServices(pkg: any): any[] {
    if (!pkg) return [];
    const mt = Array.isArray(pkg.lstMT) ? pkg.lstMT : [];
    const rbu: any[] = [];
    if (Array.isArray(pkg.lstRBU)) {
      pkg.lstRBU.forEach((group: any) => {
        if (Array.isArray(group.lstSrvice)) rbu.push(...group.lstSrvice);
      });
    }
    return [...mt, ...rbu];
  }

  getConfigStatus(oConfig: number): { label: string; cls: string } {
    return oConfig === 1
      ? { label: 'Enabled', cls: 'status-verified' }
      : { label: 'Disabled', cls: 'status-rejected' };
  }

  getServiceKeys(row: any): string[] {
    return Object.keys(row || {}).filter((k) => k !== 'oConfig');
  }

  // ─── GST helpers ───

  isGstDoc(doc: KycDoc): boolean {
    return doc.Details === 'GST' || doc.oKYC_DOC?.oKYC_Type === 8;
  }

  /** Parse and return the full GST root object */
  parseGstRoot(path: string | null): any {
    if (!path) return null;
    try {
      const obj = JSON.parse(path);
      return obj?.result || obj || null;
    } catch {
      return null;
    }
  }

  downloadGstJson(path: string | null): void {
    if (!path) return;
    const blob = new Blob([path], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gst_data.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  /** Extract GSTIN number from the GST path JSON */
  getGstNumber(path: string | null): string {
    const root = this.parseGstRoot(path);
    return root?.gstin || root?.gstnRecords?.[0]?.gstin || '—';
  }

  downloadGstPdf(doc: KycDoc): void {
    const root = this.parseGstRoot(doc.Path);
    const gstDetails = root?.gstnDetailed || root; // fallback to root if no detailed object
    if (!gstDetails) {
      this.downloadGstJson(doc.Path);
      return;
    }
    import('jspdf')
      .then(({ jsPDF }: any) => {
        const pdf = new jsPDF();
        const gstin = this.getGstNumber(doc.Path);
        pdf.setFontSize(18);
        pdf.setTextColor(40, 40, 40);
        pdf.text('GST Certificate', 14, 20);
        pdf.setFontSize(11);
        pdf.setTextColor(80, 80, 80);
        pdf.text(`GSTIN: ${gstin}`, 14, 30);
        pdf.setDrawColor(200, 200, 200);
        pdf.line(14, 34, 196, 34);
        let y = 42;
        const skip = new Set([
          'additionalAddressArray',
          'additionalPlaceSplitAddress',
          'principalPlaceSplitAddress',
          'natureOfBusinessActivities',
          'gstnRecords',
        ]);
        for (const [key, val] of Object.entries(gstDetails)) {
          if (skip.has(key) || typeof val === 'object') continue;
          pdf.setFontSize(9);
          pdf.setTextColor(120, 120, 120);
          pdf.text(this.camelToLabel(key) + ':', 14, y);
          pdf.setFontSize(10);
          pdf.setTextColor(40, 40, 40);
          const lines = pdf.splitTextToSize(String(val || '—'), 100);
          pdf.text(lines, 90, y);
          y += lines.length * 6 + 2;
          if (y > 275) {
            pdf.addPage();
            y = 20;
          }
        }
        pdf.save(`GST_${gstin}.pdf`);
      })
      .catch(() => this.downloadGstJson(doc.Path));
  }

  gstEntries(gst: any): { key: string; value: string }[] {
    const skip = new Set([
      'additionalAddressArray',
      'additionalPlaceSplitAddress',
      'principalPlaceSplitAddress',
      'natureOfBusinessActivities',
    ]);
    return Object.entries(gst || {})
      .filter(([k]) => !skip.has(k))
      .map(([k, v]) => ({
        key: this.camelToLabel(k),
        value: String(v || '—'),
      }));
  }

  private camelToLabel(str: string): string {
    return str.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
  }

  // ─── Commission helpers ───

  get displayedCommServices(): CommService[] {
    if (this.selectedCommServiceId === null) return this.commServices;
    return this.commServices.filter(
      (s) => s.ServiceID === this.selectedCommServiceId,
    );
  }

  /** Service display name — handles both "Service" and "ServiceName" field names */
  // getCommSvcName(svc: CommService): string {
  //   return svc.ServiceName || svc.Service || '—';
  // }

  /**
   * Normalize a commission row — handles two API shapes:
   *   Flat (real API): { Range_Min, Range_Max, Commission_All, oType, oHierCommType, Commission_MD, ... }
   *   Nested (legacy): { FeeID, oComm: { Fee, Range_Min, Range_Max, oType } }
   */
  // getCommRowData(entry: any): CommRow {
  //   if (entry?.oComm != null) {
  //     // nested shape fallback
  //     return {
  //       Range_Min:      entry.oComm.Range_Min  ?? 0,
  //       Range_Max:      entry.oComm.Range_Max  ?? 0,
  //       Commission_All: entry.oComm.Fee        ?? 0,
  //       oType:          entry.oComm.oType      ?? 1,
  //       oHierCommType:  entry.oHierCommType,
  //       Commission_RL:  entry.Commission_RL,
  //       Commission_MD:  entry.Commission_MD,
  //       Commission_DI:  entry.Commission_DI,
  //       Commission_AM:  entry.Commission_AM,
  //       MD_Tds:         entry.MD_Tds,
  //       DI_Tds:         entry.DI_Tds,
  //       RL_Tds:         entry.RL_Tds,
  //     };
  //   }
  //   // Flat shape (real API)
  //   return entry as CommRow;
  // }

  /** Format deduction type label */
  getDeductionType(oType: number): string {
    return oType === 2 ? 'INR' : '%';
  }

  /** Format distribution type label */
  getDistributionType(oHierCommType: number | undefined): string {
    if (oHierCommType == null) return '%';
    return oHierCommType === 2 ? 'INR' : '%';
  }

  // ─── Snapshot ───

  takeSnapshot(): void {
    const el = document.querySelector('.gs-right') as HTMLElement;
    const sectionEl = document.querySelector('.gs-section') as HTMLElement;
    if (!el) return;

    // Save original styles to restore them later
    const origRightHeight = el.style.height;
    const origRightOverflow = el.style.overflow;
    const origSecOverflow = sectionEl ? sectionEl.style.overflowY : '';
    const origSecFlex = sectionEl ? sectionEl.style.flex : '';
    const origSecHeight = sectionEl ? sectionEl.style.height : '';

    // Expand the elements to their full content height
    el.style.height = 'max-content';
    el.style.overflow = 'visible';
    if (sectionEl) {
      sectionEl.style.overflowY = 'visible';
      sectionEl.style.flex = 'none';
      sectionEl.style.height = 'max-content';
    }

    // @ts-ignore
    import('html2canvas')
      .then((module) => {
        const html2canvas = module.default || module;
        html2canvas(el, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#f3f3f3',
        }).then((canvas: HTMLCanvasElement) => {
          // Restore original styles
          el.style.height = origRightHeight;
          el.style.overflow = origRightOverflow;
          if (sectionEl) {
            sectionEl.style.overflowY = origSecOverflow;
            sectionEl.style.flex = origSecFlex;
            sectionEl.style.height = origSecHeight;
          }

          // Trigger download
          const imgData = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.href = imgData;
          const name = this.getUserFullName(this.selectedUser) || 'user';
          a.download = `snapshot_${name.replace(/\s+/g, '_')}_${this.activeSection}.png`;
          a.click();
        });
      })
      .catch((err) => {
        console.error('Snapshot failed', err);
        // Restore original styles on error
        el.style.height = origRightHeight;
        el.style.overflow = origRightOverflow;
        if (sectionEl) {
          sectionEl.style.overflowY = origSecOverflow;
          sectionEl.style.flex = origSecFlex;
          sectionEl.style.height = origSecHeight;
        }
      });
  }

  // ─── Section ───

  setActiveSection(section: typeof this.activeSection): void {
    this.activeSection = section;
  }

  // ─── Generic helpers ───

  getUserTypeLabel(type: number): string {
    const map: Record<number, string> = {
      1: 'Master',
      2: 'Distributor',
      3: 'Retailer',
    };
    return map[type] ?? `Type ${type}`;
  }

  getUserTypeBadgeClass(type: number): string {
    const map: Record<number, string> = {
      1: 'badge-admin',
      2: 'badge-di',
      3: 'badge-rl',
    };
    return map[type] ?? 'badge-default';
  }

  // getKycStatusLabel(kyc: number): string {
  //   const map: Record<number, string> = {
  //     0: 'Not Started',
  //     1: 'Pending',
  //     2: 'In Review',
  //     3: 'Rejected',
  //     4: 'Partial',
  //     5: 'Verified',
  //     6: 'Blocked',
  //   };
  //   return map[kyc] ?? `Status ${kyc}`;
  // }
  getKycStatusLabel(kyc: number): string {
    const map: Record<number, string> = {
      1: 'Pending',
      2: 'Verified',
      3: 'Rejected',
      5: 'Verified',
    };
    return map[kyc] ?? 'Unknown';
  }
  getKycStatusClass(kyc: number): string {
    if (kyc === 2 || kyc === 5) return 'status-verified';
    if (kyc === 3) return 'status-rejected';
    if (kyc === 1) return 'status-pending';
    return 'status-na';
  }

  getLoginStatusLabel(login: number): string {
    const map: Record<number, string> = {
      1: 'Inactive',
      2: 'Active',
      3: 'Blocked',
      4: 'Suspended',
      5: 'Active',
    };
    return map[login] ?? `Status ${login}`;
  }

  getLoginStatusClass(login: number): string {
    if (login === 2 || login === 5) return 'status-verified';
    if (login === 3 || login === 4) return 'status-rejected';
    return 'status-pending';
  }

  getKycTypeName(type: number): string {
    return this.kycTypeLabels[type] ?? `Doc Type ${type}`;
  }


  getKycDocStatusLabel(status: number): string {
    const map: Record<number, string> = {
      1: 'Verified',
      2: 'Verified',
      3: 'Rejected',
      5: 'Verified',
    };
    return map[status] ?? 'Pending';
  }

  getKycDocStatusClass(status: number): string {
    if (status === 2 || status === 1) return 'status-verified';
    if (status === 3) return 'status-rejected';
    return 'status-pending';
  }

  getBalanceByTag(tag: string): AccountBalance | undefined {
    return this.balances.find((b) => b.Tag === tag);
  }

  getMdDiInfo(info: any): string {
    console.log('----info', info);
    if (!info) return '—';
    const name = info.Name || '';
    const phone = info.Phone || '';
    if (!name && !phone) return '—';
    return `${name} ${phone ? `(${phone})` : ''}`.trim();
  }

  getUserFullName(user: UserInfo | null): string {
    if (!user) return '';
    return `${user.First || ''} ${user.Last || ''}`.trim();
  }

  getUserInitials(user: UserInfo): string {
    return (
      (
        (user.First || '').charAt(0) + (user.Last || '').charAt(0)
      ).toUpperCase() || '?'
    );
  }

  getResultInitials(result: SearchResult): string {
    const parts = (result.Name || '').split(' ');
    return (
      (
        (parts[0]?.charAt(0) ?? '') + (parts[1]?.charAt(0) ?? '')
      ).toUpperCase() || '?'
    );
  }

  downloadDoc(url: string): void {
    window.open(url, '_blank');
  }

  getServiceTypeList(): number[] {
    return this.selectedPkgMaster?.lstSource ?? [];
  }

  getCommRowType(type: number): string {
    return type === 2 ? 'INR' : '%';
  }

  /** Service display name — handles both "Service" and "ServiceName" field names */
  getCommSvcName(svc: CommService): string {
    return svc.Service || svc.ServiceName || '—';
  }

  /**
   * Normalize a commission row — handles two API shapes:
   *   Flat (actual):   { Fee, Range_Min, Range_Max, oType, Commission_RL, ... }
   *   Nested (legacy): { FeeID, oComm: { Fee, Range_Min, Range_Max, oType } }
   */
  getCommRowData(entry: any): CommRow {
    if (entry?.oComm != null) {
      return {
        Fee:            entry.oComm.Fee        ?? 0,
        Range_Min:      entry.oComm.Range_Min  ?? 0,
        Range_Max:      entry.oComm.Range_Max  ?? 0,
        oType:          entry.oComm.oType      ?? 1,
        Commission_RL:  entry.Commission_RL,
        Commission_MD:  entry.Commission_MD,
        Commission_DI:  entry.Commission_DI,
        Commission_AM:  entry.Commission_AM,
        Commission_All: entry.Commission_All,
        TDS_RL:         entry.TDS_RL,
        TDS_MD:         entry.TDS_MD,
        TDS_DI:         entry.TDS_DI,
        TDS_AM:         entry.TDS_AM,
      };
    }
    // Flat shape (the real API)
    return entry as CommRow;
  }

  /** Format commission fee display */
  formatCommFee(fee: number | undefined | null, oType: number | undefined | null): string {
    if (fee == null) return '—';
    return oType === 2 ? `${fee} ₹` : `${fee} %`;
  }

  /** Format a distribution cell e.g. "10 % TDS" or "20 ₹" */
  formatDistComm(val: number | undefined, oType: number, tds?: number): string {
    if (val == null || val === undefined) return '—';
    const typeStr = oType === 2 ? '₹' : '%';
    const tdsStr  = tds === 1 ? ' TDS' : '';
    return `${val} ${typeStr}${tdsStr}`;
  }

  trackByProfile(index: number, item: SearchResult): number {
    return item.Profile;
  }
  trackByServiceId(index: number, item: CommService): number {
    return item.ServiceID;
  }
  trackByBankId(index: number, item: BankDetail): string {
    return item.Account;
  }
  trackByIndex(index: number): number {
    return index;
  }

  downloadAnyFile(url: string, fallbackName: string): void {
    fetch(url)
      .then((res) => res.blob())
      .then((blob) => {
        const objectUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = fallbackName || 'document';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(objectUrl);
      })
      .catch(() => {
        // Fallback to opening in new tab if CORS fails
        window.open(url, '_blank');
      });
  }
}
