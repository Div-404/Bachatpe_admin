import { Component, OnInit, TemplateRef } from '@angular/core';

import { NgbDropdownModule, NgbModal, } from '@ng-bootstrap/ng-bootstrap';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../servies/api.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../servies/shared/shared.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { environment } from '../../../environments/environment';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgModule } from '@angular/core';

@Component({
  selector: 'app-com-package',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NgMultiSelectDropDownModule, NgSelectModule, CommonModule, NgbDropdownModule],
  templateUrl: './com-package.component.html',
  styleUrl: './com-package.component.scss'
})
export class ComPackageComponent {
  // projectTitle=environment.title;
  // projectTitlecapital=environment.titlecapital;

  checked: any = 1;
  commonForm: any = FormGroup;
  verifiedForm: any = FormGroup;
  nonVerifiedForm: any = FormGroup;
  packageName: any;
  getCurr: any;
  Fee_Dept: any;
  Fee_Recv: any;
  Fee_Send: any;
  Fee_WDraw: any;
  RecvDaily: any;
  RecvSingle: any;
  RecvOverAll: any;
  sendDaily: any;
  sendOverAll: any;
  sendSingle: any;
  depositDaily: any;
  depositOverAll: any;
  depositSingle: any;
  withDaily: any;
  withOverAll: any;
  withSingle: any;
  DailyTurnover: any;
  OverallTurnover: any;
  wholePkgData: any = [];
  openPkgForm: boolean = false;
  returnValue: boolean = false;
  send_Fee_Mode: any = 1;
  rec_Fee_Mode: any = 1;
  dep_Fee_Mode: any = 1;
  with_Fee_Mode: any = 1;
  getObj: any = []
  exchangeData: any;
  lstPermit: any;
  execPermissions: any;
  constructor(public apiService: ApiService, private router: Router, private formBuilder: FormBuilder, private sharedDataService: SharedService, public toastrService: ToastrService) {
  }

  ngOnInit(): void {
    // this.lstPermit=sessionStorage.getItem("execPerm");
    // this.execPermissions=JSON.parse(this.lstPermit);
    // this.sharedDataService.selectedPermission.subscribe((data:any) => {
    //   // console.log("sidebarPermissions",data);
    //   this.execPermissions=data;
    // });

    this.execPermissions = JSON.parse(sessionStorage.getItem("execDetails") || '{}')
    console.log("here is permission in user list>>>>>>>", this.execPermissions);

    this.commonForm = this.formBuilder.group({
      currency: ["INR"],
      verPkgName: ['', [Validators.required]],
      withdrawFee: ['', [Validators.required]],
      // withType:['',Validators.required],
      depositFee: ['', [Validators.required]],
      // depType:['',Validators.required],
      recieveFee: ['', [Validators.required]],
      // recType:['',Validators.required],
      sendFee: ['', [Validators.required]],
      multipleAccountEnable: [false]
      // sendType:['',Validators.required],
      // packageID:['',[]]
    })
    this.verifiedForm = this.formBuilder.group({

      sendVerDaily: ['', [Validators.required]],
      sendVerSingle: ['', [Validators.required]],
      sendVerOverall: ['', [Validators.required]],
      recVerDaily: ['', [Validators.required]],
      recVerSingle: ['', [Validators.required]],
      recVerOverall: ['', [Validators.required]],
      depVerDaily: ['', [Validators.required]],
      depVerSingle: ['', [Validators.required]],
      depVerOverall: ['', [Validators.required]],
      withdVerDaily: ['', [Validators.required]],
      withdVerSingle: ['', [Validators.required]],
      withdVerOverall: ['', [Validators.required]],
      overallTurnover: ['', [Validators.required]],
      dailyTurnover: ['', [Validators.required]]

    });
    this.nonVerifiedForm = this.formBuilder.group({
      sendNonVerDaily: ['', [Validators.required]],
      sendNonVerSingle: ['', [Validators.required]],
      sendNonVerOverall: ['', [Validators.required]],
      recNonVerDaily: ['', [Validators.required]],
      recNonVerOverall: ['', [Validators.required]],
      recNonVerSingle: ['', [Validators.required]],
      depVerNonDaily: ['', [Validators.required]],
      depVerNonSingle: ['', [Validators.required]],
      depVerNonOverall: ['', [Validators.required]],
      withdVerNonDaily: ['', [Validators.required]],
      withdVerNonSingle: ['', [Validators.required]],
      withdVerNonOverall: ['', [Validators.required]],
      overallNonTurnover: ['', [Validators.required]],
      dailyNonTurnover: ['', [Validators.required]]

    });

    this.getPackage();

  }


