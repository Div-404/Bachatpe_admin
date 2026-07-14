import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
  ValidatorFn,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonmoduleModule } from '../../common/commonmodule.module';
import { ApiService } from '../../servies/api.service';
import { SharedService } from '../../servies/shared/shared.service';
import { ToastrService } from 'ngx-toastr';

// ---------- Simple stage option ----------
interface OptionItem {
  id: number;
  label: string;
  code: string;
}

// ---------- Stage-subtype from GET_STAGE_SUB_TYPE ----------
interface StageSubtype {
  SubTypeID: number;
  oSubType: {
    oStage: number;
    SubType: string;
    URL: string;
  };
}

// ---------- Flow row ----------
interface FlowRow {
  stepNo: number;
  stageId: number | null;
  subTypeId: number | null; // SubTypeID (103, 104, 106, …)
  subTypeLabel?: string;
  url?: string;
}

// ---------- Package (one KYC flow config) ----------
interface SignupFlowPackage {
  pkgId: number | null;
  tag: string;
  tagStatus: boolean; // true => enabled
  usrRemarks: string;
  flow: FlowRow[];
}

@Component({
  selector: 'app-signup-kyc',
  standalone: true,
  templateUrl: './signup-kyc.component.html',
  styleUrl: './signup-kyc.component.scss',
  imports: [ReactiveFormsModule, CommonModule, FormsModule, CommonmoduleModule],
})
export class SignupKycComponent implements OnInit {
  form: FormGroup;

  private readonly AUTH_STAGE_ID = 9;

  // Static stages (we’ll auto-extend this from subtype master to match “create subtype” screen)
   kycStageOptions: OptionItem[] = [
    { id: 1, label: 'PAN Card',           code: 'PAN_CARD' },
    { id: 2, label: 'Aadhaar',            code: 'AADHAAR' },
    { id: 3, label: 'Video Verification', code: 'VIDEO' },
    // { id: 4, label: 'Bank Verification',  code: 'BANK' },
    // { id: 5, label: 'Signature',          code: 'SIGNATURE' },
    { id: 6, label: 'Agreement',          code: 'AGREEMENT' },
    { id: 7, label: 'Shop Details',         code: 'SHOP DETAILS' },
    { id: 8, label: 'GST Verification',      code: 'GST' },
    { id: 9, label: 'Authentication',     code: 'AUTHENTICATION' },
  ];

  tagOptions = [
    { label: 'Sole Proprietorship', value: 'Sole Proprietorship' },
    { label: 'Business - Partnership Firm', value: 'Business - Partnership Firm' },
    { label: 'Business - LLP', value: 'Business - LLP' },
     { label: 'Business - Private Limited Company', value: 'Business - Private Limited Company' },
      { label: 'Business - Public Limited Company', value: 'Business - Public Limited Company' },
  ];

  stageSubTypes: StageSubtype[] = [];
  kycFlowRows: FlowRow[] = [];
  packages: SignupFlowPackage[] = [];
  currentPkgIndex: number = -1;

  loadingList = false;
  loadingSubTypes = false;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private shared: SharedService,
    private toast: ToastrService,
  ) {
   const initialTag = this.tagOptions[0]?.value || '';

this.form = this.fb.group({
  tag: [initialTag, Validators.required],
  usrRemarks: ['', [this.maxWordsValidator(50)]],
});

    this.shared.setSidebrActiveClass('signup-kyc');
  }

  ngOnInit(): void {
    this.resetLocalFlow();
    this.loadStageSubTypes();
    this.loadSignupFlow();
  }

  // ---------- VALIDATORS / HELPERS ----------

  private maxWordsValidator(maxWords: number): ValidatorFn {
    return (control: AbstractControl) => {
      const v = String(control.value ?? '').trim();
      if (!v) return null;
      const words = v.split(/\s+/).filter(Boolean);
      return words.length <= maxWords
        ? null
        : { maxWords: { max: maxWords, actual: words.length } };
    };
  }
private countWords(text: string): number {
  const t = String(text ?? '').trim();
  if (!t) return 0;
  return t.split(/\s+/).filter(Boolean).length;
}

private trimToMaxWords(text: string, maxWords: number): string {
  const t = String(text ?? '').trim();
  if (!t) return '';
  const words = t.split(/\s+/).filter(Boolean);
  return words.slice(0, maxWords).join(' ');
}

