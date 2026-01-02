import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { CarritoComponent } from './carrito.component';
import { ServicoService } from '../servico.service';

describe('CarritoComponent', () => {
  let component: CarritoComponent;
  let fixture: ComponentFixture<CarritoComponent>;

  // ===== MOCK SERVICIO =====
  const servicioMock = {
    obtenerDatos: jest.fn().mockReturnValue(of([])),
    stripe: jest.fn()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarritoComponent],
      providers: [
        { provide: ServicoService, useValue: servicioMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CarritoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
