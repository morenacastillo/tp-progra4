import { Routes } from '@angular/router';
import { roleCliente } from './guards/role-cliente-guard';
import { roleAdmin } from './guards/role-admin-guard';
import { roleEmpleado } from './guards/role-empleado-guard';
import { butacasElegidas } from './guards/butacas-elegidas';
import { funcionElegida } from './guards/funcion-elegida';


export const routes: Routes = [
    {   
      path: "", 
      redirectTo: "login", 
      pathMatch: "full" 
    },

    {
      path: 'registro',
      loadComponent: () => import('./componentes/publico/registro/registro').then(m => m.Registro),
    },

    {
      path: 'login',
      loadComponent: () => import('./componentes/publico/login/login').then(m => m.Login),
    },

    {
      path: 'ingresoAnonimo',
      loadComponent: () => import('./componentes/publico/ingreso-anonimo/ingreso-anonimo').then(m => m.IngresoAnonimo),
    },

    {
      path: 'home-admin',
      loadComponent: () => import('./componentes/compartidos/layout/layout').then(m => m.Layout),
      canMatch: [roleAdmin],
      children: [
        { 
          path: '', 
          loadComponent: () => import('./componentes/admin/home-admin/home-admin').then(m => m.HomeAdmin) 
        },
        {
          path: 'empleados', 
          loadComponent: () => import('./componentes/admin/gestion-empleados/gestion-empleados').then(m => m.GestionEmpleados) 
        },
        {
          path: 'peliculas', 
          loadComponent: () => import('./componentes/admin/gestion-peliculas/gestion-peliculas').then(m => m.GestionPeliculas) 
        },
        {
          path: 'funciones', 
          loadComponent: () => import('./componentes/admin/gestion-funciones/gestion-funciones').then(m => m.GestionFunciones) 
        },
        {
          path: 'salas', 
          loadComponent: () => import('./componentes/admin/gestion-salas/gestion-salas').then(m => m.GestionSalas) 
        },
        {
          path: 'candy', 
          loadComponent: () => import('./componentes/admin/gestion-candy/gestion-candy').then(m => m.GestionCandy) 
        },
        {
          path: 'combos', 
          loadComponent: () => import('./componentes/admin/gestion-combos/gestion-combos').then(m => m.GestionCombos) 
        },
        {
          path: 'cupones', 
          loadComponent: () => import('./componentes/admin/gestion-cupones/gestion-cupones').then(m => m.GestionCupones) 
        },
        {
          path: 'logs', 
          loadComponent: () => import('./componentes/admin/log-actividad/log-actividad').then(m => m.LogActividad) 
        },
      ]
    },

    {
      path: 'home-cliente',
      loadComponent: () => import('./componentes/compartidos/layout/layout').then(m => m.Layout),
      canMatch: [roleCliente],
      children: [
        {
          path: '', 
          loadComponent: () => import('./componentes/cliente/home-cliente/home-cliente').then(m => m.HomeCliente) 
        },
        {
          path: 'cartelera', 
          loadComponent: () => import('./componentes/cliente/cartelera/cartelera').then(m => m.Cartelera) 
        },
        {
          path: 'cartelera/:id',
          loadComponent: () => import('./componentes/cliente/detalle-pelicula/detalle-pelicula').then(m => m.DetallePelicula)
        },
        {
          path: 'butacas/:id',
          loadComponent: () => import('./componentes/cliente/mapa-butacas/mapa-butacas').then(m => m.MapaButacas),
          canActivate: [funcionElegida]
        },
        {
          path: 'candy',
          loadComponent: () => import('./componentes/cliente/compra-candy/compra-candy').then(m => m.CompraCandy),
          canActivate: [butacasElegidas]
        },
        {
          path: 'carrito',
          loadComponent: () => import('./componentes/cliente/compra-carrito/compra-carrito').then(m => m.CompraCarrito),
          canActivate: [butacasElegidas]
        },
        {
          path: 'mi-perfil',
          loadComponent: () => import('./componentes/cliente/mi-perfil/mi-perfil').then(m => m.MiPerfil)
          
        },
      ]
    },

    {
      path: 'home-empleado',
      loadComponent: () => import('./componentes/compartidos/layout/layout').then(m => m.Layout),
      canMatch: [roleEmpleado],
      children: [
        { path: '', 
          loadComponent: () => import('./componentes/empleado/home-empleado/home-empleado').then(m => m.HomeEmpleado) }
      ]
    },

    {
      path: '**',
      redirectTo: "login",
    }
];