/** trims on input (covers edge cases) */
enforceMaxWords(controlName: string, maxWords: number, ev?: Event): void {
  if (this.isEditingExistingPackage) return;

  const input = ev?.target as HTMLInputElement | null;
  const current = input ? input.value : String(this.form.get(controlName)?.value ?? '');

  if (this.countWords(current) <= maxWords) return;

  const trimmed = this.trimToMaxWords(current, maxWords);

  this.form.get(controlName)?.setValue(trimmed, { emitEvent: false });

  if (input) {
    input.value = trimmed;
    const end = trimmed.length;
    input.setSelectionRange(end, end);
  }
}

/** blocks any further typing once 50 words reached (except delete/navigation/shortcuts or replace-selection) */
blockAfterMaxWords(e: KeyboardEvent, maxWords: number): void {
  if (this.isEditingExistingPackage) return;

  const input = e.target as HTMLInputElement;
  const value = input?.value ?? '';
  const wc = this.countWords(value);

  // always allow navigation/edit keys
  const allowedKeys = new Set([
    'Backspace', 'Delete', 'Tab',
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
    'Home', 'End', 'Escape',
  ]);

  if (allowedKeys.has(e.key)) return;

  // allow shortcuts (Ctrl/⌘ + A/C/V/X/Z/Y etc.)
  if (e.ctrlKey || e.metaKey) return;

  // allow replacement if user selected something
  const hasSelection =
    (input.selectionStart ?? 0) !== (input.selectionEnd ?? 0);

  // once reached limit, block any printable input unless replacing selected text
  if (wc >= maxWords && !hasSelection) {
    // printable keys have length 1 (letters, numbers, space, etc.)
    if (e.key.length === 1) {
      e.preventDefault();
    }
  }
}

