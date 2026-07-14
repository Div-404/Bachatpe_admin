import { ChangeDetectorRef, Component, OnInit, TemplateRef } from '@angular/core';

import { NgbDropdownModule, NgbModal, NgbTooltipModule, } from '@ng-bootstrap/ng-bootstrap';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../servies/api.service';
import { ToastrService } from 'ngx-toastr';
import { serviceDrop } from '../../common/serviceDrop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { SharedService } from '../../servies/shared/shared.service';
import { CommonmoduleModule } from '../../common/commonmodule.module';

@Component({
  selector: 'app-api-manage',
  standalone: true,
  imports: [NgbDropdownModule, CommonModule, ReactiveFormsModule, NgbTooltipModule, CommonmoduleModule],
  templateUrl: './api-manage.component.html',
  styleUrl: './api-manage.component.scss'
})
export class ApiManageComponent implements OnInit {
  isOn: boolean = true;
  apiList: any = []
  // serviceDro: any = serviceDrop
  serviceDro: any = []
  apiForm: any = FormGroup
  submitted: boolean = false
  statusVal: any
  editData: any
  buttonAddEdit: boolean = false
  selectedSource: string = '';
  execPermissions: any
  tooltipVisible: boolean = false

  // toggleButton() {
  //   this.isOn = !this.isOn;
  // }

  constructor(private modalService: NgbModal, private offcanvasService: NgbOffcanvas, private router: Router,
    private api: ApiService, private toster: ToastrService, private fb: FormBuilder, private shared: SharedService,
    private cdRef: ChangeDetectorRef
  ) {
    this.execPermissions = JSON.parse(sessionStorage.getItem("execDetails") || '{}')
    console.log("here is permission in user list>>>>>>>", this.execPermissions);

    this.shared.setSidebrActiveClass('api-manage');

    // Optional: You can subscribe to activeClass$ if needed
    this.shared.activeClass$.subscribe((activeClass: string) => {
      console.log('Current active class in ServicesComponent:', activeClass);
    });
  }

  openEnd(content: TemplateRef<any>) {
    if (this.execPermissions?.some((permit: any) => permit.Master === 'Configuration' && permit.SubMasters.some((sub: any) => sub.SubMaster === 'API' && sub.Add === 0))) {

      this.toster.error('You dont have permission to add APIs', 'Permission Denied');
      return;
    } else {
      this.buttonAddEdit = false
      this.submitted = false
      this.apiForm.reset()
      this.apiForm.patchValue({
        SourceID: ""
      })
      this.offcanvasService.open(content, { position: 'end' });
    }
  }
  openLg(content: TemplateRef<any>) {
    this.modalService.open(content, { size: 'md modalone', centered: false, windowClass: 'flip-modal' });
  }

  openForEdit(content: TemplateRef<any>, val: any) {
    this.submitted = false
    if (this.execPermissions?.some((permit: any) => permit.Master === 'Configuration' && permit.SubMasters.some((sub: any) => sub.SubMaster === 'API' && sub.Edit === 0))) {

      this.toster.error('"You dont have permission to update APIs', 'Permission Denied');
      return;
    } else {
      this.buttonAddEdit = true
      this.editData = val
      console.log("here is val from edit", val);

      this.apiForm.patchValue({
        SourceID: String(val.oConfig.SourceID),
        Source_ByName: val.oConfig.Source_ByName,
        Description: val.oConfig.Description,
        Reserve1: val.oConfig.Reserve1,
        Reserve2: val.oConfig.Reserve2,
        Reserve3: val.oConfig.Reserve3,
        Reserve4: val.oConfig.Reserve4,
        Reserve5: val.oConfig.Reserve5,
        Reserve6: val.oConfig.Reserve6,
        Reserve7: val.oConfig.Reserve7,
        Reserve8: val.oConfig.Reserve8,
        Reserve9: val.oConfig.Reserve9,
        Reserve10: val.oConfig.Reserve10,
        Status: val.oConfig.Status
      })

      console.log("here is from value", this.apiForm.value);


      // this.editApiConfig(this.editData)
      this.offcanvasService.open(content, { position: 'end' });
    }
  }

  closeModel(content: any) {
    this.offcanvasService.dismiss(content);
  }

  navigate(val: any) {
    this.router.navigateByUrl(val)
  }

  ngOnInit(): void {
    this.getApiConfig()
    this.getVednor()
    this.apiForm = this.fb.group({
      SourceID: ["", Validators.required],
      Source_ByName: ["", [Validators.required, Validators.pattern("[a-zA-Z][a-zA-Z ]+")]],
      Description: ["", Validators.required],
      Reserve1: [''],
      Reserve2: [''],
      Reserve3: [''],
      Reserve4: [''],
      Reserve5: [''],
      Reserve6: [''],
      Reserve7: [''],
      Reserve8: [''],
      Reserve9: [''],
      Reserve10: [''],
      Status: [""]
    })
  }

  tooltipData: any = ""
  showTooltip(val: any): void {
    this.tooltipData = ''
    this.tooltipData = val.oConfig.Description
    console.log("here is val from tool tip", val);

    this.tooltipVisible = true;
    this.cdRef.detectChanges();
  }

  hideTooltip(): void {
    this.tooltipVisible = false;
  }

