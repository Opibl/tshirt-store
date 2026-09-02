import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { DescripcionComponent } from './descripcion.component';
import { ServicoService } from '../servico.service';
import { CARRITOService } from '../carrito.service';

describe('DescripcionComponent', () => {

  let component: DescripcionComponent;
  let fixture: ComponentFixture<DescripcionComponent>;

  /* =========================
     MOCK ROUTE
  ========================= */

  const activatedRouteMock = {
    snapshot: {
      paramMap: {
        get: jest.fn().mockReturnValue('1')
      }
    }
  };

  /* =========================
     MOCK PRODUCTO
  ========================= */

  const productoMock = {
    id: '1',
    nombre: 'Producto Test',
    precio: 100,
    descripcion: 'Descripción de prueba'
  };

  /* =========================
     MOCK SERVICIO
  ========================= */

  const servicioMock = {
    obtenerDatos: jest.fn().mockReturnValue(of([productoMock])),
    stripe: jest.fn()
  };

  /* =========================
     MOCK CARRITO
  ========================= */

  const carritoMock = {
    Agregar: jest.fn()
  };

  /* =========================
     MOCK ROUTER
  ========================= */

  const routerMock = {
    navigate: jest.fn()
  };

  beforeEach(async () => {

    await TestBed.configureTestingModule({

      imports: [DescripcionComponent],

      providers: [

        {
          provide: ActivatedRoute,
          useValue: activatedRouteMock
        },

        {
          provide: ServicoService,
          useValue: servicioMock
        },

        {
          provide: CARRITOService,
          useValue: carritoMock
        },

        {
          provide: Router,
          useValue: routerMock
        }

      ]

    }).compileComponents();

    fixture = TestBed.createComponent(
      DescripcionComponent
    );

    component = fixture.componentInstance;

    fixture.detectChanges();

  });

  /* =========================
     CREACIÓN
  ========================= */

  it('should create', () => {

    expect(component).toBeTruthy();

  });

  /* =========================
     CARGAR PRODUCTO
  ========================= */

  it('should load product on init', () => {

    expect(component.id).toBe('1');

    expect(component.nombre)
      .toBe('Producto Test');

    expect(component.precio)
      .toBe(100);

    expect(component.descripcion)
      .toBe('Descripción de prueba');

  });

  /* =========================
     ADD TO CART
  ========================= */

  it('should add product to cart', () => {

    component.tallaSeleccionada = 'M';
    component.cantidadSeleccionada = 2;

    component.addToCart();

    expect(carritoMock.Agregar)
      .toHaveBeenCalledWith({

        id: '1',
        nombre: 'Producto Test',
        precio: 100,
        talla: 'M',
        cantidad: 2,
        imagen: ''

      });

  });

  /* =========================
     COMPRAR AHORA
  ========================= */

  it('should start Stripe checkout with the selected product', () => {

    component.tallaSeleccionada = 'L';
    component.cantidadSeleccionada = 1;

    servicioMock.stripe.mockReturnValue(
      of({ url: 'https://checkout.stripe.com/test-session' })
    );

    component.comprarAhora();

    expect(servicioMock.stripe).toHaveBeenCalledWith([
      {
        id: '1',
        nombre: 'Producto Test',
        precio: 100,
        talla: 'L',
        cantidad: 1
      }
    ]);

  });

});