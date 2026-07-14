import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLmWkComponent } from './add-lm-wk.component';

describe('AddLmWkComponent', () => {
  let component: AddLmWkComponent;
  let fixture: ComponentFixture<AddLmWkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddLmWkComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddLmWkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
