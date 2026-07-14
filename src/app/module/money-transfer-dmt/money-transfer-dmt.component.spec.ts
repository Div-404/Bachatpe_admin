import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoneyTransferDmtComponent } from './money-transfer-dmt.component';

describe('MoneyTransferDmtComponent', () => {
  let component: MoneyTransferDmtComponent;
  let fixture: ComponentFixture<MoneyTransferDmtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoneyTransferDmtComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MoneyTransferDmtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
