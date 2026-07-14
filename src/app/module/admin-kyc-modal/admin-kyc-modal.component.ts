import {
  Component,
  Input,
  OnInit,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import html2pdf from 'html2pdf.js';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../servies/api.service';
import { SharedService } from '../../servies/shared/shared.service';

@Component({
  selector: 'app-admin-kyc-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './admin-kyc-modal.component.html',
  styleUrls: ['./admin-kyc-modal.component.scss'],
})
export class AdminKycModalComponent implements OnInit {
  @Input() user: any;

  @ViewChild('fileInput') fileInput!: ElementRef;
  TImeNow: any = Date.now();
  formatted = new Date(this.TImeNow).toLocaleString();
  tags: any[] = [];
  selectedTag = '';

  steps: any[] = [];
  currentIndex = 0;

  kycImg = '';
  selectedFile: any = null;

  userTag = '';

  API_BASE = 'https://digiapi.sibawallet.net/DigiSuites_Config_API';
  gstNumber = '';
  gstData: any = null;
  wholegstData = '';
  buttonEnable = false;

  GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  defaultAgreementUrl =
    'https://client.digisuites.com/assets/docs/merchant-agreement.pdf';
  isAgreementStep(): boolean {
    const step = this.steps[this.currentIndex];
    return step?.title?.toLowerCase().includes('agreement');
  }

  isGstStep(): boolean {
    const step = this.steps[this.currentIndex];
    return step?.title?.toLowerCase().includes('gst');
  }
  constructor(
    public modal: NgbActiveModal,
    private http: HttpClient,
    private api: ApiService,
    private toastr: ToastrService,
    private shared: SharedService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.validateLogin();
  }

  // ================= LOGIN CHECK =================

  // validateLogin() {
  //   const payload = {
  //     Key: '',
  //     User: this.user.Phone,
  //     Password: '',
  //   };

  //   this.api.VALIDATE_LOGIN(payload).subscribe((res: any) => {
  //     this.userTag = res.Tag;

  //     if (!this.userTag) {
  //       this.getSignupFlow();
  //     } else {
  //       this.loadFlowByTag();
  //     }
  //   });
  // }
  // validateLogin() {
  //   const payload = {
  //     Key: '',
  //     User: this.user.Phone,
  //     Password: '',
  //   };

  //   this.api.VALIDATE_LOGIN(payload).subscribe((res: any) => {
  //     this.userTag = res.Tag;

  //     // ⭐ IMPORTANT
  //     this.user.Stage = res.StageID;

  //     if (!this.userTag) {
  //       this.getSignupFlow();
  //     } else {
  //       this.loadFlowByTag();
  //     }
  //   });
  // }
  validateLogin() {
    const payload = {
      Key: '',
      User: this.user.Phone,
      Password: '',
    };

    this.shared.loader(true);

    this.api.VALIDATE_LOGIN(payload).subscribe({
      next: (res: any) => {
        if (!res) {
          this.toastr.error(
            'Unable to fetch KYC details! Please try again later.',
          );
          this.shared.loader(false);
          return;
        }

        this.userTag = res.Tag;
        this.user.Stage = res.StageID;

        if (!this.userTag) {
          this.getSignupFlow();
        } else {
          this.loadFlowByTag();
        }
      },
      error: () => {
        this.shared.loader(false);
        this.toastr.error(
          'Unable to fetch KYC details! Please try again later.',
        );
      },
    });
  }
  // ================= LOAD TAGS =================

  // getSignupFlow() {
  //   const payload = { Param1: 0 };

  //   this.http
  //     .post(`${this.API_BASE}/GET_SIGNUP_FLOW`, payload)
  //     .subscribe((res: any) => {
  //       this.tags = res;
  //     });
  // }
  getSignupFlow() {
    const payload = { Param1: 0 };

    this.shared.loader(true);

    this.http.post(`${this.API_BASE}/GET_SIGNUP_FLOW`, payload).subscribe({
      next: (res: any) => {
        if (!res || res.length === 0) {
          this.toastr.error(
            'Unable to fetch KYC details! Please try again later.',
          );
          this.shared.loader(false);
          return;
        }

        this.tags = res;
        this.shared.loader(false);
      },
      error: () => {
        this.shared.loader(false);
        this.toastr.error(
          'Unable to fetch KYC details! Please try again later.',
        );
      },
    });
  }
  selectTag(tag: string) {
    this.selectedTag = tag;
  }

  // ================= UPDATE TAG =================

  updateUserTag() {
    this.api
      .updateUserTag(this.user.Profile, this.selectedTag)
      .subscribe(() => {
        this.userTag = this.selectedTag;
        this.loadFlowByTag();
      });
  }

  // ================= LOAD FLOW =================

  // loadFlowByTag() {
  //   const payload = {
  //     Key: '',
  //     Field1: this.userTag,
  //     Field2: '',
  //     Field3: '',
  //   };

  //   this.api.GET_SIGNUP_FLOW_BY_TAG(payload).subscribe((res: any) => {
  //     this.steps = this.transformFlowResponse(res);

  //     const stage = Number(this.user.Stage || 0);

  //     // Find step index by stage - land on NEXT step (stage + 1)
  //     const index = this.steps.findIndex((s) => Number(s.stage) === stage);

  //     // If stage found → move to next step (stage + 1)
  //     if (index >= 0) {
  //       this.currentIndex = index + 1;
  //     } else {
  //       this.currentIndex = 0;
  //     }
  //   });
  // }
  // loadFlowByTag() {
  //   const payload = {
  //     Key: '',
  //     Field1: this.userTag,
  //     Field2: '',
  //     Field3: '',
  //   };

  //   this.api.GET_SIGNUP_FLOW_BY_TAG(payload).subscribe((res: any) => {
  //     this.steps = this.transformFlowResponse(res);

  //     const stage = Number(this.user.Stage || 0);

  //     const index = this.steps.findIndex((s) => Number(s.stage) === stage);

  //     if (index >= 0) {
  //       this.currentIndex = Math.min(index + 1, this.steps.length - 1);
  //     } else {
  //       this.currentIndex = 0;
  //     }
  //   });
  // }
  loadFlowByTag() {
    const payload = {
      Key: '',
      Field1: this.userTag,
      Field2: '',
      Field3: '',
    };

    this.shared.loader(true);

    this.api.GET_SIGNUP_FLOW_BY_TAG(payload).subscribe({
      next: (res: any) => {
        if (!res || !res.lstFlow) {
          this.toastr.error(
            'Unable to fetch KYC details! Please try again later.',
          );
          this.shared.loader(false);
          return;
        }

        this.steps = this.transformFlowResponse(res);

        const stage = Number(this.user.Stage || 0);
        const index = this.steps.findIndex((s) => Number(s.stage) === stage);

        if (index >= 0) {
          this.currentIndex = Math.min(index + 1, this.steps.length - 1);
        } else {
          this.currentIndex = 0;
        }

        this.shared.loader(false);
      },
      error: () => {
        this.shared.loader(false);
        this.toastr.error(
          'Unable to fetch KYC details! Please try again later.',
        );
      },
    });
  }
  // ================= TRANSFORM FLOW =================

  transformFlowResponse(res: any) {
    const lst = res?.lstFlow || [];

    return lst
      .sort((a: any, b: any) => a.FlowIndex - b.FlowIndex)
      .filter((x: any) => {
        const st = Number(x?.oFlow?.Stage);
        const name = String(x?.oSubInfo?.SubType || '').toLowerCase();

        if (st === 9) return false;
        if (name.includes('phone')) return false;
        if (name.includes('authentication')) return false;

        return true;
      })
      .map((x: any) => {
        const subType = x.oSubInfo.SubType;

        return {
          stage: x.oFlow.Stage,
          subTypeId: x.oFlow.SubType,
          subTypeName: subType,
          title: subType,
          icon: this.getIcon(subType),
        };
      });
  }

  // ================= ICON =================

  getIcon(name: string) {
    const s = name.toLowerCase();

    if (s.includes('pan')) return 'fa-id-card';
    if (s.includes('aadhar')) return 'fa-id-card';
    if (s.includes('gst')) return 'fa-file-invoice';
    if (s.includes('location')) return 'fa-location-dot';
    if (s.includes('selfie')) return 'fa-camera';
    if (s.includes('agreement')) return 'fa-file-signature';

    return 'fa-circle';
  }

  // ================= FILE SELECT =================

  // onFileSelected(ev: any) {
  //   this.selectedFile = ev.target.files[0];

  //   if (!this.selectedFile) return;

  //   const fd = new FormData();

  //   fd.append('AppName', 'digisuite/adhar');
  //   fd.append('file', this.selectedFile, this.selectedFile.name);

  //   this.api.uploadImgFormData(fd).subscribe((res: any) => {
  //     this.kycImg = res.url;
  //   });
  // }
  onFileSelected(ev: any) {
    this.kycImg = ''; // 🔥 RESET BEFORE NEW UPLOAD
    this.selectedFile = ev.target.files[0];

    if (!this.selectedFile) return;

    const fd = new FormData();

    fd.append('AppName', 'digisuite/adhar');
    fd.append('file', this.selectedFile, this.selectedFile.name);

    this.shared.loader(true);

    this.api.uploadImgFormData(fd).subscribe({
      next: (res: any) => {
        this.kycImg = res.matchImageUrl;
        console.log('kycImg', this.kycImg);
        this.shared.loader(false);
      },
      error: () => {
        this.shared.loader(false);

        this.kycImg = ''; // 🔥 ADD THIS
        this.selectedFile = null; // optional

        this.toastr.error('Unable to upload KYC document! try again later.');
      },
    });
  }
  // ================= UPLOAD =================
  getKycType(title: string): number {
    const name = title.toLowerCase();

    if (name.includes('pan')) return 1;
    if (name.includes('aadhar')) return 2;
    // if (name.includes('address') || name.includes('location')) return 3;
    if (name.includes('gst')) return 8;
    if (name.includes('agreement')) return 7;
    if (name.includes('selfie')) return 6;
    if (name.includes('shop') || name.includes('location')) return 11;

    return 0;
  }
  // uploadKyc() {
  //   const step = this.steps[this.currentIndex];

  //   const payload = {
  //     Path: this.kycImg,
  //     Details: step.title,
  //     oStage: step.stage,
  //     Details2: '',
  //     Details3: '',
  //     oKYC_DOC: {
  //       ProfileId: this.user.Profile,
  //       oKYC_Type: this.getKycType(step.title),
  //       oStatus: 1,
  //       Key: '',
  //     },
  //   };

  //   this.api.UPLOAD_KYC_DOC(payload).subscribe({
  //     next: (res: any) => {
  //       if (!res?.Result) {
  //         alert(res?.MSG_USER || 'KYC Upload Failed');
  //         return;
  //       }

  //       const isLastStep = this.currentIndex === this.steps.length - 1;

  //       // ⭐ if last step → mark KYC completed
  //       const nextStage = isLastStep ? 99 : step.stage;

  //       this.updateStage(nextStage, isLastStep);
  //     },
  //     error: () => {
  //       this.toastr.error('KYC Upload Error');
  //     },
  //   });
  // }
  verifyGST() {
    const gst = (this.gstNumber || '').toUpperCase().trim();

    if (!this.GST_REGEX.test(gst)) {
      this.toastr.error('Please enter a valid GST number', 'Invalid GST');
      return;
    }

    this.shared.loader(true);
    const payload = { gstin: gst, consent: 'Y' };

    this.http
      .post('https://insurex.life:3001/api/gst/verify', payload)
      .subscribe({
        next: (res: any) => {
          this.shared.loader(false);

          // 1. Check if the API returned an error or empty result
          if (res?.error || !res?.result) {
            this.resetState();
            this.toastr.error(
              res?.error?.message || 'Data not found',
              'Verification Failed',
            );
          } else {
            this.gstData = res.result;
            this.wholegstData = JSON.stringify(res);
            // ⭐ IMPORTANT — store JSON in kycImg so uploadKyc() works
            this.kycImg = this.wholegstData;
            const status =
              this.gstData?.gstnDetailed?.gstinStatus?.toUpperCase();

            // 2. Check if GST Status is ACTIVE
            if (status === 'ACTIVE') {
              this.buttonEnable = true;
              this.toastr.success(
                'GST details fetched. Please click Next to continue.',
              );
            } else {
              this.buttonEnable = false; // Keep button disabled
              this.toastr.warning(
                `Your GST status is ${status || 'INACTIVE'}. You cannot proceed with an inactive GST.`,
                'Action Restricted',
              );
            }
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.shared.loader(false);
          this.resetState();
          const errorMsg =
            err?.error?.error?.message || 'GST verification failed';
          this.toastr.error(errorMsg);
        },
      });
  }
  private resetState() {
    this.gstData = null;
    this.buttonEnable = false;
  }
  uploadKyc() {
    const step = this.steps[this.currentIndex];

    const payload = {
      Path: this.kycImg,
      Details: step.title,
      oStage: step.stage,
      Details2: '',
      Details3: '',
      oKYC_DOC: {
        ProfileId: this.user.Profile,
        oKYC_Type: this.getKycType(step.title),
        oStatus: 1,
        Key: '',
      },
    };

    this.shared.loader(true);

    this.api.UPLOAD_KYC_DOC(payload).subscribe({
      next: (res: any) => {
        if (!res?.Result) {
          this.shared.loader(false);
          this.toastr.error('Unable to upload KYC document! try again later.');
          return;
        }

        const isLastStep = this.currentIndex === this.steps.length - 1;
        const nextStage = isLastStep ? 99 : step.stage;

        this.updateStage(nextStage, isLastStep);
      },

      error: () => {
        this.shared.loader(false);
        this.toastr.error('Unable to upload KYC document! try again later.');
      },
    });
  }
  // ================= UPDATE STAGE =================

  updateStage(stage: number, isLastStep: boolean = false) {
    this.api.updateUserStage(this.user.Profile, stage).subscribe({
      next: () => {
        if (isLastStep) {
          this.shared.loader(false);
          this.toastr.success('KYC Completed Successfully');

          this.modal.close(true);
          return;
        }

        this.currentIndex++;
        this.resetUpload();
        this.resetState();
        this.shared.loader(false);
      },
      error: () => {
        this.shared.loader(false);
        this.toastr.error('Unable to upload KYC document! try again later.');
      },
    });
  }

  // ================= RESET FILE =================

  resetUpload() {
    this.kycImg = '';
    this.selectedFile = null;

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  @ViewChild('agreementTemplate') agreementTemplate!: ElementRef;

  downloadAgreementPdf() {
    const element = this.agreementTemplate.nativeElement;

    const options = {
      margin: 0.5,
      filename: `agreement_${this.user.Code}.pdf`,
      image: {
        type: 'jpeg' as const, // ← Fix: literal type instead of string
        quality: 0.98,
      },
      html2canvas: { scale: 2 },
      jsPDF: {
        unit: 'in' as const, // ← Fix
        format: 'a4' as const, // ← Fix
        orientation: 'portrait' as const, // ← Fix
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    };

    html2pdf()?.set(options)?.from(element)?.save();
  }
}
