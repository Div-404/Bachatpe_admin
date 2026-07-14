import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupKycComponent } from './signup-kyc.component';

describe('SignupKycComponent', () => {
  let component: SignupKycComponent;
  let fixture: ComponentFixture<SignupKycComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupKycComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SignupKycComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
