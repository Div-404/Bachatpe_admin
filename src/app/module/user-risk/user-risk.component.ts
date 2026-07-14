import { Component, OnInit, TemplateRef } from '@angular/core';

import { NgbDropdownModule, NgbModal, } from '@ng-bootstrap/ng-bootstrap';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
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
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-user-risk',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NgMultiSelectDropDownModule, NgSelectModule, CommonModule, NgbAccordionModule],
  templateUrl: './user-risk.component.html',
  styleUrl: './user-risk.component.scss'
})
export class UserRiskComponent {

  checked: any = 'verify';
  // valueTog: any = false;
  statusLabel: any = true;
  searchEmail: any = '';
  buy: any = 0;
  sendForm: any = FormGroup;
  recieveForm: any = FormGroup;
  depositForm: any = FormGroup;
  withdrawForm: any = FormGroup;
  commonForm: any = FormGroup;
  currencyForms: any = [];
  disabledClass: boolean = false;
  reqId: any;
  wholePkgData: any;
  profileID: any;
  check: boolean = true
  getUserRisk: any = [];
  statusLabelCard1: boolean = true;
  statusLabelCard2: boolean = true;
  statusLabelCard3: boolean = true;
  statusLabelCard4: boolean = true;
  random_number: any;
  send_Fee_Mode: any;
  rec_Fee_Mode: any;
  dep_Fee_Mode: any;
  with_Fee_Mode: any;
  sendStatus: any = 1;
  recStatus: any = 1;
  depStatus: any = 1;
  withStatus: any = 1;
  lstPermit: any;
  execPermissions: any;
  selectedCurrency: any;
  accountID: any;
  First: any
  Last: any
  Code: any
  Email: any


  constructor(public apiService: ApiService, private route: ActivatedRoute, private router: Router, private formBuilder: FormBuilder, private sharedDataService: SharedService, public toastrService: ToastrService) {
    this.route.params.subscribe((params: any) => {
      this.profileID = params['id'];
      console.log("profileID", this.profileID);
    });

    this.First = sessionStorage.getItem("First")
    this.Last = sessionStorage.getItem("Last")
    this.Code = sessionStorage.getItem("Code")
    this.Email = sessionStorage.getItem("Email")
  }


  getObj: any = { Info_Recv: { Type: 1 }, Info_Send: { Type: 1 }, Info_Dept: { Type: 1 }, Info_WDraw: { Type: 1 } }
  ngOnInit(): void {
    // this.lstPermit=sessionStorage.getItem("execPerm");
    // this.execPermissions=JSON.parse(this.lstPermit);
    // this.sharedDataService.selectedPermission.subscribe((data:any) => {
    //   // console.log("sidebarPermissions",data);
    //   this.execPermissions=data;
    // });

    this.execPermissions = JSON.parse(sessionStorage.getItem("execDetails") || '{}')
    console.log("here is permission in user list>>>>>>>", this.execPermissions);

    this.sendForm = this.formBuilder.group({
      send_Daily: ['', [Validators.required]],
      send_PerTrans: ['', [Validators.required]],
      send_Overall: ['', [Validators.required]],
      send_Current_daily: ['', [Validators.required]],
      // send_Current_perTrans:['',[Validators.required]],
      send_Current_Overall: ['', [Validators.required]],
      send_Status: ['']

    });
    this.recieveForm = this.formBuilder.group({
      rec_Daily: ['', [Validators.required]],
      rec_PerTrans: ['', [Validators.required]],
      rec_Overall: ['', [Validators.required]],
      rec_Current_daily: ['', [Validators.required]],
      // rec_Current_perTrans:['',[Validators.required]],
      rec_Current_Overall: ['', [Validators.required]],
      rec_Status: ['']
    });
    this.depositForm = this.formBuilder.group({
      dep_Daily: ['', [Validators.required]],
      dep_PerTrans: ['', [Validators.required]],
      dep_Overall: ['', [Validators.required]],
      dep_Current_daily: ['', [Validators.required]],
      // dep_Current_perTrans:['',[Validators.required]],
      dep_Current_Overall: ['', [Validators.required]],
      dep_Status: ['']
    });
    this.withdrawForm = this.formBuilder.group({
      with_Daily: ['', [Validators.required]],
      with_PerTrans: ['', [Validators.required]],
      with_Overall: ['', [Validators.required]],
      with_Current_daily: ['', [Validators.required]],
      // with_Current_perTrans:['',[Validators.required]],
      with_Current_Overall: ['', [Validators.required]],
      with_Status: ['']
    });
    this.commonForm = this.formBuilder.group({
      send_Fee: ['', [Validators.required]],
      sendFeeMode: ['', Validators.required],
      rec_Fee: ['', [Validators.required]],
      recFeeMode: ['', Validators.required],
      dep_Fee: ['', [Validators.required]],
      depFeeMode: ['', Validators.required],
      with_Fee: ['', [Validators.required]],
      withFeeMode: ['', Validators.required]

    });
    //  this.GET_USER_INFO(this.profileID)
    //  this.getPackage('USD');
    this.GET_USER_RISK(this.profileID);

  }

