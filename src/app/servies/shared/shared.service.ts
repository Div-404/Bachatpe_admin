import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private loaderValue = new Subject<any>();
  selectedloaderValue = this.loaderValue.asObservable();

  private permissionData = new BehaviorSubject<any>({});
  selectedPermission = this.permissionData.asObservable();

  private activeClass: BehaviorSubject<any> = new BehaviorSubject<any>(null); // Initialize with null or a default value
  activeClass$: Observable<any> = this.activeClass.asObservable();

  private activeName: BehaviorSubject<any> = new BehaviorSubject<any>(null); // Initialize with null or a default value
  activeName$: Observable<any> = this.activeName.asObservable();

  private reportTab = new BehaviorSubject<any>(null); // default value
  reportTabStatus$ = this.reportTab.asObservable();

  private prefData: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  prefVal = this.permissionData.asObservable();

  private selectedTabSubject = new BehaviorSubject<string>('pref-overall');
  selectedTab$ = this.selectedTabSubject.asObservable();

  setSelectedTab(tab: string) {
    this.selectedTabSubject.next(tab);
  }

  setPref(value: any) {
    this.prefData.next(value);
  }

  setReportTab(value: boolean) {
    console.log(
      'report tab value>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>',
      value,
    );

    this.reportTab.next(value);
  }

  setSideBarName(data: any) {
    console.log('set side bar name', data);
    this.activeName.next(data);
  }

  setSidebrActiveClass(data: any) {
    console.log('setSidebrActiveClass...', data);
    this.activeClass.next(data); // Emit the new active class value
  }

  getSidebrActiveClass() {
    return this.activeClass.value; // Return the current value of the active class
  }

  constructor(private http: HttpClient) {}

  loader(data: any) {
    this.loaderValue.next(data);
  }

  fetchPermissions(data: any) {
    // console.log("services",   data)
    this.permissionData.next(data);
  }

  get2Charecter(val: any) {
    let nameArray = val.split(' ');

    // Step 2: Map over the array to get the first character of each word
    let initialsArray = nameArray.map((word: any) => word.charAt(0));

    return initialsArray[0] + initialsArray[1];
  }

  // {value: 1, name: "Money Transfer" },
  // {value: 2, name: "Recharge" },
  // {value: 3, name: "Booking" },
  // {value: 4 , name: "Utility"},
  // {value: 5, name: "Miscellaneous" }

  getSource(val: any) {
    //PENDING = 1,CANCELLED=2,REJECTED=3,IN_PROCESS=4,SUCCESS=5, FREEZE=6
    let returnStatus = '';
    switch (val) {
      case 1:
        returnStatus = 'Money Transfer';
        break;
      case 2:
        returnStatus = 'Recharge';
        break;
      case 3:
        returnStatus = 'Booking';
        break;
      case 4:
        returnStatus = 'Utility';
        break;
      case 5:
        returnStatus = 'Miscellaneous';
        break;

      default:
        break;
    }
    return returnStatus;
  }

  getBoolean(val: any) {
    //PENDING = 1,CANCELLED=2,REJECTED=3,IN_PROCESS=4,SUCCESS=5, FREEZE=6
    let returnStatus = false;
    switch (val) {
      case 1:
        returnStatus = true;
        break;
      case 2:
        returnStatus = true;
        break;
      case 3:
        returnStatus = true;
        break;
      case 4:
        returnStatus = true;
        break;
      case 5:
        returnStatus = true;
        break;

      default:
        break;
    }
    return returnStatus;
  }

  // [
  //   { name: "WTS", value: 1 },
  //   { name: "AIRTEL", value: 2 },
  //   { name: "FINOPAYMENT", value: 3 },
  //   { name: "ROUNDPAY", value: 4 },
  //   // { name: "Miscellaneous", value: 5 }

  // ]

  getVenderName(val: any) {
    //PENDING = 1,CANCELLED=2,REJECTED=3,IN_PROCESS=4,SUCCESS=5, FREEZE=6
    let returnStatus = '';
    switch (val) {
      case '1':
        returnStatus = 'WTS';
        break;
      case '2':
        returnStatus = 'AIRTEL';
        break;
      case '3':
        returnStatus = 'FINOPAYMENT';
        break;
      case '4':
        returnStatus = 'ROUNDPAY';
        break;
      case '5':
        returnStatus = 'Miscellaneous';
        break;

      default:
        break;
    }
    return returnStatus;
  }

  getServices(val: any) {
    //PENDING = 1,CANCELLED=2,REJECTED=3,IN_PROCESS=4,SUCCESS=5, FREEZE=6
    let returnStatus = '';
    switch (val) {
      case '1':
        returnStatus = 'Money Transfer';
        break;
      case '2':
        returnStatus = 'Recharge';
        break;
      case '3':
        returnStatus = 'Booking';
        break;
      case '4':
        returnStatus = 'Utility';
        break;
      case '5':
        returnStatus = 'Miscellaneous';
        break;

      default:
        break;
    }
    return returnStatus;
  }

  //   [
  //     {
  //         "value": 1,
  //         "name": "Money Transfer",
  //         "flag": false
  //     },
  //     {
  //         "value": 2,
  //         "name": "Recharge",
  //         "flag": false
  //     },
  //     {
  //         "value": 3,
  //         "name": "Booking",
  //         "flag": false
  //     },
  //     {
  //         "value": 4,
  //         "name": "Utility",
  //         "flag": false
  //     },
  //     {
  //         "value": 5,
  //         "name": "Miscellaneous",
  //         "flag": false
  //     }
  // ]

  getJsonData(): Observable<any> {
    return this.http.get('assets/data.json');
    // return this.http.get('data.json');
  }
  // ------------------------------------------------Peremission services---------------------------------------------------------------
  hasPermission(
    master: string,
    subMaster: string,
    action: 'Access' | 'Add' | 'Edit' | 'Delete' | 'AccessAll',
  ): boolean {
    console.log('hasPermission', master, subMaster, action);
    return JSON.parse(sessionStorage.getItem('execDetails') || '{}')?.some(
      (permit: any) =>
        permit.Master === master &&
        permit.SubMasters?.some(
          (sub: any) => sub.SubMaster === subMaster && sub[action] === 1,
        ),
    );
  }
}
