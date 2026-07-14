import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserWiseReportsComponent } from './user-wise-reports.component';

describe('UserWiseReportsComponent', () => {
  let component: UserWiseReportsComponent;
  let fixture: ComponentFixture<UserWiseReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserWiseReportsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserWiseReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
