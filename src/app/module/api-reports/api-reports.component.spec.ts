import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiReportsComponent } from './api-reports.component';

describe('ApiReportsComponent', () => {
  let component: ApiReportsComponent;
  let fixture: ComponentFixture<ApiReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApiReportsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ApiReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
