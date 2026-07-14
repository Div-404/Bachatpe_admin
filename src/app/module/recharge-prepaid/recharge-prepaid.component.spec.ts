import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RechargePrepaidComponent } from './recharge-prepaid.component';

describe('RechargePrepaidComponent', () => {
  let component: RechargePrepaidComponent;
  let fixture: ComponentFixture<RechargePrepaidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RechargePrepaidComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RechargePrepaidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
