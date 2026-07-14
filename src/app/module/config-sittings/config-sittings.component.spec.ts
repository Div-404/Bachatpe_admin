import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigSittingsComponent } from './config-sittings.component';

describe('ConfigSittingsComponent', () => {
  let component: ConfigSittingsComponent;
  let fixture: ComponentFixture<ConfigSittingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigSittingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfigSittingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
