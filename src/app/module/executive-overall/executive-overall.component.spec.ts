import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecutiveOverallComponent } from './executive-overall.component';

describe('ExecutiveOverallComponent', () => {
  let component: ExecutiveOverallComponent;
  let fixture: ComponentFixture<ExecutiveOverallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExecutiveOverallComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExecutiveOverallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
