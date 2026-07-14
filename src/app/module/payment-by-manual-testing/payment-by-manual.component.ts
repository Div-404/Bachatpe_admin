import { Component, OnInit, TemplateRef ,ElementRef,ViewChild,ChangeDetectorRef} from '@angular/core';

import { NgbDropdownModule, NgbModal, } from '@ng-bootstrap/ng-bootstrap';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { Router,ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../servies/api.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators,FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../servies/shared/shared.service';
import {   IDropdownSettings } from 'ng-multiselect-dropdown';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { environment } from '../../../environments/environment';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgModule } from '@angular/core';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import jsPDF from 'jspdf';
// import 'jspdf-autotable';
import { ngxCsv } from 'ngx-csv/ngx-csv';
import { HttpClient } from '@angular/common/http';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
interface StatusLookup {
  [key: number]: string;
}
@Component({
  selector: 'app-payment-by-manual',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule,NgMultiSelectDropDownModule,NgSelectModule,CommonModule,NgbAccordionModule,NgbTooltipModule, NgbDropdownModule],
  templateUrl: './payment-by-manual.component.html',
  styleUrl: './payment-by-manual.component.scss'
})
export class PaymentByManualComponent {
  @ViewChild('chatBoxBody', { static: false }) chatBoxBody!: ElementRef;
  byManualData:any=[];
  byManualAdminForm:any=FormGroup;
  chatForm:any=FormGroup;
  activeClass:any=0;
  selectedFilter:any=0;
  searchValue:any='';
  oFilter:any=1;
  modref1:any;
  imgPreview:any;
  serverTimestamps: string[] = [];
  isLocalTimeSelected: boolean = true;
  timestamps: Date[] = [];
  private displayOptionSubscription!: Subscription;
  private timezoneSubscription!: Subscription;
  selectedTimezone: string = 'UTC';
  constructor(public apiService:ApiService,private cdr: ChangeDetectorRef,private modalService: NgbModal, private http:HttpClient, private route: ActivatedRoute,private router: Router,private formBuilder: FormBuilder,private sharedDataService:SharedService, public toastrService:ToastrService){}

ngOnInit(): void {
  // this.timezoneSubscription = this.timestampDisplayService.timezone$.subscribe(
  //   timezone  => {
  //     this.selectedTimezone = timezone;
  //     // this.adjustTimestamps();
  //   }
  // );
    this.byManualAdminForm = this.formBuilder.group({

      dtFrom: ['', Validators.required],
      dtTo: ['', Validators.required],

    });
    this.chatForm = this.formBuilder.group({
      message:['',Validators.required],
     
    })
    this.showDateRange(1);
}
ngOnDestroy(): void {
  // Unsubscribe from the timezone observable when the component is destroyed
  if (this.timezoneSubscription) {
    this.timezoneSubscription.unsubscribe();
  }
}
ngAfterViewChecked() {
  this.scrollToBottom();
  this.cdr.detectChanges()
}
ngAfterViewInit() {
  this.scrollToBottom();
}
getCurrentDate(): string {
  const today = new Date();
  return this.formatDate(today);
}

formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

showDateRange(event: any): void {
  const selectedOption = event;
  const today = new Date();
  let dtStart: string;
  let dtEnd: string = this.getCurrentDate(); // Get current date


  if (selectedOption === 1) { // Last 1 Week
    this.activeClass = 0;
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    dtStart = this.formatDate(oneWeekAgo);
  }
  else if (selectedOption === 2) { // Last 15 Days
    this.activeClass = 0;
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 15);
    dtStart = this.formatDate(oneWeekAgo);
  }
  else if (selectedOption === 3) { // Last 1 Month
    this.activeClass = 0;
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);
    dtStart = this.formatDate(oneMonthAgo);
  } else if (selectedOption === 4) { // Custom Date (You can handle this case separately)
    this.activeClass = 1;
    return;
  } else {
    // Handle default case
    return;
  }

  // Now you can set dtFrom and dtTo in your statementForm
  this.byManualAdminForm.patchValue({
    dtFrom: dtStart,
    dtTo: dtEnd
  });
  this.page=1
  this.GET_PG_MG_ADM_MANUAL_RECPT(1,this.noOfRecords);
  // Call your API with the updated date range

}
showStatement:any=0;
GET_PG_MG_ADM_MANUAL_RECPT(initialCount: any, maxCount: any){
  const dtFrom = this.byManualAdminForm.value.dtFrom + " 00:00:01";
    const dtTo = this.byManualAdminForm.value.dtTo + " 23:59:59";
  let obj={
     
      "dtFrom":dtFrom,
      "dtTo":dtTo,
      "Value":this.searchValue,
      "oFilter":this.selectedFilter,               //Website=1,Email=2,UserId=3
      "Initial":initialCount,
      "MaxCount":maxCount
  }
  this.sharedDataService.loader(true);
  this.apiService.GET_PG_MG_ADM_MANUAL_RECPT(obj).subscribe((data:any)=>{
    if(data.Count>0){
      this.count=data.Count
      this.byManualData=data.lstManualRecpt;
      this.sortLedgerData(() => {
        // Sorting completed, stop the loader
        this.sharedDataService.loader(false);
      });
      // this.pager = this.pagination.getPager(this.count, this.page, 10);
      this.cdr.detectChanges()
      this.showStatement=1;
      this.cdr.detectChanges()
      this.sharedDataService.loader(false);
    }
    else {
      this.byManualData=[];
      this.showStatement=0;
      this.sharedDataService.loader(false);
    }
  })
}
searching: boolean= true
clear(){
  this.searching = true;
  this.searchValue=''
  this.selectedFilter=0;
  this.oFilter=1;
  this.showDateRange(1);

}
resetFilters(){
  this.searching = true;
  this.searchValue='';
  this.selectedFilter=0;
  this.oFilter=1;
  this.showDateRange(1);

}
typeFilter(val:any): void{
  this.selectedFilter = val;
  this.page=1
  const dtFrom = this.byManualAdminForm.value.dtFrom + " 00:00:01";
  const dtTo = this.byManualAdminForm.value.dtTo + " 23:59:59";
let obj={
       "dtFrom":dtFrom,
    "dtTo":dtTo,
    "Value":this.searchValue,
    "oFilter":this.selectedFilter,               //Website=1,Email=2,UserId=3
    "Initial":1,
    "MaxCount":this.noOfRecords
}
this.sharedDataService.loader(true);
this.searching=false;
this.apiService.GET_PG_MG_ADM_MANUAL_RECPT(obj).subscribe((data:any)=>{
  if(data.Count>0){
    this.count=data.Count
    this.byManualData=data.lstManualRecpt;
    this.sortLedgerData(() => {
      // Sorting completed, stop the loader
      this.sharedDataService.loader(false);
    });
    // this.pager = this.pagination.getPager(this.count, this.page, 10);
    this.cdr.detectChanges()
    this.showStatement=1;
   
    this.sharedDataService.loader(false);
  }
  else {
    this.byManualData=[];
    this.showStatement=0;
    this.sharedDataService.loader(false);
  }
})
}