  select(val: any) {
    this.checked = val.target.value;
    // console.log("this.checked", this.checked);
  }

  // toggle(val: any){
  //   this.statusLabel = val.target.checked;
  //   this.buy = this.statusLabel ? 1 : 0;

  // }

  toggle(cardNumber: number) {
    if (cardNumber === 1) {
      this.statusLabelCard1 = !this.statusLabelCard1;
    } else if (cardNumber === 2) {
      this.statusLabelCard2 = !this.statusLabelCard2;
    } else if (cardNumber === 3) {
      this.statusLabelCard3 = !this.statusLabelCard3;
    } else if (cardNumber === 4) {
      this.statusLabelCard4 = !this.statusLabelCard4;
    }
  }
  sendStatusToggle(val: any, cardNumber: number) {
    //  console.log("val", val.target.checked)
    if (val.target.checked == true && cardNumber === 1) {
      this.sendStatus = 1;
      this.disabledClass = val.target.checked;

    }
    else {
      this.sendStatus = 0;
      this.disabledClass = false;
    }
  }
  recStatusToggle(val: any, cardNumber: number) {
    // console.log("val", val.target.checked)
    if (val.target.checked == true && cardNumber === 2) {
      this.recStatus = 1;
      this.disabledClass = val.target.checked;

    }
    else {
      this.recStatus = 0;
      this.disabledClass = false;
    }
  }
  depStatusToggle(val: any, cardNumber: number) {
    // console.log("val", val.target.checked)
    if (val.target.checked == true && cardNumber === 3) {
      this.depStatus = 1;
      this.disabledClass = val.target.checked;

    }
    else {
      this.depStatus = 0;
      this.disabledClass = false;
    }
  }
  withStatusToggle(val: any, cardNumber: number) {
    // console.log("val", val.target.checked)
    if (val.target.checked == true && cardNumber === 4) {
      this.withStatus = 1;
      this.disabledClass = val.target.checked;

    }
    else {
      this.withStatus = 0;
      this.disabledClass = false;
    }
  }
  returnValue1: boolean = false;
  statusToggleUpdate(val: any) {

    if (val == 1) {
      this.returnValue1 = true;
      this.disabledClass = true;
    }
    else {
      this.returnValue1 = false;
      this.disabledClass = false;
    }
    return this.returnValue1;
  }

  // getPackage(val:any){
  //   let obj={
  //     "Key":"",
  //     "Currency":val
  //   }
  //   this.sharedDataService.loader(true);
  //   this.apiService.GET_ADM_ACCOUNT_TYPE(obj).subscribe((data:any)=>{
  //     console.log(data);

