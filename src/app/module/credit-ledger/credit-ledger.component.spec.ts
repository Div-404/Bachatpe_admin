import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditLedgerComponent } from './credit-ledger.component';

describe('CreditLedgerComponent', () => {
  let component: CreditLedgerComponent;
  let fixture: ComponentFixture<CreditLedgerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditLedgerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreditLedgerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
