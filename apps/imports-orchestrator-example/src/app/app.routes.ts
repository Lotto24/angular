import { Route } from '@angular/router';
import { HomeComponent } from './pages/home.component';
import { FruitComponent } from './pages/fruit.component';
import { TabComponent } from './pages/tab.component';
import { IOComponent } from './pages/io.component';
import { ServiceComponent } from './pages/service.component';
import { DeferComponent } from './pages/defer.component';
import { Defer2Component } from './pages/defer2.component';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: 'defer',
    component: DeferComponent,
  },
  {
    path: 'defer2',
    component: Defer2Component,
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'io',
    component: IOComponent,
  },
  {
    path: 'fruit',
    component: FruitComponent,
  },
  {
    path: 'tab',
    component: TabComponent,
  },
  {
    path: 'service',
    component: ServiceComponent,
  },
];