  openForm() {
    if (this.execPermissions.some((permit:any) => permit.Master === 'Finance' && permit.SubMasters.some((sub:any) => sub.SubMaster === 'Wallet Packages' && sub.Add === 0))) {

      this.toastrService.error('You do not have permission to add Packages.', 'Permission Denied');
      return;
    }else{
    this.editEnable = false
    this.openPkgForm = !this.openPkgForm;
    this.commonForm.reset()
    this.verifiedForm.reset()
    this.nonVerifiedForm.reset()
    this.accountTypeID = ''
    this.commonForm.patchValue({
      currency: "INR",
      multipleAccountEnable: 0
    })
    // console.log("openForm",this.openPkgForm )
    }
  }

  handleKeyPress(event: any) {
    // Get the current input value
    const input = event.target as HTMLInputElement;
    const inputValue = input.value;
    const key = event.key;

    // Define a regex pattern to match the whole input
    const regex = /^[0-9]+(\.[0-9]{0,2})?$/;

    // Test if the input matches the pattern
    if (!regex.test(inputValue + key)) {
      event.preventDefault(); // Prevent the keypress if it doesn't match the regex
    }
  }

  handleFeeInput(event: any) {
    // Get the current input value
    const input = event.target as HTMLInputElement;
    const inputValue = input.value;
    const key = event.key;

    // Define a regex pattern to match the whole input
    const regex = /^[0-9]+(\.[0-9]{0,1})?$/;

    // Test if the input matches the pattern
    if (!regex.test(inputValue + key)) {
      event.preventDefault(); // Prevent the keypress if it doesn't match the regex
    }
  }

  select() {
    this.checked = 2;
    // console.log("this.checked",  this.checked);
  }

  
  onToggleChange() {
    const isChecked = this.commonForm.get('multipleAccountEnable').value;
    // Set 1 if checked, 0 if unchecked
    this.commonForm.patchValue({
      multipleAccountEnable: isChecked ? 1 : 0
    });
  }
  submit() {
    let formCommon = this.commonForm.value;
    let formVerify = this.verifiedForm.value;
    let formnonVerify = this.nonVerifiedForm.value;
    console.log("Common Form:", formCommon);
    console.log("Verified Form:", formVerify);
    console.log("Non-Verified Form:", formnonVerify);
    let obj = {
      "AccountTypeId": Number(this.accountTypeID),
      "AccountType": formCommon.verPkgName.trim(),
      "Key": "",
      "Currency": "INR",
      "Multiple": formCommon.multipleAccountEnable,
      "Lmt_UserNonSend_Overall": formnonVerify.sendNonVerOverall,
      "Lmt_UserNonSend_Single": formnonVerify.sendNonVerSingle,
      "Lmt_UserNonSend_Daily": formnonVerify.sendNonVerDaily,
      "Lmt_UserSend_Overall": formVerify.sendVerOverall,
      "Lmt_UserSend_Single": formVerify.sendVerSingle,
      "Lmt_UserSend_Daily": formVerify.sendVerDaily,
      "Lmt_UserNonRecv_Overall": formnonVerify.recNonVerOverall,
      "Lmt_UserNonRecv_Single": formnonVerify.recNonVerSingle,
      "Lmt_UserNonRecv_Daily": formnonVerify.recNonVerDaily,
      "Lmt_UserRecv_Overall": formVerify.recVerOverall,
      "Lmt_UserRecv_Single": formVerify.recVerSingle,
      "Lmt_UserRecv_Daily": formVerify.recVerDaily,
      "Lmt_UserNonWDraw_Overall": formnonVerify.withdVerNonOverall,
      "Lmt_UserNonWDraw_Single": formnonVerify.withdVerNonSingle,
      "Lmt_UserNonWDraw_Daily": formnonVerify.withdVerNonDaily,
      "Lmt_UserWDraw_Overall": formVerify.withdVerOverall,
      "Lmt_UserWDraw_Single": formVerify.withdVerSingle,
      "Lmt_UserWDraw_Daily": formVerify.withdVerDaily,
      "Lmt_UserNonUpload_Overall": formnonVerify.depVerNonOverall,
      "Lmt_UserNonUpload_Single": formnonVerify.depVerNonSingle,
      "Lmt_UserNonUpload_Daily": formnonVerify.depVerNonDaily,
      "Lmt_UserUpload_Overall": formVerify.depVerOverall,
      "Lmt_UserUpload_Single": formVerify.depVerSingle,
      "Lmt_UserUpload_Daily": formVerify.depVerDaily,
      "Lmt_UserNonTurnOver_Overall": formnonVerify.overallNonTurnover,
      "Lmt_UserNonTurnOver_Daily": formnonVerify.dailyNonTurnover,
      "Lmt_UserTurnOver_Overall": formVerify.overallTurnover,
      "Lmt_UserTurnOver_Daily": formVerify.dailyTurnover,
      "Default": 0,
      "CreatedOn": "",
      // "Fee_Dept":formCommon.depositFee,
      // "Fee_WDraw":formCommon.withdrawFee,
      // "Fee_Send":formCommon.sendFee,
      // "Fee_Recv":formCommon.recieveFee,
      "Info_Dept": {
        "Fee": formCommon.depositFee,
        "Type": this.dep_Fee_Mode
      },
      "Info_WDraw": {
        "Fee": formCommon.withdrawFee,
        "Type": this.with_Fee_Mode
      },
      "Info_Send": {
        "Fee": formCommon.sendFee,
        "Type": this.send_Fee_Mode
      },
      "Info_Recv": {
        "Fee": formCommon.recieveFee,
        "Type": this.rec_Fee_Mode
      }

    }
    this.sharedDataService.loader(true);
    this.checked = 1;
    this.apiService.ADD_ADM_ACCOUNT_TYPE(obj).subscribe((data: any) => {
      // console.log(data);
      if (data.Result == true) {
        this.toastrService.success("Your Package has been Successfully added.")
        this.getPackage();
        this.openPkgForm = false;
        this.commonForm.reset();
        this.verifiedForm.reset();
        this.nonVerifiedForm.reset();

        this.sharedDataService.loader(false);
      }
      else {
        this.toastrService.error("Something went Wrong. Please try again.")

        this.sharedDataService.loader(false);
      }
    }, ((error: any) => {
      this.sharedDataService.loader(false);
      // this.toastrService.error('Your Receipt is not uploaded.');
    }))
  }
  accountTypeID: any = 0;

