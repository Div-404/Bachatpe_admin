import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { GlobalAPIService } from './../../../service/global-api.service';
// import { CookieService } from 'ngx-cookie-service';
// import { SharedDataService } from 'src/app/service/shared-data.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SharedService } from '../../../servies/shared/shared.service';
import { ApiService } from '../../../servies/api.service';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
@Component({
  selector: 'app-excutive-update',
  standalone: true,
  imports: [
    CommonModule,
    NgbDropdownModule,
    ReactiveFormsModule,
    FormsModule,
    NgSelectModule,
  ],
  templateUrl: './excutive-update.component.html',
  styleUrls: ['./excutive-update.component.scss'],
})
export class ExcutiveUpdateComponent implements OnInit, OnDestroy {
  execData: any;
  editOption: any;
  execForm: any = FormGroup;
  masterData: any;
  subMasterData: any;
  getEditData: boolean = false;
  selectedSubMasterID: any;
  selectedMasterID: any;
  executiveData: any;
  masterList: any[] = [];
  subMasterList: any[] = [];
  modalMasterList: any = [];
  modalSubMasterList: any = [];
  masterOptions: any;
  subMasterOptions: any = [];
  masterID: any = '';
  subMasterID: any;
  execID: any;
  listArray: any = [];
  addMoreData: any = [];
  masterMdule: any;
  subModule: any;
  add: boolean = false;
  edit: boolean = false;
  delete: boolean = false;
  Access: boolean = false;
  vUsetData: any = [];
  exec: any;
  countryData: any;
  cardVisibility: boolean[] = [true];
  execPermissions: any;
  Access_All: boolean = false;

  constructor(
    private modalService: NgbModal,
    private router: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private fb: FormBuilder,
    private shared: SharedService,
    private api: ApiService,
    public toastrService: ToastrService,
    private route: Router,
  ) {}
  updataeDisplayData: any = [];

