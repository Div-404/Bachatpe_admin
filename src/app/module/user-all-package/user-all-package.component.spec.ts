import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAllPackageComponent } from './user-all-package.component';

describe('UserAllPackageComponent', () => {
  let component: UserAllPackageComponent;
  let fixture: ComponentFixture<UserAllPackageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserAllPackageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserAllPackageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
