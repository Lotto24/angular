import { Observable } from 'rxjs';

export function assertObservable(type: any): type is Observable<any> {
  return type.subscribe !== undefined && type.pipe !== undefined;
}
