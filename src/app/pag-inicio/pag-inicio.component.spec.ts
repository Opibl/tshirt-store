import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { PagInicioComponent } from './pag-inicio.component';

describe('PagInicioComponent', () => {
  let component: PagInicioComponent;
  let fixture: ComponentFixture<PagInicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,        // 👈 CLAVE
        HttpClientTestingModule,    // 👈 por ServicoService
        PagInicioComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PagInicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
