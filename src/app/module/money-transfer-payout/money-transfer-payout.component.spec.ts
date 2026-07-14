import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoneyTransferPayoutComponent } from './money-transfer-payout.component';

describe('MoneyTransferPayoutComponent', () => {
  let component: MoneyTransferPayoutComponent;
  let fixture: ComponentFixture<MoneyTransferPayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoneyTransferPayoutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MoneyTransferPayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
