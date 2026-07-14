import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoneySummaryComponent } from './money-summary.component';

describe('MoneySummaryComponent', () => {
  let component: MoneySummaryComponent;
  let fixture: ComponentFixture<MoneySummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoneySummaryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MoneySummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
