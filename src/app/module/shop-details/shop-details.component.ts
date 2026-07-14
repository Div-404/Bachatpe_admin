import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, ActivatedRoute } from '@angular/router';
import { SharedService } from '../../servies/shared/shared.service';
import { ApiService } from '../../servies/api.service';
import { FormsModule } from '@angular/forms';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-shop-details',
  standalone: true,
  imports: [NgbAccordionModule,CommonModule,FormsModule],
  templateUrl: './shop-details.component.html',
  styleUrl: './shop-details.component.scss'
})
export class ShopDetailsComponent {
  profileId:any;

  constructor(private router: Router, private route:ActivatedRoute, private shared: SharedService,private api:ApiService,
    private sanitizer: DomSanitizer
  ) {}

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
      this.GET_ADM_USER_GEO(this.profileId)
    }
  }
  aadharData:any=[]
  GET_USER_KYC_INFO(val:any){
    let obj ={
      "ProfileId":val,
      "Key":"",
      "oKYC_Type": 11         //PAN_CARD = 1,AADHAR_ID = 2,ADDR = 3,BANK_STATEMENT = 4,SIGNATURE = 5,VIDEO_VERIFY = 6,AGR
    }
    this.shared.loader(true)
    this.api.GET_USER_KYC_INFO(obj).subscribe((data:any)=>{
      console.log(data)
      if(data.oKYC_DOC != null){
       this.aadharData=data
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
  mapUrl: any
  geoData:any=[]
  GET_ADM_USER_GEO(val: any) {
    let obj = {
      Key: "",
      Field1: val,
    };
    this.shared.loader(true);
    this.api.GET_ADM_USER_GEO(obj).subscribe((data: any) => {
      if (data) {
        const locationPromises = data.map((item: any) => {
          console.log("jsbfijsdfdsnfdsf", item);
          
          return this.api.getLocationName(item.Latitude, item.Longitude).toPromise().then((locationData: any) => {
            const address = locationData.results.length > 0 ? locationData.results[0].formatted_address : 'Location not found';
            // this.mapUrl= this.sanitizer.bypassSecurityTrustResourceUrl('https://www.google.com/maps/embed/v1/place?key=AIzaSyB71scKqNpMGNdzB1Nw7bVXvoXn-QJPmlU&q=' + this.location.address)
            const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${item.Latitude},${item.Longitude}&zoom=15&size=600x300&markers=color:red%7Clabel:C%7C${item.Latitude},${item.Longitude}&key=AIzaSyB71scKqNpMGNdzB1Nw7bVXvoXn-QJPmlU`;
            console.log('Url and all', )
            return {
              ...item,
              staticMapUrl, // Include the generated static map URL
              address, // Include the formatted address
            };
          });
        });
  
        Promise.all(locationPromises).then((locations) => {
          this.geoData = locations;
          this.mapUrl= this.sanitizer.bypassSecurityTrustResourceUrl(locations[0].staticMapUrl)
          this.shared.loader(false);
          console.log(locations, "her us urlllllllllllllllllllll");
        });
      
        
      } else {
        this.geoData = [];
        this.shared.loader(false);
      }
    });
  }
  expandedIndex: number | null = 0;
  toggleAccordion(index: number): void {
    this.expandedIndex = this.expandedIndex === index ? null : index; // Toggle the current index
  }
  getShortAddress(address: string): string {
    const maxLength = 25; // Specify the max length for the address
    return address.length > maxLength ? `${address.substring(0, maxLength)}...` : address;
  }
  
}
