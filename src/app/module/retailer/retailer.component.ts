import { Component } from '@angular/core';
import {
  NgbDropdownModule,
  NgbModal,
  NgbModalConfig,
} from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from '../../servies/shared/shared.service';
import { ApiService } from '../../servies/api.service';
import { ToastrService } from 'ngx-toastr';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { PaginationService } from '../../servies/pagination.service';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { AdminKycModalComponent } from '../admin-kyc-modal/admin-kyc-modal.component';
import * as XLSX from 'xlsx';
import { ngxCsv } from 'ngx-csv';

@Component({
  selector: 'app-retailer',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    NgbDropdownModule,
    NgbTooltipModule,
    ReactiveFormsModule,
  ],
  templateUrl: './retailer.component.html',
  styleUrl: './retailer.component.scss',
})
export class RetailerComponent {
  items = Array(8).fill(0);

  libuysellTab: any = 'tab1';
  mdList: any;
  filterVal: any = 0;
  searchVal: any = '';

  errorMessage1: any;
  filteredUsers1: any;
  mdProfile: any = 0;
  diProfile: any = 0;
  oReptType: any = 3;

  submitted: boolean = false;
  passForm: any = FormGroup;

  First: any = '';
  Last: any = '';
  Code: any = '';
  Phone: any = '';
  execPermissions: any;

  libuysell(tab: any) {
    this.libuysellTab = tab;
  }

  isEmailVisible: boolean = false;
  toggleEmailVisibility() {
    this.isEmailVisible = !this.isEmailVisible;
  }

  columns = [
    { key: 'Created On', label: 'Created On', visible: true },
    { key: 'M. Distributor', label: 'M. Distributor', visible: true },
    { key: 'Distributor', label: 'Distributor', visible: true },
    { key: 'User Details', label: 'User Details', visible: true },
    { key: 'Code', label: 'Code', visible: true },
    { key: 'City/State', label: 'City/State.', visible: true },
    { key: 'KYC', label: 'KYC', visible: true },
    { key: 'Login Status', label: 'Login Status', visible: true },
    { key: 'Balance', label: 'Balance', visible: true },
    { key: 'Credit', label: 'Credit', visible: true },
    { key: 'Action', label: 'Action', visible: true },
  ];
  openLg(content: any) {
    this.modalService.open(content, {
      size: 'md modalone',
      centered: true,
      windowClass: 'flip-modal',
    });
  }

  kycImg: any;
  changeDataObject: any;
  kyacStage: any;
  // openLg2(content2: any, kycStatus: any) {
  //   if (
  //     this.execPermissions?.some(
  //       (permit: any) =>
  //         permit.Master === 'Users' &&
  //         permit.SubMasters.some(
  //           (sub: any) => sub.SubMaster === 'Retailer' && sub.Edit === 0,
  //         ),
  //     )
  //   ) {
  //     this.toster.error(
  //       'You dont have permission to upload kyc.',
  //       'Permission Denied',
  //     );
  //     return;
  //   } else {
  //     console.log('here is kyc modal', kycStatus);
  //     this.kycImg = '';
  //     this.changeDataObject = kycStatus;
  //     this.kyacStage = kycStatus.Stage;
  //     this.modalService.open(content2, {
  //       size: 'md modalone',
  //       centered: true,
  //       windowClass: 'flip-modal',
  //     });
  //   }
  // }
  openLg2(user: any) {
    if (
      this.execPermissions?.some(
        (permit: any) =>
          permit.Master === 'Users' &&
          permit.SubMasters.some(
            (sub: any) => sub.SubMaster === 'Retailer' && sub.Edit === 0,
          ),
      )
    ) {
      this.toster.error(
        'You dont have permission to upload kyc.',
        'Permission Denied',
      );
      return;
    }

    const modalRef = this.modalService.open(AdminKycModalComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'flip-modal',
      backdrop: 'static',
      keyboard: false,
    });