openLg2(content2: any) {
  this.modalService.open(content2, { size: 'lg modalone', centered: true, windowClass: 'flip-modal' } );
}

openLg3(content3: any) {
  this.modalService.open(content3, { size: 'md modalone', centered: true, windowClass: 'flip-modal' } );
}

  previewImg(uploadimagepreview:TemplateRef<any>,val:any){
    this.modref1=this.modalService.open(uploadimagepreview, { centered: true });
    this.imgPreview=val.ReceiptInfo.Receipt;
  }
  closeImagePreview(){
    this.modref1.close()
  }
  pagedItems:any=[];
  onChangePage(pageOfItems:any) {
   
    this.pagedItems = pageOfItems;
  
}

sortLedgerData(callback: () => void) {
  // Sort the ledgerData array in descending order based on Timestamp
  this.byManualData.sort((a: any, b: any) => {
      return new Date(b.dtCreated).getTime() - new Date(a.dtCreated).getTime();
  });
  
  // Invoke the callback function to indicate sorting completion
  callback();
}
getStatusText(status: number): string {
  switch (status) {
      case 1:
          return 'Pending';
      case 2:
          return 'Success';
      case 3:
          return 'Reject';
      default:
          return '';
  }
}
UPDATE_PG_MG_ADM_MANUAL_STATUS(ev: any, userId: any) {

  console.log("ev.target.value",ev.target.value)
  let obj = {

    "Key":"",
    "UserID":userId.ReceiptInfo.UserID,
    "Reference":userId.Reference,
    "Status":Number(ev.target.value )    

  }
  Swal.fire({
    title: 'Are you sure, you want to change Manual Receipt Status?',
    text: "",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, Update it!'
  }).then((result: any) => {
    if (result.isConfirmed) {
      this.apiService.UPDATE_PG_MG_ADM_MANUAL_STATUS(obj).subscribe((data: any) => {
        // console.log(data)
        if (data.Result == true) {
          this.oFilter=1
          this.showDateRange(1);
        }

      }, ((error: any) => {
        this.sharedDataService.loader(false);
        // this.toastrService.error('Your Receipt is not uploaded.');
      }))
      Swal.fire(
        'UPDATED!',
        'Manual Receipt status has been updated.',
        'success'
      )
    } else {
      this.oFilter=1
      this.showDateRange(1);
      this.sharedDataService.loader(false);
    }
  })
  // this.sharedDataService.loader(true)
}

