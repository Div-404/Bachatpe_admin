import { Component,OnInit,ChangeDetectorRef, HostListener } from '@angular/core';
// import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { CookieService } from 'ngx-cookie-service';
// import { SharedDataService } from 'src/app/service/shared-data.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import {
 
  UntypedFormBuilder,
  UntypedFormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../servies/api.service';
import { SharedService } from '../../../servies/shared/shared.service';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-manager',
  standalone: true,
  imports: [ CommonModule,NgbDropdownModule,ReactiveFormsModule],
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.scss']
})
export class ManagerComponent implements OnInit{
  moduleForm:any=UntypedFormGroup;
  modRef: any;
  moduleData: any=[];
  moduleData1:any=[]
  selectedMasterID: any;
  lstPermit: any;
  execPermissions: any;
  pattern = /^[a-zA-Z\s\[\]\\/?]*$/;
 
  constructor(private modalService: NgbModal,private cd:ChangeDetectorRef,private fb: UntypedFormBuilder,
    private shared: SharedService, private router:Router, private api: ApiService,public toastrService:ToastrService,
  private toster: ToastrService) {
    this.getModule();
  
  }
  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    // Check if the pressed key matches the allowed pattern
    if (!event.key.match(this.pattern)) {
      event.preventDefault();
    }
  }

  ngOnInit(): void {
     this.execPermissions = JSON.parse(sessionStorage.getItem("execDetails") || '{}')
    // this.lstPermit=sessionStorage.getItem("execPerm");
    // this.execPermissions=JSON.parse(this.lstPermit);
    // this.shared.selectedPermission.subscribe((data:any) => {
    //   // console.log("sidebarPermissions",data);
    //   this.execPermissions=data;
    // });
    
    this.moduleForm = this.fb.group({
      name:['', [Validators.required]],  
      status:['', Validators.required],

    })

  }
  getEditData:boolean=false

  openVerticallyCentered(content: any,val:any) {
   
   
  //  if(val==0){
  //   if (this.execPermissions.some((permit:any) => permit.Master === 'Executives' && permit.SubMasters.some((sub:any) => sub.SubMaster === 'Tab' && sub.Add === 0))) {
  
  //     this.toastrService.error('You do not have permission to add Tab.', 'Permission Denied');
  //     return;
  //   }else {
  //   this.moduleForm.reset();
  //   this.modRef=this.modalService.open(content, { centered: true });
  //   // console.log("openmodal",val)
  //   // console.log("add",val);
  //   this.getEditData=false;
  //   this.moduleForm.reset();
  
  //   }
  //  }else if(this.execPermissions.some((permit:any) => permit.Master === 'Executives' && permit.SubMasters.some((sub:any) => sub.SubMaster === 'Tab' && sub.Edit === 0))){
  //   this.toastrService.error('You do not have permission to edit Tab.', 'Permission Denied');
 
  //   return;
  // }
  //  else {
  if (val == 0) {
      if (this.execPermissions?.some((permit: any) => permit.Master === 'Executive' && permit.SubMasters.some((sub: any) => sub.SubMaster === 'Tab' && sub.Add === 0))) {

      this.toster.error('You do not have permission to add tab.', 'Permission Denied');
      return;
    } 
    this.moduleForm.reset()
this.getEditData= false
this.modRef=this.modalService.open(content, { size: 'md modalone', centered: true, windowClass: 'flip-modal' });
  } else {
      if (this.execPermissions?.some((permit: any) => permit.Master === 'Executive' && permit.SubMasters.some((sub: any) => sub.SubMaster === 'Tab' && sub.Edit === 0))) {

      this.toster.error('You do not have permission update tab.', 'Permission Denied');
      return;
    } 
    console.log("editModuleForm",val);
    this.modRef=this.modalService.open(content, { size: 'md modalone', centered: true, windowClass: 'flip-modal' });
    this.getEditData = true;

   
    this.moduleForm.patchValue({
      name:val.Master,
      status:val.oEnable 
    
      })
      this.selectedMasterID = val.MasterID;
    }
// }
}
  closeModal(){
    this.modRef.close();
  }

  addModule(){
    let obj = {
      "Key":"",
     
      "Master":this.moduleForm.value.name.trim(),
      "oEnable":this.moduleForm.value.status 
    }
    this.shared.loader(true);
    this.api.ADD_EXECH_MASTER(obj).subscribe((data:any)=>{
      // console.log("addmodule",data)
      if(data.Result==true){
        this.getModule();
        this.toastrService.success("Tab added Successfully.")
        this.shared.loader(false);
        this.closeModal();
        this.moduleForm.reset();
      }
      else if(data.ERR_DEV==null){ 
        this.toastrService.error(data.MSG_USER,"Please try again.");
        this.shared.loader(false);
        this.closeModal();
      }
    }, ((error: any) => {
      this.shared.loader(false);
      // this.toastrService.error('Your Receipt is not uploaded.');
    }))
  }
updateStatus(){
  
 let obj= {
  "Key":"",
  "MasterID":this.selectedMasterID,
  "oEnable":this.moduleForm.value.status
 }
this.shared.loader(true);
this.api.UPDATE_EXECH_MASTER(obj).subscribe((data:any)=>{
if (data.Result==true){
  this.getModule();
  this.shared.loader(false);
  this.closeModal();
  this.moduleForm.reset();
  this.toastrService.success("Your Tab status has been updated.")
}
else{
  this.shared.loader(false);
  this.toastrService.error("Something went Wrong.Please try again.");
  this.closeModal();
}
}, ((error: any) => {
  this.shared.loader(false);
  // this.toastrService.error('Your Receipt is not uploaded.');
}))

  }
  getModule(){
    
    let obj={
      "Key":"",
      "MasterID": 0
    }
    this.api.GET_EXECH_MASTER(obj).subscribe((res:any)=>{
     if(res){
      this.moduleData= res;
      // console.log("this.moduledata",this.moduleData);
      this.cd.detectChanges();
     }
     else {
      this.toastrService.error("No Data found")
     }
    }, ((error: any) => {
      this.shared.loader(false);
      // this.toastrService.error('Your Receipt is not uploaded.');
    }))
  }

  deleteModule(val:any,val1:any){
    if (this.execPermissions.some((permit:any) => permit.Master === 'Executive' && permit.SubMasters.some((sub:any) => sub.SubMaster === 'Tab' && sub.Delete === 0))) {
  
      this.toastrService.error('You do not have permission to delete tab.', 'Permission Denied');
      return;
    }else{
    let obj = {
      "Key":"",
      "MasterID":val
    }
    Swal.fire({
      title: 'Are you sure, you want to delete '+val1 + '?',
      text: "",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: ' <i class="fa fa-thumbs-up"></i> Yes, Delete it!',
    }).then((result:any) => {
      if (result.isConfirmed) {
        this.api.DEL_EXECH_MASTER(obj).subscribe((data:any)=>{
          // console.log(data)
          if(data.Result==true){
            this.toastrService.success(data.MSG_USER)
           this.getModule();
          //  window.location.reload();
          }
    
        }, ((error: any) => {
          this.shared.loader(false);
          // this.toastrService.error('Your Receipt is not uploaded.');
        }))
        Swal.fire(
          'Deleted!',
          'Tab has been Deleted.',
          'success'
        )
      }
    })
  }
    
  }
}
// }