  getApiConfig() {
    let data = {
      Key: "",
      Field1: "0"
    }
    this.shared.loader(true)
    this.api.getApiCon(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        this.apiList = res
        console.log("here is res from get api config", this.apiList);

      }, error: (err: any) => {
        this.shared.loader(false)
        this.toster.error("Something went wrong", "Error")
      }
    })
  }

  getVednor() {
    let data = {
      Field1: 1
    }
    this.shared.loader(true)
    this.api.vendorApi(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        this.serviceDro = res
        console.log("here is res from get vendor", this.serviceDro);

      }, error: (err: any) => {
        this.shared.loader(false)
        this.toster.error("Something went wrong", "Error")
      }
    })
  }

  get f() {
    return this.apiForm.controls;
  }

  // ================================================================================================ add config ====================================================================================

  addApiConfig() {
    this.submitted = true
    if (this.apiForm.invalid) {
      return;
    }
    Object.keys(this.apiForm.controls).forEach(key => {
      if (this.apiForm.controls[key].value === null || this.apiForm.controls[key].value === '') {
        this.apiForm.controls[key].setValue('');
      }
    });
    this.shared.loader(true)
    let data = {
      Key: "",
      oConfig: this.apiForm.value
    }
    data.oConfig.SourceID = Number(this.apiForm.value.SourceID)
    data.oConfig.Status = 1
    this.api.addEditApiCon(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        if (res.Result == true) {
          this.closeModel('close')
          this.getApiConfig()
          this.toster.success(res.MSG_USER, "Success")
          console.log("here res from add api config", res);
        }
        else {
          this.toster.error(res.MSG_USER, "Error")
        }

      }, error: (err: any) => {
        this.shared.loader(false)
        this.toster.error("Something went wrong", "Error")
      }
    })
  }

  // ========================================================================================= edit config ====================================================================================

  editApiConfig(val: any) {
    this.submitted = true
    console.log("here is val for edir func", val);
    if (this.apiForm.invalid) {
      return
    }

    let data = {
      Key: "",
      oConfig: this.apiForm.value,
      // APIID: val.oConfig.APIID
    }
    data.oConfig.APIID = Number(val.oConfig.APIID)
    data.oConfig.SourceID = Number(val.oConfig.SourceID)
    // data.oConfig.Status = 0
    this.shared.loader(true)

    this.api.addEditApiCon(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        if (res.Result == true) {
          this.closeModel('close')
          this.getApiConfig()
          this.toster.success(res.MSG_USER, "Success")
          console.log("here res from add api config", res);
        }
        else {
          this.toster.error(res.MSG_USER, "Error")
        }

      }, error: (err: any) => {
        this.shared.loader(false)
        this.toster.error("Something went wrong", "Error")
      }
    })

  }

  // ====================================================================================== delete config ===================================================================================

  deleteApiConf(val: any) {
    if (this.execPermissions?.some((permit: any) => permit.Master === 'Configuration' && permit.SubMasters.some((sub: any) => sub.SubMaster === 'API' && sub.Delete === 0))) {

      this.toster.error('you dont have permission to delete APIs', 'Permission Denied');
      return;
    } else {
      console.log("here is val from delete", val);

      let data = {
        Key: "",
        Field1: val.oConfig.APIID
      }
      Swal.fire({
        title: "Are you sure?",
        text: "You want to delete" + " " + val.oConfig.Source_ByName,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes!"
      }).then((result: any) => {
        if (result.isConfirmed) {
          this.shared.loader(true)
          this.api.delApiCon(data).subscribe({
            next: (res: any) => {
              this.shared.loader(false)
              if (res.Result == true) {
                this.getApiConfig()
                this.toster.success(res.MSG_USER, "Success")
              }
              else {
                this.toster.error(res.MSG_USER, "Error")
              }
            }, error: (err: any) => {
              this.shared.loader(false)
              this.toster.error("Something went wrong", "Error")
            }
          })

        }
      })
    }
  }

  //  ================================================================================= status change =============================================================================


  toggleButton(val: any) {
    if (this.execPermissions?.some((permit: any) => permit.Master === 'Configuration' && permit.SubMasters.some((sub: any) => sub.SubMaster === 'API' && sub.Edit === 0))) {

      this.toster.error('you dont have permission to update APIs', 'Permission Denied');
      return;
    } else {
      if (val.oConfig.Status == 0) {
        this.statusVal = 1
      } else if (val.oConfig.Status == 1) {
        this.statusVal = 0
      }
      let data = {
        Key: "",
        Field1: val.oConfig.APIID,
        Status: this.statusVal
      }

      console.log("here is val from toggle", val);

      Swal.fire({
        title: "Are you sure?",
        text: "You want to change status of" + " " + val.oConfig.Source_ByName,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes!"
      }).then((result: any) => {
        if (result.isConfirmed) {
          this.shared.loader(true)
          this.api.updateStatusCon(data).subscribe({
            next: (res: any) => {
              this.shared.loader(false)
              if (res.Result == true) {
                this.toster.success(res.MSG_USER, "Success")
                this.getApiConfig()
              }
              else {
                this.toster.error(res.MSG_USER, "Error")
              }
            }, error: (err: any) => {
              this.shared.loader(false)
              this.toster.error("Something went wrong", "Error")
            }
          })

        }
      })
    }

  }

  navigateToComm(val: any) {
    console.log("val", val)

    this.router.navigateByUrl('set-commission/' + val.oConfig.APIID + "/" + val.oConfig.SourceID + "/" + val.oConfig.Source_ByName)
  }


  // ============================================================ pagination ==================================================

  items: any = [];
  pageOfItems?: Array<any>;
  sortProperty: string = 'id';
  onChangePage(pageOfItems: Array<any>) {

    this.pageOfItems = pageOfItems;
  }



}