/** blocks paste that would exceed 50 words; inserts trimmed version instead */
blockPasteAfterMaxWords(e: ClipboardEvent, maxWords: number): void {
  if (this.isEditingExistingPackage) return;

  const input = e.target as HTMLInputElement;
  const paste = e.clipboardData?.getData('text') ?? '';
  if (!paste) return;

  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;

  const next =
    input.value.slice(0, start) + paste + input.value.slice(end);

  if (this.countWords(next) <= maxWords) return;

  e.preventDefault();

  const trimmed = this.trimToMaxWords(next, maxWords);

  this.form.get('usrRemarks')?.setValue(trimmed, { emitEvent: false });
  input.value = trimmed;

  const caret = trimmed.length;
  input.setSelectionRange(caret, caret);
}
  get remarkWordCount(): number {
    const v = String(this.form.getRawValue().usrRemarks ?? '').trim();
    if (!v) return 0;
    return v.split(/\s+/).filter(Boolean).length;
  }

  get isEditingExistingPackage(): boolean {
    return this.currentPkgIndex >= 0;
  }

  /** while ADD: DO NOT show already-added package tags */
  get tagOptionsForAdd(): { label: string; value: string }[] {
    const used = new Set(this.packages.map((p) => p.tag));
    return this.tagOptions.filter((t) => !used.has(t.value));
  }

  /** “New Package” possible only if unused tags exist */
  get canCreateNewPackage(): boolean {
    return this.tagOptionsForAdd.length > 0;
  }

  private resetLocalFlow(): void {
    // builder rows remain, but flow summary will NOT show until first valid step
    this.kycFlowRows = [{ stepNo: 1, stageId: null, subTypeId: null }];
  }

  resequence(rows: FlowRow[]): void {
    rows.forEach((r, i) => (r.stepNo = i + 1));
  }

  private getOptionById(list: OptionItem[], id: number | null): OptionItem | undefined {
    if (id == null) return undefined;
    return list.find((x) => x.id === Number(id));
  }

  getStageLabel(list: OptionItem[], row: FlowRow): string {
    return this.getOptionById(list, row.stageId)?.label ?? '';
  }

  getSubTypeLabel(subTypeId: number | null): string {
    if (!subTypeId) return '';
    const st = this.stageSubTypes.find((x) => Number(x.SubTypeID) === Number(subTypeId));
    return st?.oSubType?.SubType || '';
  }

  /** Stage + subtype label (Requirement #17) */
  getFlowDisplayLabel(row: FlowRow): string {
    const stage = this.getStageLabel(this.kycStageOptions, row);
    const subtype = row.subTypeLabel || this.getSubTypeLabel(row.subTypeId);
    return subtype ? `${stage} - ${subtype}` : stage;
  }

  // ---------- SUBTYPE HELPERS ----------

  hasSubType(list: OptionItem[], row: FlowRow): boolean {
    if (!row.stageId) return false;
    return this.stageSubTypes.some((st) => st.oSubType?.oStage === row.stageId);
  }

  getSubTypes(list: OptionItem[], row: FlowRow): StageSubtype[] {
    if (!row.stageId) return [];
    return this.stageSubTypes.filter((st) => st.oSubType?.oStage === row.stageId);
  }

  getAvailableOptions(list: OptionItem[], rows: FlowRow[], currentIndex: number): OptionItem[] {
    const selectedIds = rows
      .map((r, idx) => (idx === currentIndex ? null : r.stageId))
      .filter((x): x is number => x !== null);

    return list.filter((opt) => !selectedIds.includes(opt.id));
  }

  isRowValid(list: OptionItem[], row: FlowRow): boolean {
    if (!row.stageId) return false;

    const hasSubs = this.hasSubType(list, row);
    if (hasSubs) return row.subTypeId !== null && row.subTypeId !== undefined;
    return true;
  }

  canAddNextRow(list: OptionItem[], rows: FlowRow[], index: number): boolean {
    const isLast = index === rows.length - 1;
    if (!isLast) return false;
    if (!this.isRowValid(list, rows[index])) return false;

    const available = this.getAvailableOptions(list, rows, index);
    const uniqueSelectedCount = rows.filter((r) => r.stageId != null).length;
    return uniqueSelectedCount < list.length && available.length > 0;
  }

  /** Requirement #1: show summary only if at least 1 VALID step is configured */
  getConfiguredFlowSummaryRows(): FlowRow[] {
    const valid = this.kycFlowRows.filter((r) => this.isRowValid(this.kycStageOptions, r));
    if (!valid.length) return [];

    const rows = valid.map((r) => ({ ...r }));
    const authIndex = rows.findIndex((r) => r.stageId === this.AUTH_STAGE_ID);
    if (authIndex > -1) {
      const [auth] = rows.splice(authIndex, 1);
      rows.unshift(auth);
    }
    return rows;
  }

  getFlowSummaryForPackage(pkg: SignupFlowPackage): FlowRow[] {
    const rows = (pkg.flow || []).map((r) => ({ ...r }));
    const authIndex = rows.findIndex((r) => r.stageId === this.AUTH_STAGE_ID);
    if (authIndex > -1) {
      const [auth] = rows.splice(authIndex, 1);
      rows.unshift(auth);
    }
    return rows;
  }

  // ---------- LOAD DATA ----------

  private extendStageOptionsFromSubtypeMaster(): void {
    // Requirement #8: stage dropdown should match options available in subtype creation
    const existing = new Map(this.kycStageOptions.map((x) => [x.id, x]));
    const ids = Array.from(
      new Set(
        this.stageSubTypes
          .map((x) => Number(x?.oSubType?.oStage))
          .filter((n) => Number.isFinite(n) && n > 0),
      ),
    );

    for (const id of ids) {
      if (!existing.has(id)) {
        this.kycStageOptions.push({ id, label: `Stage ${id}`, code: `STAGE_${id}` });
      }
    }

    this.kycStageOptions.sort((a, b) => a.id - b.id);
  }

  private loadStageSubTypes(): void {
    this.loadingSubTypes = true;
    this.api.getStageSubTypes(0).subscribe({
      next: (list: any) => {
        this.stageSubTypes = Array.isArray(list) ? list : [];
        this.extendStageOptionsFromSubtypeMaster();
        this.loadingSubTypes = false;
      },
      error: (err) => {
        console.error('GET_STAGE_SUB_TYPE(0) error', err);
        this.stageSubTypes = [];
        this.loadingSubTypes = false;
        Swal.fire('Error', 'Unable to load KYC subtypes configuration.', 'error');
      },
    });
  }

  private loadSignupFlow(opts?: { afterSaveOrDelete?: boolean }): void {
    this.loadingList = true;
    this.api.getSignupFlow().subscribe({
      next: (resp: any) => {
        const arr = Array.isArray(resp) ? resp : [];

        this.packages = arr.map((pkg: any) => {
          const oPkg = pkg?.oPkg || {};
          const oInfo = oPkg?.oInfo || {};
          const lstFlowRaw = Array.isArray(pkg?.lstFlow) ? pkg.lstFlow : [];

          const sorted = [...lstFlowRaw].sort(
            (a, b) => Number(a.FlowIndex) - Number(b.FlowIndex),
          );

          const rows: FlowRow[] = sorted.map((item: any, idx: number) => {
            const stage = item?.oFlow?.Stage ?? null;
            const subTypeRaw = item?.oFlow?.SubType ?? null;
            const subTypeId = subTypeRaw && subTypeRaw !== 0 ? Number(subTypeRaw) : null;
            const info = item?.oSubInfo || {};

            return {
              stepNo: item.FlowIndex ?? idx + 1,
              stageId: stage,
              subTypeId,
              subTypeLabel: info.SubType || '',
              url: info.URL || '',
            } as FlowRow;
          });

          return {
            pkgId: oPkg.PkgID ?? null,
           tag: oInfo.Tag || this.tagOptions[0]?.value || '',
            tagStatus: oInfo.Tag_Status === 1,
            usrRemarks: oInfo.UsrRemarks || '',
            flow: rows.length ? rows : [{ stepNo: 1, stageId: null, subTypeId: null }],
          } as SignupFlowPackage;
        });

        // Requirement #6: after add/update/delete -> reset to ADD screen
        if (opts?.afterSaveOrDelete) {
          if (this.canCreateNewPackage) this.startNewPackage();
          else if (this.packages.length) this.selectPackage(0);
          else this.startNewPackage();
        } else {
          // initial behavior
          if (this.packages.length > 0) this.selectPackage(0);
          else this.startNewPackage();
        }

        this.loadingList = false;
      },
      error: (err) => {
        console.error('GET_SIGNUP_FLOW error', err);
        this.packages = [];
        this.startNewPackage();
        this.loadingList = false;
      },
    });
  }

  // ---------- PACKAGE SELECTION / ADD ----------

  startNewPackage(): void {
    this.currentPkgIndex = -1;

    // Add mode: only unused tags should be selectable (Requirement #7)
   const defaultTag =
  this.tagOptionsForAdd[0]?.value || this.tagOptions[0]?.value || '';

this.form.reset({
  tag: defaultTag,
  usrRemarks: '',
});
    // In edit mode we disable tag; in add mode keep enabled
    this.form.get('tag')?.enable({ emitEvent: false });
    this.form.get('usrRemarks')?.enable({ emitEvent: false });

    this.resetLocalFlow();
  }

  selectPackage(index: number): void {
    //   if (!this.hasEditPermission && !this.hasAddPermission) {
    //   this.toast.error('You do not have permission to Edit configuration.');
    //   return;
    // }
    this.currentPkgIndex = index;
    const pkg = this.packages[index];

    this.form.setValue({
      tag: pkg.tag,
      // tagStatus: pkg.tagStatus,
      usrRemarks: pkg.usrRemarks,
    });

    // keep tag locked in edit; remarks editable
    this.form.get('tag')?.disable({ emitEvent: false });
    this.form.get('usrRemarks')?.enable({ emitEvent: false });

    this.kycFlowRows = pkg.flow.map((r) => ({ ...r }));
    this.resequence(this.kycFlowRows);
  }

  // ---------- FLOW UI HANDLERS ----------

  onKycStageChange(index: number, value: any): void {
    const row = this.kycFlowRows[index];
    row.stageId = value ? Number(value) : null;
    row.subTypeId = null;
    row.subTypeLabel = '';
    row.url = '';
  }

  onKycSubtypeChange(index: number, value: any): void {
    const row = this.kycFlowRows[index];
    row.subTypeId = value ? Number(value) : null;

    const st = this.stageSubTypes.find((x) => Number(x.SubTypeID) === Number(row.subTypeId));
    row.subTypeLabel = st?.oSubType?.SubType || '';
    row.url = st?.oSubType?.URL || '';
  }

  addKycStep(): void {
    if (!this.hasAddPermission) {
      this.toast.error('You do not have permission to modify configuration.');
      return;
    }
    this.kycFlowRows.push({
      stepNo: this.kycFlowRows.length + 1,
      stageId: null,
      subTypeId: null,
    });
  }

  removeKycStep(index: number): void {
    if (!this.hasDeletePermission) {
      this.toast.error('You do not have permission to modify configuration.');
      return;
    }
    this.kycFlowRows.splice(index, 1);
    this.resequence(this.kycFlowRows);
  }

  // ---------- STATUS TOGGLE (single confirm) ----------

  togglePackageStatus(pkg: SignupFlowPackage): void {
    if (!this.hasEditPermission) {
      this.toast.error('You do not have permission to change status.');
      return;
    }

    const willEnable = !pkg.tagStatus;
    const action = willEnable ? 'Enable' : 'Disable';
    const field2 = willEnable ? 1 : 2; // Requirement #11

    Swal.fire({
      title: `Update status`,
      text: `Are you sure you want to ${action.toLowerCase()} "${pkg.tag}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, ${action}`,
      cancelButtonText: 'Cancel',
      confirmButtonColor: willEnable ? '#28a745' : '#d33',
    }).then((result) => {
      if (!result.isConfirmed) return;

      const body = { Key: '', Field1: pkg.pkgId, Field2: field2 };

      this.api.updateKycFlowPkg(body).subscribe({
        next: (res: any) => {
          Swal.fire('Updated', res?.MSG_USER || 'Status updated.', 'success');
          pkg.tagStatus = willEnable;

          // sync editor if same package
          if (
            this.currentPkgIndex >= 0 &&
            this.packages[this.currentPkgIndex]?.pkgId === pkg.pkgId
          ){}
          //  {
          //   this.form.get('tagStatus')?.setValue(willEnable, { emitEvent: false });
          // }
        },
       error: (err) => {
  console.error('updateKycFlowPkg error', err);
  Swal.fire('Error', 'Failed to update status.', 'error');
},
      });
    });
  }

  // ---------- SAVE / DELETE ----------

