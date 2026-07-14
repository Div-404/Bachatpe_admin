import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  domain = environment.url;
  private isBrowser: boolean;
  constructor(@Inject(PLATFORM_ID) private platformId: Object, private router: Router, private http: HttpClient) {
    // Check if the code is running in the browser
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  makeSignup(obj: any) {
    return this.http.post(this.domain + 'MAKE_SIGNUP', obj);
  }
  getUserList(obj: any) {
    return this.http.post(this.domain + 'GET_ADM_USERS_OVERALL', obj);
  }
  changeStatus(obj: any) {
    return this.http.post(this.domain + 'getUserList', obj);
  }

  uploadImg(obj: any) {
    return this.http.post("https://client.educapitals.com:5002/upload/", obj)
  }

  UPLOAD_KYC_DOC(obj: any) {
    return this.http.post(this.domain + 'UPLOAD_KYC_DOC', obj)
  }

  changeStatusUser(obj: any) {
    return this.http.post(this.domain + "UPDATE_USER_STATUS", obj)
  }
}
