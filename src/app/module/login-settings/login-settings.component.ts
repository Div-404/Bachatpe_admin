import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { CommonmoduleModule } from '../../common/commonmodule.module';
import { ApiService } from '../../servies/api.service';
import { SharedService } from '../../servies/shared/shared.service';

type LoginFlowGetRes = {
  LOGIN_USING_EMAIL_PWD: number;
  LOGIN_USING_EMAIL_OTP: number;
  LOGIN_USING_PHONE_PWD: number;
  LOGIN_USING_PHONE_OTP: number;
  LOGIN_PIN: number;
  idleTmMin: number;
  TRANS_PIN: number;
};

type AddLoginFlowRes = {
  ERR_DEV: any;
  MSG_USER: string;
  Result: boolean;
};
@Component({
  selector: 'app-login-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CommonmoduleModule],
  templateUrl: './login-settings.component.html',
  styleUrl: './login-settings.component.scss'
})
export class LoginSettingsComponent implements OnInit, OnDestroy {
  private readonly BASE = 'https://digiapi.sibawallet.net/DigiSuites_Config_API';

  loading = false;
  loadError = '';
  private lastLoaded: LoginFlowGetRes | null = null;
  private sub = new Subscription();

  form = this.fb.group({
    emailPwd: [false],
    emailOtp: [false],
    phonePwd: [false],
    phoneOtp: [false],
    loginPin: [false],
    idleTmMin: [0, [Validators.maxLength(3)]],
    transPin: [false],
  });

  constructor(private fb: FormBuilder, private http: HttpClient, private api: ApiService, private shared: SharedService) {}

