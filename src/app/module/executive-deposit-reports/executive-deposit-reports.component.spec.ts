import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecutiveDepositReportsComponent } from './executive-deposit-reports.component';

describe('ExecutiveDepositReportsComponent', () => {
  let component: ExecutiveDepositReportsComponent;
  let fixture: ComponentFixture<ExecutiveDepositReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExecutiveDepositReportsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExecutiveDepositReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
