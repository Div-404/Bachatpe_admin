import { Component, OnInit, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDropdownModule, NgbModal, } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../servies/api.service';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedService } from '../../servies/shared/shared.service';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-manage-bank',
  standalone: true,
  imports: [CommonModule, NgbDropdownModule, ReactiveFormsModule, FormsModule],
  templateUrl: './manage-bank.component.html',
  styleUrl: './manage-bank.component.scss'
})
export class ManageBankComponent implements OnInit {
  items = Array(8).fill(0);
  bankList: any
  bankForm: any = FormGroup
  submitted: boolean = false
  execId: any
  statusVal: any
  execPermissions: any
  columns = [
    { key: 'timestamp', label: 'Timestamp', visible: true },
    { key: 'bankName', label: 'Bank Name', visible: false },
    { key: 'bankAddress', label: 'Bank Address', visible: false },
    { key: 'accountHolderName', label: 'Acc. Holder Name', visible: true },
    { key: 'accountNumber', label: 'Account No.', visible: false },
    { key: 'ifscCode', label: 'IFSC Code', visible: false },
    { key: 'status', label: 'Status', visible: true },
    { key: 'actions', label: 'Actions', visible: true }
  ];



  constructor(private modalService: NgbModal, private api: ApiService, private toster: ToastrService,
    private shared: SharedService, private fb: FormBuilder, private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.execPermissions = JSON.parse(sessionStorage.getItem("execDetails") || '{}')
    this.getBank()
    this.execId = JSON.parse(sessionStorage.getItem('isloggedIn') || "{}")
    this.bankForm = this.fb.group({
      Bank: ["", [Validators.required, Validators.pattern("[a-zA-Z][a-zA-Z ]+")]],
      Bank_Address: ["", Validators.required],
      Account_Name: ["", [Validators.required, Validators.pattern("[a-zA-Z][a-zA-Z ]+")]],
      Account_IFSC: ["", Validators.required],
      Account_Number: ["", Validators.required],
      Status: [""]
    })
  }

  openLg(content: TemplateRef<any>) {
    if (this.execPermissions?.some((permit: any) => permit.Master === 'Finance' && permit.SubMasters.some((sub: any) => sub.SubMaster === 'Manage Bank' && sub.Add === 0))) {

      this.toster.error('You do not have permission to add bank.', 'Permission Denied');
      return;
    } else {
      this.submitted = false
      this.bankForm.reset()
      this.ifscError = ''
      this.modalService.open(content, { size: 'md modalone', centered: true, windowClass: 'flip-modal' });
    }
  }

  closeModel() {
    this.modalService.dismissAll()
    this.resetForm();
  }

  get f() {
    return this.bankForm.controls;
  }
  showStatement: any = 0
  getBank() {
    this.shared.loader(true)
    this.api.getTranBank().subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        this.bankList = res
        console.log("here is res from bank list", this.bankList);
        this.showStatement = 1
      }, error: (err: any) => {
        this.shared.loader(false)
        this.showStatement = 0
        this.toster.error("Something went wrong", "Error")
      }
    })
  }
  allowNumbersOnly(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    // Check if the character is not a number (0-9)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault(); // Prevent the keypress if it's not a number
    }
  }
  trackByIndex(index: number): number {
    return index;
  }
  onColumnChange() {
    // This method will trigger when a checkbox is checked or unchecked
    console.log('Column visibility updated', this.columns);
  }
  isColumnVisible(columnKey: string): boolean {
    const column = this.columns.find(col => col.key === columnKey);
    return column ? column.visible : false;
  }

  trimBankInfo(bankInfo: any): any {
    return {
      Bank: bankInfo.Bank.trim(),
      Bank_Address: bankInfo.Bank_Address.trim(),
      Account_Name: bankInfo.Account_Name.trim(),
      Account_IFSC: bankInfo.Account_IFSC.trim(),
      Account_Number: bankInfo.Account_Number.trim(),
      Status: bankInfo.Status // Status field can be left as is or trimmed if needed
    };
  }
  addBankDetail() {
    this.submitted = true;
    if (this.bankForm.invalid) {
      return;
    }
    let trimmedBankInfo = this.trimBankInfo(this.bankForm.value);
    let data = {
      "Key": "",
      CreatedBy: this.execId.Result,
      BankInfo: trimmedBankInfo
    };
    data.BankInfo.Status = 1;

    this.api.addTranbank(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false);
        if (res.Result === true) {
          this.getBank();
          this.closeModel();
          this.resetForm();
          this.toster.success('Bank configured successfuly.', "Success");
        } else {
          this.toster.error("Something went wrong", "Error");
        }
      },
      error: (err: any) => {
        this.shared.loader(false);
        this.toster.error("Something went wrong", "Error");
      }
    });
  }
  ifscError: string | null = null;
  fetchIFSCDetails(ifscCode: string) {
    const url = `https://ifsc.razorpay.com/${ifscCode}`;
    this.http.get(url).subscribe(
      (data: any) => {
        if (data) {
          this.bankForm.patchValue({
            Bank: data.BANK,
            Bank_Address: `${data.BRANCH}, ${data.ADDRESS}, ${data.CITY}, ${data.STATE}`
          });
          this.ifscError = null; // Reset error if valid IFSC code
        }
      },
      (error: any) => {
        this.ifscError = 'Invalid IFSC code. Please enter a valid code.'; // Set error message
        console.error('Error fetching IFSC details:', error);
      }
    );
  }
  allowAlphabetsOnly(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    // Check if the character is not a letter (A-Z or a-z)
    if (!((charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122))) {
      event.preventDefault(); // Prevent the keypress if it's not an alphabet
    }
  }
  allowAlphanumericOnly(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    // Allow only letters (A-Z, a-z) and numbers (0-9)
    if (!((charCode >= 65 && charCode <= 90) ||  // Uppercase A-Z
      (charCode >= 97 && charCode <= 122) || // Lowercase a-z
      (charCode >= 48 && charCode <= 57))) { // Numbers 0-9
      event.preventDefault(); // Prevent the keypress if it's not alphanumeric
    }
  }
  resetForm() {
    this.bankForm.reset();
    this.submitted = false;
  }

