import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AepsTransactionComponent } from './aeps-transaction.component';

describe('AepsTransactionComponent', () => {
  let component: AepsTransactionComponent;
  let fixture: ComponentFixture<AepsTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AepsTransactionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AepsTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
