import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignPackageLimitsComponent } from './assign-package-limits.component';

describe('AssignPackageLimitsComponent', () => {
  let component: AssignPackageLimitsComponent;
  let fixture: ComponentFixture<AssignPackageLimitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignPackageLimitsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssignPackageLimitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
