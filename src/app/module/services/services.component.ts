import { Component, OnInit, TemplateRef } from '@angular/core';

import { NgbDropdownModule, NgbModal, } from '@ng-bootstrap/ng-bootstrap';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../servies/api.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../servies/shared/shared.service';
import { configComm } from '../../common/serviceDrop';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
// import { data } from '../../../../node_modulesss/autoprefixer/lib/autoprefixer';
import { data } from '../../../../node_modules/autoprefixer/lib/autoprefixer'
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
interface SourceItem {
  Source: string;
  SourceId: number;
  Status: number;
}

interface SourceListItem {
  Type: number;
  lstSource: SourceItem[];
}

interface TransformedData {
  Money: SourceItem[];
  Recharge: SourceItem[];
  Booking: SourceItem[];
  Utility: SourceItem[];
  Miscellaneous: SourceItem[];
}
@Component({
  selector: 'app-services',
  standalone: true,
  imports: [NgbDropdownModule, CommonModule, ReactiveFormsModule, FormsModule, NgSelectModule, NgbTooltipModule, NgbAccordionModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServicesComponent implements OnInit {
  items = Array(5).fill(0);

  sourceForm: any = FormGroup
  sourceList: any = []
  serviceVal: any
  submitted: boolean = false
  Money: any = []
  Recharge: any = []
  Booking: any = []
  Utility: any = []
  Miscellaneous: any = []
  serviceDrop: any = configComm
  serviceType: any = ''
  execPermissions: any;
  editSourceData: any

  cities = [
    { value: 1, label: '#DMT' },
    { value: 2, label: '#AePS' },
    { value: 3, label: '#Payout' },
    { value: 4, label: '#DTH' },
    { value: 5, label: '#Electricity1' },
  ];

  constructor(private modalService: NgbModal, private offcanvasService: NgbOffcanvas, private router: Router,
    private api: ApiService, private fb: FormBuilder, private toster: ToastrService, private shared: SharedService
  ) {
    this.shared.setSidebrActiveClass('services');
    this.getVendor()

    // Optional: You can subscribe to activeClass$ if needed
    this.shared.activeClass$.subscribe((activeClass: string) => {
      console.log('Current active class in ServicesComponent:', activeClass);
    });
  }

  editSource: boolean = false
  openEnd(content: TemplateRef<any>) {
    this.offcanvasService.open(content, { position: 'end' });
  }
  openLg(content: TemplateRef<any>, val: any, data: any, type: any) {
    
     if (val === 'add') {
      if (this.execPermissions.some((permit: any) => permit.Master === 'Configuration' && permit.SubMasters.some((sub: any) => sub.SubMaster === 'Services' && sub.Add === 0))) {

      this.toster.error('You do not have permission to create services.', 'Permission Denied');
      return;
    }
      // this.getVednor()

      this.editSource = false;
      this.submitted = false;
      this.sourceForm.reset();
      this.tagsList = [];
      this.serviceType = '';

      // Re-enable all form fields
      this.sourceForm.get('Source')?.enable();
      this.sourceForm.get('Type')?.enable();
      this.sourceForm.get('lstTag')?.enable();

      this.sourceForm.patchValue({
        oType: 1,
        APIId: 0
      })
      this.selectVendor(this.vendorList[0].VendorID)

      this.modalService.open(content, {
        size: 'md modalone',
        centered: true,
        windowClass: 'flip-modal'
      });
    }

  
    else if (val === 'edit') {
        if (this.execPermissions.some((permit: any) => permit.Master === 'Configuration' && permit.SubMasters.some((sub: any) => sub.SubMaster === 'Services' && sub.Edit === 0))) {

      this.toster.error('You dont have permission to update services', 'Permission Denied');
      return;
    }
      this.sourceForm.patchValue({
        oType: data.oType
      })
      console.log(data);

      this.editSource = true;
      this.submitted = false;
      this.editSourceData = data;

      this.sourceForm.patchValue({
        Source: data.Source,
        SourceId: data.SourceId,
        Status: data.Status,
        Type: type,
        APIId: data.APIId
      });
      if (data.oType == 2 && data.APIId == 0) {
        this.selectVendor(this.vendorList[0].VendorID)
      } else {
        this.selectVendor(data.APIId)
      }

      // Disable all fields except lstTag
      this.sourceForm.get('Source')?.disable();
      this.sourceForm.get('Type')?.disable();
      // Do NOT disable lstTag
      this.sourceForm.get('lstTag')?.enable();

      this.serviceType = type;
      this.tagsList = [];
      data.lstTag.forEach((ele: any) => {
        if (ele) {
          this.tagsList.push(ele);
        }
      });

      this.modalService.open(content, {
        size: 'md modalone',
        centered: true,
        windowClass: 'flip-modal'
      });
    }
  }

  closeModel(content: any) {
    this.modalService.dismissAll(content);
    this.sourceForm.reset()
  }

  navigate(val: any) {
    this.router.navigateByUrl(val)
  }

  ngOnInit(): void {




    // this.shared.selectedPermission.subscribe((data:any) => {
    //   // console.log("sidebarPermissions",data);
    //   this.execPermissions=data;
    //   console.log("here is permissions", this.execPermissions);

    // });

    this.execPermissions = JSON.parse(sessionStorage.getItem("execDetails") || '{}')
    console.log("here is permission in user list>>>>>>>", this.execPermissions);


    this.sourceForm = this.fb.group({
      Type: ["", Validators.required],        //MONEY_TRANSFER = 1,RECHARGE = 2,BOOKING = 3,UTILITY_BILL = 4,MISC_SERVICE = 5
      Source: ["", [Validators.required, Validators.pattern("[a-zA-Z][a-zA-Z ]+")]],
      Status: [1],
      lstTag: [""],
      oType: ["", Validators.required],
      APIId: ["", Validators.required]
    })
  }

  vendorList: any = []
  getVendor() {
    let data = {
      Field1: 1
    }

    this.api.vendorApi(data).subscribe({
      next: (res: any) => {

        this.vendorList = res
        this.getSource()
        console.log("here is res from get vendor", this.vendorList);

      }, error: (err: any) => {

        this.toster.error("Something went wrong", "Error")
      }
    })
  }

  getSource() {
    // alert("dfgfdhgfhgfjhgjg")
    this.Money = []
    this.Recharge = []
    this.Booking = []
    this.Utility = []
    this.Miscellaneous = []
    this.shared.loader(true)
    this.api.getSource().subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        this.sourceList = res
        console.log("here is source list", this.sourceList);

        this.sourceList.forEach((ele: any) => {
          if (ele.Type == 1) {
            this.Money = ele.lstSource
            console.log("money list", this.Money);
          }
          else if (ele.Type == 2) {
            this.Recharge = ele.lstSource
            console.log("recharge list", this.Recharge);
          }
          else if (ele.Type == 3) {
            this.Booking = ele.lstSource
            console.log("Booking list", this.Booking);
          }
          else if (ele.Type == 4) {
            this.Utility = ele.lstSource
            console.log("Utility list", this.Utility);
          }
          else if (ele.Type == 5) {
            this.Miscellaneous = ele.lstSource
            console.log("Miscellaneous list", this.Miscellaneous);
          }

        });
        // this.getVendor()

        const attachVendorName = (sourceList: any[]) => {
          sourceList.forEach((item: any) => {
            const matchedVendor = this.vendorList.find((vendor: any) => vendor.VendorID === item.APIId);
            if (matchedVendor) {
              item.VendorName = matchedVendor.Vendor; // or whatever the correct field name is
            }
          });
        };

        attachVendorName(this.Money);
        attachVendorName(this.Recharge);
        attachVendorName(this.Booking);
        attachVendorName(this.Utility);
        attachVendorName(this.Miscellaneous);
        console.log("booking list", this.Booking);


      }, error: (err: any) => {
        this.shared.loader(false)
        this.toster.error("Something went wrong", "Error")

      }
    })
  }

  chnangeRadio(ev: any){
    if(ev?.target?.value == 1){
      this.sourceForm.patchValue({
        APIId: ev.target.value
      })
    }else if (this.sourceForm.get('APIId').value == 0){
       this.selectVendor(this.vendorList[0].VendorID)
    }
  }



  selectVendor(ev: any) {
    this.sourceForm.patchValue({
      APIId: ev?.target?.value || ev
    })
    console.log(this.sourceForm);


  }


  selectServices(ev: any) {
    this.serviceVal = ev.target.value
    console.log("here is select sevrices", this.serviceVal);

  }

  get f() {
    return this.sourceForm.controls;
  }

  // ============================================================== add source ========================================================


  addSource() {

    this.submitted = true
    if (this.sourceForm.get('oType')?.value == 1) {
      this.sourceForm.patchValue({
        APIId: 0
      })
    }
    if (this.sourceForm.invalid) {
      console.log("form invalid", this.sourceForm);

      return
    }

    this.sourceForm.get('Type')?.enable();
    this.sourceForm.get('Source')?.enable();
    let data: any = {
      Key: "",
      oSource: {
        Status: 1,
        Type: Number(this.sourceForm.value.Type),
        lstTag: this.tagsList,
        Source: this.sourceForm.value.Source
      },
      oType: this.sourceForm.value.oType,     //1=automatic,2=manual
      APIId: this.sourceForm.value.APIId
    };

    // conditionally add SourceId if in edit mode
    if (this.editSource) {
      data.SourceId = this.editSourceData.SourceId;
    }



    this.shared.loader(true)

    this.api.addSource(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        if (res.Result == false) {
          this.toster.error(res.MSG_USER, "Error")

        } else {
          this.closeModel('close')
          this.getSource()
          if (this.editSource === true) {
            this.toster.success("Source updated successfully", "Success")
          } else {
            this.toster.success("Source added successfully", "Success")
          }
        }

      }, error: (err: any) => {
        this.shared.loader(false)
        this.toster.error("Something went wrong", "Error")

      }
    })

  }

  tagsList: any = []
  addTages() {
    this.tagsList.push(this.sourceForm.value.lstTag)
    this.sourceForm.get('lstTag')?.reset('');
    console.log("here is tag list", this.tagsList);

  }

  removeTag(i: any) {
    console.log("index value", i);
    if (i > -1) {
      this.tagsList.splice(i, 1)
      console.log("here is tag list", this.tagsList);

    }

  }

  // =================================================================== delte source ====================================================================

  deleteSource(val: any) {
    
    if (this.execPermissions.some((permit: any) => permit.Master === 'Configuration' && permit.SubMasters.some((sub: any) => sub.SubMaster === 'Services' && sub.Delete === 0))) {

      this.toster.error('You do not have permission to delete services.', 'Permission Denied');
      return;
    } else {
      console.log("here is val from delete", val);

      let data = {
        Key: "",
        Field1: val.SourceId
      }

      Swal.fire({
        title: "Are you sure?",
        text: "You want to delete" + " " + val.Source,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes!"
      }).then((result: any) => {
        if (result.isConfirmed) {
          this.shared.loader(true)
          this.api.delSource(data).subscribe({
            next: (res: any) => {
              this.shared.loader(false)
              if (res.Result == true) {
                this.getSource()
                console.log("here is delete data");
                this.toster.success(res.MSG_USER)
              }
              else {
                console.log("Nothing deleted");
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

  //  ============================================================= status change ====================================================

  statusVal: any
  statusChange(val: any, Type: any) {
    if (this.execPermissions.some((permit: any) => permit.Master === 'Configuration' && permit.SubMasters.some((sub: any) => sub.SubMaster === 'Services' && sub.Edit === 0))) {
      this.toster.error('You dont have permission to update services', 'Permission Denied');
      this.getSource()
      return;
    } else {
      console.log("here is val", val);

      if (val.Status == 0) {
        this.statusVal = 1
      } else if (val.Status == 1) {
        this.statusVal = 0
      }
      let data = {

        Key: "",
        SourceId: val.SourceId,
        oSource: {
          Type: Type,        //MONEY_TRANSFER = 1,RECHARGE = 2,BOOKING = 3,UTILITY_BILL = 4,MISC_SERVICE = 5
          Source: val.Source,
          Status: this.statusVal,  //Enable=1,Disable=0
          lstTag: val.lstTag
        },
        oType: val.oType,     //1=automatic,2=manual
        APIId: val.APIId

      }
      Swal.fire({
        title: "Are you sure?",
        text: "You want to change status of" + " " + val.Source,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes!"
      })
        .then((result: any) => {
          if (result.isConfirmed) {
            this.shared.loader(true)
            this.api.addSource(data).subscribe({
              next: (res: any) => {
                this.shared.loader(false)
                if (res.Result == true) {
                  this.toster.success(res.MSG_USER, "Success")
                  this.getSource()
                }
                else {
                  this.toster.error(res.MSG_USER, "Error")
                }
              }, error: (err: any) => {
                this.shared.loader(false)
                this.toster.error("Something went wrong", "Error")
              }
            })

          } else {
            this.getSource()
          }
        })
    }
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


}


