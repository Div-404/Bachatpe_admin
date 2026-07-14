import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../servies/shared/shared.service';
import { AlphaSpaceOnlyDirective } from '../../servies/alpha-space-only.directive';

type TabId = 'money' | 'recharge' | 'booking' | 'billing' | 'misc';
type Mode = 'add' | 'edit' | 'view';

interface LimitObject {
  Lmt_Account_SenderID: number;
  Lmt_RL_Account: number;
  Lmt_RL_Sender: number;
}

interface MTItem {
  Serv: string;
  ServID: number;
  oConfig: number;
  oLimit: LimitObject;
}

interface RBUService {
  Limit: number;
  Serv: string;
  ServID: number;
  oConfig: number;
}

interface RBUItem {
  oType: number;          // 2,3,4,5
  lstSrvice: RBUService[];
}

interface PackageItem {
  DefPkg: number;
  Pkg: string;
  PkgID: number;
  lstMT: MTItem[];
  lstRBU: RBUItem[];
}

// GET_SOURCE
interface SourceItem {
  APIId: number;
  Source: string;
  SourceId: number;
  Status: number;
  lstTag: string[];
  oType: number;
}

interface SourceGroup {
  Type: number; // 1..5
  lstSource: SourceItem[];
}

// simple row used for Recharge / Booking / Utility / Misc
interface SimpleRowM {
  sourceId: number;
  sourceName: string;
  type: number;    // 2,3,4,5
  enabled: boolean;
  limit: number;
  limit2: number;
  limit3: number;
}
interface SimpleRow {
  sourceId: number;
  sourceName: string;
  type: number;    // 2,3,4,5
  enabled: boolean;
  limit: number;
}

@Component({
  selector: 'app-add-lm-wk',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, AlphaSpaceOnlyDirective],
  templateUrl: './add-lm-wk.component.html',
  styleUrl: './add-lm-wk.component.scss'
})
export class AddLmWkComponent implements OnInit {
  // -------- mode ----------
  mode: Mode = 'add';
  pkgId: number | null = null;

  // -------- tabs from GET_SOURCE ----------
  tabs: { id: TabId; label: string; type: number }[] = [];
  libuysellTab: TabId | null = null;
  sourceGroups: SourceGroup[] = [];

  // raw package data (when coming from list screen)
  pkgData: PackageItem | null = null;

  // -------- top-level form fields ----------
  pkgName = '';
  defPkgChecked = false;

  // Money Transfer - DMT
  dmtEnabled = false;
  dmtRlSender?: number;
  dmtRlAccount?: number;
  dmtAccSenderId?: number;

  // Money Transfer - Payout
  payoutEnabled = false;
  payoutRlSender?: number;
  payoutRlAccount?: number;
  payoutAccSenderId?: number;

  // AePS (3 limits)
  aepsEnabled = false;
  aepsRlSender?: number;
  aepsRlAccount?: number;
  aepsAccSenderId?: number;

  // -------- dynamic RBU rows (from GET_SOURCE + GET_RL_PKG_WK_LMT) ----------
  moneyTransferRows: SimpleRowM[] = []; // Type = 1
  rechargeRows: SimpleRow[] = []; // Type = 2
  bookingRows: SimpleRow[] = [];  // Type = 3
  utilityRows: SimpleRow[] = [];  // Type = 4
  miscRows: SimpleRow[] = [];     // Type = 5

  submitting = false;

