import { Component, OnInit, TemplateRef } from '@angular/core';
import { ApiService } from '../../servies/api.service';
import { SharedService } from '../../servies/shared/shared.service';
import { ToastrService } from 'ngx-toastr';
import { configComm, serviceDrop } from '../../common/serviceDrop';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-all-package',
  standalone: true,
  imports: [FormsModule, NgMultiSelectDropDownModule, ReactiveFormsModule, CommonModule],
  templateUrl: './user-all-package.component.html',
  styleUrl: './user-all-package.component.scss'
})
export class UserAllPackageComponent implements OnInit {
  dropDownData: any = configComm
  packageList: any
  dropDown: any = configComm
  lstSource: any
  sourceList: any
  submitted: boolean = false
  execPermissions: any

  addPackageForm: any = FormGroup

  dropdownList: any = [

  ];
  selectedItems: any[] = [];
  dropdownSettings: any = {

  };
  items = Array(5).fill(0);

  openLg(content: TemplateRef<any>) {
    if (this.execPermissions?.some((permit: any) => permit.Master === 'Configuration' && permit.SubMasters.some((sub: any) => sub.SubMaster === 'Packages' && sub.Add === 0))) {

      this.toster.error('You do not have permission to add packages', 'Permission Denied');
      return;
    } else {

      // this.getSource()
      this.submitted = false
      this.addPackageForm.reset()
      this.selectedItems = []
      this.itemData = []
      this.modalService.open(content, { size: 'md modalone', centered: true, windowClass: 'flip-modal' });

    }
  }

  closeModel() {
    this.modalService.dismissAll()
  }

  constructor(private api: ApiService, private shared: SharedService, private toster: ToastrService,
    private modalService: NgbModal, private fb: FormBuilder, private router: Router
  ) {

    this.dropdownList = this.dropDownData



    this.dropdownSettings = {
      singleSelection: false,
      idField: 'value',
      textField: 'name',
      // selectAllText: 'Select All',
      // unSelectAllText: 'UnSelect All',
      itemsShowLimit: 5,
      allowSearchFilter: true
    };


    this.shared.setSidebrActiveClass('all-packages');

    // Optional: You can subscribe to activeClass$ if needed
    this.shared.activeClass$.subscribe((activeClass: string) => {
      console.log('Current active class in ServicesComponent:', activeClass);
    });
  }

  public name = 'Cricketers';
  public data: any = [
    { item_id: 1, item_text: 'Hanoi' },
    { item_id: 2, item_text: 'Lang Son' },
    { item_id: 3, item_text: 'Vung Tau' },
    { item_id: 4, item_text: 'Hue' },
    { item_id: 5, item_text: 'Cu Chi' },
  ]
  public settings = {};
  // public selectedItems = [];

  ngOnInit(): void {
    this.execPermissions = JSON.parse(sessionStorage.getItem("execDetails") || '{}')
    console.log("here is permission in user list>>>>>>>", this.execPermissions);
    this.getUserPackage()
    this.getSource()

    this.addPackageForm = this.fb.group({
      oPkg: ["", [Validators.required, , Validators.pattern("[a-zA-Z][a-zA-Z ]+")]],
      SourceType: [""]
    })



    this.data = [
      { item_id: 1, item_text: 'Hanoi' },
      { item_id: 2, item_text: 'Lang Son' },
      { item_id: 3, item_text: 'Vung Tau' },
      { item_id: 4, item_text: 'Hue' },
      { item_id: 5, item_text: 'Cu Chi' },
    ];


  }

  getMatchingItem(data1: number) {
    return this.dropDown.find((item: any) => item.value === data1);
  }


  get f() {
    return this.addPackageForm.controls;
  }
  // ======================================================================== get user package ==============================================================

