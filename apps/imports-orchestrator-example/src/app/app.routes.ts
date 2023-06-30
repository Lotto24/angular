import { Route } from '@angular/router';
import { HomeComponent } from './pages/home.component';
import { FruitComponent } from './pages/fruit.component';
import { TabComponent } from './pages/tab.component';
import { IOComponent } from './pages/io.component';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
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
];
