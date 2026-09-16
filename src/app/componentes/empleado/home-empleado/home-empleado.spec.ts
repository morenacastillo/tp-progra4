import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeEmpleado } from './home-empleado';

describe('HomeEmpleado', () => {
  let component: HomeEmpleado;
  let fixture: ComponentFixture<HomeEmpleado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeEmpleado],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeEmpleado);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
