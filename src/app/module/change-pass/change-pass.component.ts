import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../servies/api.service';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { json } from 'express';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-pass',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './change-pass.component.html',
  styleUrl: './change-pass.component.scss'
})
export class ChangePassComponent implements OnInit {

  changePassForm: any = FormGroup
  loginRes: any
  submitted: boolean = false

  constructor(private api: ApiService, private toster: ToastrService, private fb: FormBuilder,
    private router: Router
  ) {

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

  changePass() {
    this.submitted = true
    if (this.changePassForm.invalid) {
      return
    }
    let data = {
      "Key": "",
      "ExecID": Number(this.loginRes.Result),
      "OldPwd": this.changePassForm.value.OldPwd,
      "NewPwd": this.changePassForm.value.NewPwd,
      "ReCheckPwd": this.changePassForm.value.ReCheckPwd
    }
    this.api.changePass(data).subscribe({
      next: (res: any) => {
        if (res.Result == true) {
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

}
