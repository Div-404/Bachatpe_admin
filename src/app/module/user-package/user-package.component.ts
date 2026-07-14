import { Target } from '@angular-devkit/architect';
import { Component, OnInit, TemplateRef } from '@angular/core';

import { NgbDropdownModule, NgbModal, } from '@ng-bootstrap/ng-bootstrap';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../servies/api.service';
import { SharedService } from '../../servies/shared/shared.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
// import { M } from '../../../../node_modulesss/vite/dist/node/types.d-FdqQ54oU';
@Component({
  selector: 'app-user-package',
  standalone: true,
  imports: [NgbDropdownModule, CommonModule, NgMultiSelectDropDownModule, FormsModule, ReactiveFormsModule],
  templateUrl: './user-package.component.html',
  styleUrl: './user-package.component.scss'
})
export class UserPackageComponent implements OnInit{

  dropdownList:any = [];
  selectedItems :any= [];
  dropdownSettings:any = {};
  items = Array(5).fill(0);
  userPackInfo: any= []
  pkgId: any
  type: any
  packageName: any
  modalData: any
  addPackInfoForm: any= FormGroup
  submitted: boolean= false
  private dashboardRoute: string = '/user-list';
  previousUrl: any
  execPermissions: any


  constructor(private modalService: NgbModal, private offcanvasService:NgbOffcanvas, private router: Router,
    private api: ApiService, public shared:SharedService, private toster: ToastrService, private route: ActivatedRoute,
    private fb: FormBuilder,private location: Location
  ){
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

        //////////////// for back button //////////////////////
        this.router.events.subscribe(event => {
          if (event instanceof NavigationEnd) {
            this.previousUrl = event.url;
          }
        });
      }


  openEnd(content: TemplateRef<any>) {
		this.offcanvasService.open(content, { position: 'end' });
	}
  openLg(content: any, val: any) {
    if (this.execPermissions?.some((permit: any) => permit.Master === 'Configuration' && permit.SubMasters.some((sub: any) => sub.SubMaster === 'Packages' && sub.Add === 0))) {

      this.toster.error('You do not have permission to add package commission.', 'Permission Denied');
      return;
    }else{
    // this.tostMsg= false
    this.submitted= false
    this.addPackInfoForm.reset()
    this.modalData= val
    this.mdCehck= 2
    this.diCheck= 2
    this.rlCheck= 2
    this.rlDed= 2
    console.log("here is val", this.modalData);
    
		this.modalService.open(content, { size: 'md modalone', centered: true, windowClass: 'flip-modal' } );
    }
	}

  modalClose() {
    this.modalService.dismissAll()
  }

  navigate(val:any){
    this.router.navigateByUrl(val)
  }

  onSelectAll(ev:any){}
  onItemSelect(ev:any){}

  ngOnInit(): void {

    this.execPermissions = JSON.parse(sessionStorage.getItem("execDetails") || '{}')

    this.route.params.subscribe((param: any) => {
      console.log("here is param", param);
      this.pkgId = param.id
      this.type= param.type
      this.getUserPackInfo()
    })

    this.addPackInfoForm= this.fb.group({
      Range_Min: ["", Validators.required],
      Range_Max: ["", Validators.required],
      Fee: [""],
      oType: ["", Validators.required],              //perc=1,Fixed=2
      Commission_All: ["", Validators.required],
      oHierCommType: ["", Validators.required],
      Commission_MD: ["", Validators.required],
      Commission_DI: ["", Validators.required],
      Commission_RL: ["", Validators.required],
      Commission_AM: [""]
    })
  }

  // ========================================================= get package info ==========================================================

  get f() {
    return this.addPackInfoForm.controls;
  }
  goBack() {
    if (this.previousUrl !== this.dashboardRoute) {
      this.location.back();
    } else {
      console.log('Cannot go back from the dashboard route');
    }
  }


  getUserPackInfo() {
    let data= {
      Key: "",
      Field1: this.pkgId,
      Field2: this.type
    }
    this.shared.loader(true)
    this.api.getUserPackInfo(data).subscribe({next: (res: any) =>{
      this.shared.loader(false)
      this.userPackInfo= res.lstComm
      this.packageName= res.oPkg.Commission

      console.log("here is package info", this.userPackInfo);
      
    }, error: (err: any) =>{
      this.toster.error("something went wrong", "Error")
    }})
  }

