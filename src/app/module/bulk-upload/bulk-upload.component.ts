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
import jsPDF from 'jspdf';
// import 'jspdf-autotable';
import { ngxCsv } from 'ngx-csv/ngx-csv';
import { HttpClient } from '@angular/common/http';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import * as XLSX from 'xlsx';
interface FileRow {
  Timestamp: string; // Adjust based on your actual data type
  Code: string;
  Type: string;
  Phone: string;
  Amount: string;
  Status: string;
  Comment?: string; // Optional if not all rows have this
  AdmRemarks?: string; // Optional if not all rows have this
}
@Component({
  selector: 'app-bulk-upload',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, NgSelectModule, NgbDropdownModule, NgbTooltipModule],
  templateUrl: './bulk-upload.component.html',
  styleUrl: './bulk-upload.component.scss'
})
export class BulkUploadComponent implements OnInit {
  @ViewChild('fileInput') fileInput: ElementRef | undefined;
  uploadProgress: number | undefined;
  fileData: any;
  displayedColumns: string[] = [];
  fileName: any;
  currentTime: any
  selectedSource: any;
  showSampleCrypto: boolean = false;
  showSampleBank: boolean = false;
  showSampleCash: boolean = false;
  showSampleWallet: boolean = false;
  currency: any;
  currLogo: any;
  selectedAccountNumber: any;
  accountNumbers: any = []
  accNumber: any;
  source: any;
  execPermissions: any
  selectedAccBalance: any = 0.00;
  constructor(private api: ApiService, private toster: ToastrService, private shared: SharedService, private formBuilder: FormBuilder,
    private datePipe: DatePipe, private modalService: NgbModal, private cdr: ChangeDetectorRef
  ) {
    this.shared.setSidebrActiveClass('bulk-upload');

    // Optional: You can subscribe to activeClass$ if needed
    this.shared.activeClass$.subscribe((activeClass: string) => {
      console.log('Current active class in ServicesComponent:', activeClass);
    });

  }

  ngOnInit(): void {
 this.execPermissions = JSON.parse(sessionStorage.getItem("execDetails") || '{}')
  }




