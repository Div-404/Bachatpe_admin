import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionuserMainComponent } from './transactionuser-main.component';

describe('TransactionuserMainComponent', () => {
  let component: TransactionuserMainComponent;
  let fixture: ComponentFixture<TransactionuserMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionuserMainComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TransactionuserMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
