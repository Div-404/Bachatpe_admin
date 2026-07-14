import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionuserDiComponent } from './transactionuser-di.component';

describe('TransactionuserDiComponent', () => {
  let component: TransactionuserDiComponent;
  let fixture: ComponentFixture<TransactionuserDiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionuserDiComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TransactionuserDiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
