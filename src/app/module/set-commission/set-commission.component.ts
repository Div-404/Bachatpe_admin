import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';

import { NgbDropdownModule, NgbModal, } from '@ng-bootstrap/ng-bootstrap';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../servies/api.service';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../servies/shared/shared.service';
import { error } from 'console';
import Swal from 'sweetalert2';
import { validateHeaderValue } from 'http';
import { subscribe } from 'diagnostics_channel';
import { configComm } from '../../common/serviceDrop';

@Component({
  selector: 'app-set-commission',
  standalone: true,
  imports: [NgbDropdownModule, CommonModule, NgMultiSelectDropDownModule, FormsModule, ReactiveFormsModule],
  templateUrl: './set-commission.component.html',
  styleUrl: './set-commission.component.scss'
})
export class SetCommissionComponent implements OnInit {

  @ViewChild('content', { static: true }) content!: any;

  dropdownList: any = [];
  selectedItems: any = [];
  dropdownSettings: any = {};

  items = Array(15).fill(0);


  isOn: boolean = true;

  getCommList: any = []
  commiList: any
  apiId: any

  sourceList: any = []
  Money: any = []
  Recharge: any = []
  Booking: any = []
  Utility: any = []
  Miscellaneous: any = []
  commForm: any = FormGroup
  submitted: boolean = false
  btnChng: boolean = false
  servId: any
  commFee: any
  allComm: any
  configDrop: any = []
  operatorList: any = []
  execPermissions: any

  toggleButton() {
    this.isOn = !this.isOn;
  }

