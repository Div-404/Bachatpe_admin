import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { ApiService } from '../../servies/api.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-header',
// standalone: true,
//   imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {

  private dashboardRoute: string = '/user-list';
  previousUrl: any
  changePassForm: any = FormGroup
  loginRes: any
  submitted: boolean = false
  hide: boolean= false
  hide2: boolean= false


  constructor(private router: Router, private location: Location,  private modalService: NgbModal,
    private fb: FormBuilder, private api: ApiService, private toster: ToastrService
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.previousUrl = event.url;
      }
    });
  }

  openLg3(content3: any) {
   this.changePassForm.reset()
   this.submitted= false
    this.modalService.open(content3, { size: 'md modalone', centered: true, windowClass: 'flip-modal' });
  }

  closeMd() {
    this.modalService.dismissAll()
  }

  ngOnInit(): void {
    this.loginRes = JSON.parse(sessionStorage.getItem("isloggedIn") || "{}")
    console.log("here is login res", this.loginRes);

    this.changePassForm = this.fb.group({
      OldPwd: ["", Validators.required],
      NewPwd: ["", [Validators.required, Validators.pattern(/^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)]],
      ReCheckPwd: ["", [Validators.required, Validators.pattern(/^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)]],
    })
  }

  get f() {
    return this.changePassForm.controls;
  }

  goBack() {
    if (this.previousUrl !== this.dashboardRoute) {
      this.location.back();
    } else {
      console.log('Cannot go back from the dashboard route');
    }
  }

  logOut() {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to Log out",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes!"
    }).then((result: any) => {
      if (result.isConfirmed) {
        setTimeout(() => {
          this.router.navigate(['/login']).then(() => {
            this.router.navigate([{ outlets: { primary: null } }]); // Clear router state
            sessionStorage.clear();
            sessionStorage.clear();

            // location.reload()
          });

        }, 1000);
      }
    })
  }

  // ======================================================== change pass ====================================================

  changePass() {
  this.submitted = true;
  if (this.changePassForm.invalid) return;

  // ✅ Read fresh from session every time
  const loginRes = JSON.parse(sessionStorage.getItem("isloggedIn") || "{}");
  const execId = Number(loginRes?.Result);

  // ✅ Guard against invalid ExecID
  if (!execId || isNaN(execId)) {
    this.toster.error("Session expired. Please login again.", "Error");
    this.router.navigateByUrl('login');
    return;
  }

  if (this.changePassForm.value.NewPwd !== this.changePassForm.value.ReCheckPwd) {
    this.toster.error("New password and confirm password can't be different");
    return;
  }

  let data = {
    "Key": "",
    "ExecID": execId,  // ✅ Now guaranteed to be a valid number
    "OldPwd": this.changePassForm.value.OldPwd,
    "NewPwd": this.changePassForm.value.NewPwd,
    "ReCheckPwd": this.changePassForm.value.ReCheckPwd
  };
    this.api.changePass(data).subscribe({
      next: (res: any) => {
        if (res.Result == true) {
          this.closeMd()
          this.toster.success("Password changed", "Success")
          setTimeout(() => {
            sessionStorage.clear()
            this.router.navigateByUrl('login')
          }, 2000);
        } else {
          this.toster.error(res.MSG_USER, "Error")
        }
      }, error: (err: any) => {
        this.toster.error("Something went wrong", "Error")
      }
    })
  }

  toggleVisibility(val: any) {
    console.log("hide working");
    if (val === 1) {
    this.hide = !this.hide;
    }else {
      this.hide2= !this.hide2
    }
  }


}
