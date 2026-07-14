import { Component, OnInit, TemplateRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../servies/api.service';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../servies/shared/shared.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-config-sittings',
  standalone: true,
  imports: [NgbModalModule, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './config-sittings.component.html',
  styleUrl: './config-sittings.component.scss',
})
export class ConfigSittingsComponent implements OnInit {
  admSettingList: any;
  settingForm: any = FormGroup;
  submitted: boolean = false;
  execPermissions: any;

  constructor(
    private modalService: NgbModal,
    private api: ApiService,
    private toster: ToastrService,
    private shared: SharedService,
    private fb: FormBuilder,
  ) {}

  openLg(content: TemplateRef<any>) {
    this.submitted = false;
    this.settingForm.clear();
    this.modalService.open(content, {
      size: 'md modalone',
      centered: true,
      windowClass: 'flip-modal',
    });
  }

  ngOnInit(): void {
    this.execPermissions = JSON.parse(
      sessionStorage.getItem('execDetails') || '{}',
    );
    console.log('here is permission in user list>>>>>>>', this.execPermissions);
    this.getAdmSetting();

    this.settingForm = this.fb.group({
      TDS_Usr: ['', Validators.required],
      TDS_Ven: ['', Validators.required],
      GST_Usr: ['', Validators.required],
      GST_Ven: ['', Validators.required],
      BankVerify_Fee: ['', Validators.required],
      BankVerify_GST: ['', Validators.required],
      // Settle: ['', Validators.required]
    });
  }

  get f() {
    return this.settingForm.controls;
  }

  // ================================================================== get adm setting ==============================================

  getAdmSetting() {
    this.shared.loader(true);
    this.api.getAdmSetting().subscribe({
      next: (res: any) => {
        this.shared.loader(false);
        this.admSettingList = res;
        console.log('here is adm setting list', this.admSettingList);
        this.settingForm.patchValue({
          TDS_Usr: this.admSettingList.TDS_Usr,
          TDS_Ven: this.admSettingList.TDS_Ven,
          GST_Usr: this.admSettingList.GST_Usr,
          GST_Ven: this.admSettingList.GST_Ven,
          // Settle: this.admSettingList.Settle
          BankVerify_Fee: this.admSettingList.BankVerify_Fee,
          BankVerify_GST: this.admSettingList.BankVerify_GST,
        });
        this.settDayValue = this.admSettingList.Settle;
      },
      error: (err: any) => {
        this.toster.error('Something went wrong', 'Error');
      },
    });
  }

  settDayValue: any = 1;
  settDay(ev: any) {
    this.settDayValue = ev.target.value;
    this.settingForm.patchValue({
      Settle: this.settDayValue,
    });
    console.log('here is sett day value', this.settDayValue);
  }

  // ============================================================= add setting ===============================================
  resetForm() {
    this.settingForm.reset();
    this.settDayValue = 1;
  }
  addSetting() {
    if (
      this.execPermissions?.some(
        (permit: any) =>
          permit.Master === 'Configuration' &&
          permit.SubMasters.some(
            (sub: any) => sub.SubMaster === 'Settings' && sub.Edit === 0,
          ),
      )
    ) {
      this.toster.error(
        'You do not have permission to update settings',
        'Permission Denied',
      );
      return;
    } else {
      this.submitted = true;
      if (this.settingForm.invalid) {
        console.log('form invalid');

        return;
      }
      let data = {
        Key: '',
        oSetting: {
          TDS_Usr: this.settingForm.value.TDS_Usr,
          TDS_Ven: this.settingForm.value.TDS_Ven,
          GST_Usr: this.settingForm.value.GST_Usr,
          GST_Ven: this.settingForm.value.GST_Ven,
          Settle: this.settDayValue, //        ST_1D = 1,ST_3D = 2,ST_1WK = 3,ST_15D = 4,ST_30d = 5
          BankVerify_Fee: this.settingForm.value.BankVerify_Fee,
          BankVerify_GST: this.settingForm.value.BankVerify_GST,
        },
      };
      this.shared.loader(true);
      this.api.addSetting(data).subscribe({
        next: (res: any) => {
          if (res.Result == true) {
            this.shared.loader(false);
            this.toster.success('Settings updated successfully', 'Success');
            this.getAdmSetting();
            console.log('here is res from add setting', res);
          }
        },
        error: (err: any) => {
          this.shared.loader(false);
          this.toster.error('Something went wrong', 'Error');
        },
      });
    }
  }

  // =========================================================== dot validation ===============================================

  numericMessage: boolean = false;
  oneDotAfterTwoDigit(event: any): boolean {
    const charCode = event.which ? event.which : event.keyCode;

    // Get the input value
    const inputValue = event.target.value;

    // Allow digits (0-9) and dot (.)
    if ((charCode < 48 || charCode > 57) && charCode !== 46) {
      this.numericMessage = true;
      return false;
    }

    // Check if the input value already contains a dot
    const dotIndex = inputValue.indexOf('.');

    if (dotIndex !== -1) {
      // If dot is present, allow only one digit after it
      if (charCode === 46) {
        this.numericMessage = true;
        return false;
      } else {
        // Check the number of digits after the dot
        const digitsAfterDot = inputValue.substring(dotIndex + 1);
        if (digitsAfterDot.length >= 1) {
          // Prevent entering more than one digit after the dot
          this.numericMessage = true;
          return false;
        }
      }
    }

    this.numericMessage = false;
    return true;
  }
}
