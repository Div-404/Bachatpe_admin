import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDepositReportsComponent } from './user-deposit-reports.component';

describe('UserDepositReportsComponent', () => {
  let component: UserDepositReportsComponent;
  let fixture: ComponentFixture<UserDepositReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDepositReportsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserDepositReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