  getPackage() {
    let obj = {
      "Key": "",
      "Currency": ""
    }
    this.sharedDataService.loader(true);
    this.apiService.GET_ADM_ACCOUNT_TYPE(obj).subscribe((data: any) => {
      // console.log(data);

      if (data.length > 0) {
        this.getObj = data[0]
        this.rec_Fee_Mode = this.getObj.Info_Recv.Type;
        this.send_Fee_Mode = this.getObj.Info_Send.Type;
        this.dep_Fee_Mode = this.getObj.Info_Dept.Type;
        this.with_Fee_Mode = this.getObj.Info_WDraw.Type;
        this.wholePkgData = data;
        this.sharedDataService.loader(false);
      }
      else {
        this.toastrService.error("No Packages found.")
        this.sharedDataService.loader(false);
      }
    }, ((error: any) => {
      this.sharedDataService.loader(false);
      // this.toastrService.error('Your Receipt is not uploaded.');
    }))
  }
  editEnable: boolean = false;
  edit(data: any) {
    if (this.execPermissions?.some((permit: any) => permit.Master === 'Finance' && permit.SubMasters.some((sub: any) => sub.SubMaster === 'Wallet Packages' && sub.Edit === 0))) {

      this.toastrService.error('You do not have permission to edit Packages.', 'Permission Denied');
      return;
    } else {
      // console.log("data", data)
      this.getObj = data
      this.openPkgForm = true;
      this.editEnable = true;
      this.accountTypeID = data.AccountTypeId
      this.rec_Fee_Mode = data.Info_Recv.Type;
      this.send_Fee_Mode = data.Info_Send.Type;
      this.dep_Fee_Mode = data.Info_Dept.Type;
      this.with_Fee_Mode = data.Info_WDraw.Type;
      // console.log("data.Currency",data.Currency)
      this.commonForm.patchValue({
        currency: data.Currency,
        verPkgName: data.AccountType,
        withdrawFee: data.Info_WDraw.Fee,
        depositFee: data.Info_Dept.Fee,
        recieveFee: data.Info_Recv.Fee,
        sendFee: data.Info_Send.Fee,
        multipleAccountEnable: data.Multiple
      })

      this.verifiedForm.patchValue({
        sendVerDaily: data.Lmt_UserSend_Daily,
        sendVerSingle: data.Lmt_UserSend_Single,
        sendVerOverall: data.Lmt_UserSend_Overall,
        recVerDaily: data.Lmt_UserRecv_Daily,
        recVerSingle: data.Lmt_UserRecv_Single,
        recVerOverall: data.Lmt_UserRecv_Overall,
        depVerDaily: data.Lmt_UserUpload_Daily,
        depVerSingle: data.Lmt_UserUpload_Single,
        depVerOverall: data.Lmt_UserUpload_Overall,
        withdVerDaily: data.Lmt_UserWDraw_Daily,
        withdVerSingle: data.Lmt_UserWDraw_Single,
        withdVerOverall: data.Lmt_UserWDraw_Overall,
        overallTurnover: Number(data.Lmt_UserTurnOver_Overall),
        dailyTurnover: Number(data.Lmt_UserTurnOver_Daily)
      });

      this.nonVerifiedForm.patchValue({
        sendNonVerDaily: data.Lmt_UserNonSend_Daily,
        sendNonVerSingle: data.Lmt_UserNonSend_Single,
        sendNonVerOverall: data.Lmt_UserNonSend_Overall,
        recNonVerDaily: data.Lmt_UserNonRecv_Daily,
        recNonVerOverall: data.Lmt_UserNonRecv_Overall,
        recNonVerSingle: data.Lmt_UserNonRecv_Single,
        depVerNonDaily: data.Lmt_UserNonUpload_Daily,
        depVerNonSingle: data.Lmt_UserNonUpload_Single,
        depVerNonOverall: data.Lmt_UserNonUpload_Overall,
        withdVerNonDaily: data.Lmt_UserNonWDraw_Daily,
        withdVerNonSingle: data.Lmt_UserNonWDraw_Single,
        withdVerNonOverall: data.Lmt_UserNonWDraw_Overall,
        overallNonTurnover: data.Lmt_UserNonTurnOver_Overall,
        dailyNonTurnover: data.Lmt_UserNonTurnOver_Daily
      })
      this.checked = 1;
      // window.onload;
      window.scrollTo(0, 0);
    }
  }
  delete(data: any) {
    if (this.execPermissions?.some((permit: any) => permit.Master === 'Finance' && permit.SubMasters.some((sub: any) => sub.SubMaster === 'Wallet Packages' && sub.Delete === 0))) {

      this.toastrService.error('You do not have permission to delete Packages.', 'Permission Denied');
      return;
    } else {
      // console.log(data)
      let obj = {
        "Key": "",
        "AccountTypeId": data
      }
      Swal.fire({
        title: 'Are you sure, you want to delete this package?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
          this.apiService.DEL_ADM_ACCOUNT_TYPE(obj).subscribe((res: any) => {
            if (res.Result == true) {
              this.getPackage()
            }
          }, ((error: any) => {
            this.sharedDataService.loader(false);
            // this.toastrService.error('Your Receipt is not uploaded.');
          }))
          Swal.fire(
            'Deleted!',
            'Your package has been deleted.',
            'success'
          )
        }
      })
    }
  }

  toggleUpdate(val: any) {

    if (val == 1) {
      this.returnValue = false;

    }
    else {
      this.returnValue = true;
    }
    return this.returnValue;
  }
  ToggleChangeSend(val: any) {
    // console.log("val.target.value",val.target.checked)
    if (val.target.checked == true) {
      this.send_Fee_Mode = 2
    }
    else {
      this.send_Fee_Mode = 1
    }

  }
  ToggleChangeRec(val: any) {
    // console.log("val.target.value",val.target.checked)
    if (val.target.checked == true) {
      this.rec_Fee_Mode = 2
    }
    else {
      this.rec_Fee_Mode = 1
    }

  }
  ToggleChangeDep(val: any) {
    // console.log("val.target.value",val.target.checked)
    if (val.target.checked == true) {
      this.dep_Fee_Mode = 2
    }
    else {
      this.dep_Fee_Mode = 1
    }
  }
  ToggleChangeWith(val: any) {
    // console.log("val.target.value",val.target.checked)
    if (val.target.checked == true) {
      this.with_Fee_Mode = 2
    }
    else {
      this.with_Fee_Mode = 1
    }
    // this.with_Fee_Mode = this.with_Fee_Mode === 2 ? 1 : 2;

  }

  aplhaSpaceOnly(event: KeyboardEvent) {
    const allowedRegex = /^[a-zA-Z\s]*$/; // Regex for alphabets and spaces

    const key = String.fromCharCode(event.charCode);
    if (!allowedRegex.test(key)) {
      event.preventDefault(); // Prevent the default action if the character doesn't match
    }
  }

}
