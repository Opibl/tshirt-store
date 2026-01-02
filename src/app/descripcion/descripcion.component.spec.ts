import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { DescripcionComponent } from './descripcion.component';
import { ServicoService } from '../servico.service';
import { CARRITOService } from '../carrito.service';

describe('DescripcionComponent', () => {
  let component: DescripcionComponent;
  let fixture: ComponentFixture<DescripcionComponent>;

  // ===== MOCK ACTIVATED ROUTE =====
  const activatedRouteMock = {
    snapshot: {
      paramMap: {
        get: () => '1'
      }
    }
  };

  // ===== MOCK SERVICIO =====
  const productoMock = {
    id: '1',
    nombre: 'Producto Test',
    precio: 100,
    descripcion: 'Descripción de prueba'
  };

  const servicioMock = {
    obtenerDatos: jest.fn().mockReturnValue(of([productoMock])),
    stripe: jest.fn()
  };

  // ===== MOCK CARRITO =====
  const carritoMock = {
    Agregar: jest.fn()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DescripcionComponent],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: ServicoService, useValue: servicioMock },
        { provide: CARRITOService, useValue: carritoMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DescripcionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // dispara ngOnInit
  });

  // ============================
  // CREACIÓN
  // ============================
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ============================
  // CARGA DE DATOS
  // ============================
  it('should load product data on init', () => {
    expect(component.id).toBe('1');
    expect(component.nombre).toBe('Producto Test');
    expect(component.precio).toBe(100);
    expect(component.descripcion).toBe('Descripción de prueba');
    expect(component.productos.length).toBe(1);
  });

  // ============================
  // ADD TO CART
  // ============================
  it('should add product to cart', () => {
    component.addToCart('Producto Test', 100);

    expect(carritoMock.Agregar).toHaveBeenCalledWith({
      id: '1',
      nombre: 'Producto Test',
      precio: 100
    });
  });
});
