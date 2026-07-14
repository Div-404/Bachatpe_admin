import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsCommissionComponent } from './reports-commission.component';

describe('ReportsCommissionComponent', () => {
  let component: ReportsCommissionComponent;
  let fixture: ComponentFixture<ReportsCommissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportsCommissionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportsCommissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