  private addEditUrl =
    'https://pay.bachatpay.co/Digi_CONF_API_bachatpay/ADD_EDIT_PKG_WK_LMT';
  private getSourceUrl =
    'https://pay.bachatpay.co/Digi_CONF_API_bachatpay/GET_SOURCE';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient, private toster: ToastrService, private shared: SharedService
  ) { }

  // -------- getters used in template ----------
  get isViewMode(): boolean {
    return this.mode === 'view';
  }
  get isEditMode(): boolean {
    return this.mode === 'edit';
  }
  get isAddMode(): boolean {
    return this.mode === 'add';
  }

  // -------- lifecycle ----------
  ngOnInit(): void {
    // mode + pkgId
    const m = this.route.snapshot.queryParamMap.get('mode');
    if (m === 'add' || m === 'edit' || m === 'view') {
      this.mode = m;
    }

    const idParam = this.route.snapshot.queryParamMap.get('pkgId');
    this.pkgId = idParam ? +idParam : null;

    // package data from previous screen (GET_RL_PKG_WK_LMT row)
    const state: any = history.state;
    if (state && state.pkg) {
      this.pkgData = state.pkg as PackageItem;
      this.pkgName = this.pkgData.Pkg;
      this.defPkgChecked = this.pkgData.DefPkg === 1;
      this.patchLimitsFromPackage(this.pkgData);
    }

    // always build tabs from GET_SOURCE (+ RBU rows)
    this.loadSourceTabs();
  }

  // -------- GET_SOURCE → tabs + dynamic rows ----------
  private loadSourceTabs(): void {
    this.http.get<SourceGroup[]>(this.getSourceUrl).subscribe({
      next: (res) => {
        console.log("reas", res);
        this.sourceGroups = Array.isArray(res) ? res : [];
        const tabs: { id: TabId; label: string; type: number }[] = [];

        for (const group of this.sourceGroups) {
          const id = this.mapTypeToTabId(group.Type);
          const label = this.mapTypeToLabel(group.Type);
          if (!id) continue;
          if (tabs.some((t) => t.id === id)) continue; // avoid duplicates
          tabs.push({ id, label, type: group.Type });
        }

        if (!tabs.length) {
          this.buildDefaultTabs();
        } else {
          this.tabs = tabs;
          this.libuysellTab = this.libuysellTab || this.tabs[0].id;
        }

        // build dynamic rows for Recharge/Booking/Utility/Misc
        this.buildRbuRowsFromSources();
      },
      error: (err) => {
        console.error('GET_SOURCE error:', err);
        this.buildDefaultTabs();
      }
    });
  }

  private mapTypeToTabId(type: number): TabId | null {
    switch (type) {
      case 1: return 'money';      // MONEY_TRANSFER
      case 2: return 'recharge';   // RECHARGE
      case 3: return 'booking';    // BOOKING
      case 4: return 'billing';    // UTILITY_BILL
      case 5: return 'misc';       // MISC_SERVICE
      default: return null;
    }
  }

  private mapTypeToLabel(type: number): string {
    switch (type) {
      case 1: return 'Money Transfer';
      case 2: return 'Recharge';
      case 3: return 'Booking';
      case 4: return 'Utility Bill';
      case 5: return 'Misc Service';
      default: return 'Unknown';
    }
  }

  private buildDefaultTabs(): void {
    this.tabs = [
      { id: 'money', label: 'Money Transfer', type: 1 },
      { id: 'recharge', label: 'Recharge', type: 2 },
      { id: 'booking', label: 'Booking', type: 3 },
      { id: 'billing', label: 'Utility Bill', type: 4 },
      { id: 'misc', label: 'Misc Service', type: 5 }
    ];
    this.libuysellTab = this.tabs[0].id;
  }

  // 🔹 dynamic rows for Type 2/3/4/5 from GET_SOURCE + pkgData.lstRBU
  // private buildRbuRowsFromSources(): void {
  //   // reset
  //   this.moneyTransferRows = [];
  //   this.rechargeRows = [];
  //   this.bookingRows = [];
  //   this.utilityRows = [];
  //   this.miscRows = [];

  //   const pkg = this.pkgData;

  //   // map existing lstRBU entries by (type + ServID)
  //   const existing = new Map<string, RBUService & { type: number }>();
  //   if (pkg && pkg.lstRBU) {
  //     for (const grp of pkg.lstRBU) {
  //       for (const s of grp.lstSrvice) {
  //         const key = `${grp.oType}_${s.ServID}`;
  //         existing.set(key, { ...s, type: grp.oType });
  //       }
  //     }
  //   }

  //   for (const grp of this.sourceGroups) {
  //     const type = grp.Type;
  //     let target: SimpleRow[] | null = null;

  //     if (type === 1) target = this.moneyTransferRows;
  //     else if (type === 2) target = this.rechargeRows;
  //     else if (type === 3) target = this.bookingRows;
  //     else if (type === 4) target = this.utilityRows;
  //     else if (type === 5) target = this.miscRows;
  //     else continue; // only RBU types

  //     for (const src of grp.lstSource) {
  //       // if (src.Status !== 1) continue; // only active sources

  //       const key = `${type}_${src.SourceId}`;
  //       const match = existing.get(key);

  //       const row: SimpleRow = {
  //         sourceId: src.SourceId,
  //         sourceName: src.Source,
  //         type,
  //         enabled: match ? (match.oConfig === 0 || match.oConfig === 1) : false,
  //         limit: match ? match.Limit : 0
  //       };

  //       console.log("row", row);
  //       target.push(row);
  //       console.log("target",target)
  //     }
  //   }
  // }
  private buildRbuRowsFromSources(): void {
    // reset
    this.moneyTransferRows = [];
    this.rechargeRows = [];
    this.bookingRows = [];
    this.utilityRows = [];
    this.miscRows = [];

    const pkg = this.pkgData;

    // ----- 1) Index existing RBU (types 2–5) by (type + ServID)
    const existingRbu = new Map<string, RBUService & { type: number }>();
    if (pkg?.lstRBU) {
      for (const grp of pkg.lstRBU) {
        for (const s of grp.lstSrvice) {
          const key = `${grp.oType}_${s.ServID}`;
          existingRbu.set(key, { ...s, type: grp.oType });
        }
      }
    }

    // ----- 2) Index existing Money Transfer by ServID from lstMT
    const existingMt = new Map<number, any>();
    if (pkg?.lstMT) {
      for (const mt of pkg.lstMT) {
        // mt: { ServID, Serv, oLimit: { Lmt_RL_Sender, Lmt_RL_Account, Lmt_Account_SenderID }, oConfig }
        existingMt.set(mt.ServID, mt);
      }
    }

    // ----- 3) Walk sources and build rows
    for (const grp of this.sourceGroups) {
      const type = grp.Type;
      let target: SimpleRow[] | null = null;

      if (type === 1) target = this.moneyTransferRows;
      else if (type === 2) target = this.rechargeRows;
      else if (type === 3) target = this.bookingRows;
      else if (type === 4) target = this.utilityRows;
      else if (type === 5) target = this.miscRows;
      else continue; // ignore others

      for (const src of grp.lstSource) {
        const sourceId = src.SourceId;
        const sourceName = src.Source;

        if (type === 1) {
          // ----- Money Transfer row (3 limits) -----
          const mtMatch = existingMt.get(sourceId);

          const oLimit = mtMatch?.oLimit || {};
          const row: SimpleRowM = {
            sourceId,
            sourceName,
            type,
            enabled: mtMatch ? mtMatch.oConfig === 1 : false,  // 1 = enabled, 2 = disabled
            limit: oLimit.Lmt_RL_Sender ?? 0,
            limit2: oLimit.Lmt_RL_Account ?? 0,
            limit3: oLimit.Lmt_Account_SenderID ?? 0,
          };

          target.push(row);

        } else {
          // ----- RBU row (single Limit) -----
          const key = `${type}_${sourceId}`;
          const match = existingRbu.get(key);

          const row: SimpleRow = {
            sourceId,
            sourceName,
            type,
            enabled: match ? match.oConfig === 1 : false, // 1 = enabled, 2 = disabled
            limit: match ? (match.Limit ?? 0) : 0,
          };

          target.push(row);
        }
      }
    }
  }

  // -------- pre-fill limits from GET_RL_PKG_WK_LMT row ----------
  private patchLimitsFromPackage(pkg: PackageItem) {
    const mt = pkg.lstMT || [];

    const payout = mt.find((x) => x.Serv.toLowerCase() === 'payout');
    if (payout) {
      this.payoutEnabled = payout.oConfig === 0 || payout.oConfig === 1;
      this.payoutRlSender = payout.oLimit.Lmt_RL_Sender;
      this.payoutRlAccount = payout.oLimit.Lmt_RL_Account;
      this.payoutAccSenderId = payout.oLimit.Lmt_Account_SenderID;
    }

    const dmt = mt.find(
      (x) =>
        x.Serv.toLowerCase().includes('dmt') ||
        x.Serv.toLowerCase().includes('money')
    );
    if (dmt) {
      this.dmtEnabled = dmt.oConfig === 0 || dmt.oConfig === 1;
      this.dmtRlSender = dmt.oLimit.Lmt_RL_Sender;
      this.dmtRlAccount = dmt.oLimit.Lmt_RL_Account;
      this.dmtAccSenderId = dmt.oLimit.Lmt_Account_SenderID;
    }

    const aeps = mt.find((x) => x.Serv.toLowerCase().includes('aeps'));
    if (aeps) {
      // 1 or 0 = enabled, 2 = disabled
      this.aepsEnabled = aeps.oConfig === 1 || aeps.oConfig === 0;
      this.aepsRlSender = aeps.oLimit.Lmt_RL_Sender;
      this.aepsRlAccount = aeps.oLimit.Lmt_RL_Account;
      this.aepsAccSenderId = aeps.oLimit.Lmt_Account_SenderID;
    }

    // lstRBU is handled generically in buildRbuRowsFromSources()
  }

  // -------- UI handlers ----------
  libuysell(tab: TabId) {
    this.libuysellTab = tab;
  }

  navigate(val: any) {
    this.router.navigateByUrl(val);
  }
  hasServiceSelected(): boolean {
    return (
      this.dmtEnabled ||
      this.payoutEnabled ||
      this.aepsEnabled ||
      this.moneyTransferRows.some(r => r.enabled) ||
      this.rechargeRows.some(r => r.enabled) ||
      this.bookingRows.some(r => r.enabled) ||
      this.utilityRows.some(r => r.enabled) ||
      this.miscRows.some(r => r.enabled)
    );
  }

  // -------- submit / update ----------
  //   onSubmit(): void {
  //     if (!this.pkgName || this.pkgName.trim() === '') {
  //    this.toster.error("Package name cannot be empty");
  //    return;
  // }
  // if (!this.hasServiceSelected()) {
  //    this.toster.error("Please select at least one service");
  //    return;
  // }


  //     if (this.isViewMode || this.submitting) return;

  //     this.submitting = true;

  //     // lstMT (Money Transfer)
  //     const lstMT: any[] = [];

  //     if (this.payoutEnabled || this.payoutRlSender || this.payoutRlAccount || this.payoutAccSenderId) {
  //       lstMT.push({
  //         // TODO: if needed, map ServID from GET_SOURCE Type=1 for "Payout"
  //         ServID: 101,
  //         Serv: 'Payout',
  //         oLimit: {
  //           Lmt_RL_Sender: +this.payoutRlSender! || 0,
  //           Lmt_RL_Account: +this.payoutRlAccount! || 0,
  //           Lmt_Account_SenderID: +this.payoutAccSenderId! || 0
  //         },
  //         oConfig: this.payoutEnabled ? 1 : 2
  //       });
  //     }

  //     if (this.dmtEnabled || this.dmtRlSender || this.dmtRlAccount || this.dmtAccSenderId) {
  //       lstMT.push({
  //         // TODO: adjust ServID as per your config for DMT
  //         ServID: 102,
  //         Serv: 'DMT',
  //         oLimit: {
  //           Lmt_RL_Sender: +this.dmtRlSender! || 0,
  //           Lmt_RL_Account: +this.dmtRlAccount! || 0,
  //           Lmt_Account_SenderID: +this.dmtAccSenderId! || 0
  //         },
  //         oConfig: this.dmtEnabled ? 1 : 2
  //       });
  //     }

  //     const hasAepsLimit =
  //       !!(this.aepsRlSender || this.aepsRlAccount || this.aepsAccSenderId);

  //     if (this.aepsEnabled || hasAepsLimit) {
  //       lstMT.push({
  //         // AEPS = SourceId 100 as per your GET_SOURCE
  //         ServID: 100,
  //         Serv: 'AEPS',
  //         oLimit: {
  //           Lmt_RL_Sender: +this.aepsRlSender! || 0,
  //           Lmt_RL_Account: +this.aepsRlAccount! || 0,
  //           Lmt_Account_SenderID: +this.aepsAccSenderId! || 0
  //         },
  //         // 1 = enabled, 2 = disabled
  //         oConfig: this.aepsEnabled ? 1 : 2
  //       });
  //     }

  //     // lstRBU – grouped arrays per Type (2,3,4,5) from dynamic rows
  //     const lstRBU: any[] = [];

  //     const pushGroup = (rows: SimpleRow[], type: number) => {
  //       console.log("source", rows,"--type", type)
  //       const services = rows
  //         .filter(
  //           (r) =>
  //             r.enabled ||
  //             (r.limit !== null && r.limit !== undefined && +r.limit !== 0)
  //         )
  //         .map((r) => ({
  //           ServID: r.sourceId,
  //           Serv: r.sourceName,
  //           Limit: +r.limit || 0,
  //           // 0 = active, 2 = disabled
  //           oConfig: r.enabled ? 0 : 2
  //         }));

  //       if (services.length) {
  //         lstRBU.push({
  //           oType: type,
  //           lstSrvice: services
  //         });
  //       }
  //     };

  //     //1=Money, 2 = RECHARGE, 3 = BOOKING, 4 = UTILITY_BILL, 5 = MISC_SERVICE
  //     pushGroup(this.moneyTransferRows, 1);
  //     pushGroup(this.rechargeRows, 2);
  //     pushGroup(this.bookingRows, 3);
  //     pushGroup(this.utilityRows, 4);
  //     pushGroup(this.miscRows, 5);

  //     const payload: any = {
  //       Pkg: this.pkgName || 'one',
  //       // DefPkg: this.defPkgChecked ? 1 : 0,
  //       lstMT,
  //       lstRBU
  //     };

  //     if (this.isEditMode && this.pkgId != null) {
  //       payload.PkgID = this.pkgId;
  //     }

  //     console.log('ADD_EDIT_PKG_WK_LMT payload →', payload);
  //      this.shared.loader(true)
  //     this.http.post(this.addEditUrl, payload).subscribe({
  //       next: (res: any) => {
  //         console.log('ADD_EDIT_PKG_WK_LMT response:', res);
  //         this.submitting = false;

  //         if (res?.Result) {

  //            this.toster.success('Package added successfully.')
  //             this.shared.loader(false)
  //           this.router.navigate(['package-lm-wk']);
  //         } else {

  //          this.toster.error( 'Something went wrong. Please try again.')
  //            this.shared.loader(false)
  //         }
  //       },
  //       error: (err) => {
  //         console.error(err);
  //         this.submitting = false;
  //          this.shared.loader(false)

  //       }
  //     });
  //   }
  onSubmit(): void {

    // ---------------- VALIDATIONS ----------------
    if (!this.pkgName || this.pkgName.trim() === '') {
      this.toster.error("Package name cannot be empty");
      return;
    }

    if (!this.hasServiceSelected()) {
      this.toster.error("Please select at least one service");
      return;
    }

    if (this.isViewMode || this.submitting) return;

    this.submitting = true;


    // ----------------------------------------------------
    //   1️⃣  DYNAMIC MONEY TRANSFER  → goes to lstMT only
    // ----------------------------------------------------
    const lstMT = this.moneyTransferRows
      .filter(mt =>
        mt?.enabled ||
        mt?.limit > 0 ||
        mt?.limit2 > 0 ||
        mt?.limit3 > 0
      )
      .map(mt => ({
        ServID: mt.sourceId,
        Serv: mt.sourceName,
        oLimit: {
          Lmt_RL_Sender: +mt.limit || 0,
          Lmt_RL_Account: +mt?.limit2 || 0,
          Lmt_Account_SenderID: +mt?.limit3 || 0,
        },
        oConfig: mt.enabled ? 1 : 2    // 1 = enabled, 2 = disabled
      }));



    // ----------------------------------------------------
    //   2️⃣  OTHER SERVICE TYPES  → lstRBU
    // ----------------------------------------------------
    const lstRBU: any[] = [];

    const pushGroup = (rows: SimpleRow[], type: number) => {

      const services = rows
        .filter(r =>
          r.enabled ||
          (r.limit !== null && r.limit !== undefined && +r.limit !== 0)
        )
        .map(r => ({
          ServID: r.sourceId,
          Serv: r.sourceName,
          Limit: +r.limit || 0,
          oConfig: r.enabled ? 1 : 2     // fixed → must be 1/2 NOT 0/2
        }));

      if (services.length > 0) {
        lstRBU.push({
          oType: type,
          lstSrvice: services
        });
      }
    };


    // DO NOT add moneyTransferRows here (that goes to lstMT)
    pushGroup(this.rechargeRows, 2);   // RECHARGE
    pushGroup(this.bookingRows, 3);    // BOOKING
    pushGroup(this.utilityRows, 4);    // UTILITY
    pushGroup(this.miscRows, 5);       // MISC



    // ----------------------------------------------------
    //   3️⃣  FINAL PAYLOAD
    // ----------------------------------------------------
    const payload: any = {
      Pkg: this.pkgName,
      lstMT,
      lstRBU
    };

    if (this.isEditMode && this.pkgId != null) {
      payload.PkgID = this.pkgId;
    }


    console.log('ADD_EDIT_PKG_WK_LMT payload →', payload);

    this.shared.loader(true);

    // ---------------- API CALL ----------------
    this.http.post(this.addEditUrl, payload).subscribe({
      next: (res: any) => {
        console.log('ADD_EDIT_PKG_WK_LMT response:', res);
        this.submitting = false;
        this.shared.loader(false);

        if (res?.Result) {
          this.toster.success(
            this.isEditMode ? "Package updated Successfully." : "Package added successfully."
          );
          this.router.navigate(['package-lm-wk']);
        } else {
          this.toster.error('Something went wrong. Please try again.');
        }
      },
      error: (err) => {
        console.error(err);
        this.submitting = false;
        this.shared.loader(false);
      }
    });
  }




  getLimit(obj: any, key: string) {
    if (obj[key] !== undefined) return obj[key];
    if (obj[key.toLowerCase()] !== undefined) return obj[key.toLowerCase()];
    if (obj[key.toUpperCase()] !== undefined) return obj[key.toUpperCase()];
    return '';
  }

  setLimit(obj: any, key: string, value: any) {
    if (obj[key] !== undefined) obj[key] = value;
    else if (obj[key.toLowerCase()] !== undefined) obj[key.toLowerCase()] = value;
    else if (obj[key.toUpperCase()] !== undefined) obj[key.toUpperCase()] = value;
    else obj[key] = value;
  }

  onLimitInput(obj: any, key: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const cursor = input.selectionStart || 0;

    const valid = /^(\d+\.?\d{0,2}|\.\d{0,2}|\d+\.)$/;

    if (value === '') {
      this.setLimit(obj, key, '');
      return;
    }

    if (valid.test(value)) {
      this.setLimit(obj, key, value);
      setTimeout(() => input.setSelectionRange(cursor, cursor));
    } else {
      const last = this.getLimit(obj, key);
      input.value = last;
      setTimeout(() => input.setSelectionRange(cursor - 1, cursor - 1));
    }
  }

  onLimitBlur(obj: any, key: string) {
    let v = this.getLimit(obj, key);

    if (!v || v === '.') v = '0.00';
    else if (v.endsWith('.')) v += '00';
    else if (v.includes('.')) {
      const [i, d] = v.split('.');
      if (d.length === 0) v = i + '.00';
      else if (d.length === 1) v = i + '.' + d + '0';
    } else v += '.00';

    this.setLimit(obj, key, v);
  }

  onLimitFocus(obj: any, key: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const v = this.getLimit(obj, key);

    if (v === '0' || v === '0.00' || v === '') {
      this.setLimit(obj, key, '');
      input.value = '';
    }
  }

  displayLimit(obj: any, key: string) {
    const v = this.getLimit(obj, key);

    // If value is 0 / 0.00 / empty → keep input blank (show placeholder only)
    if (v === null || v === undefined || v === '' || v === '0' || v === '0.00' || +v === 0) {
      return '';
    }

    return v; // show real value when user actually enters one
  }



}
