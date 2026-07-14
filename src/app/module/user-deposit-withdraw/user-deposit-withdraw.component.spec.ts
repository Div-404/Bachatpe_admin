import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDepositWithdrawComponent } from './user-deposit-withdraw.component';

describe('UserDepositWithdrawComponent', () => {
  let component: UserDepositWithdrawComponent;
  let fixture: ComponentFixture<UserDepositWithdrawComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDepositWithdrawComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserDepositWithdrawComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
