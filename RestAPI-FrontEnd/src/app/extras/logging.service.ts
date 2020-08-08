import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  private onErrorOccurred: Subject<{ errors: string[] }>;

  constructor() {
    this.onErrorOccurred = new Subject<{ errors: string[] }>();
  }

  public logError(errors: { errors: string[] }) {
    this.onErrorOccurred.next(errors);
  }
}
