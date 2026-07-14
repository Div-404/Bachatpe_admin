import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../servies/shared/shared.service';
import { ApiService } from '../../servies/api.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { configComm } from '../../common/serviceDrop';

@Component({
  selector: 'app-assign-package',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assign-package.component.html',
  styleUrl: './assign-package.component.scss'
})
export class AssignPackageComponent implements OnInit {

  private dashboardRoute: string = '/user-list';
  packageList: any
  pkgId: any
  public dropDownList = configComm
  First: any
  Last: any
  Code: any
  UserType: any
  profileId: any
  activePkgId: any
  previousUrl: any
  Phone: any


  constructor(private shared: SharedService, private api: ApiService, private toster: ToastrService,
    private route: ActivatedRoute, private router: Router, private location: Location
  ) {

    //////////////// for back button //////////////////////
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.previousUrl = event.url;
      }
    });
  }


  ngOnInit(): void {

    this.First = sessionStorage.getItem('First')
    this.Last = sessionStorage.getItem('Last')
    this.Code = sessionStorage.getItem('Code')
    // this.Code = sessionStorage.getItem('Phone')
    this.Phone = this.UserType = sessionStorage.getItem('UserType')

    if (this.userInfoData.length == 0) {
      this.route.params.subscribe((param: any) => {
        console.log("here is param", param.id);
        this.pkgId = param.id
        this.activePkgId = param.id
        this.profileId = param.pf
        console.log("here is profileId", this.profileId);

        // this.type= param.type
        this.getUserPackage()
        this.allPackage()
      })
    } else {
      this.getUserPackage()
      this.allPackage()
    }

  }


  goBack() {
    if (this.previousUrl !== this.dashboardRoute) {
      this.location.back();
    } else {
      console.log('Cannot go back from the dashboard route');
    }
  }

  // ======================================================================== get user package ==============================================================

  selecPkgVal: any = 0
  currentService: any
  pkgName: any
  getUserPackage() {

    let data = {
      Key: "",
      Field1: this.pkgId
    }
    this.shared.loader(true)

    this.api.getUserPackage(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        this.packageList = res
        this.pkgName = res[0].oPkg.Commission
        this.currentService = res[0].lstSource
        this.allPackage()
        console.log("here is live package data", this.packageList);

        // this.lstSource = res.lstSource
        console.log("here is all current service", this.currentService)

      }, error: (err: any) => {
        this.shared.loader(false)
        this.toster.error("Something went wrong", "error")
      }
    })
  }

  allPkgList: any
  allPackage() {

    let data = {
      Key: "",
      Field1: "0"
    }
    this.shared.loader(true)

    this.api.getUserPackage(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        // this.allPkgList = res
        this.allPkgList = res.filter((ele: any) => ele.PkgID !== this.packageList[0].PkgID);
        console.log("here is all package", this.allPkgList);


      }, error: (err: any) => {
        this.shared.loader(false)
        this.toster.error("Something went wrong", "error")
      }
    })
  }


  navigateToUser() {
    this.router.navigateByUrl('user-list')
  }

  serviceEn: boolean = false
  showService() {
    this.serviceEn = !this.serviceEn
  }

  buttonEnable: boolean = false
  serviceList: any
  selectPkg: any
  selectpkg(ev: any) {
    let selectedIndex = ev.target.value
    console.log("here is ev", ev.target.value);
    if (selectedIndex) {
      this.buttonEnable = true
      this.selectPkg = this.allPkgList[selectedIndex];
      this.serviceList = this.selectPkg.lstSource
      this.pkgId = this.selectPkg.PkgID
      console.log("here is service list", this.serviceList);

      console.log("dgdsgdfg", this.selectPkg); // This is the selected object with all its data.
    } else {
      console.log('No package selected');
    }

  }
  viewToNavigate(type: any) {
    // console.log("here navigation pkgID", PkgID.PkgID);
    console.log("here navigation type", type);

    this.router.navigateByUrl("user-package/" + this.pkgId + "/" + type)
  }

  viewToNavigateActivePkg(type: any) {
    // console.log("here navigation pkgID", PkgID.PkgID);
    console.log("here navigation type", type);

    this.router.navigateByUrl("user-package/" + this.activePkgId + "/" + type)
  }

  getServiceName(type: any): string | undefined {

    const matchedService = this.dropDownList.find(service => service.value === type);


    return matchedService ? matchedService.name : undefined;
  }


  // ============================================================== update user commission ==================================================

  updateComm() {

    let data = {
      "Key": "",
      "Field1": this.profileId,          //profileid    
      "Field2": this.pkgId
    }
    this.shared.loader(true)

    this.api.updateUserCommPkg(data).subscribe({
      next: (res: any) => {
        this.shared.loader(false)
        if (res.Result == true) {
          // location.reload()
          this.GET_USER_INFO()
          this.toster.success(res.MSG_USER, "Success")
          // this.navigateToUser()
        } else {
          this.toster.error(res.MSG_USER, "Error")
        }
        console.log("here is all current service", res)

      }, error: (err: any) => {
        this.shared.loader(false)
        this.toster.error("Something went wrong", "error")
      }
    })
  }

  userInfoData: any = []
  GET_USER_INFO() {
    let obj = {
      profileId: this.profileId
    }
    // this.shared.loader(true)
    this.api.GET_USER_INFO(obj).subscribe((data: any) => {
      console.log("user info", data)
      this.userInfoData = data
      if (this.userInfoData) {
        this.pkgId = this.userInfoData.PkgID
        this.getUserPackage()
        this.buttonEnable = false
        this.selecPkgVal = 0
        this.serviceList = []
        this.router.navigateByUrl("assign-package/" + this.selectPkg.PkgID + "/" + this.profileId)
      }

    })
  }
}
