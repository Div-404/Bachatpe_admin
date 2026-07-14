import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SharedService } from '../../servies/shared/shared.service';
import { CommonmoduleModule } from '../../common/commonmodule.module';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

interface PackageItem {
  DefPkg: number;   // 1 = default, 2 = not default
  Pkg: string;
  PkgID: number;
  lstMT: any[];
  lstRBU: any[];
  lstSrvice: any[];
}

@Component({
  selector: 'app-package-lm-wk',
  standalone: true,
  imports: [CommonModule, HttpClientModule, CommonmoduleModule],
  templateUrl: './package-lm-wk.component.html',
  styleUrl: './package-lm-wk.component.scss'
})
export class PackageLmWkComponent implements OnInit {
  packages: PackageItem[] = [];
  loading = false;
  errorMsg = '';
  @ViewChild('confirmDefaultTpl') confirmDefaultTpl!: TemplateRef<any>;

  private apiUrl =
    'https://pay.bachatpay.co/Digi_CONF_API_bachatpay/GET_RL_PKG_WK_LMT';

  private updateDefaultUrl =
    'https://pay.bachatpay.co/Digi_CONF_API_bachatpay/UPDATE_RL_PKG_DEFAULT';

  constructor(private router: Router, private http: HttpClient, private shared: SharedService, private toster: ToastrService, public modalService: NgbModal) { }

  ngOnInit(): void {
    this.fetchPackages();
  }

  fetchPackages(): void {
    this.loading = true;
    this.shared.loader(true)
    this.http.post<PackageItem[]>(this.apiUrl, { Field1: 0 }).subscribe({
      next: res => {
        this.packages = Array.isArray(res) ? res : [];
        this.loading = false;
        this.shared.loader(false)
      },
      error: err => {
        console.error(err);
        this.errorMsg = 'Unable to load packages.';
        this.shared.loader(false)
        this.loading = false;
      }
    });
  }
  onDefaultClick(event: Event, row: PackageItem) {
    event.preventDefault();        // ❗ STOP TOGGLE
    event.stopPropagation();       // ❗ STOP UI SLIDE

    if (row.DefPkg === 1) return;  // if already default
    this.openDefaultModal(row);    // open modal manually
  }

  // setAsDefault(row: PackageItem): void {
  //     // current default row should not send API (we also disable it in HTML)
  //     if (row.DefPkg === 1) return;

  //     const body = { Field1: row.PkgID }; // packageID
  //  this.shared.loader(true)
  //     this.http.post<any>(this.updateDefaultUrl, body).subscribe({
  //       next: (res) => {
  //         if (res?.Result) {
  //           // backend has updated default; refresh list so only 1 has DefPkg = 1
  //           // optional toast
  //           // alert(res.MSG_USER || 'Default RL Package updated');

  //           this.fetchPackages();
  //         } else {
  //           alert(res?.MSG_USER || 'Unable to update default package');
  //           this.fetchPackages(); // revert UI state
  //            this.shared.loader(false)
  //         }
  //       },
  //       error: (err) => {
  //         console.error('UPDATE_RL_PKG_DEFAULT error', err);
  //         alert('API error while setting default package.');
  //         this.fetchPackages(); // revert UI state
  //       }
  //     });
  //   }
  viewPackage(pkg: PackageItem): void {
    this.router.navigate(['add-lm-wk'], {
      queryParams: { mode: 'view', pkgId: pkg.PkgID },
      state: { pkg }   // 👈 yahan pura object send
    });
  }

  editPackage(pkg: PackageItem): void {
    this.router.navigate(['add-lm-wk'], {
      queryParams: { mode: 'edit', pkgId: pkg.PkgID },
      state: { pkg }   // 👈 yahan bhi
    });
  }

  // Add package change nahi karna (wahan koi pkg nahi hoga)
  addPackage(): void {
    this.router.navigate(['add-lm-wk'], {
      queryParams: { mode: 'add' }
    });
  }
  deletePackage(pkg: PackageItem): void {
    console.log('delete clicked', pkg);
  }


  selectedRowForDefault: any = null;

  openDefaultModal(row: any) {
    if (row.DefPkg === 1) return; // already default
    this.selectedRowForDefault = row;

    const ref = this.modalService.open(this.confirmDefaultTpl, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      scrollable: false
    });

    ref.result.then((res: any) => {
      if (res === 'confirm') {
        this.runSetDefault(this.selectedRowForDefault);
      }
    })
    ref.result.catch(() => {
      // do nothing → UI never changed anyway
    });
  }
  confirmDefault(modal: any) {
    modal.close('confirm');
  }
  runSetDefault(row: PackageItem): void {
    if (!row) return;

    const body = { Field1: row.PkgID };
    this.shared.loader(true);

    this.http.post<any>(this.updateDefaultUrl, body).subscribe({
      next: (res) => {
        this.shared.loader(false);

        if (res?.Result) {
          this.toster.success('Default package updated');
          this.fetchPackages();
        } else {
          this.toster.error(res?.MSG_USER || 'Unable to update default package');
          this.fetchPackages();
        }
      },
      error: (err) => {
        console.error('Error default package', err);
        this.shared.loader(false);
        this.toster.error('API error while setting default package');
        this.fetchPackages();
      }
    });
  }


}