  mdCehck= 2
  diCheck= 2
  rlCheck= 2
  rlDed= 2
  checkStart(ev: any, type: any) {
    if (ev.target.checked && type === 'md') {
      this.mdCehck= 1
    } else if (!ev.target.checked && type === 'md') {
      this.mdCehck= 2
    } else if (ev.target.checked  && type === 'di'){
      this.diCheck= 1
    } else if (!ev.target.checked  && type === 'di'){
      this.diCheck= 2
    }else if (ev && type === 'rl'){
      this.rlCheck= 1
    }else if (!ev.target.checked && type === 'rl'){
      this.rlCheck= 2
    }else if (ev.target.checked && type === 'rlded'){
      this.rlDed= 1
    } else if (!ev.target.checked && type === 'rlded'){
      this.rlDed= 2
    }

    console.log("here is ev", ev.target.checked);
    

  }

  // ======================================================================= add package info =======================================================

  // tostMsg: any= ''
  addPackageInfo() {
    this.submitted = true;
    
    // Check if the form is invalid
    if (this.addPackInfoForm.invalid) {
      return;
    }
  
    // Explicitly convert Range_Min and Range_Max to numbers
    const rangeMin = Number(this.addPackInfoForm.value.Range_Min);
    const rangeMax = Number(this.addPackInfoForm.value.Range_Max);
  
    // Check if the minimum value is greater than or equal to the maximum value
    if (rangeMin >= rangeMax) {
      // this.tostMsg= "maximum value have to be greater then minimum"
      this.toster.error("Minimum Value should not be greater than or equal to the Maximum value.");
      return;
    }
    // this.tostMsg= ""
  
    // Prepare data object for the API call
    let data = {
      "Key": "",
      "SourceType": this.modalData.SourceType,          // MONEY_TRANSFER = 1, RECHARGE = 2, BOOKING = 3, UTILITY_BILL = 4, MISC_SERVICE = 5
      "ServiceID": this.modalData.ServiceID,
      "CommisisonID": this.modalData.CommisisonID,
      "oComm": this.addPackInfoForm.value
    }
  
    // Set default values
    data.oComm.Fee = 0;
    data.oComm.oType = Number(this.addPackInfoForm.value.oType);
    data.oComm.MD_Tds=  this.mdCehck
    data.oComm.DI_Tds=  this.diCheck
    data.oComm.RL_Tds=  this.rlCheck
    data.oComm.RL_Deduct=  this.rlDed
    data.oComm.Commission_AM= 0
  
    // Make the API call
    this.shared.loader(true);
    this.api.addPackInfo(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false);
        console.log("here add package info res", res);
        if (res.Result === true) {
          this.modalClose();
          this.getUserPackInfo();
          this.toster.success("commission added successfully", "Success");
        } else {
          this.toster.error("Invalid Range Configuration.", "Error");
        }
      },
      error: (err: any) => {
        this.shared.loader(false);
        this.toster.error("Something went wrong", "Error");
      }
    });
  }
  
  // ========================================================== delete package info ===================================================================

  deletePackageInfo(val: any) {
      if (this.execPermissions?.some((permit: any) => permit.Master === 'Configuration' && permit.SubMasters.some((sub: any) => sub.SubMaster === 'Packages' && sub.Delete === 0))) {

      this.toster.error('You do not have permission to delete package commission.', 'Permission Denied');
      return;
    }else{
    console.log("here is val from delete", val);

    let data = {
      Key: "",
      Field1: String(val.CommisisonID),
      Field2: String(val.SourceType),
      Field3: String(val.ServiceID)
    }

    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete" + " " + val.ServiceName,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes!"
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.shared.loader(true)
        this.api.delUserPackInfo(data).subscribe({
          next: (res: any) => {
            this.shared.loader(false)
            if (res.Result == true) {
              this.getUserPackInfo()
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

  goToPackage() {
    this.router.navigateByUrl("all-packages")
  }

  // =========================================================== dot validation ===============================================

  numericMessage: boolean= false
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
