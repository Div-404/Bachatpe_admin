import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SharedService } from '../../servies/shared/shared.service';
import { ApiService } from '../../servies/api.service';

@Component({
  selector: 'app-gst-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gst-detail.component.html',
  styleUrl: './gst-detail.component.scss',
})
export class GstDetailComponent {
  profileId: any;
  gstData: any = null;
  hasData = false;
  isImage = false;
  imageUrl = '';
  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private shared: SharedService,
  ) {
    this.route.parent?.params.subscribe((params: any) => {
      this.profileId = params['profileId'];
    });

    if (this.profileId) {
      this.loadGstInfo(this.profileId);
    }
  }
  gstIN: any;
  // loadGstInfo(profileId: any) {
  //   const payload = {
  //     ProfileId: profileId,
  //     Key: '',
  //     oKYC_Type: 8, // GST = 8
  //   };

  //   this.shared.loader(true);

  //   this.api.getUserKyc(payload).subscribe({
  //     next: (res: any) => {
  //       this.shared.loader(false);

  //       if (res?.Path) {
  //         try {
  //           const parsed = JSON.parse(res.Path);
  //           this.gstIN = parsed?.result?.gstin || null;
  //           this.gstData = parsed?.result?.gstnDetailed || null;
  //           this.hasData = !!this.gstData;
  //           console.log(this.gstData);
  //         } catch (e) {
  //           console.error('Failed to parse GST data:', e);
  //           this.gstData = null;
  //           this.hasData = false;
  //         }
  //       } else {
  //         this.gstData = null;
  //         this.hasData = false;
  //       }
  //     },
  //     error: () => {
  //       this.shared.loader(false);
  //       this.gstData = null;
  //       this.hasData = false;
  //     },
  //   });
  // }
  loadGstInfo(profileId: any) {
    const payload = {
      ProfileId: profileId,
      Key: '',
      oKYC_Type: 8,
    };

    this.shared.loader(true);

    this.api.getUserKyc(payload).subscribe({
      next: (res: any) => {
        this.shared.loader(false);

        if (!res?.Path) {
          this.hasData = false;
          return;
        }

        const path = res.Path;

        // CASE 1 — Image document
        if (path.startsWith('http')) {
          this.isImage = true;
          this.imageUrl = path;
          this.hasData = true;
          return;
        }

        // CASE 2 — JSON GST data
        try {
          const parsed = JSON.parse(path);

          this.gstIN = parsed?.result?.gstin || null;
          this.gstData = parsed?.result?.gstnDetailed || null;

          this.hasData = !!this.gstData;
          this.isImage = false;
        } catch (e) {
          console.error('GST parse failed', e);
          this.hasData = false;
        }
      },

      error: () => {
        this.shared.loader(false);
        this.hasData = false;
      },
    });
  }
}
