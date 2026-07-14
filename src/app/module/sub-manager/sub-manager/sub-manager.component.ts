import {
  ChangeDetectorRef,
  Component,
  OnInit,
  HostListener,
} from '@angular/core';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { GlobalAPIService } from './../../../service/global-api.service';
// import { CookieService } from 'ngx-cookie-service';
// import { SharedDataService } from 'src/app/service/shared-data.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ApiService } from '../../../servies/api.service';
import { SharedService } from '../../../servies/shared/shared.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-sub-manager',
  standalone: true,
  imports: [CommonModule, NgbDropdownModule, ReactiveFormsModule],
  templateUrl: './sub-manager.component.html',
  styleUrls: ['./sub-manager.component.scss'],
})
export class SubManagerComponent implements OnInit {
  modRef: any;
  subModuleForm: any = FormGroup;
  masterData: any;
  selmasterID: any;
  subMasterData: any;
  selectedSubMasterID: any;
  getEditData: boolean = false;
  pattern = /^[a-zA-Z\s\[\]\\\/]*$/;
  execPermissions: any;
  constructor(
    private modalService: NgbModal,
    private cd: ChangeDetectorRef,
    private fb: FormBuilder,
    private shared: SharedService,
    private api: ApiService,
    public toastrService: ToastrService,
    private toster: ToastrService,
  ) {}

  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    // Check if the pressed key matches the allowed pattern
    if (!event.key.match(this.pattern)) {
      event.preventDefault();
    }
  }

  ngOnInit(): void {
    this.execPermissions = JSON.parse(
      sessionStorage.getItem('execDetails') || '{}',
    );
    // this.shared.selectedPermission.subscribe((data:any) => {
    //   // console.log("sidebarPermissions",data);
    //   this.execPermissions=data;
    // });

    this.getModule();
    this.getSubMaster();
    this.subModuleForm = this.fb.group({
      masterID: ['', Validators.required],
      subMasName: ['', Validators.required],
      add: [''],
      edit: [''],
      access: [''],
      Access_All: [''],
      delete: [''],
    });
  }

  openVerticallyCentered(content: any, val: any) {
    // console.log("openmodal",val)
    if (val == 0) {
      if (
        this.execPermissions?.some(
          (permit: any) =>
            permit.Master === 'Executive' &&
            permit.SubMasters.some(
              (sub: any) => sub.SubMaster === 'Sub Tab' && sub.Add === 0,
            ),
        )
      ) {
        this.toster.error(
          'You do not have permission to add sub tab.',
          'Permission Denied',
        );
        return;
      }
      this.getEditData = false;
      this.subModuleForm.reset();
      this.modRef = this.modalService.open(content, {
        size: 'md modalone',
        centered: true,
        windowClass: 'flip-modal',
      });
      //   if (this.execPermissions.some((permit:any) => permit.Master === 'Executives' && permit.SubMasters.some((sub:any) => sub.SubMaster === 'Sub Tab' && sub.Add === 0))) {
      //     // Display an error message or prevent the submission
      //     this.toastrService.error('You do not have permission to add Sub Tab.', 'Permission Denied');
      //     return;
      //   }else {
      // //  console.log("add",val);
      //  this.modRef=this.modalService.open(content, { centered: true });
      //  this.subModuleForm.reset();

      // //  console.log("beforeeditbuttonclick",this.getEditData)
      //   }
      // }else  if (this.execPermissions.some((permit:any) => permit.Master === 'Executives' && permit.SubMasters.some((sub:any) => sub.SubMaster === 'Sub Tab' && sub.Edit === 0))) {
      //   // Display an error message or prevent the submission
      //   this.toastrService.error('You do not have permission to edit Sub Tab.', 'Permission Denied');
      //   return;
    } else {
      if (
        this.execPermissions?.some(
          (permit: any) =>
            permit.Master === 'Executive' &&
            permit.SubMasters.some(
              (sub: any) => sub.SubMaster === 'Sub Tab' && sub.Edit === 0,
            ),
        )
      ) {
        this.toster.error(
          'You do not have permission to update sub tab.',
          'Permission Denied',
        );
        return;
      }
      this.modRef = this.modalService.open(content, {
        size: 'md modalone',
        centered: true,
        windowClass: 'flip-modal',
      });
      //  console.log("editsubModuleForm",val);
      this.getEditData = true;

      // console.log("aftereditbuttonclick",this.getEditData)
      this.subModuleForm.patchValue({
        masterID: val.MasterID,
        subMasName: val.SubMaster,
        add: val.oPermit.Add,
        edit: val.oPermit.Edit,
        access: val.oPermit.Access,
        Access_All: val.oPermit.Access_All,
        delete: val.oPermit.Delete,
      });
      this.selectedSubMasterID = val.SubMasterID;
    }
  }

  closeModal() {
    this.modRef.close();
    this.subModuleForm.reset();
  }

  getModule() {
    let obj = {
      Key: '',
      MasterID: 0,
    };
    this.api.GET_EXECH_MASTER(obj).subscribe(
      (res: any) => {
        if (res) {
          this.masterData = res;
          // console.log("this.moduledata",this.masterData);
          this.cd.detectChanges();
          this.shared.loader(false);
        } else {
          this.shared.loader(false);
          this.toastrService.error('No Data found');
        }
      },
      (error: any) => {
        this.shared.loader(false);
        // this.toastrService.error('Your Receipt is not uploaded.');
      },
    );
  }
  onSourceSelect(event: any) {
    let selectedSource = event.target.value;
    this.selmasterID = selectedSource;
    // console.log("selsourceselsorce",this.selmasterID)
  }
  permssionCheck: any = 0;
  changeEvent(ev: any) {
    if (ev.target.checked == true) {
      this.permssionCheck = 1;
      this.subModuleForm.patchValue({
        access: true,
      });
    }
  }
  acessCheckEvent1(ev: any) {
    if (ev.target.checked == true) {
      this.permssionCheck = 1;
      this.subModuleForm.patchValue({
        Access_All: true,
      });
    }
  }
  acessCheckEvent(event: any) {
    if (event.target.checked == true) {
      this.permssionCheck = 1;
    } else {
      this.permssionCheck = 0;
      this.subModuleForm.patchValue({
        add: false,
        edit: false,
        delete: false,
      });
    }
  }

  addSubModule() {
    let obj = {
      Key: '',
      MasterID: this.subModuleForm.value.masterID,
      SubMaster: this.subModuleForm.get('subMasName').value.trim(),
      oPermit: {
        Add: this.subModuleForm.get('add').value ? 1 : 0,
        Delete: this.subModuleForm.get('delete').value ? 1 : 0,
        Access: this.subModuleForm.get('access').value ? 1 : 0,
        Access_All: this.subModuleForm.get('Access_All').value ? 1 : 0,
        // Access: this.permssionCheck,
        Edit: this.subModuleForm.get('edit').value ? 1 : 0,
      },
    };
    this.shared.loader(true);
    this.api.ADD_EXEC_SUB_MASTER(obj).subscribe(
      (data: any) => {
        if (data.Result == true) {
          this.toastrService.success(data.MSG_USER);
          this.getSubMaster();
          this.shared.loader(false);
          this.closeModal();
          this.getEditData = false;
          this.subModuleForm.reset();
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
          // console.log("submasterdata",this.subMasterData);
          this.getEditData = false;
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

  updateStatus() {
    let obj = {
      Key: '',
      MasterID: 0,
      SubMasterID: this.selectedSubMasterID,
      oPermit: {
        Add: this.subModuleForm.value.add ? 1 : 0,
        Delete: this.subModuleForm.value.delete ? 1 : 0,
        Access: this.subModuleForm.value.access ? 1 : 0,
        Access_All: this.subModuleForm.value.Access_All ? 1 : 0,
        Edit: this.subModuleForm.value.edit ? 1 : 0,
      },
    };
    this.shared.loader(true);
    this.api.UPDATE_EXECH_SUB_PERMIT(obj).subscribe(
      (data: any) => {
        if (data.Result == true) {
          this.getSubMaster();
          this.shared.loader(false);
          this.closeModal();
          this.toastrService.success('Sub Tab Permission Updated.');
        } else {
          this.shared.loader(false);
          this.toastrService.error('Something went Wrong.Please try again.');
          this.closeModal();
        }
      },
      (error: any) => {
        this.shared.loader(false);
        // this.toastrService.error('Your Receipt is not uploaded.');
      },
    );
  }
  deleteSubMaster(val: any, val1: any) {
    if (
      this.execPermissions?.some(
        (permit: any) =>
          permit.Master === 'Executive' &&
          permit.SubMasters.some(
            (sub: any) => sub.SubMaster === 'Sub Tab' && sub.Delete === 0,
          ),
      )
    ) {
      this.toster.error(
        'You do not have permission to delete sub tab.',
        'Permission Denied',
      );
      return;
    } else {
      let obj = {
        Key: '',
        SubMasterID: val,
        MasterID: 0,
      };
      Swal.fire({
        title: 'Are you sure, you want to delete ' + val1 + '?',
        text: '',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: ' <i class="fa fa-thumbs-up"></i> Yes, Delete it!',
      }).then((result: any) => {
        if (result.isConfirmed) {
          this.api.DEL_EXECH_SUB_MASTER(obj).subscribe(
            (data: any) => {
              // console.log(data)
              if (data.Result == true) {
                this.toastrService.success(
                  'Sub Tab has been deleted successfully.',
                );
                this.getSubMaster();
              }
            },
            (error: any) => {
              this.shared.loader(false);
              // this.toastrService.error('Your Receipt is not uploaded.');
            },
          );
          Swal.fire('Deleted!', 'Sub Tab has been Deleted.', 'success');
        }
      });
    }
  }
}
// }
