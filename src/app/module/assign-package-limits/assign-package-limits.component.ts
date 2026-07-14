import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../servies/shared/shared.service';
type TabId = 'money' | 'recharge' | 'booking' | 'billing' | 'misc';

interface LimitObject {
  Lmt_Account_SenderID: number;
  Lmt_RL_Account: number;
  Lmt_RL_Sender: number;
}

interface MTItem {
  Serv: string;
  ServID: number;
  oConfig: number;   // 1 = enabled, 0 or 2 = disabled
  oLimit: LimitObject;
}

interface RBUService {
  Limit: number;
  Serv: string;
  ServID: number;
  oConfig: number;   // 1 = enabled, 0/2 = disabled
}

interface RBUGroup {
  oType: number;          // 2=Recharge,3=Booking,4=Utility,5=Misc
  lstSrvice: RBUService[];
}

interface AssignedPkg {
  PkgID: number;
  lstMT: MTItem[];
  lstRBU: RBUGroup[];
}

// Master package (GET_RL_PKG_WK_LMT)
interface MasterPkg {
  DefPkg: number;     // 1=default
  Pkg: string;
  PkgID: number;
  lstMT: MTItem[];
  lstRBU: RBUGroup[];
}

@Component({
  selector: 'app-assign-package-limits',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './assign-package-limits.component.html',
  styleUrl: './assign-package-limits.component.scss'
})
export class AssignPackageLimitsComponent implements OnInit {

  // ---- routing / user context ----
  retailerId = '';          // from route param :id
  profile: string | null = null;

  userFirst = '';
  userLast = '';
  userCode = '';
  userType = '';

  // ---- top-right controls ----
  allPackages: MasterPkg[] = [];
  selectedPkgId: number | null = null;
  hasAssignedPackage = false;
  assigning = false;
  savingLimits = false;

  activePackageLabel = 'Default Package';

  // ---- assigned package limits ----
  assignedPkg: AssignedPkg | null = null;
  mtList: MTItem[] = [];                         // MONEY_TRANSFER: lstMT
  rbuGroupsByType: { [type: number]: RBUGroup } = {}; // 2,3,4,5 → group

  // ---- tabs inside limits editor ----
  libuysellTab: TabId = 'money';

