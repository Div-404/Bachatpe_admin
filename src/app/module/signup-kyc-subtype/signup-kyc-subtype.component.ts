import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../servies/api.service';
import { CommonmoduleModule } from '../../common/commonmodule.module';
import { SharedService } from '../../servies/shared/shared.service';
import { ToastrService } from 'ngx-toastr';

interface OptionItem {
  id: number;
  label: string;
  code: string;
}

@Component({
  selector: 'app-signup-kyc-subtype',
  standalone: true,
  templateUrl: './signup-kyc-subtype.component.html',
  styleUrls: ['./signup-kyc-subtype.component.scss'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CommonmoduleModule],
})
export class SignupKycSubtypeComponent implements OnInit {
  form: FormGroup;
  subtypes: any[] = [];
  loadingList = false;
  saving = false;
  editing = false; // true when editing existing subtype

  // Same stage list as signup-kyc
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

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private shared: SharedService,
    private toast: ToastrService,
  ) {
    this.form = this.fb.group({
      stageId: [null, [Validators.required]],
      subType: ['', [Validators.required, Validators.maxLength(100)]],
      url: ['', [Validators.maxLength(500)]],
    });

    this.shared.setSidebrActiveClass('signup-kyc-subtype');
    this.shared.activeClass$.subscribe((activeClass: string) => {
      console.log('Current active class in signup-kyc-subtype:', activeClass);
    });
  }

  ngOnInit(): void {
    // Load ALL subtypes once on init (Field1 = 0)
    this.loadSubTypes(0);
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls as { [key: string]: AbstractControl };
  }

  /** Helper to get stage label by id (for cards). */
  getStageLabel(stageId: number | null): string {
    if (!stageId) return '';
    const opt = this.kycStageOptions.find(o => o.id === stageId);
    return opt ? opt.label : String(stageId);
  }

  private loadSubTypes(stageId: number): void {
    this.loadingList = true;
    this.api.getSubTypes(stageId).subscribe({
      next: (list: any) => {
        this.subtypes = Array.isArray(list) ? list : [];
        this.loadingList = false;
      },
      error: (err) => {
        console.error('GET_STAGE_SUB_TYPE error', err);
        this.subtypes = [];
        this.loadingList = false;
        Swal.fire('Error', 'Unable to load subtypes.', 'error');
      },
    });
  }

  /** Internal clear reset used both after save and via refresh icon */
  private clearForm(): void {
    this.editing = false;

  this.form.reset({
    stageId: null,
    subType: '',
    url: '',
  });

  this.setEditModeControlState(); // re-enable everything

  this.form.markAsPristine();
  this.form.markAsUntouched();
  }

  /** Public method for refresh icon */
  resetFormValues(): void {
    this.clearForm();
  }

  /** Add / update subtype (same API) */
  private submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

   const raw = this.form.getRawValue(); // includes disabled controls

const stageId = Number(raw.stageId);
const subType = String(raw.subType || '').trim();
const url = String(raw.url || '').trim();

    this.saving = true;

    this.api.addSubtype(stageId, subType, url).subscribe({
      next: (res: any) => {
        this.saving = false;
        Swal.fire(
          'Success',
          res?.MSG_USER || 'Stage subtype saved successfully',
          'success',
        );

        // Reset form after add or edit
        this.clearForm();

        // Reload ALL subtypes (Field1 = 0)
        this.loadSubTypes(0);
      },
      error: (err) => {
        this.saving = false;
        console.error('ADD_STAGE_SUB_TYPE error', err);
        Swal.fire(
          'Error',
          'Failed to add/save stage subtype.',
          'error',
        );
      },
    });
  }

  /** Edit – fill form; submit() uses same ADD API */
  edit(val: any): void {
    this.editing = true;
    this.form.patchValue({
      stageId: val?.oSubType?.oStage ?? null,
      subType: val?.oSubType?.SubType ?? '',
      url: val?.oSubType?.URL ?? '',
    });
     this.setEditModeControlState(); // disable stage + subtype
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  /** SweetAlert2 confirmation before delete */
  confirmDelete(sub: any): void {
    const subTypeId = sub?.SubTypeID;
    const name = sub?.oSubType?.SubType || 'this subtype';

    Swal.fire({
      title: 'Delete subtype?',
      text: `Are you sure you want to delete "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed && subTypeId) {
        this.deleteSubtype(subTypeId);
      }
    });
  }

  private deleteSubtype(subTypeId: number): void {
    this.api.deleteSubtype(subTypeId).subscribe({
      next: (res: any) => {
        Swal.fire(
          'Deleted',
          'Stage subtype deleted successfully.',
          'success',
        );
        // Reload ALL after delete
        this.loadSubTypes(0);
      },
      error: (err) => {
        console.error('DEL_STAGE_SUB_TYPE error', err);
        Swal.fire(
          'Error',
          err?.error?.MSG_USER || 'Failed to delete stage subtype.',
          'error',
        );
      },
    });
  }
private setEditModeControlState(): void {
  if (this.editing) {
    this.f['stageId'].disable({ emitEvent: false });
    this.f['subType'].disable({ emitEvent: false });
    this.f['url'].enable({ emitEvent: false });
  } else {
    this.f['stageId'].enable({ emitEvent: false });
    this.f['subType'].enable({ emitEvent: false });
    this.f['url'].enable({ emitEvent: false });
  }
}
  // ---- permissions ----
  hasEdit = this.shared.hasPermission(
    'Configuration',
    'signup-kyc-subtype',
    'Edit',
  );
  hasDelete = this.shared.hasPermission(
    'Configuration',
    'signup-kyc-subtype',
    'Delete',
  );
  hasAdd = this.shared.hasPermission(
    'Configuration',
    'signup-kyc-subtype',
    'Add',
  );

  accessToAdd() {
    if (!this.editing && !this.hasAdd) {
      this.toast.error('You do not have permission to add.');
      return;
    }

    if (this.editing && !this.hasEdit) {
      this.toast.error('You do not have permission to edit.');
      return;
    }

    this.submit();
  }

  accessToEdit(val: any) {
    if (!this.hasEdit) {
      this.toast.error('You do not have permission to edit.');
      return;
    }
    this.edit(val);
  }

  accessToDelete(sub: any) {
    if (!this.hasDelete) {
      this.toast.error('You do not have permission to delete.');
      return;
    }
    this.confirmDelete(sub);
  }
}

