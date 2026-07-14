
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';

import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule, DatePipe, formatDate } from '@angular/common';
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
import { Subscription } from 'rxjs';

// import 'jspdf-autotable';
import { ngxCsv } from 'ngx-csv/ngx-csv';
import { HttpClient } from '@angular/common/http';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { CommonmoduleModule } from '../../common/commonmodule.module';
@Component({
  selector: 'app-bulk-history',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule,NgSelectModule,NgbDropdownModule,NgbTooltipModule, CommonmoduleModule],
  templateUrl: './bulk-history.component.html',
  styleUrl: './bulk-history.component.scss'
})
export class BulkHistoryComponent implements OnInit{
  bulkUploadData:any=[]
  showStatement:any=0
  showStatement1:any=0
  modRef:any
  bulkFileID:any
  selectedFileData:any=[]
  bulkFileName:any
  bulkFileTime:any
  constructor(private api: ApiService, private toster: ToastrService, private shared: SharedService, private formBuilder:FormBuilder,
    private datePipe: DatePipe,private modalService: NgbModal, private cdr:ChangeDetectorRef
  ) { 

    this.shared.setSidebrActiveClass('bulk-history');

    // Optional: You can subscribe to activeClass$ if needed
    this.shared.activeClass$.subscribe((activeClass: string) => {
      console.log('Current active class in ServicesComponent:', activeClass);
    });
  }

ngOnInit(): void {
    this.GET_DIGI_BULK_FILES()
}
  

  GET_DIGI_BULK_FILES(){
  this.shared.loader(true)
  this.api.GET_DIGI_BULK_FILES().subscribe((data:any)=>{
if(data){
  this.bulkUploadData=data
  this.showStatement=1
  this.shared.loader(false)
}
else{
  this.bulkUploadData=[]
  this.showStatement=0
  this.shared.loader(false)
}
  },
  (error) => {
    this.shared.loader(false)
  
  }
)
  }
  openLg(content: any,val:any) {
		this.modRef=this.modalService.open(content, { size: 'lg modalone', centered: true, windowClass: 'flip-modal' } );
    this.bulkFileID=val.BulkID
    this.bulkFileName=val.Bulk
    this.bulkFileTime=val.oTm?.Tm_Str
    this.GET_DIGI_BULK_UPLOAD(this.bulkFileID)
	}
  closeModal(){
    this.modRef.close()
    this.bulkFileID=''
    this.bulkFileName=''
    this.bulkFileTime=''
    this.selectedFileData=[]
  }

  GET_DIGI_BULK_UPLOAD(val:any){
 let obj = {
  "Key":"",
    "Field1":val   //Bulk ID
 }
 this.shared.loader(true)
 this.api.GET_DIGI_BULK_UPLOAD(obj).subscribe((data:any)=>{
  if(data.lstUpload){
    this.selectedFileData=data.lstUpload
    this.showStatement1=1
    this.shared.loader(false)
    this.cdr.detectChanges()
  }
  else{
    this.selectedFileData=[]
    this.showStatement1=0
    this.shared.loader(false)

  }
 },
 (error) => {
  this.selectedFileData=[]
  this.showStatement1=0
   this.shared.loader(false)
 
 }
)
  }
  downloadExcel(val: any): void {
    // Hit the API first with the given value to fetch the data
    const obj = {
      "Key": "",
      "Field1": val // Bulk ID
    };
  
    this.shared.loader(true);
    this.api.GET_DIGI_BULK_UPLOAD(obj).subscribe(
      (data: any) => {
        if (data.lstUpload) {
          this.selectedFileData = data.lstUpload;
        
          this.shared.loader(false);
          this.cdr.detectChanges();
  
          // Ensure we format the data properly for the Excel sheet
          const formattedData = this.selectedFileData.map((data: any) => ({
            'Timestamp': data.oUpload?.CreatedOn,
            'User Code': data.oUpload?.Code,
            'Account': data.oUpload?.Type,
            'Phone': data.oUpload?.Phone,
            'Amount': data.oUpload?.Amount,
            'Comment': data.oUpload?.Comment,
            // 'Admin Remarks': data.oUpload?.AdmRemarks,
            'Status': this.getStatusText(data?.Status)
          }));
  
          const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(formattedData);
          const workbook: XLSX.WorkBook = { Sheets: { 'Bulk Data': worksheet }, SheetNames: ['Bulk Data'] };
          XLSX.writeFile(workbook, 'Bulk_Balance_Data.xlsx');
        } else {
          this.selectedFileData = [];
       
          this.shared.loader(false);
        }
      },
      (error) => {
        this.selectedFileData = [];
       
        this.shared.loader(false);
      }
    );
  }
  
  downloadPDF(val: any): void {
    // Hit the API first with the given value to fetch the data
    const obj = {
      "Key": "",
      "Field1": val // Bulk ID
    };
  
    this.shared.loader(true);
    this.api.GET_DIGI_BULK_UPLOAD(obj).subscribe(
      (data: any) => {
        if (data.lstUpload) {
          this.selectedFileData = data.lstUpload;
        
          this.shared.loader(false);
          this.cdr.detectChanges();
  
          const doc = new jsPDF();
          doc.text('Bulk Balance Data', 14, 10);
  
          // Define the columns and the data for the PDF table
          const tableColumn = ['Timestamp', 'User Code', 'Account', 'Phone', 'Amount', 'Comment', 'Status'];
          const tableRows: any[] = [];
  
          // Loop through the data to create rows for the table
          this.selectedFileData.forEach((data: any) => {
            const rowData = [
              data.oUpload?.CreatedOn,
              data.oUpload?.Code,
              data.oUpload?.Type,
              data.oUpload?.Phone,
              data.oUpload?.Amount,
              data.oUpload?.Comment,
              // data.oUpload?.AdmRemarks,
              this.getStatusText(data?.Status)
            ];
            tableRows.push(rowData);
          });
  
          // Add the table to the PDF
          (doc as any).autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 20,
          });
  
          // Save the PDF
          doc.save('Bulk_Balance_Data.pdf');
        } else {
          this.selectedFileData = [];
         
          this.shared.loader(false);
        }
      },
      (error) => {
        this.selectedFileData = [];
      
        this.shared.loader(false);
      }
    );
  }
  
  getStatusText(statusCode: number): string {
    switch (statusCode) {
      case 1:
        return 'PENDING';
      case 3:
        return 'REJECTED';
      case 4:
        return 'IN_PROCESS';
      case 5:
        return 'SUCCESS';
      default:
        return 'UNKNOWN';
    }
  }

  
  // ============================================================ pagination ==================================================

  items: any = [];
  pageOfItems?: Array<any>;
  sortProperty: string = 'id';
  onChangePage(pageOfItems: Array<any>) {

    this.pageOfItems = pageOfItems;
  }

}
