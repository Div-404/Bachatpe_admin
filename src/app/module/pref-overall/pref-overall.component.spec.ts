import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrefOverallComponent } from './pref-overall.component';

describe('PrefOverallComponent', () => {
  let component: PrefOverallComponent;
  let fixture: ComponentFixture<PrefOverallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrefOverallComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrefOverallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
