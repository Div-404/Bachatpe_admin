import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceContaninerComponent } from './balance-contaniner.component';

describe('BalanceContaninerComponent', () => {
  let component: BalanceContaninerComponent;
  let fixture: ComponentFixture<BalanceContaninerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BalanceContaninerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BalanceContaninerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