  ngOnInit(): void {
    // When loginPin is OFF -> idleTmMin must be 0
    this.sub.add(
      this.form.get('loginPin')!.valueChanges.subscribe((v) => {
        if (!v) this.form.get('idleTmMin')!.setValue(0, { emitEvent: false });
      })
    );

    this.load();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  load(): void {
    this.loading = true;
    this.loadError = '';
this.shared.loader(true)
    this.api.GET_LOGIN_FLOW().subscribe({
      next: (res:any) => {
        this.lastLoaded = res;
const idleUi =
  res.LOGIN_PIN === 1 && Number(res.idleTmMin) > 0 ? (res.idleTmMin) : 0;
        this.form.patchValue(
          {
            emailPwd: res.LOGIN_USING_EMAIL_PWD === 1,
            emailOtp: res.LOGIN_USING_EMAIL_OTP === 1,
            phonePwd: res.LOGIN_USING_PHONE_PWD === 1,
            phoneOtp: res.LOGIN_USING_PHONE_OTP === 1,
            loginPin: res.LOGIN_PIN === 1,
            idleTmMin: idleUi,
            transPin: res.TRANS_PIN === 1,
        
          },
          { emitEvent: true }
        );
        this.shared.loader(false)

        // if login pin is disabled => idle must show 0
        // if (res.LOGIN_PIN !== 1) {
        //   this.form.get('idleTmMin')!.setValue('0', { emitEvent: false });
        // }

        this.loading = false;
         this.shared.loader(false)
      },
      error: (err) => {
        this.loading = false;
         this.shared.loader(false)
        this.loadError = 'Unable to load settings right now. Showing default values.';
        // defaults: all disabled (2) and idleTmMin = 0 => all checkboxes false and 0
        this.form.reset(
          {
            emailPwd: false,
            emailOtp: false,
            phonePwd: false,
            phoneOtp: false,
            loginPin: false,
            idleTmMin: 0,
            transPin: false,
          },
          { emitEvent: true }
        );
        console.error(err);
      },
    });
  }

  onCancel(): void {
    if (!this.lastLoaded) {
      this.form.reset(
        {
          emailPwd: false,
          emailOtp: false,
          phonePwd: false,
          phoneOtp: false,
          loginPin: false,
          idleTmMin: 0,
          transPin: false,
        },
        { emitEvent: true }
      );
      return;
    }

    const r = this.lastLoaded;
    const idleUi =
  r.LOGIN_PIN === 1 && Number(r.idleTmMin) > 0 ? (r.idleTmMin) : 0;
    this.form.patchValue(
      {
        emailPwd: r.LOGIN_USING_EMAIL_PWD === 1,
        emailOtp: r.LOGIN_USING_EMAIL_OTP === 1,
        phonePwd: r.LOGIN_USING_PHONE_PWD === 1,
        phoneOtp: r.LOGIN_USING_PHONE_OTP === 1,
        loginPin: r.LOGIN_PIN === 1,
        idleTmMin: idleUi,
        transPin: r.TRANS_PIN === 1,
      },
      { emitEvent: true }
    );

    if (r.LOGIN_PIN !== 1) {
      this.form.get('idleTmMin')!.setValue(0, { emitEvent: false });
    }
  }

  onSave(): void {
    if (this.loading) return;

    const loginPinEnabled = !!this.form.value.loginPin;
const idleRaw = String(this.form.value.idleTmMin ?? '');
const idleNum = loginPinEnabled ? this.toNonNegativeInt(idleRaw) : 0;

    // ✅ mapping exactly as you requested:
    // checked => 1, unchecked => 2, idleTmMin => 0 when loginPin off
    const payload = {
      LOGIN_USING_EMAIL_PWD: this.form.value.emailPwd ? 1 : 2,
      LOGIN_USING_EMAIL_OTP: this.form.value.emailOtp ? 1 : 2,
      LOGIN_USING_PHONE_PWD: this.form.value.phonePwd ? 1 : 2,
      LOGIN_USING_PHONE_OTP: this.form.value.phoneOtp ? 1 : 2,
      LOGIN_PIN: loginPinEnabled ? 1 : 2,
      idleTmMin: idleNum,
      TRANS_PIN: this.form.value.transPin ? 1 : 2,
    };

    this.loading = true;
this.shared.loader(true)
    this.api.ADD_LOGIN_FLOW(payload).subscribe({
      next: (res:any) => {
        this.loading = false;

        if (res?.Result) {
          Swal.fire({
            icon: 'success',
            title: 'Saved',
            text: 'Login settings saved successfully.',
            confirmButtonColor: '#2D684E',
          });
          this.shared.loader(false)
          // refresh GET state so Cancel works correctly
          this.load();
        } else {
          this.shared.loader(false)
          Swal.fire({
            icon: 'error',
            title: 'Failed',
            text:'Failed to update login settings.',
            confirmButtonColor: '#2D684E',
          });
        }
      },
      error: (err) => {
        this.loading = false;
        this.shared.loader(false)
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: 'Failed to update login settings.',
          confirmButtonColor: '#2D684E',
        });
        console.error(err);
      },
    });
  }

  // ---- Input control for idle minutes (digits only) ----
  numberOnlyKeydown(e: KeyboardEvent): void {
    const allowed = [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
      'Home',
      'End',
    ];

    if (allowed.includes(e.key)) return;

    // allow ctrl/cmd shortcuts (copy/paste/select all)
    if (e.ctrlKey || e.metaKey) return;

    if (!/^\d$/.test(e.key)) e.preventDefault();
  }

 sanitizeIdleInput(): void {
  const ctrl = this.form.get('idleTmMin')!;
  const v = (ctrl.value ?? 0);
  const digits = v;
  ctrl.setValue(digits, { emitEvent: false }); // ✅ no fallback '0'
}
normalizeIdleOnBlur(): void {
  const ctrl = this.form.get('idleTmMin')!;
  const raw = String(ctrl.value ?? '');
  const n = this.toNonNegativeInt(raw);

  // ✅ keep UI blank for 0, remove leading zeros for >0
  ctrl.setValue(n > 0 ? n : 0, { emitEvent: false });
}
  private toNonNegativeInt(v: string): number {
    const n = parseInt((v || '0').replace(/[^\d]/g, ''), 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }
}