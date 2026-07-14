import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkHistoryComponent } from './bulk-history.component';

describe('BulkHistoryComponent', () => {
  let component: BulkHistoryComponent;
  let fixture: ComponentFixture<BulkHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkHistoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BulkHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
