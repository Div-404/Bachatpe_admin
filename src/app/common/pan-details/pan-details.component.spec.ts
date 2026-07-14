import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanDetailsComponent } from './pan-details.component';

describe('PanDetailsComponent', () => {
  let component: PanDetailsComponent;
  let fixture: ComponentFixture<PanDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PanDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
