import { Component, OnInit } from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { SharedService } from '../../servies/shared/shared.service';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../servies/api.service';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reports-penality',
  standalone: true,
  imports: [NgbTooltipModule, NgbDropdownModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './reports-penality.component.html',
  styleUrl: './reports-penality.component.scss'
})
export class ReportsPenalityComponent implements OnInit {
  libuysellTab: any = "tab2"
  penaltyForm: any = FormGroup
  editData: any
  execPermissions: any

  libuysell(tab: any) {
    this.libuysellTab = tab
  }
  constructor(private modalService: NgbModal, private shared: SharedService, private toster: ToastrService,
    private api: ApiService, private fb: FormBuilder
  ) { }
  openLg2(content2: any, val: any, editVal: any) {
    this.penaltyForm.controls.packages
    console.log("packages", this.penaltyForm.controls.packages.status);

    this.editData = editVal
    if (val == 'add') {
      if (this.execPermissions?.some((permit: any) => permit.Master === 'Finance' && permit.SubMasters.some((sub: any) => sub.SubMaster === 'Transaction' && sub.Add === 0))) {

        this.toster.error('You dont have permission to add package.', 'Permission Denied');
        return;
      }
      this.penaltyForm.reset()
      this.packages.clear();
      this.packages.push(this.createPackageGroup());
    } else {
      if (this.execPermissions?.some((permit: any) => permit.Master === 'Finance' && permit.SubMasters.some((sub: any) => sub.SubMaster === 'Transaction' && sub.Edit === 0))) {

        this.toster.error('You dont have permission to update package.', 'Permission Denied');
        return;
      }
      this.packages.clear()
      this.penaltyForm.patchValue({
        Pkg: editVal.oPenality.Pkg
      })
      editVal.lstPenality.forEach((ele: any) => {
        this.packages.push(this.fb.group({
          Min: ele.Min,
          Max: ele.Max,
          Perc_Fiat: ele.Perc_Fiat,
          Value: ele.Value
        }))
      });


    }
    console.log("here is edit val", this.editData);
    this.modalService.open(content2, { size: 'md modalone', centered: true, windowClass: 'flip-modal' });
  }

  ngOnInit(): void {
    this.execPermissions = JSON.parse(sessionStorage.getItem("execDetails") || '{}')
    this.shared.setSidebrActiveClass('credit-container')
    this.getReportPanalty()

    this.penaltyForm = this.fb.group({
      Pkg: ['', Validators.required],
      PkgID: [''],
      packages: this.fb.array([this.createPackageGroup()])
    });



  }

  // =========================================================== form array =========================================================

  createPackageGroup(): FormGroup {
    return this.fb.group({
      Min: ['', Validators.required],
      Max: ['', Validators.required],
      Perc_Fiat: ['', Validators.required],
      Value: ['', Validators.required]
    });
  }

  get packages(): FormArray {
    return this.penaltyForm.get('packages') as FormArray;
  }

  addPackage(): void {
    this.packages.push(this.createPackageGroup());
  }

  removePackage(index: number): void {
    this.packages.removeAt(index);
  }

  isPackageArrayInvalid(): boolean {
    return this.packages.controls.some(group => {
      const values = group.value;
      return (
        !values.Min?.toString().trim() ||
        !values.Max?.toString().trim() ||
        !values.Perc_Fiat?.toString().trim() ||
        !values.Value?.toString().trim()
      );
    });
  }


  // ============================================================== get panalty ======================================================


  closeMd() {
    this.modalService.dismissAll()
  }


