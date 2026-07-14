import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AepsLedgerComponent } from './aeps-ledger.component';

describe('AepsLedgerComponent', () => {
  let component: AepsLedgerComponent;
  let fixture: ComponentFixture<AepsLedgerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AepsLedgerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AepsLedgerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
