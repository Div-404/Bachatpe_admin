import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AadharDetailComponent } from './aadhar-detail.component';

describe('AadharDetailComponent', () => {
  let component: AadharDetailComponent;
  let fixture: ComponentFixture<AadharDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AadharDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AadharDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
