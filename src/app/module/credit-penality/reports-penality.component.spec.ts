import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsPenalityComponent } from './reports-penality.component';

describe('ReportsPenalityComponent', () => {
  let component: ReportsPenalityComponent;
  let fixture: ComponentFixture<ReportsPenalityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportsPenalityComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportsPenalityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
