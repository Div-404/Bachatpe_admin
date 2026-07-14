import { Target } from '@angular-devkit/architect';
import { SharedService } from './../../servies/shared/shared.service';
import { Country } from 'country-state-city';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../servies/api.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validator,
  Validators,
} from '@angular/forms';
import Swal from 'sweetalert2';
// import { file } from '../../../../node_modulesss/@babel/types/lib/index-legacy';
import { CommonModule, Location } from '@angular/common';
// import { c } from '../../../../node_modulesss/vite/dist/node/types.d-FdqQ54oU';

@Component({
  selector: 'app-message-center',
  standalone: true,
  imports: [NgbDropdownModule, ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './message-center.component.html',
  styleUrl: './message-center.component.scss',
})
export class MessageCenterComponent implements OnInit {
  @ViewChild('fileInput', { static: false })
  fileInput!: ElementRef<HTMLInputElement>;

  allMsgList: any;
  userProfile: any = 0;
  Phone: any = '';
  msgForm!: FormGroup;
  today: any;
  private dashboardRoute: string = '/user-list';
  previousUrl: any;
  isExpired: boolean = false;
  execPermissions: any;

  constructor(
    private api: ApiService,
    private toster: ToastrService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private shared: SharedService,
    private location: Location,
  ) {}

  ngOnInit(): void {
    this.execPermissions = JSON.parse(
      sessionStorage.getItem('execDetails') || '{}',
    );
    const now = new Date();
    this.today = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    console.log('here is radio val value', this.radioVal);

    this.route.queryParams.subscribe((param: any) => {
      console.log('Param', param);
      if (param?.id) {
        this.userProfile = param.id;
        this.Phone = param.phone || '';

        this.showRadio = true;
        this.radioChecked = true;
        this.radioVal = Number(param.id); // 🔥 important

        this.startMsg();
        this.getAllmsg();
      } else {
        // this.queryParam= false
        this.userProfile = 0;
        // this.shared.setReportTab(this.profileId)
        this.getAllmsg();
        this.startMsg();
      }
    });
    // this.getAllmsg()

    this.msgForm = this.fb.group({
      MsgId: [''],
      Profile: [''],
      oMsg: ['', Validators.required],
      MessageText: ['', Validators.required],
      MessageImage: ['', Validators.required],
      oDisplayType: ['', Validators.required],
      Tm_Str: ['', Validators.required],
      ClientRead: [''],
    });
  }

  goBack() {
    if (this.previousUrl !== this.dashboardRoute) {
      this.location.back();
    } else {
      console.log('Cannot go back from the dashboard route');
    }
  }

  Count: any = 0;
  getAllmsg() {
    let data = {
      Field1: this.userProfile, //Profile
      Field2: '1', //Initial
      Field3: '100', //Maxcount
    };
    this.shared.loader(true);
    this.api.getAllMessage(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false);
        this.allMsgList = res.lstMsgs;
        this.Count = res.Country;
        console.log('here is res all msg list', this.allMsgList);
      },
      error: (err: any) => {
        this.toster.error('Something went wrong', 'error');
      },
    });
  }

  showRadio: boolean = false;
  startMsg() {
    if (
      this.execPermissions?.some(
        (permit: any) =>
          permit.Master === 'Message Center' &&
          permit.SubMasters.some(
            (sub: any) => sub.SubMaster === 'Message Center' && sub.Add === 0,
          ),
      )
    ) {
      this.toster.error(
        'You do not have permission to add message.',
        'Permission Denied',
      );
      return;
    } else {
      if (this.showRadio == false) {
        this.showRadio = true;
      } else {
        this.bannerImage = '';
        this.Displaydate = '';
        this.msgForm.reset();
        this.msgForm.patchValue({
          Profile: this.radioVal,
          oDisplayType: '',
          oMsg: '',
        });
        this.editValue = null;
        this.showRadio = false;
        this.radioChecked = false;
        this.Phone = '';
      }
      console.log('here is radio val', this.radioVal);
    }
  }

  radioChecked: boolean = false;
  radioVal: any;
  setRadio(ev: any) {
    // only clear when user manually switches radio
    if (typeof ev === 'object') {
      this.Phone = '';
    }

    this.radioVal = '';
    this.radioChecked = ev?.target?.checked ?? true;

    if (this.radioChecked && this.userProfile != 0) {
      this.radioVal = Number(this.userProfile);
      this.imageVal = '';
    } else if (ev?.target?.checked && ev?.target?.value == '0') {
      this.radioVal = 0;
      this.bannerImage = '';
      this.Displaydate = '';
      this.msgForm.reset();
      this.msgForm.patchValue({
        Profile: this.radioVal,
        oDisplayType: '',
        oMsg: '',
      });
      this.imageVal = '';
    } else if (ev?.target?.checked && ev?.target?.value != '0') {
      this.radioVal = null;
      this.imageVal = '';
    } else if (this.editValue) {
      this.radioChecked = true;
      this.radioVal = Number(ev?.target?.value || ev);
    }

    console.log('radioVal:', this.radioVal);
  }
  // setRadio(ev: any) {
  //   this.Phone = '';
  //   this.radioVal = '';
  //   this.radioChecked = ev.target?.checked || true;
  //   if (this.radioChecked && this.userProfile != 0) {
  //     this.radioVal = Number(this.userProfile);
  //     this.imageVal = '';
  //   } else if (ev.target?.checked && ev.target?.value == '0') {
  //     this.radioVal = Number(ev.target?.value);
  //     this.bannerImage = '';
  //     this.Displaydate = '';
  //     this.msgForm.reset();
  //     this.msgForm.patchValue({
  //       Profile: this.radioVal,
  //       oDisplayType: '',
  //       oMsg: '',
  //     });
  //     this.imageVal = '';
  //   } else if (ev.target?.checked && ev.target.value != '0') {
  //     this.radioVal = null;
  //     console.log('this is individual');
  //     this.imageVal = '';
  //   } else if (this.editValue) {
  //     this.radioChecked = true;
  //     this.radioVal = this.editValue.Profile;
  //     this.radioVal = Number(ev.target?.value || ev);
  //   }

  //   console.log('here is radio val', this.editValue);
  //   console.log('here is radio val', this.radioVal);
  //   console.log('here is radio val', this.radioChecked);
  // }

  // ======================================================== add  msg ==========================================================
  Displaydate: any = '';
  selectDate(ev: any) {
    console.log('here is event', ev.target);

    const dateInput = ev.target.value; // format will be "yyyy-MM-dd"
    const date = new Date(dateInput);

    // Set a default time if needed
    date.setHours(23, 59, 59); // 12:00:00

    // Format to "yyyy-MM-dd HH:mm:ss"
    // let formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');

    const pad = (n: number) => n.toString().padStart(2, '0');

    const formattedDate = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    this.msgForm.patchValue({
      Tm_Str: formattedDate,
    });

    this.Displaydate = formattedDate ? formattedDate.slice(0, 10) : '';

    console.log('Formatted date:', formattedDate);
  }

  selectMsgType(ev: any) {
    this.msgForm.patchValue({
      oMsg: ev.target?.value || String(ev),
    });
    console.log(this.msgForm);
  }

  selectDisplay(ev: any) {
    this.msgForm.patchValue({
      oDisplayType: ev.target?.value || String(ev),
    });
    console.log(this.msgForm);
  }

  async createMsg() {
    let formValue = this.msgForm.value;
    // let userId: number | null = null;

    let data: any = {
      Profile: this.radioVal,
      oMsg: formValue.oMsg,
      MessageText: formValue.MessageText,
      MessageImage: this.bannerImage,
      oDisplayType: formValue.oDisplayType,
      Expiry: {
        Tm_Secs: 0,
        Tm_Str: formValue.Tm_Str,
      },
      ClientRead: 1,
    };

    // try {
    //   if (this.Phone === '') {
    //     // Don't call getUserIdAsPromise, proceed without Profile
    //   } else {
    //     // Get user ID using email
    //     userId = await this.getUserIdAsPromise(this.Phone);
    //     data.Profile = userId;
    //   }

    if (this.editValue) {
      data.MsgId = this.editValue.MsgId;
    }

    this.api.addMessage(data).subscribe({
      next: (res: any) => {
        if (res.Result === true) {
          this.msgForm.reset();
          this.msgForm.patchValue({
            oMsg: '',
            oDisplayType: '',
            Tm_Str: '',
          });
          this.Phone = '';
          this.showRadio = false;
          this.radioChecked = false;
          this.getAllmsg();
          if (this.editValue) {
            this.editValue = null;
            this.toster.success('Message Updated successfully', 'Success');
          } else if (!this.editValue) {
            this.toster.success('Message created successfully', 'Success');
          }
        } else {
          this.toster.error("Message couldn't be created", 'Error');
        }
      },
      error: (error: any) => {
        this.toster.error('Something went wrong', 'Error');
      },
    });

    // } catch (error) {
    //   this.toster.error("Please enter correct email", "Error");
    // }
  }

  getUserIdAsPromise(email: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const data = { Field1: email };

      this.api.getIdEmail(data).subscribe({
        next: (res: any) => {
          if (res.Result == -1) {
            reject('Invalid email provided.');
          } else {
            this.radioVal = resolve(res.Result);
          }
        },
        error: () => {
          reject('Failed to get user ID.');
        },
      });
    });
  }

  // ===================================================== edit ==============================================================

  editValue: any;
  editMsg(val: any) {
    if (
      this.execPermissions?.some(
        (permit: any) =>
          permit.Master === 'Message Center' &&
          permit.SubMasters.some(
            (sub: any) => sub.SubMaster === 'Message Center' && sub.Edit === 0,
          ),
      )
    ) {
      this.toster.error(
        'You do not have permission to update message.',
        'Permission Denied',
      );
      return;
    } else {
      this.editValue = val;
      this.showRadio = true;
      this.radioChecked = true;
      this.setRadio(val.Profile);
      this.selectMsgType(val.oMsg);
      this.selectDisplay(val.oDisplayType);
      const dateOnly = val.Expiry.Tm_Str.split(' ')[0]; // "2025-05-22"
      this.msgForm.patchValue({
        oMsg: val.oMsg,
        MessageText: val.MessageText,
        MessageImage: val.MessageImage,
        oDisplayType: val.oDisplayType,
        Tm_Str: dateOnly,
      });
      this.imageVal = val.MessageImage;
      this.bannerImage = val.MessageImage;
      this.Displaydate = dateOnly;
      this.GET_USER_INFO(this.editValue.Profile);
      console.log('here is val', val);
    }
  }

  // =================================================== upload image =========================================================

  imageVal: any = '';
  bannerImage: any = '';
  onFileSelected(ev: any) {
    const fileInput = ev.target;

    this.imageVal = fileInput.files[0].name;

    if (fileInput.files && fileInput.files[0]) {
      const file: File = fileInput.files[0];
      const reader = new FileReader();

      reader.readAsDataURL(file);
      reader.onload = () => {
        const data = {
          base64Image: reader.result,
          AppName: 'digisuite',
        };

        this.shared.loader(true);
        this.api.uploadImg(data).subscribe({
          next: (res: any) => {
            this.shared.loader(false);
            this.msgForm.patchValue({
              MessageImage: res.url,
            });
            this.bannerImage = res.url;
            this.toster.success('Image uploaded successfully', 'Success');
            // this.kyacStage = this.kyacStage + 1

            this.fileInput.nativeElement.value = ''; // Reset the file input field after upload
          },
          error: (err: any) => {
            this.shared.loader(false);
            this.toster.error('Something went wrong', 'Error');
          },
        });
      };
    }
  }

  // ====================================================================================== delete config ===================================================================================

  deleteMsg(val: any) {
    if (
      this.execPermissions?.some(
        (permit: any) =>
          permit.Master === 'Message Center' &&
          permit.SubMasters.some(
            (sub: any) =>
              sub.SubMaster === 'Message Center' && sub.Delete === 0,
          ),
      )
    ) {
      this.toster.error(
        'You do not have permission to delete message.',
        'Permission Denied',
      );
      return;
    } else {
      console.log('here is val from delete', val);

      let data = {
        Field1: val.MsgId,
      };
      Swal.fire({
        title: 'Are you sure?',
        text: 'You want to delete this message',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes!',
      }).then((result: any) => {
        if (result.isConfirmed) {
          this.shared.loader(true);
          this.api.deleteMessage(data).subscribe({
            next: (res: any) => {
              this.shared.loader(false);
              if (res.Result == true) {
                this.getAllmsg();
                this.toster.success('Message Deleted Successfully', 'Success');
              } else {
                this.toster.error(res.MSG_USER, 'Error');
              }
            },
            error: (err: any) => {
              this.shared.loader(false);
              this.toster.error('Something went wrong', 'Error');
            },
          });
        }
      });
    }
  }

  // ==================================================== get userId ==============================================

  getUserId() {
    let data = {
      Field1: this.Phone,
    };

    // const emailPattern = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/;
    console.log('this.radioVal', this.radioVal);

    const phonePattern = /^[6-9]\d{9}$/; // valid 10-digit Indian mobile

    const phone = (this.Phone || '').toString().trim();

    if (!phonePattern.test(phone) && this.userProfile != 0) {
      this.toster.error('Please enter a valid phone number', 'Invalid');
      return;
    }
    this.api.getIdEmail(data).subscribe({
      next: (res: any) => {
        if (res.Result == -1) {
          this.radioVal = null;
          this.toster.error('Please enter correct Phone', 'Error');
          return;
        } else {
          this.radioVal = res.Result;
          console.log('here is radioval', this.radioVal);
        }
        console.log('here is res', res);
      },
      error: (err: any) => {
        this.toster.error('Something went wrong', 'Error');
      },
    });
  }

  userInfoData: any = [];
  GET_USER_INFO(val: any) {
    let obj = {
      profileId: val,
    };
    // this.shared.loader(true)
    this.api.GET_USER_INFO(obj).subscribe((data: any) => {
      console.log('user info', data);
      this.userInfoData = data;
      this.Phone = data.Phone;
    });
  }
}
