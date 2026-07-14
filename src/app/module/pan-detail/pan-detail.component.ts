import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, ActivatedRoute } from '@angular/router';
import { SharedService } from '../../servies/shared/shared.service';
import { ApiService } from '../../servies/api.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pan-detail',
  standalone: true,
  imports: [CommonModule, RouterOutlet,FormsModule],
  templateUrl: './pan-detail.component.html',
  styleUrl: './pan-detail.component.scss'
})
export class PanDetailComponent implements OnInit{

  profileId:any;

  constructor(private router: Router, private route:ActivatedRoute, private shared: SharedService,private api:ApiService) {}
  ngOnInit(): void {
    // Subscribe to the route parameters observable
    this.route.parent?.params.subscribe((params: any) => {
      this.profileId = params['profileId'];
      console.log('Profile ID:', this.profileId);
      // Use profileId to fetch user details here
    });
    if(this.profileId){
      
      this.GET_USER_KYC_INFO(this.profileId)
      this.GET_USER_INFO(this.profileId)
    }
  }
  aadharData:any=[]
  GET_USER_KYC_INFO(val:any){
    let obj ={
      "ProfileId":val,
      "Key":"",
      "oKYC_Type":1         //PAN_CARD = 1,AADHAR_ID = 2,ADDR = 3,BANK_STATEMENT = 4,SIGNATURE = 5,VIDEO_VERIFY = 6,AGR
    }
    this.shared.loader(true)
    this.api.GET_USER_KYC_INFO(obj).subscribe((data:any)=>{
      console.log(data)
      if(data.oKYC_DOC != null){
       this.aadharData=data
       console.log("here aa dhar data>>>>>>>>>>>>>>>>>>>>>>", this.aadharData);
       
        this.shared.loader(false)
      }
      else {
        this.shared.loader(false)
      }
    },
  )
  }
  userInfoData:any=[]
  GET_USER_INFO(val:any){
    let obj={
      profileId: val
    }
    // this.shared.loader(true)
    this.api.GET_USER_INFO(obj).subscribe((data:any)=>{
console.log("user info", data)
    this.userInfoData = data
    
    })
  }
}
