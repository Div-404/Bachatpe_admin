import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceOverallComponent } from './balance-overall.component';

describe('BalanceOverallComponent', () => {
  let component: BalanceOverallComponent;
  let fixture: ComponentFixture<BalanceOverallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BalanceOverallComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BalanceOverallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
