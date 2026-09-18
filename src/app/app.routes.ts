import { Routes } from '@angular/router';
import { accesoCliente } from './guards/role-accesoCliente-guard';
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
        { path: '', loadComponent: () => import('./componentes/admin/home-admin/home-admin').then(m => m.HomeAdmin) }
      ]
    },

    {
      path: 'home-cliente',
      loadComponent: () => import('./componentes/compartidos/layout/layout').then(m => m.Layout),
      canMatch: [accesoCliente],
      children: [
        { path: '', loadComponent: () => import('./componentes/cliente/home-cliente/home-cliente').then(m => m.HomeCliente) }
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