  constructor(private modalService: NgbModal, private offcanvasService: NgbOffcanvas, private router: Router,
    private api: ApiService, private toster: ToastrService, private route: ActivatedRoute, public shared: SharedService,
    private fb: FormBuilder,
  ) {


    this.shared.getJsonData().subscribe((res: any) => {

      this.configDrop = res

      console.log("this.configDrop", this.configDrop)

    })

    this.dropdownList = [
      { "item_id": 1, item_text: 'Mumbai' },
      { item_id: 2, item_text: 'Bangaluru' },
      { item_id: 3, item_text: 'Pune' },
      { item_id: 4, item_text: 'Navsari' },
      { item_id: 5, item_text: 'New Delhi' }
    ];
    this.selectedItems = [
      { item_id: 3, item_text: 'Pune' },
      { item_id: 4, item_text: 'Navsari' }
    ];
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };

  }

  openM: any

  // openEnd(content: TemplateRef<any>) {
  //   console.log("content", content);

  //   this.offcanvasService.open(content, { position: 'end', panelClass: 'bg-info' });
  // }
  openLg(content: any) {
    if (this.execPermissions?.some((permit: any) => permit.Master === 'Configuration' && permit.SubMasters.some((sub: any) => sub.SubMaster === 'API' && sub.Add === 0))) {

      this.toster.error('You do not have permission to configure.', 'Permission Denied');
      return;
    } else {
      this.buttonEnable = false

      this.openM = this.modalService.open(content, { size: 'md modal0600 modalone', centered: true, windowClass: 'flip-modal' });
    }
  }

  closeMd(content: any) {
    this.modalService.dismissAll(content)
  }

  openLg2(content2: TemplateRef<any>, val: any, comm: any, allComm: any) {

    console.log("here is comm", allComm);

    this.submitted = false
    this.commForm.reset()
    this.servId = comm.ServiceID
    this.commFee = comm
    this.allComm = allComm


    if (val == 'add') {
      this.btnChng = true
      if (this.execPermissions?.some((permit: any) => permit.Master === 'Configuration' && permit.SubMasters.some((sub: any) => sub.SubMaster === 'API' && sub.Add === 0))) {

        this.toster.error('You do not have permission to add.', 'Permission Denied');
        return;
      }
    } else if (val == 'edit') {
      if (this.execPermissions?.some((permit: any) => permit.Master === 'Configuration' && permit.SubMasters.some((sub: any) => sub.SubMaster === 'API' && sub.Edit === 0))) {

        this.toster.error('You do not have permission to update.', 'Permission Denied');
        return;
      }
      // console.log("here is comm for edit", this.allComm);
      this.btnChng = false
      this.commForm.patchValue({
        Range_Min: comm.oComm.Range_Min,
        Range_Max: comm.oComm.Range_Max,
        Fee: comm.oComm.Fee,
        oType: String(comm.oComm.oType),
      })
    }
    this.modalService.open(content2, { size: 'md modal0600 modalone', centered: true, windowClass: 'flip-modal' });
  }

  closeModel(content2: any) {
    this.modalService.dismissAll(content2)
  }

  navigate(val: any) {
    this.router.navigateByUrl(val)
  }

  onSelectAll(ev: any) { }
  onItemSelect(ev: any) {

  }
  venderID: any = []
  apiName: any = ""
  ngOnInit(): void {
    this.execPermissions = JSON.parse(sessionStorage.getItem("execDetails") || '{}')
    this.route.params.subscribe((param: any) => {
      // console.log("here is param", param);
      this.apiId = param.id
      this.venderID = param.venderName
      this.apiName = param.api
      this.getVendorComm()
      this.getSource()
      this.getVednor()
    })
    this.commForm = this.fb.group({
      Range_Min: ["", Validators.required],
      Range_Max: ["", Validators.required],
      Fee: ["", Validators.required],
      oType: ["", Validators.required],
    })


  }

  get f() {
    return this.commForm.controls
  }

  // ================================================================ get vendor comm =========================================================

  field2: any = "0"
  field3: any = "0"
  getVendorComm() {
    this.operatorList = []
    let data = {
      Key: "",
      Field1: this.apiId,          //APIsourceID         mendatory
      Field2: this.field2,       //SourceType
      Field3: this.field3
    }
    this.shared.loader(true)
    this.api.getVendorComm(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        this.getCommList = res.lstServiceComm
        this.commiList = res.lstServiceComm

        this.getFilterData(res.lstServiceComm)
        // this.getCommList.forEach((ele: any) => {
        //   if (this.getCommList.length) {
        //     this.operatorList.push({
        //       Service: ele.Service,
        //       ServiceID: ele.ServiceID
        //     })
        //   }
        //   console.log("here is ele", ele.SourceType);

        // });

        if (this.getCommList.length < 1) {
          this.openLg(this.content)
        }
        for (let index = 0; index < this.getCommList.length; index++) {
          const element = this.getCommList[index];
          this.operatorList.push({
            "Service": element.Service,
            "ServiceID": element.ServiceID
          })
        }
        // console.log("operator", this.operatorList);
        // console.log("here is commission list", this.getCommList);

      }, error: (err: any) => {
        this.shared.loader(false)
        this.toster.error("Something went wrong", "Error")
      }
    })
  }


  vendorName: any
  vendorList: any
  getVednor() {
    let data = {
      Field1: 1
    }
    this.shared.loader(true)
    this.api.vendorApi(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        this.vendorList = res
        this.vendorList.forEach((ele: any) => {
          if (ele.VendorID == this.venderID) {
            this.vendorName = ele.Vendor
          }
        });
        console.log("here is res from get vendor", this.vendorList);

      }, error: (err: any) => {
        this.shared.loader(false)
        this.toster.error("Something went wrong", "Error")
      }
    })
  }

  serviceName: any = []
  getFilterData(val: any) {

    // this.configDrop = [
    //   { value: 1, name: "Money Transfer", flag: false },
    //   { value: 2, name: "Recharge", flag: false },
    //   { value: 3, name: "Booking", flag: false },
    //   { value: 4, name: "Utility", flag: false },
    //   { value: 5, name: "Miscellaneous", flag: false }
    // ]
    val.forEach((element: any) => {
      let service = "";
      let SourceType = ''
      let CommisionID = ''


      this.configDrop.forEach((el: any, index: any) => {
        // console.log("elelelelelelel", el)
        if (el.value == element.SourceType) {
          this.configDrop[index].flag = true
          if (this.configDrop[index].flag == true && this.configDrop[index].value == 1) {
            this.MONEY_TRANSFER = 1
            // this.RECHARGE=
            // this.BOOKING=
            // this.UTILITY_BILL=
            // this.MISC_SERVICE=
          } else if (this.configDrop[index].flag == true && this.configDrop[index].value == 2) {
            this.RECHARGE = 1
          } else if (this.configDrop[index].flag == true && this.configDrop[index].value == 3) {
            this.BOOKING = 1
          } else if (this.configDrop[index].flag == true && this.configDrop[index].value == 4) {
            this.UTILITY_BILL = 1
          } else if (this.configDrop[index].flag == true && this.configDrop[index].value == 5) {
            this.MISC_SERVICE = 1
          }

        }

        // console.log(" this.configDrop[index].flage", this.configDrop[index].flage)
      });


      if (element.SourceType == 1) {
        service = "Money Transfer";
        SourceType = "1"
        CommisionID = element.CommisionID

      } else if (element.SourceType == 2) {
        service = "Recharge";
        SourceType = "2",
          CommisionID = element.CommisionID
      } else if (element.SourceType == 3) {
        service = "Booking";
        SourceType = "3",
          CommisionID = element.CommisionID
      } else if (element.SourceType == 4) {
        service = "Utility";
        SourceType = "4",
          CommisionID = element.CommisionID
      } else if (element.SourceType == 5) {
        service = "Miscellaneous";
        SourceType = "5",
          CommisionID = element.CommisionID
      }
      if (service && !this.serviceName.some((s: any) => s.service === service)) {
        this.serviceName.push({
          service,
          SourceType,
          CommisionID
        });
      }


    });
    // console.log("here is service name", this.serviceName);


    this.getCommList = val
  }

  serviceEnable: boolean = false
  filteredServiceName: any
  selctFirstDro(ev: any) {
    this.serviceEnable = false
    // console.log("here is val from first drop", ev.target.value);
    this.field2 = ev.target.value
    this.field3 = "0"
    // console.log("here is service name", this.serviceName);
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Blank array except those i selected ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    this.serviceName = this.serviceName.filter((service: any) => service.SourceType === this.field2);
    console.log("here is service name", this.serviceName);
    if (this.field2 != "0") {
      this.serviceEnable = true
      this.getSource()
    }

    this.getVendorComm()
  }

  selectOperator(ev: any) {
    // console.log("here is val from first drop", ev.target.value);
    this.field3 = ev.target.value
    this.getVendorComm()
  }

  // =================================================================== get source ===========================================================

  getSourceData(SourceType: any) {
    // console.log("sourceType", SourceType)
    // console.log("this.getCommList.filter((service: any) => service.SourceType === sourceType)", this.getCommList.filter((service: any) => service.SourceType == SourceType))
    // console.log("here is commision list", this.getCommList);

    return this.getCommList.filter((service: any) => service.SourceType == SourceType)
  }


  getserviceData(SourceType: any) {
    // console.log("sourceType", SourceType)
    // console.log("this.getCommList.filter((service: any) => service.SourceType === sourceType)", this.getCommList.filter((service: any) => service.SourceType == SourceType))
    return this.getCommList.filter((service: any) => service.SourceType == SourceType)
  }


  serList: any
  getSource() {
    this.shared.loader(true)
    this.api.getSource().subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        this.sourceList = res
        // console.log("here is source list", this.sourceList);

        this.sourceList.forEach((ele: any) => {
          if (ele.Type == this.field2) {
            this.serList = ele.lstSource
            console.log("here is data for services", this.serList);

          }

          // if (ele.Type == 1) {
          //   this.Money = ele.lstSource
          //   // console.log("money list", this.Money);
          // }
          // else if (ele.Type == 2) {
          //   this.Recharge = ele.lstSource
          //   // console.log("recharge list", this.Recharge);
          // }
          // else if (ele.Type == 3) {
          //   this.Booking = ele.lstSource
          //   // console.log("Booking list", this.Booking);
          // }
          // else if (ele.Type == 4) {
          //   this.Utility = ele.lstSource
          //   // console.log("Utility list", this.Utility);
          // }
          // else if (ele.Type == 5) {
          //   this.Miscellaneous = ele.lstSource
          //   // console.log("Miscellaneous list", this.Miscellaneous);
          // }

        });

      }, error: (err: any) => {
        this.shared.loader(false)
        this.toster.error("Something went wrong", "Error")

      }
    })
  }

  //  ======================================================= add comm============================================================

  radioChng(val: any) {
    // console.log("here is val", val.target.value);

  }

  addComm() {
    this.submitted = true
    if (this.commForm.invalid) {
      return
    }
    let data = {
      ServiceID: Number(this.servId),
      APIID: Number(this.apiId),
      oType: this.commForm.value
    }
    data.oType.oType = Number(this.commForm.value.oType)
    if (Number(this.commForm.value.Range_Max) <= Number(this.commForm.value.Range_Min)) {
      this.toster.error("Minimum Value should not be greater than or equal to the Maximum value.")
      return;
    }
    this.shared.loader(true)
    this.api.addMoreComm(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        if (res.Result == true) {
          this.closeModel('close')
          this.getVendorComm()
          this.toster.success(res.MSG_USER, "Success")
          // console.log("here is res", res);
        } else {
          this.toster.error(res.MSG_USER, "Error")
        }

      }, error: (error: any) => {
        this.shared.loader(false)
        this.toster.error("Something went wrong", "Error")
      }
    })
  }

  // =========================================================== edit comm ===================================================================

  editComm() {
    let data = {
      CommissionID: this.allComm.CommisionID,
      FeeID: this.commFee.FeeID,
      Fee: this.commForm.value.Fee,
      oType: Number(this.commForm.value.oType)     //perc=1,Fixed=2
    }
    this.shared.loader(true)
    this.api.updateComm(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        if (res.Result == true) {
          this.closeModel('close')
          this.getVendorComm()
          this.toster.success("Commission Fee Updated Successfully", "Success")
          // console.log("here is res", res);
        } else {
          this.toster.error("Commission Fee not updated", "Error")
        }

      }, error: (error: any) => {
        this.shared.loader(false)
        this.toster.error("Something went wrong", "Error")
      }
    })
  }

  // ========================================================= delete commission ================================================================

  deleteComm(val: any) {
    if (this.execPermissions?.some((permit: any) => permit.Master === 'Configuration' && permit.SubMasters.some((sub: any) => sub.SubMaster === 'API' && sub.Delete === 0))) {

      this.toster.error('You do not have permission to delete.', 'Permission Denied');
      return;
    }
    // console.log("here is val from delete", val);

    let data = {
      Key: "",
      Field1: String(val.FeeID)
    }

    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this commission",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes!"
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.api.delComm(data).subscribe({
          next: (res: any) => {
            // this.shared.loader(false)
            if (res.Result == true) {
              this.getVendorComm()
              this.toster.success("Commission deleted successfully", "Success")
            }
            else {
              this.toster.error("Commission not deleted", "Error")
            }
          }, error: (err: any) => {
            this.toster.error("Something went wrong", "Error")
          }
        })

      }
    })
  }

  // ================================================== config =============================================================

  MONEY_TRANSFER: any = 0
  RECHARGE: any = 0
  BOOKING: any = 0
  UTILITY_BILL: any = 0
  MISC_SERVICE: any = 0
  buttonEnable: boolean = false
  changeCheckVal(val: any, ev: any) {
    // console.log("here is event", ev.target.checked);

    // console.log("here is val", val);

    if (ev.target.checked == true && val.value == 1) {
      this.buttonEnable = true
      this.MONEY_TRANSFER = 1
    } else if (ev.target.checked == true && val.value == 2) {
      this.buttonEnable = true
      this.RECHARGE = 1
    } else if (ev.target.checked == true && val.value == 3) {
      this.buttonEnable = true
      this.BOOKING = 1
    } else if (ev.target.checked == true && val.value == 4) {
      this.buttonEnable = true
      this.UTILITY_BILL = 1
    } else if (ev.target.checked == true && val.value == 5) {
      this.buttonEnable = true
      this.MISC_SERVICE = 1
    } else if (ev.target.checked == false && val.value == 1) {
      this.buttonEnable = true
      this.MONEY_TRANSFER = 0
    } else if (ev.target.checked == false && val.value == 2) {
      this.buttonEnable = true
      this.RECHARGE = 0
    } else if (ev.target.checked == false && val.value == 3) {
      this.buttonEnable = true
      this.BOOKING = 0
    } else if (ev.target.checked == false && val.value == 4) {
      this.buttonEnable = true
      this.UTILITY_BILL = 0
    } else if (ev.target.checked == false && val.value == 5) {
      this.buttonEnable = true
      this.MISC_SERVICE = 0
    }

  }



  addConfig() {
    // console.log("here is val from submit", this.MONEY_TRANSFER, this.RECHARGE, this.BOOKING, this.UTILITY_BILL, this.MISC_SERVICE);

    let data = {
      Key: "",
      API_ID: this.apiId,
      oStat: {
        MONEY_TRANSFER: this.MONEY_TRANSFER,      //Enable=1,Disable=0
        RECHARGE: this.RECHARGE,              //Enable=1,Disable=0
        BOOKING: this.BOOKING,      //Enable=1,Disable=0
        UTILITY_BILL: this.UTILITY_BILL,      //Enable=1,Disable=0
        MISC_SERVICE: this.MISC_SERVICE      //Enable=1,Disable=0
      }
    }

    this.api.addConfigComm(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        if (res.Result == true) {
          this.closeMd('close')
          this.getVendorComm()
          this.toster.success("Services Configured successfully", "Success")
          // console.log("here is res", res);
        } else {
          this.toster.error("Services not Configured", "Error")
        }

      }, error: (error: any) => {
        this.shared.loader(false)
        this.toster.error("Something went wrong", "Error")
      }
    })
  }

  backButton() {
    this.router.navigateByUrl('api-manage')
  }

  // =========================================================== dot validation ===============================================

  numericMessage: boolean = false
  oneDotAfterTwoDigit(event: any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;

    // Get the input value
    const inputValue = event.target.value;

    // Allow digits (0-9) and dot (.)
    if ((charCode < 48 || charCode > 57) && charCode !== 46) {
      this.numericMessage = true;
      return false;
    }

    // Check if the input value already contains a dot
    const dotIndex = inputValue.indexOf('.');

    if (dotIndex !== -1) {
      // If dot is present, allow only one digit after it
      if (charCode === 46) {
        this.numericMessage = true;
        return false;
      } else {
        // Check the number of digits after the dot
        const digitsAfterDot = inputValue.substring(dotIndex + 1);
        if (digitsAfterDot.length >= 2) {
          // Prevent entering more than one digit after the dot
          this.numericMessage = true;
          return false;
        }
      }
    }

    this.numericMessage = false;
    return true;
  }
}
