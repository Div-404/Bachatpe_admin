import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminKycModalComponent } from './admin-kyc-modal.component';

describe('AdminKycModalComponent', () => {
  let component: AdminKycModalComponent;
  let fixture: ComponentFixture<AdminKycModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminKycModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminKycModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