delete(val:any){
  let obj={
    "Key":"",
    "UserID":val.ReceiptInfo.UserID,
    "Reference":val.Reference
  }
  Swal.fire({
    title: `Are you sure, you want to delete the receipt of <span style="color:#f67312;">${val.Name}</span> with UTR no. as <span style="color: #f67312;">${val.ReceiptInfo.UTR}</span>?`,
    text: "",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: ' <i class="fa fa-thumbs-up"></i> Yes, Delete it!',
  }).then((result:any) => {
    if (result.isConfirmed) {
      this.apiService.DEL_PG_MG_MANUAL_STATUS(obj).subscribe((data:any)=>{
        // console.log(data)
        if(data.Result==true){
          this.oFilter=1
       this.showDateRange(1)  
          this.cdr.detectChanges()
       
        }

      }, ((error: any) => {
        this.sharedDataService.loader(false);
        // this.toastrService.error('Your Receipt is not uploaded.');
      }))
      Swal.fire(
        'Deleted!',
        'Your Manual Receipt has been Deleted.',
        'success'
      )
    }
    else {
      this.oFilter=1
      this.showDateRange(1);
      this.cdr.detectChanges()
      this.sharedDataService.loader(false);
    }
  })
}


showChat:boolean=false;
chatID:any;
referenceID:any;
remarksID:any=0;
chatAdmin(val:any){
this.showChat=true;
this.cdr.detectChanges()
console.log("valvalvalchat",val)
this.referenceID=val.Reference;
this.cdr.detectChanges()
this.remarksID=val.ReceiptInfo.RemarkID
this.cdr.detectChanges()
this.GET_USER_REMARKS(val.ReceiptInfo.RemarkID);

}

closeChat(){
  this.showChat=false;
  this.cdr.detectChanges()
  this.chatForm.reset();
  this.chatHistory=[]
  this.cdr.detectChanges()
}


setMessage(message: string) {
  this.cdr.detectChanges()
  this.chatForm.patchValue({ message });
}
ADD_USER_REMARKS(){
  let obj = {
    "RemarkID":this.remarksID,
    "Message":this.chatForm.value.message,
    "Attachment":"",
    "CreatedBy":2          //      USER = 1,ADMIN = 2
}
this.apiService.ADD_USER_REMARKS(obj).subscribe((data:any)=>{
  if(data.Result==true){
    console.log("remarks", data)
    this.chatForm.reset()
    this.cdr.detectChanges()
    this.GET_USER_REMARKS(this.remarksID)
  }
  else {
    this.toastrService.error("Message could not be sent. Please try again.")
  }
})
}
isLoadingMessages: boolean = false;
chatHistory:any=[];
GET_USER_REMARKS(val:any){
  this.isLoadingMessages = true; // Set loading state to true
  let obj = {
    "Key":"",
    "RemarkID":val
}
this.apiService.GET_USER_REMARKS(obj).subscribe((data:any)=>{
  if(data.lstMesaage != ''){
    this.isLoadingMessages = false;
    this.chatHistory = data.lstMesaage
    this.cdr.detectChanges()
    this.scrollToBottom()
   
  }
  else {
    this.isLoadingMessages = false;
    this.chatHistory = [];
    this.cdr.detectChanges()
   
  }
   ((error: any) => {
    this.isLoadingMessages = false; // Set loading state to false if there's an error
    console.error('Error fetching user remarks:', error);
  });
})
}
scrollToBottom(): void {
  if (this.chatBoxBody) {
    try {
      this.chatBoxBody.nativeElement.scrollTop = this.chatBoxBody.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Scroll to bottom error:', err);
    }
  } else {
    console.warn('chatBoxBody is not yet defined');
  }
  this.cdr.detectChanges()
}



formatTimestamp(timestamp: string): string {
  // return this.timestampDisplayService.convertServerTimeToLocal(timestamp);
  return timestamp;
}

