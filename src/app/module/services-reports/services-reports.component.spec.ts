import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicesReportsComponent } from './services-reports.component';

describe('ServicesReportsComponent', () => {
  let component: ServicesReportsComponent;
  let fixture: ComponentFixture<ServicesReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicesReportsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ServicesReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
