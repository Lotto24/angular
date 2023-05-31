import {Route} from '@angular/router';
import {HomeComponent} from "./pages/home.component";
import {FruitComponent} from "./pages/fruit.component";

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'fruit',
    component: FruitComponent
  }
];
