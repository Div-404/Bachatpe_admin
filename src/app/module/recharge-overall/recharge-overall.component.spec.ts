import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RechargeOverallComponent } from './recharge-overall.component';

describe('RechargeOverallComponent', () => {
  let component: RechargeOverallComponent;
  let fixture: ComponentFixture<RechargeOverallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RechargeOverallComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RechargeOverallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
