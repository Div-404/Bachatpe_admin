import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionuserReComponent } from './transactionuser-re.component';

describe('TransactionuserReComponent', () => {
  let component: TransactionuserReComponent;
  let fixture: ComponentFixture<TransactionuserReComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionuserReComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TransactionuserReComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