private buildKycPayload() {
  const fv = this.form.getRawValue() as any;

  const tag: string = fv.tag || this.tagOptions[0]?.value || '';
  const usrRemarks: string = fv.usrRemarks || '';

  const currentPkgStatus =
    this.isEditingExistingPackage && this.currentPkgIndex >= 0
      ? !!this.packages[this.currentPkgIndex]?.tagStatus
      : true; // ADD mode always enabled

  return {
    Key: '',
    oInfo: {
      Tag: tag,
      Tag_Status: currentPkgStatus ? 1 : 0,
      UsrRemarks: usrRemarks,
    },
    lstFlow: this.kycFlowRows
      .filter((r) => this.isRowValid(this.kycStageOptions, r))
      .map((r) => ({
        Stage: r.stageId,
        SubType: r.subTypeId ?? 0,
      })),
  };
}

  saveConfig(): void {
    if (!this.hasEditPermission && !this.hasAddPermission) {
      this.toast.error('You do not have permission to save configuration.');
      return;
    }

    // Requirement #5: remarks max 50 words
    if (this.form.get('usrRemarks')?.hasError('maxWords')) {
      this.toast.error('Remarks can be maximum 50 words.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Please fill package details.');
      return;
    }

    const payload = this.buildKycPayload();

    if (!payload.lstFlow || payload.lstFlow.length === 0) {
      Swal.fire('Warning', 'Please configure at least one KYC step before saving.', 'warning');
      return;
    }

    this.saving = true;
    this.api.addSignupFlow(payload).subscribe({
      next: () => {
        this.saving = false;

        // Requirement #10
        const msg = this.isEditingExistingPackage
          ? 'Signup and KYC flow package updated successfully'
          : 'Signup and KYC flow package added successfully';

        Swal.fire('Success', msg, 'success');
        // Requirement #6
        this.loadSignupFlow({ afterSaveOrDelete: true });
      },
      error: () => {
        this.saving = false;

        // Requirement #9
        const msg = this.isEditingExistingPackage
          ? 'Failed to update Signup & KYC flow package'
          : 'Failed to add Signup & KYC flow package';

        Swal.fire('Error', msg, 'error');
      },
    });
  }

  deletePackage(pkg: SignupFlowPackage): void {
    if (!this.hasDeletePermission) {
      this.toast.error('You do not have permission to delete configuration.');
      return;
    }

    // Requirement #13
    Swal.fire({
      title: 'Delete Package',
      text: `Are you sure you want to delete "${pkg.tag}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
    }).then((result) => {
      if (!result.isConfirmed) return;

      const payload = { Key: '', Field1: pkg.pkgId, Field2: '' };

      this.api.resetSignupFlow(payload).subscribe({
        next: () => {
          Swal.fire('Deleted', 'Signup & KYC flow package deleted successfully', 'success');
          // Requirement #6
          this.loadSignupFlow({ afterSaveOrDelete: true });
        },
        error: () => {
          // Requirement #14
          Swal.fire('Error', 'Failed to delete package.', 'error');
        },
      });
    });
  }

  // permissions
  hasEditPermission = this.shared.hasPermission('Configuration', 'signup-kyc', 'Edit');
  hasDeletePermission = this.shared.hasPermission('Configuration', 'signup-kyc', 'Delete');
  hasAddPermission = this.shared.hasPermission('Configuration', 'signup-kyc', 'Add');
}