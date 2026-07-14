import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditDepositComponent } from './credit-deposit.component';

describe('CreditDepositComponent', () => {
  let component: CreditDepositComponent;
  let fixture: ComponentFixture<CreditDepositComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditDepositComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreditDepositComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