  //     if(data){
  //       this.wholePkgData=data;
  //      this.commonForm.patchValue({
  //       send_Fee: data[0].Fee_Send,
  //       rec_Fee:data[0].Fee_Recv,
  //       dep_Fee:data[0].Fee_Dept,
  //       with_Fee:data[0].Fee_WDraw ,
  //       });
  //       this.sendForm.patchValue({
  //         send_Current_daily:data[0].Lmt_UserSend_Daily,
  //         send_Current_perTrans: data[0].Lmt_UserRecv_Single,
  //         send_Current_Overall: data[0].Lmt_UserRecv_Overall,
  //         send_Daily: data[0].Lmt_UserSend_Daily,
  //         send_PerTrans: data[0].Lmt_UserRecv_Single,
  //         send_Overall:data[0].Lmt_UserRecv_Overall

  //       });
  //       this.recieveForm.patchValue({
  //         rec_Current_daily:data[0].Lmt_UserRecv_Daily,
  //         rec_Current_perTrans: data[0].Lmt_UserRecv_Single,
  //         rec_Current_Overall: data[0].Lmt_UserRecv_Overall,
  //         rec_Daily: data[0].Lmt_UserRecv_Daily,
  //         rec_PerTrans: data[0].Lmt_UserRecv_Single,
  //         rec_Overall:data[0].Lmt_UserRecv_Overall
  //       });
  //       this.depositForm.patchValue({
  //         dep_Current_daily: data[0].Lmt_UserUpload_Daily,
  //         dep_Current_perTrans:data[0].Lmt_UserUpload_Single,
  //         dep_Current_Overall:data[0].Lmt_UserUpload_Overall,
  //         dep_Daily: data[0].Lmt_UserUpload_Daily,
  //         dep_PerTrans:data[0].Lmt_UserUpload_Single,
  //         dep_Overall:data[0].Lmt_UserUpload_Overall
  //       });
  //       this.withdrawForm.patchValue({
  //         with_Current_daily:data[0].Lmt_UserWDraw_Daily,
  //         with_Current_perTrans:data[0].Lmt_UserWDraw_Single,
  //         with_Current_Overall:data[0].Lmt_UserWDraw_Overall,
  //         with_Daily: data[0].Lmt_UserWDraw_Daily,
  //         with_PerTrans:data[0].Lmt_UserWDraw_Single,
  //         with_Overall:data[0].Lmt_UserWDraw_Overall
  //       })
  //       this.sharedDataService.loader(false);
  //     }
  //     else{
  //       this.toastrService.error("No Packages found.","Sorry!!")
  //       this.sharedDataService.loader(false);
  //     }
  //   })
  // }
  handleKeyPress(event: KeyboardEvent) {
    // console.log("event", event)
    // Check if the pressed key is a number (0-9), a decimal point (.), or a backspace key (code 8)
    if (
      (event.keyCode >= 48 && event.keyCode <= 57) || // 0-9

      event.keyCode === 8 || // Backspace
      event.key === '.' // Decimal point
    ) {
      // Allow the keypress event to continue
    } else {
      // Prevent any other keypress events
      event.preventDefault();
    }
  }
  handleInput(event: any) {
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

  returnValue: boolean = false;


  toggleUpdate(val: any) {
    // console.log("status toggle update",val)
    if (val == 1) {
      this.returnValue = true;

    }
    else {
      this.returnValue = false;
    }
    return this.returnValue;
  }



  ToggleChangeSend(val: any) {
    // console.log("val.target.value",val.target.checked)
    if (val.target.checked == true) {
      this.send_Fee_Mode = 1
    }
    else {
      this.send_Fee_Mode = 2
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

  ADD_EDIT_USER_RISK(index: any) {
    const currencyForm = this.currencyForms[index];
    const selectedCurrency = this.getUserRisk[index].Curr;
    const accountID = this.getUserRisk[index].AccountID;
    const balance = this.getUserRisk[index].Balance;
    const pending = this.getUserRisk[index].Pending

    // if (this.execPermissions.some((permit:any) => permit.Master === 'User Risks' && permit.SubMasters.some((sub:any) => sub.SubMaster === 'Userrisk' && sub.Add === 0))) {

    //   this.toastrService.error('You do not have permission to Add Risk Module.', 'Permission Denied');
    //   return;
    // }else
    if (this.execPermissions.some((permit: any) => permit.Master === 'User Risks' && permit.SubMasters.some((sub: any) => sub.SubMaster === 'Userrisk' && sub.Edit === 0))) {

      this.toastrService.error('You do not have permission to Edit Risk Module.', 'Permission Denied');
      return;
    } else {
      const formValues = currencyForm.value;
      // console.log("formValues",formValues);

      let obj = {
        "Profile": this.profileID,
        "Key": "",

        "AccountID": accountID,
        "Curr": selectedCurrency,
        "Risk_Status": 2,
        "Balance": balance,
        "Pending": pending,

        "Info_Dept": {
          "Fee": Number(formValues.dep_Fee),
          "Type": (formValues.depFeeMode) ? 1 : 2  // AUTO = 1, MANUAL = 2
        },
        "Info_WDraw": {
          "Fee": Number(formValues.with_Fee),
          "Type": (formValues.withFeeMode) ? 1 : 2 // AUTO = 1, MANUAL = 2
        },
        "Info_Send": {
          "Fee": Number(formValues.send_Fee),
          "Type": (formValues.sendFeeMode) ? 1 : 2 // AUTO = 1, MANUAL = 2
        },
        "Info_Recv": {
          "Fee": Number(formValues.rec_Fee),
          "Type": (formValues.recFeeMode) ? 1 : 2 // AUTO = 1, MANUAL = 2
        },
        "oRecv": {
          "Lmt_Stat": {
            "Profile": 0,
            "oTransType": 2,                //send=1,rec=2,dep=3,with=4
            "Key": "",
            "Account": "",
            "Lmt_PerTrans": Number(formValues.rec_PerTrans),
            "Lmt_Daily": Number(formValues.rec_Daily),
            "Lmt_Overall": Number(formValues.rec_Overall),
            "Status": (formValues.rec_Status) ? 1 : 0

          },
          "Curr_Daily": Number(formValues.rec_Current_daily),
          "Curr_Overall": Number(formValues.rec_Current_Overall)
        },
        "oSend": {
          "Lmt_Stat": {
            "Profile": 0,
            "oTransType": 1,                //send=1,rec=2,dep=3,with=4
            "Key": "",
            "Account": "",
            "Lmt_PerTrans": Number(formValues.send_PerTrans),
            "Lmt_Daily": Number(formValues.send_Daily),
            "Lmt_Overall": Number(formValues.send_Overall),
            "Status": (formValues.send_Status) ? 1 : 0

          },
          "Curr_Daily": Number(formValues.send_Current_daily),
          "Curr_Overall": Number(formValues.send_Current_Overall)

        },
        "oDeposit":
        {
          "Lmt_Stat": {
            "Profile": 0,
            "oTransType": 3,                //send=1,rec=2,dep=3,with=4
            "Key": "",
            "Account": "",
            "Lmt_PerTrans": Number(formValues.dep_PerTrans),
            "Lmt_Daily": Number(formValues.dep_Daily),
            "Lmt_Overall": Number(formValues.dep_Overall),
            "Status": (formValues.dep_Status) ? 1 : 0

          },
          "Curr_Daily": Number(formValues.dep_Current_daily),
          "Curr_Overall": Number(formValues.dep_Current_Overall)
        },
        "oWithdraw":
        {
          "Lmt_Stat": {
            "Profile": 0,
            "oTransType": 4,                //send=1,rec=2,dep=3,with=4
            "Key": "",
            "Account": "",
            "Lmt_PerTrans": Number(formValues.with_PerTrans),
            "Lmt_Daily": Number(formValues.with_Daily),
            "Lmt_Overall": Number(formValues.with_Overall),
            "Status": (formValues.with_Status) ? 1 : 0

          },
          "Curr_Daily": Number(formValues.with_Current_daily),
          "Curr_Overall": Number(formValues.with_Current_Overall)
        },
        "oTimestamp": ""
      }



      this.sharedDataService.loader(true)
      this.apiService.ADD_EDIT_USER_RISK(obj).subscribe((data: any) => {
        // console.log(data);
        if (data.Result == true) {
          this.GET_USER_RISK(this.profileID)
          this.toastrService.success('User Risk updated Successfully.');
          this.sharedDataService.loader(false)
        }
        else {
          this.toastrService.error('Something went wrong.');
          this.sharedDataService.loader(false)
        }
      })
    }
  }
  fStatus: boolean = false;
  showStatement: boolean = false
  GET_USER_RISK(val: any) {
    this.getUserRisk = []
    this.currencyForms.splice(0, this.currencyForms.length);
    let obj = {
      "Profile": val,
      "Currency": ""
    }

    this.sharedDataService.loader(true);
    this.apiService.GET_USER_RISK(obj).subscribe((data: any) => {
      // console.log("getUser Risk", data);
      if (data == '') {
        this.showStatement = true
      }
      if (data.length) {
        this.showStatement = false
        this.getUserRisk = data;
        this.getUserRisk.forEach((currencyData: any) => {


          const form = this.formBuilder.group({
            send_Daily: [currencyData.oSend.Lmt_Stat.Lmt_Daily],
            send_PerTrans: [currencyData.oSend.Lmt_Stat.Lmt_PerTrans],
            send_Overall: [currencyData.oSend.Lmt_Stat.Lmt_Overall],
            send_Current_daily: [currencyData.oSend.Curr_Daily],
            send_Current_Overall: [currencyData.oSend.Curr_Overall],

            send_Status: this.getBoolean(currencyData.oSend.Lmt_Stat.Status),

            rec_Daily: [currencyData.oRecv.Lmt_Stat.Lmt_Daily],
            rec_PerTrans: [currencyData.oRecv.Lmt_Stat.Lmt_PerTrans],
            rec_Overall: [currencyData.oRecv.Lmt_Stat.Lmt_Overall],
            rec_Current_daily: [currencyData.oRecv.Curr_Daily],
            rec_Current_Overall: [currencyData.oRecv.Curr_Overall],
            rec_Status: this.getBoolean(currencyData.oRecv.Lmt_Stat.Status),

            dep_Daily: [currencyData.oDeposit.Lmt_Stat.Lmt_Daily],
            dep_PerTrans: [currencyData.oDeposit.Lmt_Stat.Lmt_PerTrans],
            dep_Overall: [currencyData.oDeposit.Lmt_Stat.Lmt_Overall],
            dep_Current_daily: [currencyData.oDeposit.Curr_Daily],
            dep_Current_Overall: [currencyData.oDeposit.Curr_Overall],
            dep_Status: this.getBoolean(currencyData.oDeposit.Lmt_Stat.Status),

            with_Daily: [currencyData.oWithdraw.Lmt_Stat.Lmt_Daily],
            with_PerTrans: [currencyData.oWithdraw.Lmt_Stat.Lmt_PerTrans],
            with_Overall: [currencyData.oWithdraw.Lmt_Stat.Lmt_Overall],
            with_Current_daily: [currencyData.oWithdraw.Curr_Daily],
            with_Current_Overall: [currencyData.oWithdraw.Curr_Overall],
            with_Status: this.getBoolean(currencyData.oWithdraw.Lmt_Stat.Status),

            send_Fee: [currencyData.Info_Send.Fee],
            sendFeeMode: this.getBooleanFee(currencyData.Info_Send.Type),

            rec_Fee: [currencyData.Info_Recv.Fee],
            recFeeMode: this.getBooleanFee(currencyData.Info_Recv.Type),
            dep_Fee: [currencyData.Info_Dept.Fee],
            depFeeMode: this.getBooleanFee(currencyData.Info_Dept.Type),
            with_Fee: [currencyData.Info_WDraw.Fee],
            withFeeMode: this.getBooleanFee(currencyData.Info_WDraw.Type)
          });

          this.currencyForms.push(form);


        });



        this.getObj = data[0]



        this.commonForm.patchValue({
          send_Fee: data[0].Info_Send.Fee,
          // sendFeeMode:data[0].Info_Send.Type,
          rec_Fee: data[0].Info_Recv.Fee,
          // recFeeMode:data[0].Info_Recv.Type,
          dep_Fee: data[0].Info_Dept.Fee,
          // depFeeMode:data[0].Info_Dept.Type,
          with_Fee: data[0].Info_WDraw.Fee,
          // withFeeMode:data[0].Info_WDraw.Type


        });



        this.withdrawForm.patchValue({

          with_Daily: data[0].oWithdraw.Lmt_Stat.Lmt_Daily,
          with_PerTrans: data[0].oWithdraw.Lmt_Stat.Lmt_PerTrans,
          with_Overall: data[0].oWithdraw.Lmt_Stat.Lmt_Overall,
          with_Current_daily: data[0].oWithdraw.Curr_Daily,
          with_Current_Overall: data[0].oWithdraw.Curr_Overall
        })
        this.sharedDataService.loader(false);

      }

      else {
        this.sharedDataService.loader(false);
      }
    }, ((error: any) => {
      this.sharedDataService.loader(false);
      // this.toastrService.error('Your Receipt is not uploaded.');
    }))
  }
  getBoolean(val: any) {
    if (val == 0) {
      return false
    }
    else {
      return true
    }

  }
  getBooleanFee(val: any) {
    if (val == 2) {
      return false
    }
    else {
      return true
    }

  }

  ngOnDestroy() {
    sessionStorage.removeItem("First")
    sessionStorage.removeItem("Last")
    sessionStorage.removeItem("Code")
    sessionStorage.removeItem("Email")
  }

  createdDate: any
  first: any
  last: any
  //   GET_USER_INFO(val: any){
  //     let obj={
  //       Profile: val
  //     }
  //     this.sharedDataService.loader(true);
  //    this.apiService.GET_USER_INFO(obj).subscribe((data:any)=>{
  //     console.log("here is user info data",data);
  //     if(data){
  //       this.sharedDataService.loader(false);
  //     this.createdDate= data?.oTimestamp?.sCreadedOn_Str;
  //     this.first=data?.First;
  //     this.last=data?.Last
  //     this.email= data?.oContact.Email


  //     }
  //     else{
  //       this.sharedDataService.loader(false);

  //     }
  //    }, ((error: any) => {
  //     this.sharedDataService.loader(false);
  //     // this.toastrService.error('Your Receipt is not uploaded.');
  //   }));
  //   }

  // searchUser:any;
  // searchParamLoginID:any;
  // firstName:any;
  // lastName:any;
  // email:any;
  // search(initialCount: any, maxCount: any) {
  //   if (this.searchEmail != '') {
  //     let obj= {
  //       "Key":"",
  //       "Status":1,
  //       "Value":this.searchEmail,
  //       "oFilter":2,            //NAME = 1,EMAIL = 2,USERID = 3
  //       "dtFrom": this.createdDate,
  //       "dtTo":new Date(),
  //       "Initial":initialCount,
  //       "MaxCount":maxCount

  //   }
  //   this.sharedDataService.loader(true);

  //   this.apiService.GET_ADM_USERS(obj).subscribe({next: (res: any) =>{
  //     if(res.lstUserInfo!=''){
  //     this.searchUser= res.lstUserInfo[0];
  //    this.searchParamLoginID= this.searchUser.LoginID
  //    this.router.navigateByUrl('/risk-module/'+this.searchParamLoginID)
  //    this.sharedDataService.loader(false);
  //    this.searchEmail='';
  //    this.GET_USER_INFO(this.searchParamLoginID)
  //    this.GET_USER_RISK(this.searchParamLoginID);

  //     }
  //     else if(res.lstUserInfo==''){
  //       this.sharedDataService.loader(false);
  //       this.toastrService.error("User Not found.");
  //     }

  //   }, error: (err: any) =>{
  //     console.log(err);
  //     this.sharedDataService.loader(false);
  //   }})
  // } else {
  //   // this.toster.error("please select correct field")
  //   this.sharedDataService.loader(false);
  //   // this.toastrService.error("Please Select Type for search!");
  // }
  // } 


}