exportPdf() {
  const dtFrom = this.byManualAdminForm.value.dtFrom + " 00:00:01";
  const dtTo = this.byManualAdminForm.value.dtTo + " 23:59:59";
  let obj = {
    "dtFrom": dtFrom,
    "dtTo": dtTo,
    "Value": this.searchValue,
    "oFilter": this.selectedFilter,
    "Initial": 1,
    "MaxCount": this.count
  };

  this.sharedDataService.loader(true);

  this.apiService.GET_PG_MG_ADM_MANUAL_RECPT(obj).subscribe((data: any) => {
    if (data.Count > 0) {
      this.count = data.Count;
      this.byManualData = data.lstManualRecpt;

      this.sortLedgerData(() => {
        if (this.byManualData) {
          const headers = [
            'Timestamp',
            'Merchant',
            'Currency',
            'Amount',
            'Status',
            'Reference_No',
            'Remarks'
          ];

          const statusLookup: StatusLookup = {
            1: 'Pending',
            2: 'Success',
            3: 'Reject',
          };

          const pdfData = this.byManualData.map((data: any) => [
            this.formatTimestamp(data.dtCreated),
            data.Name,
            data.ReceiptInfo.Currency,
            data.ReceiptInfo.Amount,
            statusLookup[data.Status] || 'Unknown',
            data.Reference,
            data.ReceiptInfo.Remarks
          ]);

          const doc = new jsPDF();
          doc.text('Pay by Manual Transactions', 14, 22);
          (doc as any).autoTable({
            head: [headers],
            body: pdfData,
            startY: 26,
            styles: {
              fontSize: 10,
            },
          });

          doc.save('PaybyManual.pdf');
        } else {
          this.toastrService.error("No data to export.");
        }

        this.sharedDataService.loader(false);
        this.cdr.detectChanges();
      });

      // this.pager = this.pagination.getPager(this.count, this.page, 10);
      this.showStatement = 1;
      this.cdr.detectChanges();
    } else {
      this.byManualData = [];
      this.showStatement = 0;
      this.sharedDataService.loader(false);
    }
  }, (error: any) => {
    this.sharedDataService.loader(false);
    // Handle error appropriately
  });
}

exportCsv() {
  const dtFrom = this.byManualAdminForm.value.dtFrom + " 00:00:01";
  const dtTo = this.byManualAdminForm.value.dtTo + " 23:59:59";
  let obj = {
    "dtFrom": dtFrom,
    "dtTo": dtTo,
    "Value": this.searchValue,
    "oFilter": this.selectedFilter,
    "Initial": 1,
    "MaxCount": this.count
  };
  
  this.sharedDataService.loader(true);
  
  this.apiService.GET_PG_MG_ADM_MANUAL_RECPT(obj).subscribe((data: any) => {
    if (data.Count > 0) {
      this.count = data.Count;
      this.byManualData = data.lstManualRecpt;
      
      this.sortLedgerData(() => {
        if (this.byManualData) {
          const headers = [
            'Timestamp',
            'Merchant',
            'Currency',
            'Amount',
            'Status',
            'Reference_No',
            'Remarks'
          ];

          const statusLookup: StatusLookup = {
            1: 'Pending',
            2: 'Success',
            3: 'Reject',
          };
       
          const csvData = this.byManualData.map((data: any) => ({
            Timestamp: this.formatTimestamp(data.dtCreated),
            Merchant: data.Name,
            Currency: data.ReceiptInfo.Currency,
            Amount: data.ReceiptInfo.Amount,
            Status: statusLookup[data.Status] || 'Unknown',
            Reference_No: data.Reference,
            Remarks: data.ReceiptInfo.Remarks
          }));
      
          const options = {
            fieldSeparator: ',',
            quoteStrings: '"',
            decimalseparator: '.',
            showLabels: true,
            showTitle: false,
            title: 'Pay by Manual',
            useBom: true,
            noDownload: false,
            headers,
          };
      
          new ngxCsv(csvData, `Pay by Manual Transactions`, options);
        } else {
          this.toastrService.error("No data to export.");
        }

        this.sharedDataService.loader(false);
        this.cdr.detectChanges();
      });
      
      // this.pager = this.pagination.getPager(this.count, this.page, 10);
      this.showStatement = 1;
      this.cdr.detectChanges();
    } else {
      this.byManualData = [];
      this.showStatement = 0;
      this.sharedDataService.loader(false);
    }
  }, (error: any) => {
    this.sharedDataService.loader(false);
    // Handle error appropriately
  });
}

pendingCount:any;
pager:any;
page:any=1
noOfRecords:any=10

onPageSizeChange() {
  this.page = 1;
  this.setPage(1);
}

setPage(page: number) {
  this.page = page;
this.cdr.detectChanges()
  if ((page >= 1) && (page <= this.pager.totalPages)) {
    // this.pager = this.pagination.getPager(this.count, this.page, this.noOfRecords);
    this.cdr.detectChanges()
    console.log("pagerpagerpagerpagerpager", this.pager);
    this.pagedItems = this.byManualData.slice(((this.noOfRecords * page) - this.noOfRecords), this.noOfRecords * page);  // Fixed slicing logic
    this.cdr.detectChanges()
    this.pendingCount = 0;
    this.GET_PG_MG_ADM_MANUAL_RECPT(((this.noOfRecords * page) - this.noOfRecords + 1), this.noOfRecords * page);
    this.cdr.detectChanges()
  }
}
count:any
}
