import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrefRangeComponent } from './pref-range.component';

describe('PrefRangeComponent', () => {
  let component: PrefRangeComponent;
  let fixture: ComponentFixture<PrefRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrefRangeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrefRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