  downloadSampleFileBank() {
    const headers = ['Code', 'Type', 'Phone', 'Amount', 'Comment'];
    const data: any = [];
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'sample_file_Bank.xlsx');
  }


  headerMismatchMsg: boolean = false;
  // onFileChange(event: any, val: any) {
  //   this.fileData=[]
  //   const target: DataTransfer = <DataTransfer>(event.target);
  //     if (target.files.length !== 1) throw new Error('Cannot use multiple files');
  //     const file: File = target.files[0];
  //     const reader: FileReader = new FileReader();

  //     // Get the filename
  //     this.fileName = file.name;

  //     // Calculate total file size
  //     const totalSize = file.size;
  //   reader.onloadstart = () => {
  //       // Start of file read
  //       this.uploadProgress = 0; // Reset progress
  //   };

  //   reader.onloadend = () => {
  //       // End of file read
  //       this.uploadProgress = 100; // Set progress to 100%
  //   };

  //   reader.onprogress = (e: ProgressEvent<FileReader>) => {
  //       if (e.lengthComputable) {
  //           // Calculate progress percentage based on loaded bytes and total size
  //           this.uploadProgress = Math.round((e.loaded / totalSize) * 100);
  //       }
  //   };

  //   reader.onload = (e: any) => {
  //       const bstr: string = e.target.result;
  //       const workbook: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
  //       const firstSheetName: string = workbook.SheetNames[0];
  //       const worksheet: XLSX.WorkSheet = workbook.Sheets[firstSheetName];
  //       const fileData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  //       // Extract headers from the file
  //       const uploadedHeaders = fileData[0] as string[];

  //       // Define expected headers based on val parameter
  //       let expectedHeaders: string[] = [];
  //       if (val == 'bank') {
  //           expectedHeaders = ['Code', 'Type', 'Phone', 'Amount', 'Status'];
  //       } 


  //       // Check for header mismatches
  //       const headerMismatches = expectedHeaders.filter(header => !uploadedHeaders.includes(header));

  //       if (headerMismatches.length > 0) {
  //           // Display error message for header mismatches
  //           console.error('Header mismatch detected:', headerMismatches);
  //           // Optionally, you can show an error message to the user
  //           // alert(`Header mismatch detected. Missing headers: ${headerMismatches.join(', ')}`);
  //           this.toster.error('Your Uploaded excel sheet Headers doesnot match. Please check again.')
  //           // Reset progress bar
  //           this.fileData = null;
  //           this.uploadProgress = undefined;
  //           this.source='';
  //           this.showSampleBank=false;

  //           this.uploadProgress = 0;
  //           this.headerMismatchMsg=true;
  //           return;
  //       }

  //       // Get current date and time
  //       this.currentTime = new Date().toLocaleString();

  //       // Add current time to each row in fileData array
  //       fileData.forEach((row: any) => {
  //           row['Timestamp'] = this.currentTime;
  //       });

  //       // Proceed with displaying the table if no header mismatches are found
  //       this.fileData = fileData.slice(1); // Exclude the header row
  //       this.displayedColumns = uploadedHeaders;
  //       console.log("filedata", this.fileData);

  //   };

  //   reader.onerror = (e) => {
  //       // Handle error occurred during file reading
  //       console.error('Error occurred while reading the file:', e);
  //       // Reset progress bar
  //       this.uploadProgress = 0;
  //   };

  //   // Start reading the file only if no header mismatches are detected
  //   reader.readAsBinaryString(file);
  // }
  onFileChange(event: any, val: string): void {
    console.log("function is working");
    
     if (this.execPermissions?.some((permit: any) => permit.Master === 'Finance' && permit.SubMasters.some((sub: any) => sub.SubMaster === 'Bulk Balance' && sub.Add === 0))) {

      this.toster.error('You do not have permission upload bulk payment.', 'Permission Denied');
      return;
    } else {
    this.fileData = []; // Reset file data

    const target = event.target as DataTransfer; // Use proper casting for DataTransfer type
    if (target.files.length !== 1) throw new Error('Cannot use multiple files');

    const file: File = target.files[0];
    const reader: FileReader = new FileReader();

    // Set the filename
    this.fileName = file.name;

    // Calculate total file size
    const totalSize = file.size;

    reader.onloadstart = () => {
      this.uploadProgress = 0; // Reset progress
    };

    reader.onloadend = () => {
      this.uploadProgress = 100; // Set progress to 100%
    };

    reader.onprogress = (e: ProgressEvent<FileReader>) => {
      if (e.lengthComputable) {
        this.uploadProgress = Math.round((e.loaded / totalSize) * 100);
      }
    };

    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const bstr: string = e.target?.result as string; // Safely access result
        const workbook: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
        const firstSheetName: string = workbook.SheetNames[0];
        const worksheet: XLSX.WorkSheet = workbook.Sheets[firstSheetName];
        const fileData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][]; // Use appropriate typing

        if (!fileData || fileData.length === 0) {
          throw new Error('The file is empty or cannot be parsed');
        }

        const uploadedHeaders = fileData[0] as string[];

        // Define expected headers based on the `val` parameter
        let expectedHeaders: string[] = [];
        if (val === 'bank') {
          expectedHeaders = ['Code', 'Type', 'Phone', 'Amount', 'Comment'];
        }

        // Check for header mismatches
        const isHeadersMatching = expectedHeaders.every(
          (header, index) => uploadedHeaders[index] === header
        );

        if (!isHeadersMatching || uploadedHeaders.length !== expectedHeaders.length) {
          console.error('Header mismatch detected:', uploadedHeaders);
          this.toster.error('Your Uploaded Excel sheet Headers do not match. Please check again.');
          this.fileData = []; // Reset fileData if headers do not match
          this.uploadProgress = undefined;
          this.headerMismatchMsg = true;
          return;
        }

        // Proceed with data processing if headers match
        const dataRows = fileData.slice(1); // Exclude headers

        if (dataRows.length === 0) {
          this.fileData = []; // Ensure fileData is set to an empty array
          this.headerMismatchMsg = false; // Reset mismatch message
        } else {
          // Map the rows to objects and validate row length
          this.fileData = dataRows.map((row: unknown[]) => {
            console.log('Processing row:', row); // Log the row being processed

            // Generate current timestamp for each row
            const currentTimestamp = new Date().toISOString(); // Generates the current timestamp in ISO format

            if (row.length < 8) {
              console.warn('Row data is incomplete:', row); // Log incomplete rows for debugging
              // Optionally fill in default values or skip this row
              return {
                Timestamp: currentTimestamp, // Use current timestamp
                Code: row[0] as string || '',
                Type: row[1] as string || '',
                Phone: row[2] as string || '',
                Amount: row[3] as string || '',
                Comment: row[4] as string || '',
                AdmRemarks: row[5] as string || ''
              };
            }

            return {
              Timestamp: currentTimestamp, // Assign the current timestamp
              Code: row[0] as string,
              Type: row[1] as string,
              Phone: row[2] as string,
              Amount: row[3] as string,
              Comment: row[4] as string,
              AdmRemarks: row[5] as string,
            };
          }).filter(data => data.Timestamp); // Filter out rows with missing Timestamp if necessary

          this.headerMismatchMsg = false; // Reset mismatch message if data is valid
        }

        // Set the displayed columns to match the uploaded headers
        this.displayedColumns = uploadedHeaders;
        console.log("fileData", this.fileData);
      } catch (error) {
        console.error('Error processing file:', error);
        this.toster.error('An error occurred while processing the file.');
        this.fileData = []; // Ensure fileData is reset
        this.uploadProgress = 0;
      }
    };

    reader.onerror = (e) => {
      console.error('Error occurred while reading the file:', e);
      this.uploadProgress = 0;
      this.toster.error('Error occurred while reading the file.');
    };

    reader.readAsBinaryString(file);
  }
  }




  selectedRows: number[] = [];


  processFile() {
    if (this.fileData?.length) {
      const payload = {
        Count: this.fileData.length,
        CreatedBy: Number(sessionStorage.getItem('agentID')), // Replace with dynamic user data if needed
        FileName: this.fileName, // Use the uploaded file name
        lstUpload: this.fileData.map((row: any) => { // Change to 'any' to avoid type issues
          return {
            // Timestamp: row.Timestamp, // Use the timestamp generated during upload
            Code: row.Code,
            Type: row.Type,
            Phone: row.Phone,
            Amount: row.Amount,
            Comment: row.Comment,
            AdmRemarks: ''
          } as FileRow; // Cast to the defined interface
        })
      };
      this.shared.loader(true)
      this.api.ADD_DIGI_BULK_UPLOAD(payload).subscribe(
        (response: any) => {
          console.log('API call success', response);
          if (response.Result > 0) {
            this.cancelUpload()
            this.shared.loader(false)
            this.toster.success('File Uploaded Successfully.')
          }
          else {
            this.shared.loader(false)
            this.cancelUpload()
            this.toster.error('Something went wrong.Please try again.')
          }
          // Handle successful API call, show success message or navigate
        },
        (error) => {
          this.shared.loader(false)
          this.cancelUpload()
          console.error('API call error', error);
          // Handle error, show error message to the user
        }
      );
    }
  }




  // Method to remove selected rows
  removeRow(index: number) {
    // Show SweetAlert confirmation dialog
    Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to remove this transaction.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, remove it!'
    }).then((result) => {
      if (result.isConfirmed) {
        // If user confirms, remove the row
        this.fileData.splice(index, 1);

        // Update the selectedRows array by removing the selected row
        this.selectedRows = this.selectedRows.map((i) => i > index ? i - 1 : i).filter((i) => i !== index);

        // Show success message
        Swal.fire('Deleted!', 'Transaction has been removed.', 'success');
      }
    });
  }

  cancelUpload() {
    // Reset the fileData and uploadProgress variables to cancel the upload
    this.fileData = null;
    this.uploadProgress = undefined;
    this.source = '';
    this.showSampleBank = false;
    this.headerMismatchMsg = false;

    // Clear the file input's value to allow re-selection of the same file
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }






}
