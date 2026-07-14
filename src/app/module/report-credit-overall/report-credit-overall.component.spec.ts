import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportCreditOverallComponent } from './report-credit-overall.component';

describe('ReportCreditOverallComponent', () => {
  let component: ReportCreditOverallComponent;
  let fixture: ComponentFixture<ReportCreditOverallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportCreditOverallComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportCreditOverallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
