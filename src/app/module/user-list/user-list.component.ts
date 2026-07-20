import { CommonModule } from '@angular/common';
import {
  Component,
  TemplateRef,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import {
  NgbDropdownModule,
  NgbModal,
  NgbModalConfig,
} from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserService } from './user.service';
import { ApiService } from '../../servies/api.service';
import { SharedService } from '../../servies/shared/shared.service';
import { SharedModule } from '../../common/shared.module';
import Swal from 'sweetalert2';
import { PaginationService } from '../../servies/pagination.service';
// import { Country, State, City } from 'country-state-city';
// import { getStateByCodeAndCountry } from 'country-state-city/lib/state';
// import { error, log } from 'console';
import { HttpClient } from '@angular/common/http';
import { first } from 'rxjs';
import { AdminKycModalComponent } from '../admin-kyc-modal/admin-kyc-modal.component';
import * as XLSX from 'xlsx';
import { ngxCsv } from 'ngx-csv';
@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    NgbDropdownModule,
    SharedModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent implements OnInit {
  @ViewChild('content2', { static: true }) content2!: any;
  items = Array(8).fill(0);
  addUserForm: any = FormGroup;
  libuysellTab: any = 'tab1';
  submitted: boolean = false;
  userList: any;
  searchId: any = '0';
  searchVal: any = '';
  loginId: any;
  crossIcon: boolean = false;
  searchIcon: boolean = false;
  Count: any;
  countrySel: any = '';

  states: any;
  selectedCountry: any;
  cities: any;
  userData: any;
  passForm: any = FormGroup;
  execPermissions: any;

  columns = [
    { key: 'Created On', label: 'Created On', visible: true },
    { key: 'Type', label: 'Type', visible: true },
    { key: 'User Details', label: 'User Details', visible: true },
    { key: 'Code', label: 'Code', visible: true },
    { key: 'City/State', label: 'City/State.', visible: true },
    { key: 'KYC', label: 'KYC', visible: true },
    { key: 'Login Status', label: 'Login Status', visible: true },
    { key: 'Balance', label: 'Balance', visible: true },
    { key: 'Credit', label: 'Credit', visible: false },
    { key: 'Action', label: 'Action', visible: true },
  ];
  private hasAccess = this.shared.hasPermission(
    'Users',
    'Overall',
    'AccessAll',
  );
  // console.log('hasAccess', hasAccess);
  constructor(
    public share: SharedService,
    private apiServ: ApiService,
    private modalService: NgbModal,
    private toster: ToastrService,
    private api: ApiService,
    private router: Router,
    private fb: FormBuilder,
    private shared: SharedService,
    private pagination: PaginationService,
    config: NgbModalConfig,
    private http: HttpClient,
  ) {
    config.backdrop = 'static';
    config.keyboard = false;

    console.log('gtdfgfdgfdg const');

    this.shared.setSidebrActiveClass('user-list');

    // Optional: You can subscribe to activeClass$ if needed
    this.shared.activeClass$.subscribe((activeClass: string) => {
      console.log('Current active class in ServicesComponent:', activeClass);
    });
  }

  ngOnInit(): void {
    this.execPermissions = JSON.parse(
      sessionStorage.getItem('execDetails') || '{}',
    );
    this.loginId = JSON.parse(sessionStorage.getItem('isloggedIn') || '{}');
    console.log('here is login id', this.loginId);

    // this.getUser(1, 10);

    if (this.hasAccess) {
      // User can see all data initially
      this.activatefilter = true;
      this.getUser(1, 10);
    } else {
      // User must filter first
      this.activatefilter = false;
      this.userList = [];
    }
    this.addUserForm = this.fb.group({
      First: ['', Validators.required],
      Last: ['', Validators.required],
      Email: [''],
      Pwd: [''],
      // Email: ["", [Validators.required, Validators.pattern(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/)]],
      Phone: [
        '',
        [Validators.required, Validators.pattern('^((\\+91-?)|0)?[0-9]{10}$')],
      ],
      Country: [''],
      oUserType: [1, Validators.required],
      oSignType: ['', Validators.required],
      City: ['', Validators.required],
      State: ['', Validators.required],
    });

    this.passForm = this.fb.group({
      Key: [''],
      // NewPwd: ["", [Validators.required, Validators.pattern(/^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)]]
      NewPwd: ['', [Validators.required]],
    });
    // this.getCountry()

    // this.states = State.getStatesOfCountry('IN');
    // console.log("here is state", this.states);
  }

  passData: any;
  First: any = '';
  Last: any = '';
  Code: any = '';
  Phone: any = '';
  openChangePass(contentPass: any, val: any) {
    if (
      this.execPermissions?.some(
        (permit: any) =>
          permit.Master === 'Users' &&
          permit.SubMasters.some(
            (sub: any) => sub.SubMaster === 'Overall' && sub.Edit === 0,
          ),
      )
    ) {
      this.toster.error(
        'You do not have permission to update password.',
        'Permission Denied',
      );
      return;
    } else {
      this.submitted = false;
      this.passForm.reset();
      this.passData = val;
      this.First = this.passData.First;
      this.Last = this.passData.Last;
      this.Code = this.passData.Code;
      this.Phone = this.passData.Phone;
      console.log('pass data', this.passData);

      this.modalService.open(contentPass, {
        size: 'md modalone',
        centered: true,
        windowClass: 'flip-modal',
      });
    }
  }

  // =============================================================== column setting ====================================================

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

  selectedState: any = '';
  selectCity: any = 0;
  onStateChange(ev: any) {
    console.log('evvvvvv', ev.target.value);
    this.selectedState = ev.target.value;
    this.addUserForm.patchValue({
      State: this.selectedState,
    });

    this.getCity();
    this.addUserForm.patchValue({
      City: '',
    });
  }

  onCityChange(ev: any) {
    this.selectCity = ev.target.value;
    this.addUserForm.patchValue({
      City: this.selectCity,
    });
  }

  selectUser(ev: any) {
    this.crossIcon = false;
    console.log('here is ev', ev.target.value);
    this.searchId = ev.target.value;
    this.searchVal = '';
  }

  statusVal: any = 0;
  selectSatus(ev: any) {
    this.page = 1;
    this.statusVal = ev.target.value;
    this.getUser(1, 10);
    this.activatefilter = true;
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

  TotalApprove: any;
  TotalPending: any;
  TotalRejected: any;
  TotalUsers: any;
  FirstData: any;
  getUser(Initial: any, MaxCount: any) {
    // if (!this.hasAccess) return;
    this.Count = 0;
    // if (this.crossIcon == true) {
    //   this.searchId = '0'
    //   this.searchVal= ""
    //   this.crossIcon = false
    // }
    let data = {
      Key: '',
      Field1: this.searchId, //     NONE = "0",USER_CODE = 1,NAME = 2,PHONE = 3, Email= 4,MASTER_DIST = 5,DISTRIBUTER = 6,STATE = 7,CITY = 8
      Field2: this.searchVal, //Email  , Phone,  Name,   UserCode  , md
      Field3: '0', // DI
      Field4: Initial,
      Field5: Number(MaxCount),
      STATUS: Number(this.statusVal),
    };
    // if (this.searchVal != "") {
    //   // this.searchId= '0'
    //   // this.searchVal = ""
    //   this.crossIcon = true
    //   this.statusVal= 0
    // }
    this.shared.loader(true);
    this.api.getUserList(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false);
        this.userList = res.lstUsers;
        this.TotalApprove = res.TotalApprove;
        this.TotalPending = res.TotalPending;
        this.TotalRejected = res.TotalRejected;
        this.TotalUsers = res.TotalUsers;
        this.Count = res.Count;
        this.pager = this.pagination.getPager(
          this.Count,
          this.page,
          this.numRecord,
        );
        console.log('here is res from user list', this.userList);
        this.FirstData = this.userList[0];
        console.log('FFFFFFFFFFFF', this.FirstData);
      },
      error: (err: any) => {
        this.shared.loader(false);
        this.toster.error('Something went wrong', 'Error');
      },
    });
  }
  activatefilter: boolean = false;
  search() {
    this.page = 1;
    this.crossIcon = true;
    this.activatefilter = true;
    this.getUser(1, 10);
  }

  clear() {
    this.page = 1;
    this.searchVal = '';
    this.searchId = 0;
    this.crossIcon = false;
    this.statusVal = 0;
    this.activatefilter = false;
    if (this.hasAccess) {
      // User can see all data initially
      this.activatefilter = true;
      this.getUser(1, 10);
    } else {
      // User must filter first
      this.activatefilter = false;
      this.userList = [];
    }
  }

  libuysell(tab: any) {
    this.libuysellTab = tab;
  }

  isEmailVisible: boolean = false;
  indValue: any;
  toggleEmailVisibility(val: any, val2: any) {
    if (val) {
      this.indValue = val2;
      this.isEmailVisible = !this.isEmailVisible;
    }
  }

  modalRef: any;
  openLg(content: any) {
    if (
      this.execPermissions?.some(
        (permit: any) =>
          permit.Master === 'Users' &&
          permit.SubMasters.some(
            (sub: any) => sub.SubMaster === 'Overall' && sub.Add === 0,
          ),
      )
    ) {
      this.toster.error(
        'You do not have permission to add users.',
        'Permission Denied',
      );
      return;
    } else {
      this.submitted = false;
      this.addUserForm.reset();
      this.addUserForm.patchValue({
        oUserType: 1,
        oSignType: 2,
      });
      this.getState();
      this.cityData = [];
      this.cityDataTransForm = [];
      console.log('here is ousertype', this.addUserForm.value.oUserType);

      this.selectCity = 0;
      this.selectedState = '';

      this.modalRef = this.modalService.open(content, {
        size: 'md modalone',
        centered: true,
        windowClass: 'flip-modal',
      });
    }
  }
  kyacStage: any;
  changeDataObject: any = {};
  // openLg2(content2: any, kycStatus: any) {
  //   if (
  //     this.execPermissions?.some(
  //       (permit: any) =>
  //         permit.Master === 'Users' &&
  //         permit.SubMasters.some(
  //           (sub: any) => sub.SubMaster === 'Overall' && sub.Edit === 0,
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
  getKycType(stage: number) {
    switch (stage) {
      case 1:
        return 1; // PAN
      case 2:
        return 2; // Aadhar
      case 3:
        return 6; // Selfie
      case 4:
        return 11; // Shop Details
      case 5:
        return 8; // GST
      case 6:
        return 7; // Agreement

      default:
        return 0;
    }
  }
  // openLg2(content2: any, kycStatus: any) {

  //   if (
  //     this.execPermissions?.some(
  //       (permit: any) =>
  //         permit.Master === 'Users' &&
  //         permit.SubMasters.some(
  //           (sub: any) => sub.SubMaster === 'Overall' && sub.Edit === 0,
  //         ),
  //     )
  //   ) {
  //     this.toster.error('You dont have permission to upload kyc.', 'Permission Denied');
  //     return;
  //   } else {

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
  // openLg2(user: any) {
  //   if (
  //     this.execPermissions?.some(
  //       (permit: any) =>
  //         permit.Master === 'Users' &&
  //         permit.SubMasters.some(
  //           (sub: any) => sub.SubMaster === 'Overall' && sub.Edit === 0,
  //         ),
  //     )
  //   ) {
  //     this.toster.error(
  //       'You dont have permission to upload kyc.',
  //       'Permission Denied',
  //     );
  //     return;
  //   }

  //   const modalRef = this.modalService.open(AdminKycModalComponent, {
  //     size: 'lg',
  //     centered: true,
  //     windowClass: 'flip-modal',
  //   });

  //   modalRef.componentInstance.user = user;
  // }
  openLg2(user: any) {
    if (
      this.execPermissions?.some(
        (permit: any) =>
          permit.Master === 'Users' &&
          permit.SubMasters.some(
            (sub: any) => sub.SubMaster === 'Overall' && sub.Edit === 0,
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
            this.activatefilter = true;
            this.getUser(1, 10);
          } else {
            this.activatefilter = false;
            this.userList = [];
          }
        }
      },
      () => {
        // dismissed → do nothing
      },
    );
  }
  openLgkyc(contentkyc: any) {
    this.modalService.open(contentkyc, {
      size: 'lg modalone',
      centered: true,
      windowClass: 'flip-modal',
    });
  }

  openLg3(content3: any, item: any) {
    this.userData = item;
    this.getUserLoc();
    console.log('here is item', this.userData);

    this.modalService.open(content3, {
      size: 'md modalone',
      centered: true,
      windowClass: 'flip-modal',
    });
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
            (sub: any) => sub.SubMaster === 'Overall' && sub.Edit === 0,
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
      // this.getMd()
      // this.getDi()

      this.modalService.open(contentrole, {
        size: 'md md-big modalone',
        centered: true,
        windowClass: 'flip-modal',
      });
    }
  }

  closeModel() {
    this.page = 1;
    this.getUser(1, 10);
    this.modalService.dismissAll();
  }

  expandedIndex: number | null = null; // Track the expanded index
  toggleExpend(index: any) {
    this.expandedIndex = this.expandedIndex === index ? null : index;
    console.log('expended index', this.expandedIndex);
  }

  // ========================================================== assign md di =====================================================

  assignMdDi() {
    // var data = {}
    // if (this.mdProfileId && !this.diProfileId) {
    //   data = {
    //     "Field1": this.assignSrc.Profile,         //ProfileID              //DI
    //     "Field3": this.mdProfileId
    //   }
    // } else if (this.mdProfileId && this.diProfileId) {
    //   data = {
    //     "Field1": this.assignSrc.Profile,         //ProfileID
    //     "Field2": this.diProfileId,               //DI
    //     "Field3": this.mdProfileId
    //   }
    // }
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
          this.toster.success(res.MSG_USER, 'Success');
          this.closeModel();
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
  selecAdType(ev: any, type: any) {
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

  // ============================================================= get master distributor ==================================================

  errorMessage: any = '';
  mdVal: any = '';
  mdList: any;
  getMd(ev: any) {
    if (ev.target.value == '') {
      this.mdList = [];
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

  // ============================================================= get distributor list ========================================================

  errorMessage1: any = '';
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

  navigate(route: string, profileID: any) {
    this.router.navigateByUrl(`${route}/${profileID}`);
  }

  navigateQueryUserType(val: any) {
    console.log('here is val', val);
    localStorage.setItem('First', val.First);
    localStorage.setItem('Last', val.Last);
    localStorage.setItem('Code', val.Code);
    localStorage.setItem('Phone', val.Phone);
    if (val.UserType == 1) {
      this.router.navigateByUrl(
        `user-main/m-distributor?id=${val.Profile}&type=${val.UserType}`,
      );
    } else if (val.UserType == 2) {
      this.router.navigateByUrl(
        `user-main/user-distributor?id=${val.Profile}&type=${val.UserType}`,
      );
    } else if (val.UserType == 3) {
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
        `${route}?id=${val.Profile}&phone=${val.Phone}`,
      );
    }
  }

  navigate2(route: string, val: any) {
    localStorage.setItem('Profile', val.Profile);
    localStorage.setItem('First', val.First);
    localStorage.setItem('Last', val.Last);
    localStorage.setItem('Code', val.Code);
    localStorage.setItem('Phone', val.Phone);
    this.router.navigateByUrl(`${route}`);
  }
  numericMessage: boolean = false;
  numberOnly(event: any): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      this.numericMessage = true;
      return false;
    }
    this.numericMessage = false;
    return true;
  }

  AlphabetOnly(event: any) {
    var inp = String.fromCharCode(event.keyCode);

    if (/[a-zA-Z]/.test(inp)) {
      return true;
      // this.strinput=false
    } else {
      // this.strinput=true
      event.preventDefault();
      return false;
    }
  }
  get f() {
    return this.addUserForm.controls;
  }

  get fpass() {
    return this.passForm.controls;
  }

  signup() {
    this.submitted = true;
    this.addUserForm.patchValue({
      Email: '',
      Pwd: '', // 🔑 force empty string
    });

    if (this.addUserForm.invalid) {
      return;
    }
    // this.shared.loader(true)

    let data = this.addUserForm.value;

    // data.Country = this.userCountry
    data.Key = '';
    data.oSignType = Number(this.addUserForm.value.oSignType);
    data.oUserType = Number(this.addUserForm.value.oUserType);
    data.Country = 'India';
    this.shared.loader(true);

    this.api.makeSignup(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false);
        if (res.Result == -1) {
          // this.router.navigateByUrl("login")
          this.toster.error('Profile already exists and active');
        } else if (
          this.addUserForm.value.oSignType == '3' &&
          res.MSG_USER != 'Your Profile KYC still pending'
        ) {
          this.closeModal();
          this.getUser(1, 10);
          this.toster.success(
            'Signup successfully. Please complete your kyc',
            'Success',
          );
          // setTimeout(() => {
          //   this.openLg2(this.content2, this.userList[0])
          // }, 500);
          setTimeout(() => {
            if (this.FirstData) {
              this.openLg2(this.FirstData);
            }
          }, 500);
          // this.router.navigateByUrl('view-kyc/' + res.Result + '/show-aadhar')
        } else if (res.MSG_USER == 'User Created successfully' && res.Result) {
          this.toster.success('Signup successfully', 'Success');
          this.closeModal();
          this.getUser(1, 10);
        } else {
          this.toster.error('profile already exist', 'Error');
          // this.closeModal()
          // this.getUser(1, 10)
        }
      },
      error: (err: any) => {
        this.shared.loader(false);
        this.toster.error('Something went wrong', 'Error');
      },
    });
  }
  // getUserData: any = [
  //   {
  //     ProfileID: 1007,
  //     Code: "CODE-0140",
  //     Type: "1",
  //     Name: "Vikas Pathak",
  //     Contact: "+91 7845125874",
  //     Place: "Bhimapur",
  //     Email: "anurag.singh@marketwicks.com",
  //     Balance: 720,
  //     Credit: 34000,
  //     Penalty: "NA",
  //     KYC: 0,
  //     Status: "1",
  //     state: "Uttar Pradesh"

  //   },
  //   {
  //     ProfileID: 1006,
  //     Code: "CODE-0140",
  //     Type: "1",
  //     Name: "Anurag Singh",
  //     Contact: "+91 7845125874",
  //     Place: "Bhimapur",
  //     Email: "anurag1.singh@marketwicks.com",
  //     Balance: 70000,
  //     Credit: 4567,
  //     Penalty: "NA",
  //     KYC: 0,
  //     Status: "2",
  //     state: "Uttar Pradesh"

  //   },
  //   {
  //     ProfileID: 1005,
  //     Code: "CODE-0140",
  //     Type: "1",
  //     Name: "Anurag Singh",
  //     Contact: "+91 7845125874",
  //     Place: "Bhimapur",
  //     Email: "anurag2.singh@marketwicks.com",
  //     Balance: 500,
  //     Credit: 2400,
  //     Penalty: "NA",
  //     KYC: 0,
  //     Status: "2",
  //     state: "Madhya Pradesh"

  //   },
  //   {
  //     ProfileID: 1004,
  //     Code: "CODE-0140",
  //     Type: "1",
  //     Name: "Anurag Singh",
  //     Contact: "+91 7845125874",
  //     Place: "Bhimapur",
  //     Email: "anurag3.singh@marketwicks.com",
  //     Balance: 30000,
  //     Credit: 4520,
  //     Penalty: "NA",
  //     KYC: 0,
  //     Status: "2",
  //     state: "Himachal Pradesh"

  //   },
  //   {
  //     ProfileID: 1003,
  //     Code: "CODE-0140",
  //     Type: "1",
  //     Name: "Anurag Singh",
  //     Contact: "+91 7845125874",
  //     Place: "Bhimapur",
  //     Email: "anurag4.singh@marketwicks.com",
  //     Balance: 50000,
  //     Credit: 2300,
  //     Penalty: "NA",
  //     KYC: 0,
  //     Status: "2",
  //     state: "Himachal Pradesh"

  //   },
  //   {
  //     ProfileID: 1002,
  //     Code: "CODE-0140",
  //     Type: "1",
  //     Name: "Anurag Singh",
  //     Contact: "+91 7845125874",
  //     Place: "Bhimapur",
  //     Email: "anurag5.singh@marketwicks.com",
  //     Balance: 4000,
  //     Credit: 4500,
  //     Penalty: "NA",
  //     KYC: 0,
  //     Status: "2",
  //     state: "Himachal Pradesh"

  //   }
  // ]

  getUserList() {
    let obj = {};
    this.api.getUserList(obj).subscribe((res: any) => { });
  }
  stateData: any = [];
  getState() {
    let data = {
      country: 'India',
    };

    this.http
      .post('https://countriesnow.space/api/v0.1/countries/states', data)
      .subscribe((res: any) => {
        this.stateData = res.data.states;
        console.log('here is all state', this.stateData);
      });
  }

  cityDataTransForm: any = [];
  cityData: any = [];
  getCity() {
    let data = {
      country: 'India',
      state: this.selectedState,
    };

    this.http
      .post('https://countriesnow.space/api/v0.1/countries/state/cities', data)
      .subscribe((res: any) => {
        this.cityData = res.data;
        this.cityDataTransForm = this.cityData.map((item: any) => ({
          name: item,
        }));
        console.log('here is city transform data', this.cityDataTransForm);

        console.log('here is all city', this.cityData);
      });
  }

  closeModal() {
    if (this.modalRef) {
      this.modalRef.close(); // or this.modalRef.dismiss() for dismissing the modal
    }
  }

  statKyc: any;
  statLogin: any;
  changeStatus(ev: any, item: any, type: any) {
    if (
      this.execPermissions?.some(
        (permit: any) =>
          permit.Master === 'Users' &&
          permit.SubMasters.some(
            (sub: any) => sub.SubMaster === 'Overall' && sub.Edit === 0,
          ),
      )
    ) {
      this.getUser(1, 10);
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
                  this.toster.success(
                    'Kyc status updated successfully',
                    'Success',
                  );
                }
                this.page = 1;
                // this.getUser(1, 10);
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
          // this.getUser(1, 10);
        }
      });
    }
  }

  filePath: any = [];
  // onFileSelected(ev: any) {

  //   if (ev.target.files[0] != undefined) {
  //     console.log(event)
  //     const file: File = ev.target.files[0];

  //     var reader = new FileReader();
  //     reader.readAsDataURL(file);
  //     reader.onload = () => {

  //       console.log('RESULT', reader.result);

  //       const data = {

  //         // App: 'uploadReceit',
  //         // oData: reader.result
  //         "base64Image": reader.result,

  //         "AppName": "digisuite/adhar"

  //       };

  //       // this.api.uploadImage( data).subscribe((response: any) => {
  //       this.api.uploadImg(data).subscribe({
  //         next: (res: any) => {

  //           this.toster.success("Image uploaded successfully", "Success")
  //           this.uploadKYC(this.kyacStage + 1)

  //         }, error: (err: any) => {

  //           this.toster.error("Something went wrong", "Error")
  //         }
  //       })
  //     }
  //   }
  // }
  kycImg: any = '';
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
        if (kycVal == 6) {
          // this.getUser(1, 10);
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

  navChangePass() {
    this.router.navigateByUrl('view-kyc/show-Changepass');
  }

  navComm(id: any, item: any, pf: any) {
    console.log('here is item', item);

    sessionStorage.setItem('First', item.First);
    sessionStorage.setItem('Last', item.Last);
    sessionStorage.setItem('Code', item.Code);
    sessionStorage.setItem('UserType', item.UserType);
    this.router.navigateByUrl('assign-package/' + id + '/' + pf);
  }
  navPackage(id: any, item: any, pf: any) {
    console.log('here is item', item);

    sessionStorage.setItem('First', item.First);
    sessionStorage.setItem('Last', item.Last);
    sessionStorage.setItem('Code', item.Code);
    sessionStorage.setItem('UserType', item.UserType);

    this.router.navigateByUrl('assign-package-limits/' + id + '/' + pf);
  }

  navChangeLedger(item: any) {
    console.log('dsetg', item);
    sessionStorage.setItem('First', item.First);
    sessionStorage.setItem('Last', item.Last);
    sessionStorage.setItem('Code', item.Code);
    sessionStorage.setItem('Phone', item.Phone);
    this.router.navigateByUrl('user-ledger/' + item.Profile);
  }

  userRiskNav(val: any) {
    console.log('here is val', val);
    sessionStorage.setItem('First', val.First);
    sessionStorage.setItem('Last', val.Last);
    sessionStorage.setItem('Code', val.Code);
    sessionStorage.setItem('Email', val.Email);
    sessionStorage.setItem('UserType', val.UserType);
    this.router.navigateByUrl('user-risk/' + val.Profile);
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
      this.pagedItems = this.userList.slice(
        this.pageRecord * page - this.pageRecord + 1,
        this.pageRecord * page,
      );
      //  this.getLedger(((this.pageRecord*page)-this.pageRecord+1), this.pageRecord*page)
      this.getUser(
        this.pageRecord * page - this.pageRecord + 1,
        this.pageRecord * page,
      );
    }
  }

  getDisplayText(status: number): string {
    switch (status) {
      case 1:
        return 'Pending (pending-color)';
      case 5:
        return 'Success (success-color)';
      case 3:
        return 'Reject (reject-color)';
      case 2:
        return 'Suspended (suspended-color)';
      default:
        return 'Unknown';
    }
  }

  private getTagBalance(item: any, tag: string): string {
    return item.oTag_Lst?.find((dd: any) => dd.Tag === tag)?.Balance ?? '0';
  }

  private userTypeLabel(t: number): string {
    return t === 1 ? 'MD' : t === 2 ? 'DI' : t === 3 ? 'RT' : String(t);
  }

  private kycLabel(v: number): string {
    return v === 5 ? 'Success' : v === 1 ? 'Pending' : v === 3 ? 'Reject' : v === 2 ? 'Suspend' : String(v);
  }

  private fetchAllUsers(): Promise<any[]> {
    return new Promise((resolve) => {
      const data = {
        Key: '',
        Field1: this.searchId,
        Field2: this.searchVal,
        Field3: '0',
        Field4: 1,
        Field5: this.Count || 999999,
        STATUS: Number(this.statusVal),
      };
      this.api.getUserList(data).subscribe({
        next: (res: any) => resolve(res.lstUsers || []),
        error: () => resolve([]),
      });
    });
  }

  async exportCsv() {
    const users = await this.fetchAllUsers();
    const rows = users.map((item: any) => ({
      'Created On': item.Updated?.Tm_Str?.substring(0, 16) || '',
      Type: this.userTypeLabel(item.UserType),
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
    new ngxCsv(rows, 'UserList', { headers: Object.keys(rows[0]) });
  }

  async exportExcel() {
    const users = await this.fetchAllUsers();
    const rows = users.map((item: any) => ({
      'Created On': item.Updated?.Tm_Str?.substring(0, 16) || '',
      Type: this.userTypeLabel(item.UserType),
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
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    XLSX.writeFile(wb, 'UserList.xlsx');
  }

  openAsUser(profileId: number) {
    const clientOrigin = 'https://client.digisuites.com';
    const sid = (crypto as any)?.randomUUID?.() || String(Date.now());
    const clientUrl = `${clientOrigin}/#/login?imp=1&sid=${encodeURIComponent(sid)}`;
    const winName = `client_imp_${sid}`; // ✅ unique name per click
    const child = window.open(clientUrl, winName);

    const onReady = (e: MessageEvent) => {
      if (e.origin !== clientOrigin) return;
      if (e.data?.type !== 'CLIENT_READY' || e.data?.sid !== sid) return; // ✅ match this popup only
      window.removeEventListener('message', onReady);

      this.http
        .post(
          'https://pay.bachatpay.co/Digi_CONF_API_bachatpay/LOGIN_USER_BY_ADM',
          { Field1: String(profileId) },
        )
        .subscribe({
          next: (payload: any) => {
            child?.postMessage(
              { type: 'LOGIN_AS', sid, payload },
              clientOrigin,
            );
          },
          error: (err) => console.error('LOGIN_USER_BY_ADM failed', err),
        });
    };

    window.addEventListener('message', onReady);
  }
}
