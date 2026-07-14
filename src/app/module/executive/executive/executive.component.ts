import { Component ,OnInit,ChangeDetectorRef} from '@angular/core';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { GlobalAPIService } from './../../../service/global-api.service';
// import { CookieService } from 'ngx-cookie-service';
// import { SharedDataService } from 'src/app/service/shared-data.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, FormsModule, Validators ,FormArray, ReactiveFormsModule} from '@angular/forms';
import { Router } from '@angular/router';
import { SharedService } from '../../../servies/shared/shared.service';
import { ApiService } from '../../../servies/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-executive',
  standalone: true,
  imports: [ CommonModule, NgbDropdownModule, ReactiveFormsModule, FormsModule],
  templateUrl: './executive.component.html',
  styleUrls: ['./executive.component.scss']
})
export class ExecutiveComponent implements OnInit{
  modref: any;
 execForm:any = FormGroup;
  masterData: any;
  subMasterData: any;
  getEditData:boolean=false;
  selectedSubMasterID: any;
  selectedMasterID: any;
  executiveData: any;
  masterList: any[] = []; 
  subMasterList: any[] = [];
  modalMasterList: any=[];
  modalSubMasterList: any=[];
  masterOptions: any;
  subMasterOptions: any=[];
  masterID: any;
  subMasterID: any;
  execID: any;
  execPermissions: any;
  
  constructor(private modalService: NgbModal,private router: Router,private cd :ChangeDetectorRef,private fb: FormBuilder,private shared:SharedService
    ,  private api:ApiService,public toastrService:ToastrService, private toster: ToastrService) {}


  ngOnInit(): void {
     this.execPermissions = JSON.parse(sessionStorage.getItem("execDetails") || '{}')
    // this.shared.selectedPermission.subscribe((data:any) => {
    //   // console.log("sidebarPermissions",data);
    //   this.execPermissions=data;
    // });
    this.getExecutive();
  
   
   
 
  }
  // goToEexecUpdate(val1: any, val2:any){
    
  //  console.log("Executive val1", val2);
  // //  console.log("val2", val2);
  // if(val2==1){
  //   if (this.execPermissions.some((permit:any) => permit.Master === 'Executives' && permit.SubMasters.some((sub:any) => sub.SubMaster === 'Executive' && sub.Edit === 0))) {
  //     // Display an error message or prevent the submission
  //     this.toastrService.error('You do not have permission to edit executive.', 'Permission Denied');
  //     return;
  //   }else{
  //     sessionStorage.setItem('execdata',JSON.stringify(val1))
  //  this.router.navigateByUrl('/exec-update/'+ val2)
  //   }
  
  // }
  // else if(val2==0){
  //   if (this.execPermissions.some((permit:any) => permit.Master === 'Executives' && permit.SubMasters.some((sub:any) => sub.SubMaster === 'Executive' && sub.Add === 0))) {
  //     // Display an error message or prevent the submission
  //     this.toastrService.error('You do not have permission to add executive.', 'Permission Denied');
  //     return;
  //   }
  //   this.router.navigateByUrl('/exec-update/'+ val2)
  // }

  // }
  goToEexecUpdate(val1: any, val2: any) {
    // console.log("val1", val1);
  
    if (val2 == 1) {
       if (this.execPermissions?.some((permit: any) => permit.Master === 'Executive' && permit.SubMasters.some((sub: any) => sub.SubMaster === 'Executive' && sub.Edit === 0))) {

      this.toster.error('You do not have permission to update executive.', 'Permission Denied');
      return;
    }
      // console.log('Checking Edit Permissions...');
      // const hasEditPermission = this.execPermissions.some((permit: any) =>
      //   permit.Master === 'Executives' &&
      //   permit.SubMasters.some((sub: any) =>
      //     sub.SubMaster === 'Executive' && sub.Edit === 0
      //   )
      // );
  
      // console.log('Edit Permission:', hasEditPermission);
  
      // if (hasEditPermission) {
      //   // Display an error message or prevent the submission
      //   this.toastrService.error('You do not have permission to edit executive.', 'Permission Denied');
      //   return;
      // }
    } else {
       if (this.execPermissions?.some((permit: any) => permit.Master === 'Executive' && permit.SubMasters.some((sub: any) => sub.SubMaster === 'Executive' && sub.Add === 0))) {

      this.toster.error('You do not have permission to add executive.', 'Permission Denied');
      return;
    }
      // console.log('Checking Add Permissions...');
      // const hasAddPermission = this.execPermissions.some((permit: any) =>
      //   permit.Master === 'Executives' &&
      //   permit.SubMasters.some((sub: any) =>
      //     sub.SubMaster === 'Executive' && sub.Add === 0
      //   )
      // );
  
      // console.log('Add Permission:', hasAddPermission);
  
      // if (hasAddPermission) {
      //   // Display an error message or prevent the submission
      //   this.toastrService.error('You do not have permission to add executive.', 'Permission Denied');
      //   return;
      // }
    }
  
    sessionStorage.setItem('execdata', JSON.stringify(val1));
    this.router.navigateByUrl('/exec-update/' + val2);
  }
  
  // <-- Form array for Executives (Start) --->
 
 
  
  

  




  getExecutive(){
    let obj = {
      "ExecID": 0
    }
    this.shared.loader(true);
    this.api.GET_EXECUTIVE(obj).subscribe((data:any)=>{
      if(data){
        this.executiveData=data;
        this.shared.loader(false);
        this.cd.detectChanges();
      }
      else {
        this.toastrService.error("No Records found")
      }
    }, ((error: any) => {
      this.shared.loader(false);
      // this.toastrService.error('Your Receipt is not uploaded.');
    }))
  }



}
