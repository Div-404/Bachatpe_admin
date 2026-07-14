import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoneyMainComponent } from './money-main.component';

describe('MoneyMainComponent', () => {
  let component: MoneyMainComponent;
  let fixture: ComponentFixture<MoneyMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoneyMainComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MoneyMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
