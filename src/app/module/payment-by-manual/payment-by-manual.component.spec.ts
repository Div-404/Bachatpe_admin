import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentByManualComponent } from './payment-by-manual.component';

describe('PaymentByManualComponent', () => {
  let component: PaymentByManualComponent;
  let fixture: ComponentFixture<PaymentByManualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentByManualComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PaymentByManualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