    modalRef.componentInstance.user = user;
    // ⭐ listen when modal closes
    modalRef.result.then(
      (result) => {
        if (result === true) {
          if (this.hasAccess) {
            this.getRi(1, 10);
          } else {
            this.riList = [];
          }
        }
      },
      () => {
        // dismissed → do nothing
      },
    );
  }
  closeModal() {
    this.modalService.dismissAll();
  }

  openLg3(content3: any) {
    this.loader = true;
    this.loader2 = true;
    this.selectedUser = [];
    this.selectedUser2 = [];
    this.mdAdList = [];
    this.diAdList = [];
    this.advType = 0;
    this.advType2 = 0;
    this.advVal = '';
    this.advVal2 = '';
    this.errorMessage = '';
    this.errorMessage1 = '';
    this.modalService.open(content3, {
      size: 'md modalone',
      centered: true,
      windowClass: 'flip-modal',
    });
  }

  userData: any;
  openLg4(content4: any, item: any) {
    this.userData = item;
    this.getUserLoc();
    console.log('here is item', this.userData);

    this.modalService.open(content4, {
      size: 'md modalone',
      centered: true,
      windowClass: 'flip-modal',
    });
  }

  passData: any;
  openChangePass(contentPass: any, val: any) {
    if (
      this.execPermissions?.some(
        (permit: any) =>
          permit.Master === 'Users' &&
          permit.SubMasters.some(
            (sub: any) => sub.SubMaster === 'Retailer' && sub.Edit === 0,
          ),
      )
    ) {
      this.toster.error(
        'You do not have permission to update password.',
        'Permission Denied',
      );
      return;
    } else {
      this.First = '';
      this.Last = '';
      this.Code = '';
      this.Phone = '';
      this.submitted = false;
      this.passForm.reset();
      this.passData = val;
      this.First = this.passData.First;
      this.Last = this.passData.Last;
      this.Code = this.passData.Code;
      this.Phone = this.passData.Phone;
      this.modalService.open(contentPass, {
        size: 'md modalone',
        centered: true,
        windowClass: 'flip-modal',
      });
    }
  }

  expandedIndex: number | null = null; // Track the expanded index
  toggleExpend(index: any) {
    this.expandedIndex = this.expandedIndex === index ? null : index;
    console.log('expended index', this.expandedIndex);
  }

  get fpass() {
    return this.passForm.controls;
  }

  // ============================================================== change password ==============================================

  changePass() {
    this.submitted = true;
    if (this.passForm.invalid) {
      return;
    }

    let passData = {
      Key: '',
      LoginID: this.passData.Profile,
      NewPwd: this.passForm.value.NewPwd,
    };
    this.shared.loader(true);
    this.api.CHANGE_USER_ADM_PASSWORD(passData).subscribe({
      next: (res: any) => {
        this.shared.loader(false);
        if (res.Result == false) {
          this.toster.error(res.MSG_USER, 'Error');
        } else {
          this.closeModel();
          this.toster.success('User password changed successfully.', 'Success');
        }
      },
      error: (err: any) => {
        this.shared.loader(false);
        this.toster.error('Something went wrong', 'Error');
      },
    });
  }

  // =============================================================column setting ======================================================

  trackByIndex(index: number): number {
    return index;
  }
  onColumnChange() {
    // This method will trigger when a checkbox is checked or unchecked
    console.log('Column visibility updated', this.columns);
  }
  isColumnVisible(columnKey: string): boolean {
    const column = this.columns.find((col) => col.key === columnKey);
    return column ? column.visible : false;
  }

  newLocation: any;
  getUserLoc() {
    let data = {
      Key: '',
      Field1: String(this.userData.Profile),
    };
    this.api.getUserLocation(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false);
        // if (res.Result == true) {
        // this.latitude= res.Latitude
        // this.longitude= res.Longitude
        // console.log("latitude ", this.latitude, "this.longitude", this.longitude);
        this.newLocation = res.Address;
        console.log('here is res from get location api', res);
      },
      error: (err: any) => {
        this.shared.loader(false);
        this.toster.error('Something went wrong', 'Error');
      },
    });
  }

  assignSrc: any;
  openLgrole(contentrole: any, item: any) {
    if (
      this.execPermissions?.some(
        (permit: any) =>
          permit.Master === 'Users' &&
          permit.SubMasters.some(
            (sub: any) => sub.SubMaster === 'Retailer' && sub.Add === 0,
          ),
      )
    ) {
      this.toster.error(
        'You dont have permission to assign MD/DI.',
        'Permission Denied',
      );
      return;
    } else {
      this.errorMessage = '';
      this.errorMessage1 = '';
      this.mdVal = '';
      this.mdType = 0;
      this.mdProfileId = '';
      this.mdList = [];
      this.diProfileId = '';
      this.diList = [];
      this.diVal = '';
      this.diType = 0;
      console.log('itemmmmmm', item);
      this.assignSrc = item;

      this.modalService.open(contentrole, {
        size: 'md md-big modalone',
        centered: true,
        windowClass: 'flip-modal',
      });
    }
  }

  closeModel() {
    this.page = 1;
    // this.getRi(1, 10);
    if (this.hasAccess) {
      // User can see all data initially
      this.getRi(1, 10);
    } else {
      this.riList = [];
    }
    this.modalService.dismissAll();
  }

  closeModBtn() {
    this.page = 1;
    this.diProfile = 0;
    this.mdProfile = 0;
    this.searchVal = '';
    this.oReptType = 3;
    if (this.hasAccess) {
      // User can see all data initially
      this.getRi(1, 10);
    } else {
      this.riList = [];
    }
    this.modalService.dismissAll();
  }

  constructor(
    private modalService: NgbModal,
    private router: Router,
    private shared: SharedService,
    private api: ApiService,
    private toster: ToastrService,
    private pagination: PaginationService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    config: NgbModalConfig,
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  navigate(route: string, profileID: any) {
    this.router.navigateByUrl(`${route}/${profileID}`);
  }

  navigate2(route: string, val: any) {
    localStorage.setItem('Profile', val.Profile);
    localStorage.setItem('First', val.First);
    localStorage.setItem('Last', val.Last);
    localStorage.setItem('Code', val.Code);
    localStorage.setItem('Phone', val.Phone);
    this.router.navigateByUrl(`${route}`);
  }
  private hasAccess = this.shared.hasPermission(
    'Users',
    'Retailer',
    'AccessAll',
  );

  ngOnInit(): void {
    this.execPermissions = JSON.parse(
      sessionStorage.getItem('execDetails') || '{}',
    );
    this.shared.setSidebrActiveClass('retailer');
    this.route.queryParams.subscribe((param: any) => {
      if (param.id) {
        this.mdProfile = param.id;
      } else {
        this.diProfile = param.diProfile;
        this.mdProfile = param.mdProfile;
      }
      this.First = sessionStorage.getItem('RiFirst');
      this.Last = sessionStorage.getItem('RiLast');
      this.Code = sessionStorage.getItem('RiCode');
      this.Phone = sessionStorage.getItem('RiPhone');
      this.oReptType = 3;
      console.log('here is quary param id', param);
    });
    // this.getRi(1, 10)
    if (this.hasAccess) {
      // User can see all data initially
      this.getRi(1, 10);
    } else {
      this.riList = [];
    }
    this.passForm = this.fb.group({
      Key: [''],
      NewPwd: ['', [Validators.required]],
    });
  }

  navigateQueryUserType(val: any) {
    console.log('here is val', val);
    localStorage.setItem('First', val.First);
    localStorage.setItem('Last', val.Last);
    localStorage.setItem('Code', val.Code);
    localStorage.setItem('Phone', val.Phone);
    if (val.UserType == 3) {
      this.router.navigateByUrl(
        `user-main/user-retailer?id=${val.Profile}&type=${val.UserType}`,
      );
    }
  }

  navigateQury(route: string, val: any) {
    if (route != 'message-center') {
      localStorage.setItem('First', val.First);
      localStorage.setItem('Last', val.Last);
      localStorage.setItem('Code', val.Code);
      localStorage.setItem('Phone', val.Phone);
      this.router.navigateByUrl(
        `${route}?id=${val.Profile}&type=${val.UserType}`,
      );
    } else {
      this.router.navigateByUrl(
        `${route}?id=${val.Profile}&email=${val.Email}`,
      );
    }
  }

  // ============================================================= get MD ===================================================================

  riList: any;
  Count: any;
  getRi(Initial: any, MaxCount: any) {
    this.Count = 0;
    // if (this.crossIcon == true) {
    //   this.searchId= '0'
    //   // this.searchVal= ""
    //   this.crossIcon= false
    // }
    let data = {
      Key: '',
      oReptType: this.oReptType, //        MASTER_DISTR = 1,DISTRI = 2,RETAILER = 3,END_USER = 4
      ProfileMD: this.mdProfile,
      ProfileDI: this.diProfile,
      oType: this.filterVal, //        NONE=0,NAME=1,EMAIL=2,PHONE=7,USER_CODE=8
      Value: this.searchVal,
      Initial: Initial,
      MaxCount: MaxCount,
      // Status: 0
    };
    // if (this.searchVal != "") {
    //   // this.searchId= '0'
    //   this.searchVal= ""
    //   this.crossIcon= true
    // }
    this.shared.loader(true);
    this.api.getAdmType(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false);
        this.riList = res.lstUsers;
        this.Count = res.Count;
        this.pager = this.pagination.getPager(
          this.Count,
          this.page,
          this.numRecord,
        );
        console.log('here is res from user list', this.mdList);
      },
      error: (err: any) => {
        this.shared.loader(false);
        this.toster.error('Something went wrong', 'Error');
      },
    });
  }

  sleectFilter(ev: any) {
    this.searchVal = '';
    this.filterVal = ev.target.value;
    console.log('here filterval', this.filterVal);
  }

  search() {
    this.crossIcon = true;
    this.page = 1;
    this.getRi(1, 10);
  }

  crossIcon: boolean = false;
  clear() {
    this.page = 1;
    this.filterVal = 0;
    this.searchVal = '';
    this.mdProfile = 0;
    this.diProfile = 0;
    this.crossIcon = false;
    // this.getRi(1, 10)
    if (this.hasAccess) {
      // User can see all data initially
      this.getRi(1, 10);
    } else {
      this.riList = [];
    }
    this.mdAdList = [];
    this.selectedUser = [];
    this.diAdList = [];
    this.riList = [];
  }

  // ===================================================================== advance search ========================================================

  mdAdList: any;
  advType: any = 0;
  advVal: any = '';
  getAdvanceFil(ev: any) {
    if (ev.target.value == '') {
      this.mdAdList = [];
      this.errorMessage = '';
      return;
    }

    let data = {
      Key: '',
      oReptType: 1, //MD=1,DI=2,RE=3
      oType: this.advType, //NONE=0,NAME=1,EMAIL=2,PHONE=7,USER_CODE=8
      Value: this.advVal,
    };

    // this.shared.loader(true)
    this.api.filterMdDsRi(data).subscribe({
      next: (res: any) => {
        // this.shared.loader(false)
        this.mdAdList = res;
        if (this.mdAdList.length < 1) {
          this.errorMessage = 'No Md found';
        }
        console.log('here is res from user list', this.mdList);
      },
      error: (err: any) => {
        // this.shared.loader(false)
        this.toster.error('Something went wrong', 'Error');
      },
    });
  }

  selecAdType(ev: any) {
    this.loader = true;
    this.selectedUser = [];
    this.mdAdList = [];
    this.advVal = '';
    this.advType = ev.target.value;
    this.errorMessage = '';
  }

  loader: any = true;
  selectedUser: any = [];
  onSelectUser(val: any) {
    console.log('here is val', val);
    this.mdProfile = val.ProfileId;

    this.selectedUser = [];
    this.errorMessage = '';
    // this.advVal= ''
    console.log('here is val', val);
    this.selectedUser.push(val);
    this.loader = false;
    if (this.selectedUser.length > 0) {
      this.mdAdList = [];
      if (this.advType == '1') {
        this.advVal = val.Name;
      } else if (this.advType == '2') {
        this.advVal = val.Email;
      } else if (this.advType == '7') {
        this.advVal = val.Phone;
      } else if (this.advType == '8') {
        this.advVal = val.Code;
      }
    }
    console.log('selected user', this.selectedUser);
  }

  // ====================================================================== adv serach 2 ==========================================================

  diAdList: any;
  advType2: any = 0;
  advVal2: any = '';
  getAdvanceFil2(ev: any) {
    if (ev.target.value == '') {
      this.diAdList = [];
      this.errorMessage1 = '';
      return;
    }

    let data = {
      Key: '',
      oReptType: 2, //MD=1,DI=2,RE=3
      oType: this.advType2, //NONE=0,NAME=1,EMAIL=2,PHONE=7,USER_CODE=8
      Value: this.advVal2,
    };

    // this.shared.loader(true)
    this.api.filterMdDsRi(data).subscribe({
      next: (res: any) => {
        // this.shared.loader(false)
        this.diAdList = res;
        if (this.mdAdList.length < 1) {
          this.errorMessage1 = 'No Di found';
        }
        console.log('here is res from user list', this.diAdList);
      },
      error: (err: any) => {
        // this.shared.loader(false)
        this.toster.error('Something went wrong', 'Error');
      },
    });
  }

  selecAdType2(ev: any) {
    this.loader2 = true;
    this.selectedUser2 = [];
    this.diAdList = [];
    this.advVal2 = '';
    this.errorMessage1 = '';
    this.advType2 = ev.target.value;
  }

  loader2: any = true;
  selectedUser2: any = [];
  onSelectUser2(val: any) {
    console.log('here is val', val);
    this.diProfile = val.ProfileId;

    this.selectedUser2 = [];
    this.errorMessage1 = '';
    // this.advVal= ''
    this.selectedUser2.push(val);
    this.loader2 = false;
    if (this.selectedUser2.length > 0) {
      this.diAdList = [];
      if (this.advType2 == '1') {
        this.advVal2 = val.Name;
      } else if (this.advType2 == '2') {
        this.advVal2 = val.Email;
      } else if (this.advType2 == '7') {
        this.advVal2 = val.Phone;
      } else if (this.advType2 == '8') {
        this.advVal2 = val.Code;
      }
    }
    console.log('selected user', this.selectedUser2);
  }

  // ======================================================================= submit to find md or di ==================================================================

  advSubmit() {
    this.crossIcon = true;
    this.searchVal = '';
    this.filterVal = 0;
    this.closeModel();
    this.getRi(1, 10);
  }

  onFileSelected(ev: any) {
    const fileInput = ev.target;

    if (fileInput.files && fileInput.files[0]) {
      const file: File = fileInput.files[0];
      const reader = new FileReader();

      reader.readAsDataURL(file);
      reader.onload = () => {
        const data = {
          base64Image: reader.result,
          AppName: 'digisuite/adhar',
        };

        this.shared.loader(true);
        this.api.uploadImg(data).subscribe({
          next: (res: any) => {
            this.shared.loader(false);
            this.kycImg = res.url;
            this.toster.success('Image uploaded successfully', 'Success');
            // this.kyacStage = this.kyacStage + 1

            fileInput.value = ''; // Reset the file input field after upload
          },
          error: (err: any) => {
            this.shared.loader(false);
            this.toster.error('Something went wrong', 'Error');
          },
        });
      };
    }
  }

  removeImg() {
    this.kycImg = '';
  }

  kycType: any = 0;
  kycDet: any = '';
  stageVal: any;
  uploadKYC(val: any, kycVal: any) {
    console.log('img', this.kycImg);
    console.log('val', val);
    this.stageVal = val + 1;

    if (kycVal == 1) {
      this.kycDet = 'pan';
      this.kycType = kycVal;
    } else if (kycVal == 2) {
      this.kycDet = 'aadhar';
      this.kycType = kycVal;
    } else if (kycVal == 3) {
      this.kycDet = 'selfie';
      this.kycType = kycVal + 3;
    } else if (kycVal == 6) {
      this.kycDet = 'shop';
      this.kycType = 11;
    }

    let obj = {
      Path: this.kycImg,
      Details: this.kycDet,
      Details2: '',
      Details3: '',
      oStage: kycVal, //PAN_CARD = 1,AADDHAR = 2,VIDEO = 3,BANK = 4SIGNATURE = 5AGREEMENT = 6DISCLAIMER = 7,PERSONAL_INFO = 8,SHOP_DETAILS = 9
      oKYC_DOC: {
        ProfileId: this.changeDataObject?.Profile,
        oKYC_Type: this.kycType, //PAN_CARD = 1,AADHAR_ID = 2,ADDR = 3,BANK_STATEMENT = 4,SIGNATURE = 5,VIDEO_VERIFY = 6,AGREEMENT = 7,PASSPORT = 8,SHOP_DETAILS = 11
        oStatus: 2, //        PENDING = 1,SUCCESS = 2,REJECT = 3,RESUBMIT = 4,SUSPEND = 5,UPLOAD = 6
        Key: '',
      },
    };

    this.api.UPLOAD_KYC_DOC(obj).subscribe((res: any) => {
      if (res.Result == true) {
        this.kyacStage = kycVal;
        this.toster.success(res.MSG_USER, 'Success');
        this.kycImg = '';
        if (kycVal == 9) {
          this.getRi(1, 10);
          this.closeModal();
        }
      }
      // else if (res.Result == true && kycVal == 9) {
      //   this.kyacStage = kycVal
      //   this.toster.success(res.MSG_USER, "Success")
      //   this.getUser(1, 10)
      //   this.closeModal()
      // }
      else {
        this.toster.error(res.MSG_USER, 'Error');
      }
    });
  }

  userRiskNav(val: any) {
    console.log('here is val', val);
    sessionStorage.setItem('First', val.First);
    sessionStorage.setItem('Last', val.Last);
    sessionStorage.setItem('Code', val.Code);
    sessionStorage.setItem('Email', val.Email);
    this.router.navigateByUrl('user-risk/' + val.Profile);
  }

  navComm(id: any, item: any, pf: any) {
    console.log('here is item', item);

    sessionStorage.setItem('First', item.First);
    sessionStorage.setItem('Last', item.Last);
    sessionStorage.setItem('Code', item.Code);
    sessionStorage.setItem('Phone', item.Phone);
    sessionStorage.setItem('UserType', item.UserType);
    this.router.navigateByUrl('assign-package/' + id + '/' + pf);
  }

  navChangeLedger(item: any) {
    console.log('dsetg', item);
    sessionStorage.setItem('First', item.First);
    sessionStorage.setItem('Last', item.Last);
    sessionStorage.setItem('Code', item.Code);
    sessionStorage.setItem('Phone', item.Phone);
    this.router.navigateByUrl('user-ledger/' + item.Profile);
  }

  statKyc: any;
  statLogin: any;
  changeStatus(ev: any, item: any, type: any) {
    if (
      this.execPermissions?.some(
        (permit: any) =>
          permit.Master === 'Users' &&
          permit.SubMasters.some(
            (sub: any) => sub.SubMaster === 'Retailer' && sub.Edit === 0,
          ),
      )
    ) {
      this.getRi(1, 10);
      this.toster.error(
        'You do not have permission to update status.',
        'Permission Denied',
      );
      return;
    } else {
      console.log('item', item);
      // if (ev.target.value) {
      // this.statLogin= ev.target.value
      // }
      if (ev.target.value && type === 'kyc') {
        this.statKyc = ev.target.value;
        this.statLogin = item.Login;
      } else if (ev.target.value && type === 'login') {
        this.statLogin = ev.target.value;
        this.statKyc = item.KYC;
      }

      Swal.fire({
        title: 'Are you sure?',
        text: 'You want to change status',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes!',
      }).then((result: any) => {
        if (result.isConfirmed) {
          let data = {
            Key: '',
            LoginID: item.Profile,
            Status_Login: this.statLogin, //   PENDING = 1,SUCCESS = 5,REJECT = 3,suspend = 2
            Status_KYC: this.statKyc,
          };
          this.api.changeStatusUser(data).subscribe({
            next: (res: any) => {
              // this.shared.loader(false)
              if (res.Result == true) {
                if (type === 'login') {
                  this.toster.success(
                    'Login status updated successfully',
                    'Success',
                  );
                } else {
                  this.toster.success(res.MSG_USER, 'Success');
                }
                this.page = 1;
                this.getRi(1, 10);
              } else {
                this.toster.error(res.MSG_USER, 'Error');
              }
            },
            error: (err: any) => {
              this.toster.error('Something went wrong', 'Error');
            },
          });
        } else {
          this.page = 1;
          this.getRi(1, 10);
        }
      });
    }
  }

  // ============================================================= get distributor list ========================================================

  diVal: any = '';
  diType: any = 0;
  diList: any;
  getDi() {
    if (this.mdProfileId == '') {
      this.mdProfileId = 0;
    }
    let data = {
      Key: '',
      oReptType: 2, //        MASTER_DISTR = 1,DISTRI = 2,RETAILER = 3,END_USER = 4
      ProfileMD: this.mdProfileId,
      ProfileDI: 0,
      oType: this.diType, //        NONE=0,NAME=1,EMAIL=2,PHONE=7,USER_CODE=8
      Value: this.diVal,
      Initial: 0,
      MaxCount: 100,
      // Status: 0
    };

    this.shared.loader(true);
    this.api.getAdmType(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false);
        this.diList = res.lstUsers;
        if (this.diList.length < 1) {
          this.errorMessage1 = 'No Di found.';
        } else {
          this.errorMessage1 = '';
        }
        console.log('here is res from user list', this.diList);
      },
      error: (err: any) => {
        this.shared.loader(false);
        this.toster.error('Something went wrong', 'Error');
      },
    });
  }

  // ============================================================= get master distributor ==================================================

  errorMessage: any = '';
  mdVal: any = '';
  getMd(ev: any) {
    if (this.mdVal == '') {
      this.mdList = [];
      this.errorMessage = '';
      return;
    }
    let data = {
      Key: '',
      oReptType: 1, //        MASTER_DISTR = 1,DISTRI = 2,RETAILER = 3,END_USER = 4
      ProfileMD: 0,
      ProfileDI: 0,
      oType: this.mdType, //        NONE=0,NAME=1,EMAIL=2,PHONE=7,USER_CODE=8
      Value: this.mdVal,
      Initial: 0,
      MaxCount: 100,
      // Status: 0
    };
    this.shared.loader(true);
    this.api.getAdmType(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false);
        this.mdList = res.lstUsers;
        if (this.mdList.length < 1) {
          this.errorMessage = 'No Md found.';
        } else {
          this.errorMessage = '';
        }
        console.log('here is res from user list', this.mdList);
      },
      error: (err: any) => {
        this.shared.loader(false);
        this.toster.error('Something went wrong', 'Error');
      },
    });
  }

  // ========================================================== assign md di =====================================================

  assignMdDi() {
    var data = {};
    if (this.mdProfileId && !this.diProfileId) {
      data = {
        Field1: this.assignSrc.Profile, //ProfileID              //DI
        Field3: this.mdProfileId,
      };
    } else if (!this.mdProfileId && this.diProfileId) {
      data = {
        Field1: this.assignSrc.Profile, //ProfileID
        Field2: this.diProfileId, //DI
      };
    } else if (this.mdProfileId && this.diProfileId) {
      data = {
        Field1: this.assignSrc.Profile, //ProfileID
        Field2: this.diProfileId, //DI
        Field3: this.mdProfileId,
      };
    }
    this.api.assignMdDi(data).subscribe({
      next: (res: any) => {
        if (res.Result == true) {
          this.closeModel();
          this.getRi(1, 10);
          this.toster.success(res.MSG_USER, 'Success');
        } else {
          this.toster.error(res.MSG_USER, 'Error');
        }
      },
      error: (error: any) => {
        this.toster.error('Something went wrong', 'Error');
      },
    });
  }

  mdProfileId: any = 0;
  diProfileId: any;
  selectMdDi(val: any, type: any) {
    if (type === 'md' && this.mdType === '1') {
      console.log('her is md', val);
      this.mdVal = val.First + ' ' + val.Last;
      this.mdProfileId = val.Profile;
      this.mdList = [];
      // this.getDi()
    } else if (type === 'md' && this.mdType === '2') {
      this.mdVal = val.Email;
      this.mdProfileId = val.Profile;
      this.mdList = [];
    } else if (type === 'md' && this.mdType === '7') {
      this.mdVal = val.Phone;
      this.mdProfileId = val.Profile;
      this.mdList = [];
    } else if (type === 'md' && this.mdType === '8') {
      this.mdVal = val.Code;
      this.mdProfileId = val.Profile;
      this.mdList = [];
    } else if (type === 'di' && this.diType === '1') {
      this.diVal = val.First + ' ' + val.Last;
      this.diProfileId = val.Profile;
      this.diList = [];
    } else if (type === 'di' && this.diType === '2') {
      this.diVal = val.Email;
      this.diProfileId = val.Profile;
      this.diList = [];
    } else if (type === 'di' && this.diType === '7') {
      this.diVal = val.Phone;
      this.diProfileId = val.Profile;
      this.diList = [];
    } else if (type === 'di' && this.diType === '8') {
      this.diVal = val.Code;
      this.diProfileId = val.Profile;
      this.diList = [];
    }

    //  else{
    //   this.diProfileId= val.Profile
    //   this.diList= []
    // }
  }

  mdType: any = 0;
  selecAdTypee(ev: any, type: any) {
    // this.loader= true
    // this.selectedUser= []
    if (type === 'md') {
      this.mdList = [];
      this.diList = [];
      this.mdVal = '';
      this.mdType = ev.target.value;
      console.log('md type', this.mdType);
    } else {
      this.diVal = '';
      this.diType = ev.target.value;
      console.log('md type', this.mdType);
    }
  }

  // =========================================================== pagination ===============================================

  numRecord: any = 10;
  pageRecord: any = 10;
  pageRecordNum: any = '';
  pager: any = [];

  pagedItems: any;
  pages: any = '';
  page: any = 1;
  onPageSizeChange() {
    this.page = 1;
    this.pageRecord = this.numRecord;
    this.setPage(1);
  }
  setPage(page: number) {
    this.page = page;

    if (page >= 1 && page <= this.pager.totalPages) {
      this.pager = this.pagination.getPager(
        this.Count,
        this.pageRecord,
        this.numRecord,
      );
      this.pagedItems = this.riList.slice(
        this.pageRecord * page - this.pageRecord + 1,
        this.pageRecord * page,
      );
      //  this.getLedger(((this.pageRecord*page)-this.pageRecord+1), this.pageRecord*page)
      this.getRi(
        this.pageRecord * page - this.pageRecord + 1,
        this.pageRecord * page,
      );
    }
  }

  ngOnDestroy() {
    sessionStorage.removeItem('RiFirst');
    sessionStorage.removeItem('RiLast');
    sessionStorage.removeItem('RiPhone');
    sessionStorage.removeItem('RiCode');
    console.log('data remove');
  }
  navPackage(id: any, item: any, pf: any) {
    console.log('here is item', item);

    sessionStorage.setItem('First', item.First);
    sessionStorage.setItem('Last', item.Last);
    sessionStorage.setItem('Code', item.Code);
    sessionStorage.setItem('UserType', item.UserType);

    this.router.navigateByUrl('assign-package-limits/' + id + '/' + pf);
  }

  private getTagBalance(item: any, tag: string): string {
    return item.oTag_Lst?.find((dd: any) => dd.Tag === tag)?.Balance ?? '0';
  }

  private kycLabel(v: number): string {
    return v === 5 ? 'Success' : v === 1 ? 'Pending' : v === 3 ? 'Reject' : v === 2 ? 'Suspend' : String(v);
  }

  private fetchAll(): Promise<any[]> {
    return new Promise((resolve) => {
      const data = {
        Key: '',
        oReptType: this.oReptType,
        ProfileMD: this.mdProfile,
        ProfileDI: this.diProfile,
        oType: this.filterVal,
        Value: this.searchVal,
        Initial: 1,
        MaxCount: this.Count || 999999,
      };
      this.api.getAdmType(data).subscribe({
        next: (res: any) => resolve(res.lstUsers || []),
        error: () => resolve([]),
      });
    });
  }

  async exportCsv() {
    const items = await this.fetchAll();
    const rows = items.map((item: any) => ({
      'Created On': item.Created?.Tm_Str?.substring(0, 16) || '',
      'M. Distributor': item.MD_INFO ? `${item.MD_INFO.Name || ''} (${item.MD_INFO.ClientCode || ''})` : '',
      Distributor: item.DI_INFO ? `${item.DI_INFO.Name || ''} (${item.DI_INFO.ClientCode || ''})` : '',
      Name: `${item.First || ''} ${item.Last || ''}`.trim(),
      // Email: item.Email || '',
      Phone: item.Phone || '',
      Code: item.Code || '',
      City: item.Addr?.oUserAddr?.City || '',
      State: item.Addr?.oUserAddr?.State || '',
      KYC: this.kycLabel(item.KYC),
      Balance: this.getTagBalance(item, 'BALANCE'),
      Credit: this.getTagBalance(item, 'CREDIT'),
    }));
    if (!rows.length) return;
    new ngxCsv(rows, 'RetailerList', { headers: Object.keys(rows[0]) });
  }

  async exportExcel() {
    const items = await this.fetchAll();
    const rows = items.map((item: any) => ({
      'Created On': item.Created?.Tm_Str?.substring(0, 16) || '',
      'M. Distributor': item.MD_INFO ? `${item.MD_INFO.Name || ''} (${item.MD_INFO.ClientCode || ''})` : '',
      Distributor: item.DI_INFO ? `${item.DI_INFO.Name || ''} (${item.DI_INFO.ClientCode || ''})` : '',
      Name: `${item.First || ''} ${item.Last || ''}`.trim(),
      // Email: item.Email || '',
      Phone: item.Phone || '',
      Code: item.Code || '',
      City: item.Addr?.oUserAddr?.City || '',
      State: item.Addr?.oUserAddr?.State || '',
      KYC: this.kycLabel(item.KYC),
      Balance: this.getTagBalance(item, 'BALANCE'),
      Credit: this.getTagBalance(item, 'CREDIT'),
    }));
    if (!rows.length) return;
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Retailers');
    XLSX.writeFile(wb, 'RetailerList.xlsx');
  }
}
