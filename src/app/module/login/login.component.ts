import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../servies/api.service';
import { SharedService } from '../../servies/shared/shared.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  libuysellTab: any = 'tab1';

  libuysell(tab: any) {
    this.libuysellTab = tab;
  }

  loginForm: any = FormGroup;
  submitted: boolean = false;
  execId: any;
  execPermission: any;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private shared: SharedService,
    private router: Router,
    private toster: ToastrService,
    private http: HttpClient,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  get f() {
    return this.loginForm.controls;
  }

  ngOnInit(): void {
    const localStorage = this.document?.defaultView?.localStorage;
    if (localStorage && sessionStorage.getItem('isloggedIn') != undefined) {
      this.router.navigateByUrl('user-list');
    }
    this.loginForm = this.fb.group({
      Email: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/,
          ),
        ],
      ],
      Password: ['', Validators.required],
    });
  }

  login() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    let data = this.loginForm.value;
    data.Key = '';

    this.shared.loader(true);
    this.api.login(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false);
        console.log('login res', res);

        if (res.Result == -1) {
          this.toster.error('Invalid credentilas', 'Error');
        } else {
          this.execId = res.Result;
          this.getExecutive(res);
          sessionStorage.setItem('agentID', res.Result);
          //  sessionStorage.setItem("isloggedIn", JSON.stringify(res))
          //  setTimeout(() => {
          //   this.router.navigateByUrl("user-list");
          // }, 100);
          // this.router.navigateByUrl("user-list")
        }
      },
      error: (err: any) => {
        this.shared.loader(false);
        this.toster.error('Something went wrong', 'Error');
      },
    });
  }

  hide: boolean = false;
  toggleVisibility(): void {
    this.hide = !this.hide;
  }

  // =========================================== get executive ====================================================

  // getExecutive(val: any) {
  //   let data = {
  //     Key:"",
  //     ExecID: this.execId
  //   }
  //   this.shared.loader(true)
  //   this.api.getExecutive(data).subscribe({next: (res: any) =>{
  //     this.shared.loader(false)
  //     this.execPermission= res.lstPermit
  //     sessionStorage.setItem("execDetails", JSON.stringify(this.execPermission))
  //     this.shared.fetchPermissions(res.lstPermit);
  //     // sessionStorage.setItem("isloggedIn", JSON.stringify(val))
  //     this.router.navigateByUrl("user-list");
  //     sessionStorage.setItem("isloggedIn", JSON.stringify(val))
  //     console.log("here is get executuve res", res);

  //   }, error: (err: any)=>{
  //     this.shared.loader(false)
  //     this.toster.error("Something went wrong", "Error")
  //   }})
  // }

  getExecutive(val: any) {
    let data = {
      Key: '',
      ExecID: this.execId,
    };
    this.shared.loader(true);
    this.api.getExecutive(data).subscribe({
      next: (res: any) => {
        this.execPermission = res.lstPermit;
        sessionStorage.setItem(
          'execDetails',
          JSON.stringify(this.execPermission),
        );
        this.shared.fetchPermissions(res.lstPermit);

        console.log('here is get executuve res', res);
        this.toster.success('Login successfully', 'Success');
        sessionStorage.setItem('isloggedIn', JSON.stringify(val));
        console.log('here is get executuve res', res);
        this.shared.loader(false);
        this.router.navigateByUrl('dashboard');
      },
      error: (err: any) => {
        this.shared.loader(false);
        this.toster.error('Something went wrong', 'Error');
      },
    });
  }
}
