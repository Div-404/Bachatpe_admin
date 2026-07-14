import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsCreditsComponent } from './reports-credits.component';

describe('ReportsCreditsComponent', () => {
  let component: ReportsCreditsComponent;
  let fixture: ComponentFixture<ReportsCreditsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportsCreditsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportsCreditsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