  // ---- API URLs ----
  private getPackagesUrl =
    'https://pay.bachatpay.co/Digi_CONF_API_bachatpay/GET_RL_PKG_WK_LMT';
  private getAssignedUrl =
    'https://pay.bachatpay.co/Digi_CONF_API_bachatpay/GET_RL_ASSIGNED_PKG';
  private assignPkgUrl =
    'https://pay.bachatpay.co/Digi_CONF_API_bachatpay/ASSIGN_ASSIGN_RL_PKG';
  private editPkgUrl =
    'https://pay.bachatpay.co/Digi_CONF_API_bachatpay/EDIT_RL_PKG';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient, private toster: ToastrService, private shared: SharedService
  ) { }

  // ---------- lifecycle ----------
  ngOnInit(): void {
    this.retailerId = this.route.snapshot.paramMap.get('id') || '';
    this.profile = this.route.snapshot.paramMap.get('pf');

    // from navPackage()
    this.userFirst = sessionStorage.getItem('First') || '';
    this.userLast = sessionStorage.getItem('Last') || '';
    this.userCode = sessionStorage.getItem('Code') || '';
    this.userType = sessionStorage.getItem('UserType') || '';

    this.loadPackages();
    this.loadAssignedPackage();
  }

  // ---------- navigation ----------
  goBack() {
    window.history.back();
  }

  // ---------- load master packages ----------
  private loadPackages(): void {
    const body = { Field1: 0 };

    this.http.post<MasterPkg[]>(this.getPackagesUrl, body).subscribe({
      next: (res) => {
        this.allPackages = Array.isArray(res) ? res : [];
        this.refreshActivePackageLabel();
      },
      error: (err) => {
        console.error('GET_RL_PKG_WK_LMT error', err);
      }
    });
  }

  // ---------- load assigned package for this retailer ----------
  private loadAssignedPackage(): void {
    if (!this.retailerId) return;

    const body = { Field1: this.profile };
    this.shared.loader(true)
    this.http.post<any>(this.getAssignedUrl, body).subscribe({
      next: (res) => {
        if (res && res.PkgID) {
          this.assignedPkg = res as AssignedPkg;
          this.hasAssignedPackage = true;
          this.selectedPkgId = res.PkgID;

          this.mtList = res.lstMT || [];
          this.rbuGroupsByType = {};
          (res.lstRBU || []).forEach((g: RBUGroup) => {
            this.rbuGroupsByType[g.oType] = g;
          });
          this.shared.loader(false)

        } else {
          // no package assigned yet
          this.assignedPkg = null;
          this.hasAssignedPackage = false;
          this.selectedPkgId = null;
          this.mtList = [];
          this.rbuGroupsByType = {};
          this.shared.loader(false)
        }

        this.refreshActivePackageLabel();
      },
      error: (err) => {
        console.error('GET_RL_ASSIGNED_PKG error', err);
        // treat as no package assigned
        this.assignedPkg = null;
        this.hasAssignedPackage = false;
        this.selectedPkgId = null;
        this.mtList = [];
        this.rbuGroupsByType = {};
        this.refreshActivePackageLabel();
        this.shared.loader(false)
      }
    });
  }

  // ---------- helpers ----------
  private refreshActivePackageLabel(): void {
    if (this.assignedPkg && this.allPackages?.length) {
      const match = this.allPackages.find(p => p.PkgID === this.assignedPkg!.PkgID);
      this.activePackageLabel = match ? match.Pkg : `Pkg #${this.assignedPkg.PkgID}`;
    } else if (this.allPackages?.length) {
      const def = this.allPackages.find(p => p.DefPkg === 1);
      this.activePackageLabel = def ? `Default Package (${def.Pkg})` : 'Default Package';
    } else {
      this.activePackageLabel = 'Default Package';
    }
  }

  onPackageChange(): void {
    // nothing fancy – button enable is driven from template
  }

  getRbuGroup(type: number): RBUGroup | null {
    return this.rbuGroupsByType[type] || null;
  }

  onMtCheckboxChange(item: MTItem, ev: Event) {
    const input = ev.target as HTMLInputElement | null;
    const checked = !!input && input.checked;
    item.oConfig = checked ? 1 : 2;
  }

  onServiceCheckboxChange(s: RBUService, ev: Event) {
    const input = ev.target as HTMLInputElement | null;
    const checked = !!input && input.checked;
    s.oConfig = checked ? 1 : 2;
  }

  // ---------- assign package (first time only) ----------
  onAssignPackage(): void {
    if (this.hasAssignedPackage || !this.selectedPkgId || !this.retailerId) return;

    this.assigning = true;
    const body = {
      Field1: String(this.selectedPkgId),     // PkgID
      Field2: this.profile,               // RetailerID
      Field3: this.userCode || ''            // Retailer usercode
    };
    this.shared.loader(true)
    this.http.post<any>(this.assignPkgUrl, body).subscribe({
      next: (res) => {
        this.assigning = false;
        if (res?.Result) {

          this.toster.success('User package assigned')
          // reload assigned package with limits
          this.loadAssignedPackage();
          this.shared.loader(false)
        } else {

          this.toster.error('Unable to assign package')
          this.shared.loader(false)
        }
      },
      error: (err) => {
        console.error('ASSIGN_ASSIGN_RL_PKG error', err);
        this.assigning = false;
        this.shared.loader(false)
        this.toster.error('API error while assigning package')

      }
    });
  }

  // ---------- save limits (EDIT_RL_PKG) ----------
  onSaveLimits(): void {
    if (!this.hasAssignedPackage || !this.selectedPkgId || !this.retailerId) return;

    this.savingLimits = true;

    // build lstMT
    const lstMT = (this.mtList || []).map(mt => ({
      ServID: mt.ServID,
      Serv: mt.Serv,
      oLimit: {
        Lmt_RL_Sender: +mt.oLimit.Lmt_RL_Sender || 0,
        Lmt_RL_Account: +mt.oLimit.Lmt_RL_Account || 0,
        Lmt_Account_SenderID: +mt.oLimit.Lmt_Account_SenderID || 0
      },
      oConfig: mt.oConfig ?? 0
    }));

    // build lstRBU per type 2..5
    const lstRBU: any[] = [];
    [2, 3, 4, 5].forEach(type => {
      const grp = this.rbuGroupsByType[type];
      if (!grp || !grp.lstSrvice || !grp.lstSrvice.length) return;

      lstRBU.push({
        oType: type,
        lstSrvice: grp.lstSrvice.map(s => ({
          ServID: s.ServID,
          Serv: s.Serv,
          Limit: +s.Limit || 0,
          oConfig: s.oConfig ?? 0
        }))
      });
    });

    const payload = {
      Key: '',
      RL_ID: this.profile,
      oPkgInfo: {
        PkgID: this.selectedPkgId,
        lstMT,
        lstRBU
      }
    };
    this.shared.loader(true)
    this.http.post<any>(this.editPkgUrl, payload).subscribe({
      next: (res) => {
        this.savingLimits = false;
        if (res?.Result) {

          this.toster.success('Retailer package updated successfully')
          // Optionally reload to confirm from server
          this.loadAssignedPackage();
          this.shared.loader(false)
        } else {

          this.toster.error('Unable to update limits')
        }
      },
      error: (err) => {
        console.error('EDIT_RL_PKG error', err);
        this.savingLimits = false;
        this.shared.loader(false)
        this.toster.error('API error while updating limits')

      }
    });
  }



  /**
   * Strict amount input handler
   * ✓ Only numeric + one dot allowed
   * ✓ Two decimals max
   * ✓ Wrong input instantly clears field
   * ✓ Smooth typing, zero cursor jumping
   */
  onStrictAmountInput(mt: any, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const currentValue = inputElement.value;
    const cursorPosition = inputElement.selectionStart || 0;

    // Validate format: digits, optional one dot, max two decimals
    const validPattern = /^(\d+\.?\d{0,2}|\.\d{0,2}|\d+\.)$/;

    if (currentValue === '') {
      // Allow empty input
      mt.limit = '';
      return;
    }

    if (validPattern.test(currentValue)) {
      // Valid input - keep it
      mt.Limit = currentValue;

      // Restore cursor position (prevents jumping)
      setTimeout(() => {
        inputElement.setSelectionRange(cursorPosition, cursorPosition);
      }, 0);
    } else {
      // Invalid input - revert to last valid value
      inputElement.value = mt.limit || mt.Limit;

      // Restore cursor to last valid position
      const newCursor = Math.min(cursorPosition - 1, mt.Limit.length);
      setTimeout(() => {
        inputElement.setSelectionRange(newCursor, newCursor);
      }, 0);
    }
    console.log("strcitctinput", mt)

  }

  /**
   * Blur handler - formats to proper decimal format
   */
  // onStrictAmountBlurLimit(mt: any, name:any): void {
  // console.log("Mt.Limit",mt)
  // console.log("Mt.name",name)
  //   let value = mt.oLimit[name];

  //   if (value === '' || value === '.') {
  //     value = '0.00';
  //   } else if (value?.endsWith('.')) {
  //     value = value + '00';
  //   } else if (value?.includes('.')) {
  //     const parts = value?.split('.');
  //     if (parts[1].length === 0) {
  //       value = value + '00';
  //     } else if (parts[1].length === 1) {
  //       value = value + '0';
  //     }
  //   } else {
  //     // No decimal point - add .00
  //     value = value + '.00';
  //   }
  //   mt.oLimit[name] = value;
  // console.log("Mt.Limit",mt.limit)

  // }

  // onStrictAmountBlur(mt: any): void {
  //   if(mt.Limit||mt.limit){
  //   let value = mt?.limit||mt?.Limit;

  //   if (value === '' || value === '.') {
  //     value = '0.00';
  //   } else if (value?.endsWith('.')) {
  //     value = value + '00';
  //   } else if (value?.includes('.')) {
  //     const parts = value?.split('.');
  //     if (parts[1].length === 0) {
  //       value = value + '00';
  //     } else if (parts[1].length === 1) {
  //       value = value + '0';
  //     }
  //   } else {
  //     // No decimal point - add .00
  //     value = value + '.00';
  //   }

  //   mt.limit = value;
  // }
  // }
  /**
   * Focus handler - clears field if it shows formatted 0.00
   */
  // onStrictAmountFocus(mt: any, event: Event): void {
  //   const input = event.target as HTMLInputElement;

  //   const v = mt.limit||mt.Limit;

  //   // Clear only if it's literally zero
  //   if (v === '0' || v === 0 || v === '0.00' || v === '') {
  //     mt.limit = '';
  //     input.value = '';
  //   }
  //   console.log("VFocus",v)
  // }
  // onStrictAmountFocusLimit(mt: any,limit:any, event: Event): void {
  //   const input = event.target as HTMLInputElement;

  //   const v = mt.limit||mt.Limit;

  //   // Clear only if it's literally zero
  //   if (v === '0' || v === 0 || v === '0.00' || v === '') {
  //     mt.limit = '';
  //     input.value = '';
  //   }

  // }

  // displayLimit(v: any) {
  //   console.log("VVVV", v);
  //   if (v === '0' || v === 0 || v === '0.00' || v === '') {
  //     return '';
  //   }
  //   console.log("V",v)
  //   return v; // keep original value on edit
  // }


  // read value regardless of limit/Limit
  getLimit(obj: any, key: string) {
    if (obj[key] !== undefined) return obj[key];
    if (obj[key.toLowerCase()] !== undefined) return obj[key.toLowerCase()];
    if (obj[key.toUpperCase()] !== undefined) return obj[key.toUpperCase()];
    return '';
  }

  // write value regardless of limit/Limit
  setLimit(obj: any, key: string, value: any) {
    if (obj[key] !== undefined) obj[key] = value;
    else if (obj[key.toLowerCase()] !== undefined) obj[key.toLowerCase()] = value;
    else if (obj[key.toUpperCase()] !== undefined) obj[key.toUpperCase()] = value;
    else obj[key] = value; // fallback create
  }

  onLimitInput(obj: any, key: string, event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;
    const cursor = inputElement.selectionStart || 0;

    const valid = /^(\d+\.?\d{0,2}|\.\d{0,2}|\d+\.)$/;

    if (value === '') {
      this.setLimit(obj, key, '');
      return;
    }

    if (valid.test(value)) {
      this.setLimit(obj, key, value);

      setTimeout(() => {
        inputElement.setSelectionRange(cursor, cursor);
      }, 0);
    } else {
      inputElement.value = this.getLimit(obj, key);
      setTimeout(() => {
        inputElement.setSelectionRange(cursor - 1, cursor - 1);
      }, 0);
    }
  }

  onLimitBlur(obj: any, key: string) {
    let v = this.getLimit(obj, key);

    if (v === '' || v === '.' || v === undefined || v === null) {
      v = '0.00';
    } else if (v.endsWith('.')) {
      v += '00';
    } else if (v.includes('.')) {
      const [int, dec] = v.split('.');
      if (dec.length === 0) v = int + '.00';
      else if (dec.length === 1) v = int + '.' + dec + '0';
    } else {
      v = v + '.00';
    }

    this.setLimit(obj, key, v);
  }
  onLimitFocus(obj: any, key: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const v = this.getLimit(obj, key);

    if (v === '0' || v === '0.00' || v === '' || v === null) {
      this.setLimit(obj, key, '');
      input.value = '';
    }
  }
  displayLimit(obj: any, key: string) {
    let v = this.getLimit(obj, key);

    if (v === null || v === undefined || v === '') return '';

    const num = Number(v);

    if (isNaN(num)) return '';

    return num.toFixed(2);
  }
}
