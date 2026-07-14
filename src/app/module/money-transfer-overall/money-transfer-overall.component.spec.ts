import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoneyTransferOverallComponent } from './money-transfer-overall.component';

describe('MoneyTransferOverallComponent', () => {
  let component: MoneyTransferOverallComponent;
  let fixture: ComponentFixture<MoneyTransferOverallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoneyTransferOverallComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MoneyTransferOverallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