  ngOnInit(): void {
    this.shared.selectedPermission.subscribe((data: any) => {
      // console.log("sidebarPermissions",data);
      this.execPermissions = data;
    });

    this.getCountries();
    this.getExecutive();
    this.getModule();
    this.getSubMaster();

    this.execForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)]],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,3})$/,
          ),
        ],
      ],
      phone: ['', Validators.required],
      country: ['', Validators.required],
      status: ['', Validators.required],
      lstPermit: this.fb.array([this.createModuleFormGroup()]),
    });
    this.router.params.subscribe((params) => {
      this.editOption = params['id1'];

      this.exec = sessionStorage.getItem('execdata');
      this.execData = JSON.parse(this.exec);
    });

    this.listArray = [];
    if (this.editOption == 0) {
      this.modalMasterList = this.masterList;
      this.modalSubMasterList = this.subMasterList;
      this.execForm.reset();
      this.getEditData = false;
    } else {
      this.execData.lstPermit.forEach((element: any) => {
        element?.SubMasters?.forEach((el: any) => {
          this.getEditData = true;
          this.vUsetData.push({
            Master: element.Master,
            MasterID: element.MasterID,

            Access: el.Access,
            Add: el.Add,
            Delete: el.Delete,
            Edit: el.Edit,
            Access_All: el.Access_All,
            SubMaster: el.SubMaster,
            SubMasterID: el.SubMasterID,
          });
        });
      });

      this.addMoreData = this.execData.lstPermit;

      this.addMoreData.forEach((element: any) => {
        element?.SubMasters.forEach((el: any) => {
          if (el.Access == 0) {
            el.Access = false;
          } else {
            el.Access = true;
          }
          if (el.Add == 0) {
            el.Add = false;
          } else {
            el.Add = true;
          }
          if (el.Edit == 0) {
            el.Edit = false;
          } else {
            el.Edit = true;
          }
          if (el.Delete == 0) {
            el.Delete = false;
          } else {
            el.Delete = true;
          }
          if (el.Access_All == 0) {
            el.Access_All = false;
          } else {
            el.Access_All = true;
          }
          this.updataeDisplayData.push({
            Master: element.Master,
            MasterID: element.MasterID,
            SubMasters: el,
          });
        });
      });

      this.getEditData = true;
      this.execForm.reset();
      //  this.onMasterIDChange(100)

      this.addMoreData.forEach((element: any) => {
        element?.SubMasters.forEach((element1: any) => {
          let obj = {
            Master: element.Master,
            MasterID: element.MasterID,
            SubMasterID: element1.SubMaster,
          };
          this.listArray.push(obj);
        });
      });

      this.execID = this.execData.ExecID;
      this.execForm.patchValue({
        name: this.execData.Name,
        email: this.execData.Email,
        phone: this.execData.Phone,
        country: this.execData.Country,
        status: this.execData.Status ? 'Active' : 'Inactive',
      });
    }
  }

  ngOnDestroy(): void {
    sessionStorage.removeItem('execdata');
  }

  createModuleFormGroup() {
    return this.fb.group({
      MasterID: ['', Validators.required],
      SubMasterID: ['', Validators.required],
    });
  }
  addModule() {
    const moduleGroup = this.createModuleFormGroup();
    (<FormArray>this.execForm.get('lstPermit')).push(moduleGroup);
  }

  removeModule(index: number) {
    (<FormArray>this.execForm.get('lstPermit')).removeAt(index);
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

  removeCard(index: number) {
    // Remove the card at the given index from the vUsetData array
    this.vUsetData.splice(index, 1);
  }
  getModule() {
    let obj = {
      Key: '',
      MasterID: 0,
    };
    this.api.GET_EXECH_MASTER(obj).subscribe((res: any) => {
      if (res) {
        this.masterData = res;

        this.masterOptions = this.masterData.map((item: any) => ({
          id: item.MasterID,
          name: item.Master,
        }));

        this.cd.detectChanges();
      } else {
        this.toastrService.error('No Data found');
      }
    });
  }
  subMasterValue: any = [];
  MasterValue: any = [];
  onMasterIDChange(event: any) {
    //  console.log("masterIDchangeevent",event)
    this.MasterValue = event;

    this.masterID = event.id; // Store the selected value (ID)
    // Update the Sub Master dropdown options based on the selected Master

    this.subMasterOptions = [];
    this.subModule = '';
    this.subMasterOptions = this.subMasterData
      .filter((item: any) => item.MasterID === this.masterID)
      .map((item: any) => ({
        id: item.SubMasterID,
        SubMaster: item.SubMaster,
        Add: item.oPermit.Add,
        Edit: item.oPermit.Edit,
        Access: item.oPermit.Access,
        Access_All: item.oPermit.Access_All,
        Delete: item.oPermit.Delete,
      }));
  }

  onSubMasterIDChange(event: any) {
    // console.log("submasterIDchangeevent",event)
    this.subMasterID = event; // Store the selected value (ID)
  }

  getSubMaster() {
    let obj = {
      Key: '',
      MasterID: 0,
      SubMasterID: 0,
    };
    this.api.GET_EXECH_SUB_MASTER(obj).subscribe(
      (res: any) => {
        if (res) {
          this.subMasterData = res;
          // console.log("this.subMasterData",this.subMasterData)

          this.subMasterOptions = this.subMasterData
            .filter((item: any) => item.MasterID === this.masterID)
            .map((item: any) => ({
              id: item.SubMasterID,
              SubMaster: item.SubMaster,
              Add: item.oPermit.Add,
              Edit: item.oPermit.Edit,
              Access: item.oPermit.Access,
              Access_All: item.oPermit.Access_All,
              Delete: item.oPermit.Delete,
            }));

          this.cd.detectChanges();
        } else {
          this.toastrService.error('No Records found');
        }
      },
      (error: any) => {
        this.shared.loader(false);
        // this.toastrService.error('Your Receipt is not uploaded.');
      },
    );
  }

  getExecutive() {
    let obj = {
      ExecID: 0,
    };
    this.shared.loader(true);
    this.api.GET_EXECUTIVE(obj).subscribe(
      (data: any) => {
        if (data) {
          this.executiveData = data;
          this.shared.loader(false);
          this.cd.detectChanges();
        } else {
          this.toastrService.error('No Records found');
        }
      },
      (error: any) => {
        this.shared.loader(false);
        // this.toastrService.error('Your Receipt is not uploaded.');
      },
    );
  }

  selectedMasterChanged(master: string) {
    this.modalSubMasterList = this.subMasterData
      .filter((item: any) => item.Master === master)
      .map((item: any) => item.SubMaster);
  }
  submoduleFilterData: any = [];

  fil: any = [];
  newfillData: any = [];
  updatData: any = [];
  getCountries() {
    this.api.GET_COUNTERIES().subscribe(
      (res: any) => {
        if (res != '') {
          this.countryData = res;
          console.log('countries', this.countryData);
        }
      },
      (error: any) => {
        this.shared.loader(false);
        // this.toastrService.error('Your Receipt is not uploaded.');
      },
    );
  }

  addExecutive() {
    let obj = {
      Key: '',
      Name: this.execForm.value.name,
      Email: this.execForm.value.email,
      Phone: Number(this.execForm.value.phone),
      Country: this.execForm.value.country,
      Status: Number(this.execForm.value.status),
      lstPermit: this.groupByMasterID(this.vUsetData),
      TimeStampInfo: '',
    };
    this.shared.loader(true);
    this.api.ADD_EXECUTVE(obj).subscribe(
      (data: any) => {
        if (data.Result == true) {
          this.getExecutive();

          this.toastrService.success('Executive added successfully', 'Success');
          this.shared.loader(false);
          this.execForm.reset();
          this.vUsetData = [];
          this.route.navigateByUrl('executive');
        } else {
          this.toastrService.error(data.MSG_USER, 'Please try again!');
          this.execForm.reset();
          this.shared.loader(false);
          this.vUsetData = [];
        }
      },
      (error: any) => {
        this.shared.loader(false);
        // this.toastrService.error('Your Receipt is not uploaded.');
      },
    );
  }

  updataPermData: any = [];
  updataPermData2: any = [];
  updataPermData3: any = [];

  data123: any = [];
  data1235678: any = [];

  newABCDAta: any = [];

  updateUserPermissions() {
    this.updataPermData3 = [];

    this.vUsetData.forEach((element: any) => {
      if (element.Add == true) {
        element.Add = 1;
      } else {
        element.Add = 0;
      }
      if (element.Edit == true) {
        element.Edit = 1;
      } else {
        element.Edit = 0;
      }
      if (element.Delete == true) {
        element.Delete = 1;
      } else {
        element.Delete = 0;
      }
      if (element.Access == true) {
        element.Access = 1;
      } else {
        element.Access = 0;
      }
      if (element.Access_All == true) {
        element.Access_All = 1;
      } else {
        element.Access_All = 0;
      }
    });
    let dataNew = this.transformData(this.vUsetData);
    let obj = {
      UserID: this.execID,

      oMasterPermit: this.transformedData,
    };

    this.shared.loader(true);
    this.api.ADD_EXEC_PERMIT(obj).subscribe(
      (data: any) => {
        if (data.Result == true) {
          this.getExecutive();
          this.toastrService.success('Executive Updated Successfully.');
          this.shared.loader(false);
        } else {
          this.toastrService.error(data.MSG_USER);
          this.shared.loader(false);
        }
      },
      (error: any) => {
        this.shared.loader(false);
        // this.toastrService.error('Your Receipt is not uploaded.');
      },
    );
  }

  addMoreDataFunc() {
    // console.log("this.masterMdule.name",this.masterMdule)

    const isDuplicate = this.vUsetData.some(
      (item: any) =>
        item.MasterID == this.masterMdule.id &&
        item.SubMasterID == this.subMasterValue.id,
    );

    if (!isDuplicate) {
      this.vUsetData.push({
        MasterID: this.masterMdule.id,
        Master: this.masterMdule.name,
        SubMasterID: this.subMasterValue.id,
        SubMaster: this.subMasterValue.SubMaster,
        Add: this.add,
        Delete: this.delete,
        Access: this.Access,
        Access_All: this.Access_All,
        Edit: this.edit,
      });
    } else {
      this.toastrService.error('You have already selected the Sub Tab.');
    }
    this.masterMdule = '';
    this.subMasterValue = [];
    this.masterMdule = '';
    this.subModule = '';
    this.subMasterOptions = [];
  }

  sModule: any;
  onSubModuleChange(ev: any) {
    // console.log("evevevevevevevev",ev)
    this.subMasterValue = ev;
    this.add = ev.Add;
    this.edit = ev.Edit;
    this.delete = ev.Delete;
    this.Access = ev.Access;
    this.Access_All = ev.Access_All;
  }

  chengeData(ev: any, i: any) {
    if (i == 0) {
      this.add = ev.target.checked;
    } else if (i == 1) {
      this.edit = ev.target.checked;
    } else if (i == 2) {
      this.delete = ev.target.checked;
    } else if (i == 3) {
      this.Access = ev.target.checked;
    } else if (i == 4) {
      this.Access_All = ev.target.checked;
    }
  }

  transformedData: any;
  transformData(inputJson: any) {
    // Group the original data by MasterID
    const groupedData = this.groupBy(inputJson, 'MasterID');

    // Transform the grouped data into the desired format
    this.transformedData = Object.keys(groupedData).map((masterID) => {
      return {
        MasterID: +masterID,
        oSubMasterPermit: groupedData[masterID].map((item: any) => {
          return {
            SubMasterID: item.SubMasterID,
            SubMaster: item.SubMaster,
            oPermit: {
              Add: item.Add,
              Delete: item.Delete,
              Access: item.Access,
              Edit: item.Edit,
              Access_All: item.Access_All,
            },
          };
        }),
      };
    });
  }

  // Helper function to group data by a specific property
  groupBy(arr: any, key: any) {
    return arr.reduce(function (acc: any, obj: any) {
      const groupKey = obj[key];
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(obj);
      return acc;
    }, {});
  }
  groups: any = {};
  groupedData: any;
  groupByMasterID(data: any[]): any[] {
    this.groupedData = [];
    this.groups = {};

    for (const item of data) {
      const masterID = item.MasterID;
      if (!this.groups[masterID]) {
        this.groups[masterID] = {
          MasterID: masterID,
          SubMasters: [item.SubMasterID],
        };
      } else {
        this.groups[masterID].SubMasters.push(item.SubMasterID);
      }
    }

    for (const groupKey in this.groups) {
      this.groupedData.push(this.groups[groupKey]);
    }

    return this.groupedData;
  }
}
