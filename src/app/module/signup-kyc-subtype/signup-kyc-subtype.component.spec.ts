import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupKycSubtypeComponent } from './signup-kyc-subtype.component';

describe('SignupKycSubtypeComponent', () => {
  let component: SignupKycSubtypeComponent;
  let fixture: ComponentFixture<SignupKycSubtypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupKycSubtypeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SignupKycSubtypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
