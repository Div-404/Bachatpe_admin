import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepositTransactionComponent } from './deposit-transaction.component';

describe('DepositTransactionComponent', () => {
  let component: DepositTransactionComponent;
  let fixture: ComponentFixture<DepositTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepositTransactionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DepositTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
