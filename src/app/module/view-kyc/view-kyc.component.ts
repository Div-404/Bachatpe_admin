import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterOutlet, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../servies/api.service';
import { SharedService } from '../../servies/shared/shared.service';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { catchError, finalize, forkJoin, Observable, of } from 'rxjs';

@Component({
  selector: 'app-view-kyc',
  standalone: true,
  imports: [CommonModule, RouterOutlet, PdfViewerModule],
  templateUrl: './view-kyc.component.html',
  styleUrl: './view-kyc.component.scss',
})
export class ViewKycComponent implements OnInit, OnDestroy {
  currentTab: any = '';
  profileId: any;
  // 🔹 AGREEMENT STATE
  showAgreement = false;
  agreementUrl: string | null = null;
  agreementLoaded = false;
  isAgreementSigned = false;

  zoom = 1;
  kycDocs: { [stage: number]: any } = {};
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private shared: SharedService,
    private api: ApiService,
  ) {}
  // KYC stage map: PAN=1, AADHAR=2, VIDEO=6, BANK=4, SIGNATURE=5, AGREEMENT=7, SHOP=11, GST=8
  loadAllKycInfo() {
    const stages = [1, 2, 6, 7, 8, 11]; // oKYC_Type values

    const requests: { [key: number]: Observable<any> } = {};
    stages.forEach((s) => {
      requests[s] = this.api
        .getUserKyc({
          ProfileId: this.profileId,
          Key: '',
          oKYC_Type: s,
        })
        .pipe(catchError(() => of(null)));
    });

    forkJoin(requests).subscribe({
      next: (results: any) => {
        Object.keys(results).forEach((key) => {
          const stage = Number(key);
          const res = results[key];
          this.kycDocs[stage] = res?.oKYC_DOC ? res : null;
          if (stage === 6) {
            this.Profilepic = res?.Path;
          }
        });
        console.log('KYC docs loaded:', this.kycDocs);

        // Auto-navigate to first available tab
        this.navigateToFirstAvailable();
      },
      error: (err) => {
        console.error('Failed to load KYC docs:', err);
      },
    });
  }

  private navigateToFirstAvailable() {
    const tabMap: { stage: number; route: string }[] = [
      { stage: 1, route: 'show-pan' },
      { stage: 2, route: 'show-aadhar' },
      { stage: 6, route: 'show-selfie' },
      { stage: 11, route: 'show-shop' },
      { stage: 7, route: 'agreement' },
      // { stage: 4, route: 'bank-detail' },
      { stage: 8, route: 'show-gst' },
    ];

    for (const tab of tabMap) {
      if (this.kycDocs[tab.stage]) {
        if (tab.route === 'agreement') {
          this.openAgreement();
        } else {
          this.navigate(tab.route);
        }
        return;
      }
    }
    // ⭐ fallback if no KYC docs exist
    this.currentTab = 'bank-detail';
    this.router.navigateByUrl(`view-kyc/${this.profileId}/bank-detail`);
  }
  ngOnInit(): void {
    // Subscribe to the route parameters observable
    this.route.params.subscribe((params: any) => {
      this.profileId = params['profileId'];
      console.log('Profile ID:', this.profileId);
      // Use profileId to fetch user details here
    });
    const storedTab = sessionStorage.getItem('currentTab'); // Get the stored tab
    if (storedTab) {
      this.currentTab = storedTab; // Set currentTab from localStorage
    }
    this.GET_USER_INFO(this.profileId);
    // this.navigate('show-pan');
    // this.getUserKycDetail();
    // this.GET_USER_KYC_INFO(this.profileId);
    this.loadAllKycInfo();
  }
  ngOnDestroy() {
    sessionStorage.removeItem('currentTab'); // Clear the tab on component destruction if needed
  }
  navigate(val: string) {
    this.currentTab = val;
    this.showAgreement = false; // 🔹 IMPORTANT
    sessionStorage.setItem('currentTab', val); // Store the current tab in localStorage
    this.router.navigateByUrl(`view-kyc/${this.profileId}/${val}`);
  }
  userInfoData: any = [];
  GET_USER_INFO(val: any) {
    let obj = {
      profileId: val,
    };
    // this.shared.loader(true)
    this.api.GET_USER_INFO(obj).subscribe((data: any) => {
      console.log('user info', data);
      this.userInfoData = data;
    });
  }
  getUserKycDetail() {
    this.shared.loader(true);
    let data = {
      // ProfileId: JSON.parse(sessionStorage.getItem("profileId") || "{}"),
      ProfileId: this.profileId,
      Key: '',
      oKYC_Type: 7, //SIGNATURE = 5,PASSPORT = 8,CANCELLED_CHEQUE = 9,UTILITY_BILL = 10
    };

    this.shared.loader(true);
    this.api.getUserKyc(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false);
        this.agreementUrl = res?.Path;
        this.isAgreementSigned = res?.oKYC_DOC?.oStatus === 2;
        console.log('aggrement', this.agreementUrl);

        // sessionStorage.setItem('matchImg', this.kycDetailRes.Path)
      },
      error: (err: any) => {
        this.shared.loader(false);
        // this.toster.error("Something went wrong", "Error")
      },
    });
  }
  isPdf = false;
  isImage = false;
  // 🔹 AGREEMENT TAB CLICK
  // openAgreement() {
  //   this.currentTab = 'agreement';
  //   this.showAgreement = true;

  //   if (this.agreementLoaded) return;

  //   const payload = {
  //     ProfileId: this.profileId,
  //     Key: '',
  //     oKYC_Type: 7,
  //   };
  //   this.shared.loader(true);
  //   this.api
  //     .getUserKyc(payload)
  //     .pipe(
  //       finalize(() => {
  //         this.shared.loader(false);
  //       }),
  //     )
  //     .subscribe({
  //       next: (res: any) => {
  //         this.agreementUrl = res?.Path || null;
  //         this.isAgreementSigned = res?.oKYC_DOC?.oStatus === 2;
  //         this.agreementLoaded = true;
  //       },
  //     });
  // }
  openAgreement() {
    this.currentTab = 'agreement';
    this.showAgreement = true;

    if (this.agreementLoaded) return;

    this.shared.loader(true);

    const payload = {
      ProfileId: this.profileId,
      Key: '',
      oKYC_Type: 7,
    };

    this.api.getUserKyc(payload).subscribe({
      next: (res: any) => {
        const path = res?.Path || null;

        this.agreementUrl = path;

        if (path) {
          const lower = path.toLowerCase();

          this.isPdf = lower.endsWith('.pdf');
          this.isImage =
            lower.endsWith('.jpg') ||
            lower.endsWith('.jpeg') ||
            lower.endsWith('.png');
        }

        this.isAgreementSigned = res?.oKYC_DOC?.oStatus === 2;
        this.agreementLoaded = true;

        this.shared.loader(false);
      },
      error: () => {
        this.shared.loader(false);
      },
    });
  }
  incrementZoom(val: number) {
    this.zoom += val;
  }

  Profilepic: any;
  // GET_USER_KYC_INFO(val: any) {
  //   let obj = {
  //     ProfileId: val,
  //     Key: '',
  //     oKYC_Type: 6, //PAN_CARD = 1,AADHAR_ID = 2,ADDR = 3,BANK_STATEMENT = 4,SIGNATURE = 5,VIDEO_VERIFY = 6,AGR
  //   };
  //   this.shared.loader(true);
  //   this.api.GET_USER_KYC_INFO(obj).subscribe((data: any) => {
  //     console.log('lets', data);
  //     if (data.oKYC_DOC != null) {
  //       this.Profilepic = data.Path;
  //       this.shared.loader(false);
  //     } else {
  //       this.shared.loader(false);
  //     }
  //   });
  // }
}
