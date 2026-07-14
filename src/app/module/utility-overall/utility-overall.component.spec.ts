import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UtilityOverallComponent } from './utility-overall.component';

describe('UtilityOverallComponent', () => {
  let component: UtilityOverallComponent;
  let fixture: ComponentFixture<UtilityOverallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtilityOverallComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UtilityOverallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
