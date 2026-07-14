import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingOverallComponent } from './booking-overall.component';

describe('BookingOverallComponent', () => {
  let component: BookingOverallComponent;
  let fixture: ComponentFixture<BookingOverallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingOverallComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BookingOverallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
