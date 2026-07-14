import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessTimestampComponent } from './business-timestamp.component';

describe('BusinessTimestampComponent', () => {
  let component: BusinessTimestampComponent;
  let fixture: ComponentFixture<BusinessTimestampComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessTimestampComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BusinessTimestampComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
