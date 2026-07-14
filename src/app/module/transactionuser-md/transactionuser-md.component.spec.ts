import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionuserMdComponent } from './transactionuser-md.component';

describe('TransactionuserMdComponent', () => {
  let component: TransactionuserMdComponent;
  let fixture: ComponentFixture<TransactionuserMdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionuserMdComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TransactionuserMdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
