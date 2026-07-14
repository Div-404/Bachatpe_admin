import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsBalanceComponent } from './reports-balance.component';

describe('ReportsBalanceComponent', () => {
  let component: ReportsBalanceComponent;
  let fixture: ComponentFixture<ReportsBalanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportsBalanceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportsBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
