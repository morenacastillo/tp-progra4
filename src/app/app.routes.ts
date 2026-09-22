import { Routes } from '@angular/router';
import { roleCliente } from './guards/role-accesoCliente-guard';
import { roleAdmin } from './guards/role-admin-guard';
import { roleEmpleado } from './guards/role-empleado-guard';

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
          path: '', loadComponent: () => import('./componentes/admin/home-admin/home-admin').then(m => m.HomeAdmin) 
        },
        {
          path: 'empleados', loadComponent: () => import('./componentes/admin/empleados/empleados').then(m => m.Empleados) 
        },
        {
          path: 'peliculas', loadComponent: () => import('./componentes/admin/gestion-peliculas/gestion-peliculas').then(m => m.GestionPeliculas) 
        },

      ]
    },

    {
      path: 'home-cliente',
      loadComponent: () => import('./componentes/compartidos/layout/layout').then(m => m.Layout),
      canMatch: [roleCliente],
      children: [
        {
          path: '', loadComponent: () => import('./componentes/cliente/home-cliente/home-cliente').then(m => m.HomeCliente) 
        },
        {
          path: 'cartelera', loadComponent: () => import('./componentes/cliente/cartelera/cartelera').then(m => m.Cartelera) 
        },
        {
          path: 'pelicula/:id',
          loadComponent: () => import('./componentes/cliente/detalle-pelicula/detalle-pelicula').then(m => m.DetallePelicula)
        },
      ]
    },

    {
      path: 'home-empleado',
      loadComponent: () => import('./componentes/compartidos/layout/layout').then(m => m.Layout),
      canMatch: [roleEmpleado],
      children: [
        { path: '', loadComponent: () => import('./componentes/empleado/home-empleado/home-empleado').then(m => m.HomeEmpleado) }
      ]
    },

    {
      path: '**',
      redirectTo: "login",
    }
];
