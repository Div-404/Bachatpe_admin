import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletAndLedgerComponent } from './wallet-and-ledger.component';

describe('WalletAndLedgerComponent', () => {
  let component: WalletAndLedgerComponent;
  let fixture: ComponentFixture<WalletAndLedgerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WalletAndLedgerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WalletAndLedgerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
