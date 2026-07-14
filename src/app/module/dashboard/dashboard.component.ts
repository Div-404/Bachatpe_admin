import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../servies/api.service';
import { SharedService } from '../../servies/shared/shared.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  userVal: any = [];
  $index: any;
  vendors = [
    { Vendor: 'Cyrus', VendorID: 102 },
    { Vendor: 'IServeU', VendorID: 100 },
    { Vendor: 'Kwik', VendorID: 103 },
    { Vendor: 'Sankalpe', VendorID: 101 },
  ];
  constructor(
    private shared: ApiService,
    private loader: SharedService,
  ) {}
  ngOnInit(): void {
    this.loader.loader(true);
    this.shared.GET_Admin_Data().subscribe((data) => {
      this.userVal = data;
      this.loader.loader(false);
    });
  }
  libuysellTab: any = 'tab1';
  mapVendorsToAPI(apiList: number) {
    const vendor = this.vendors.find((v) => v.VendorID === apiList);
    return vendor ? vendor.Vendor : 'Unknown Vendor';
  }
  libuysell(tab: any) {
    this.libuysellTab = tab;
  }

  businessTab: any = 'tab1';

  businessBody(tab: any) {
    this.businessTab = tab;
  }
  records = Array.from({ length: 8 });
  recordsten = Array.from({ length: 8 });
  getServiceType(type: number): string {
    switch (type) {
      case 1:
        return 'Money Transfer';
      case 2:
        return 'Recharge';
      case 3:
        return 'Booking';
      case 4:
        return 'Utility';
      default:
        return 'Misc';
    }
  }
}
