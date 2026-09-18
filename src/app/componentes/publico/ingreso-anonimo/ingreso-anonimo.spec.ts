import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IngresoAnonimo } from './ingreso-anonimo';

describe('IngresoAnonimo', () => {
  let component: IngresoAnonimo;
  let fixture: ComponentFixture<IngresoAnonimo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngresoAnonimo],
    }).compileComponents();

    fixture = TestBed.createComponent(IngresoAnonimo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
