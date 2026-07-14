import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsBalanceMainComponent } from './reports-balance-main.component';

describe('ReportsBalanceMainComponent', () => {
  let component: ReportsBalanceMainComponent;
  let fixture: ComponentFixture<ReportsBalanceMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportsBalanceMainComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportsBalanceMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