  getUserPackage() {

    let data = {
      Key: "",
      Field1: "0"
    }
    this.shared.loader(true)

    this.api.getUserPackage(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        this.packageList = res
        this.lstSource = res.lstSource
        // console.log("here is all source", this.lstSource);
        // console.log("here is all package", this.packageList);

      }, error: (err: any) => {
        this.shared.loader(false)
        this.toster.error("Something went wrong", "error")
      }
    })
  }

  // ================================================================= get api for dropdown ==============================================================

  getSource() {
    this.shared.loader(true)
    this.api.getSource().subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        this.sourceList = res
        // console.log("here is source list", this.sourceList);

        for (let index = 0; index < this.sourceList.length; index++) {
          const element = this.sourceList[index];
          // console.log("here is element"m ele);


        }

        // this.sourceList.forEach((ele: any) => {
        //   if (ele.Type == 1) {
        //     this.Money = ele.lstSource
        //     console.log("money list", this.Money);
        //   }
        //   else if (ele.Type == 2) {
        //     this.Recharge = ele.lstSource
        //     console.log("recharge list", this.Recharge);
        //   }
        //   else if (ele.Type == 3) {
        //     this.Booking = ele.lstSource
        //     console.log("Booking list", this.Booking);
        //   }
        //   else if (ele.Type == 4) {
        //     this.Utility = ele.lstSource
        //     console.log("Utility list", this.Utility);
        //   }
        //   else if (ele.Type == 5) {
        //     this.Miscellaneous = ele.lstSource
        //     console.log("Miscellaneous list", this.Miscellaneous);
        //   }

        // });

      }, error: (err: any) => {
        this.shared.loader(false)
        this.toster.error("Something went wrong", "Error")

      }
    })
  }


  onDeSelectAll(ev: any) {
    this.itemData = []
  }


  onDropDownClose(ev: any) { }

  allowAlphabetsOnly(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;

    // Allow only alphabetic characters (A-Z and a-z)
    if ((charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122)) {
      return true; // Allow input
    } else {
      event.preventDefault(); // Prevent input of other characters
      return false;
    }
  }
  allData: any = []
  // onSelectAll(ev: any) {
  //   this.allData= ev
  //   for (let index = 0; index < this.allData.length; index++) {
  //     const element = this.allData[index];
  //     this.selectedItems.push({
  //       SourceType: element.value
  //     })
  //     console.log("here is element", element);

  //   }
  //   console.log("here is ev from all select", this.selectedItems);
  //  }

  //  onDeSelect(item: any) {
  //   const index = this.selectedItems.indexOf(item.value);
  //   if (index > -1) { 
  //     this.selectedItems.splice(index, 1); 
  //   }
  //   console.log("here is unselect item", this.selectedItems);

  //    }

  onSelectAll(ev: any) {
    this.itemData = []
    this.itemData = ev.map((item: any) => ({ SourceType: item.value }));
    console.log("All items selected:", this.itemData);
  }

  onDeSelect(item: any) {
    // Find the index of the item with the same 'SourceType' value
    const index = this.itemData.findIndex((i: any) => i.SourceType === item.value);
    if (index > -1) {
      this.itemData.splice(index, 1); // Remove the item from selectedItems
    }
    // console.log("Item unselected:", item.value);
    // console.log("Updated selected items after unselect:", this.selectedItems);
  }

  itemData: any = []
  onItemSelect(ev: any) {
    console.log("here is ev", ev.value);

    // this.itemData= ev.value
    this.itemData.push({
      SourceType: ev.value
    })
    // console.log("here is ev from select", ev.value);
    console.log("here is ev from select", this.itemData);

  }

  // =========================================================== add package ========================================================================

  addPackage() {
    this.submitted = true
    if (this.addPackageForm.invalid) {

      return;
    }
    let data = {
      "Key": "",
      "oPkg": {
        "Commission": this.addPackageForm.value.oPkg,         //package name
        "Default": 0                   //status will be by default disable
      },
      "oComm": this.itemData
    }
    this.shared.loader(true)
    this.api.addPackage(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        // console.log("here is add package res", res);
        if (res.Result == true) {
          this.getUserPackage()
          this.closeModel()
          this.toster.success("Package Added Successfully", "Success")
        } else {
          this.toster.error(res.MSG_USER, "Error")
        }

      }, error: (err: any) => {
        this.shared.loader(false)
        this.toster.error("Something went wrong", "Error")
      }
    })

  }

  // ================================================================ delet package =========================================================

  deletePackage(val: any) {
    // console.log("here is val from delete", val);

      if (this.execPermissions?.some((permit: any) => permit.Master === 'Configuration' && permit.SubMasters.some((sub: any) => sub.SubMaster === 'Packages' && sub.Delete === 0))) {
      this.toster.error('You do not have permission to delete packages', 'Permission Denied');
      return;
    } else {
    let data = {
      Key: "",
      Field1: String(val.PkgID)
    }

    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete" + " " + val.oPkg.Commission,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes!"
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.shared.loader(true)
        this.api.delUserPackage(data).subscribe({
          next: (res: any) => {
            this.shared.loader(false)
            if (res.Result == true) {
              this.getUserPackage()
              this.toster.success("Package Deleted Successfully", "Success")
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

  viewToNavigate(PkgID: any, type: any) {
    // console.log("here navigation pkgID", PkgID.PkgID);
    console.log("here navigation type", type);

    this.router.navigateByUrl("user-package/" + PkgID.PkgID + "/" + type)
  }

  // ========================================================== craete package as default =======================================================

  packageDefault(val: any) {

    if (this.execPermissions?.some((permit: any) => permit.Master === 'Configuration' && permit.SubMasters.some((sub: any) => sub.SubMaster === 'Packages' && sub.Edit === 0))) {
      this.getUserPackage()
      this.toster.error('You do not have permission to update packages', 'Permission Denied');
      return;
    } else {

      let data = {
        Key: "",
        Field1: String(val.PkgID)
      }

      Swal.fire({
        title: "Are you sure?",
        text: "You want to set default" + " " + val.oPkg.Commission,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes!"
      }).then((result: any) => {
        if (result.isConfirmed) {
          this.shared.loader(true)
          this.api.createPackDefault(data).subscribe({
            next: (res: any) => {
              this.shared.loader(false)
              if (res.Result == true) {
                this.getUserPackage()
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

        } else {
          this.getUserPackage()
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