statusUpdate(val: any) {
  console.log("here re is val", val);

  const originalStatus = val.BankInfo.Status;
  const newStatus = originalStatus == 1 ? 0 : 1;

  val.localStatus = newStatus == 1;

  // Show confirmation dialog
  Swal.fire({
    title: "Are you sure?",
    text: "You want to change the status of " + val.BankInfo.Bank,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes!"
  }).then((result: any) => {
    if (result.isConfirmed) {
      // ✅ Check permission *after* confirmation
      const noEditPermission = this.execPermissions?.some(
        (permit: any) =>
          permit.Master === 'Finance' &&
          permit.SubMasters.some((sub: any) => sub.SubMaster === 'Manage Bank' && sub.Edit === 0)
      );

      if (noEditPermission) {
        val.localStatus = originalStatus == 1; // Revert UI toggle
        this.getBank();
        this.toster.error('You do not have permission to update status.', 'Permission Denied');
        return;
      }

      let data = {
        Key: "",
        Field1: String(val.BankInfo.BankID),
        Field2: newStatus
      };

      this.shared.loader(true);
      this.api.bankStatus(data).subscribe({
        next: (res: any) => {
          this.shared.loader(false);
          if (res.Result === true) {
            this.toster.success(res.MSG_USER, "Success");
            this.getBank();
          } else {
            this.toster.error(res.MSG_USER, "Error");
            val.localStatus = originalStatus == 1; // Revert if failed
          }
        },
        error: (err: any) => {
          this.shared.loader(false);
          this.toster.error("Something went wrong", "Error");
          val.localStatus = originalStatus == 1; // Revert if error
        }
      });
    } else {
      val.localStatus = originalStatus == 1; // Reset if canceled
      this.getBank();
    }
  });
}








  delbankTran(val: any) {
    if (this.execPermissions?.some((permit: any) => permit.Master === 'Finance' && permit.SubMasters.some((sub: any) => sub.SubMaster === 'Manage Bank' && sub.Delete === 0))) {

      this.toster.error('You do not have permission to delete bank.', 'Permission Denied');
      return;
    } else {
      let data = {
        "Key": "",
        Field1: String(val.BankInfo.BankID),
      }

      Swal.fire({
        title: "Are you sure?",
        text: "You want to delete" + " " + val.BankInfo.Bank + " " + "holding an account number" + " " + val.BankInfo.Account_Number,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes!"
      }).then((result: any) => {
        if (result.isConfirmed) {
          this.shared.loader(true)
          this.api.deleteTranBank(data).subscribe({
            next: (res: any) => {
              this.shared.loader(false)
              if (res.Result == true) {
                this.toster.success("Bank deleted successfully", "Success")
                this.getBank()
              }
              // else {
              //   this.toster.error(res.MSG_USER, "Error")
              // }
            }, error: (err: any) => {
              this.shared.loader(false)
              this.toster.error("Something went wrong", "Error")
            }
          })

        }
        // else {
        //   this.getBank()
        // }
      })
    }
  }



}
