import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessOverallComponent } from './business-overall.component';

describe('BusinessOverallComponent', () => {
  let component: BusinessOverallComponent;
  let fixture: ComponentFixture<BusinessOverallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessOverallComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BusinessOverallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
