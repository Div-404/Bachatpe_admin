import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceDwmainComponent } from './balance-dwmain.component';

describe('BalanceDwmainComponent', () => {
  let component: BalanceDwmainComponent;
  let fixture: ComponentFixture<BalanceDwmainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BalanceDwmainComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BalanceDwmainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
