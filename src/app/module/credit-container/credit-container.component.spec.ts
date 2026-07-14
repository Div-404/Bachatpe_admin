import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditContainerComponent } from './credit-container.component';

describe('CreditContainerComponent', () => {
  let component: CreditContainerComponent;
  let fixture: ComponentFixture<CreditContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditContainerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreditContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
