import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SourceDepositReportsComponent } from './source-deposit-reports.component';

describe('SourceDepositReportsComponent', () => {
  let component: SourceDepositReportsComponent;
  let fixture: ComponentFixture<SourceDepositReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SourceDepositReportsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SourceDepositReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