  panaltyList: any = []
  getReportPanalty() {
    this.panaltyList = []
    let data = {
      "Field1": "0"
    }
    this.shared.loader(true)
    this.api.getReportPanalty(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        this.panaltyList = res

        console.log("here is panalty list", this.panaltyList);

      }, error: (err: any) => {
        this.toster.error("Something went wrong", 'Error')
      }
    })

  }
  // ============================================================ change status =========================================================

  changeStatus(ev: any, val: any) {
    if (this.execPermissions?.some((permit: any) => permit.Master === 'Finance' && permit.SubMasters.some((sub: any) => sub.SubMaster === 'Transaction' && sub.Edit === 0))) {
      this.getReportPanalty()
      this.toster.error('You dont have permission to update package.', 'Permission Denied');
      return;
    } else {
      console.log("here is panalty list", val);
      console.log("here is panalty list", ev.target.value);

      let data = {
        "Field1": val.PkgID,   //Penalty ID
        "Field2": ev.target.value      //status    Enable=1,Disable=2
      }
      this.shared.loader(true)
      this.api.UpdateStatusPan(data).subscribe({
        next: (res: any) => {
          this.shared.loader(false)
          if (res.Result == true) {
            this.toster.success("Package status updated successfully", "Success")
          } else {
            this.toster.error(res.MSG_USER, "Error")
          }

        }, error: (err: any) => {
          this.toster.error("Something went wrong", 'Error')
        }
      })
    }

  }

  // ========================================================= add panalty ============================================================

  addEditPanalty() {
    console.log("here is edit val", this.penaltyForm.controls.packages);

    const invalidPackages = this.penaltyForm.value.packages.some((pkg: any) => {
      const min = Number(pkg.Min);
      const max = Number(pkg.Max);
      return isNaN(min) || isNaN(max) || min >= max;
    });

    if (invalidPackages) {
      this.toster.error('Min. value cannot be greater than or equal to max. value', 'Error');
      return;
    }

    let formValue = this.penaltyForm.value

    let data: any = {
      //"PkgID":0,
      Pkg: formValue.Pkg.trim(),
      //"Default":2,    //ENABLE=1,DISABLE=2
      //"Status":1,     //ENABLE=1,DISABLE=2

      lstPenality: formValue.packages
    }

    if (this.editData) {
      data.PkgID = this.editData.oPenality.PkgID; // or some identifier from editData
    }

    this.api.addEditReportPanalty(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        if (res.Result != -1 && !this.editData) {
          this.closeMd()
          this.getReportPanalty()
          this.toster.success("Package created successfully", "Success")
        } else if (res.Result == -1 && this.editData) {
          this.closeMd()
          this.getReportPanalty()
          this.toster.success("Package updated successfully", "Success")
        }
        else {
          this.toster.error(res.MSG_USER, "Error")
        }

      }, error: (err: any) => {
        this.toster.error("Something went wrong", 'Error')
      }
    })

  }

  // ============================================================== create default package =========================================


  packageDefault(val: any) {
    if (this.execPermissions?.some((permit: any) => permit.Master === 'Finance' && permit.SubMasters.some((sub: any) => sub.SubMaster === 'Transaction' && sub.Edit === 0))) {
      this.getReportPanalty()
      this.toster.error('You dont have permission to update package.', 'Permission Denied');
      return;
    } else {

      let data = {
        "Field1": val.PkgID,   //penalty ID
        "Field2": "1"      //Default status.   Enable=1,Disable=2
      }

      Swal.fire({
        title: "Are you sure?",
        text: "You want to set this package" + " " + val.Pkg + " " + "as Default",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes!"
      }).then((result: any) => {
        if (result.isConfirmed) {
          this.shared.loader(true)
          this.api.UpdateDefaultPan(data).subscribe({
            next: (res: any) => {
              this.shared.loader(false)
              if (res.Result == true) {
                this.getReportPanalty()
                this.toster.success("Package set as Default successfully", "Success")
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
          this.getReportPanalty()
        }
      })
    }
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

  inpputForEveryone(event: any) {
    // Get the current input value
    const input = event.target as HTMLInputElement;
    const inputValue = input.value;
    const key = event.key;

    // Define a regex pattern to match the whole input
    const regex = /^(?!\s*$)[A-Za-z ]+$/;

    // Test if the input matches the pattern
    if (!regex.test(inputValue + key)) {
      event.preventDefault(); // Prevent the keypress if it doesn't match the regex
    }
  }

  numberOnly(event: any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      this.numericMessage = true;
      return false;
    }
    this.numericMessage = false;
    return true;
  }
}
