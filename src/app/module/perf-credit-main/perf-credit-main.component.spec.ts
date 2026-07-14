import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfCreditMainComponent } from './perf-credit-main.component';

describe('PerfCreditMainComponent', () => {
  let component: PerfCreditMainComponent;
  let fixture: ComponentFixture<PerfCreditMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfCreditMainComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PerfCreditMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
