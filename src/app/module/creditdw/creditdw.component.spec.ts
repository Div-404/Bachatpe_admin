import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditdwComponent } from './creditdw.component';

describe('CreditdwComponent', () => {
  let component: CreditdwComponent;
  let fixture: ComponentFixture<CreditdwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditdwComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreditdwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
