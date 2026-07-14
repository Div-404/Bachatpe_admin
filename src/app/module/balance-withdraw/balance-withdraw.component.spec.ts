import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceWithdrawComponent } from './balance-withdraw.component';

describe('BalanceWithdrawComponent', () => {
  let component: BalanceWithdrawComponent;
  let fixture: ComponentFixture<BalanceWithdrawComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BalanceWithdrawComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BalanceWithdrawComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
