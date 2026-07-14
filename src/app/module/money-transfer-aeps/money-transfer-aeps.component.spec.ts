import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoneyTransferAepsComponent } from './money-transfer-aeps.component';

describe('MoneyTransferAepsComponent', () => {
  let component: MoneyTransferAepsComponent;
  let fixture: ComponentFixture<MoneyTransferAepsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoneyTransferAepsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MoneyTransferAepsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
