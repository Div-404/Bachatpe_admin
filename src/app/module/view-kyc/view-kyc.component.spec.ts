import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewKycComponent } from './view-kyc.component';

describe('ViewKycComponent', () => {
  let component: ViewKycComponent;
  let fixture: ComponentFixture<ViewKycComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewKycComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewKycComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
