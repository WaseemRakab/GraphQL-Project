import {Component, OnInit} from '@angular/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Observable} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {select, Store} from '@ngrx/store';
import * as fromApp from '../store/app.reducer';
import {logout} from '../auth/store/auth.actions';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {
  loggedIn: Observable<boolean>;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver,
              private matIconRegistry: MatIconRegistry,
              private domSanitizer: DomSanitizer,
              private store: Store<fromApp.AppState>) {
    this.matIconRegistry.addSvgIcon('menu',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/menu.svg'));
  }

  ngOnInit(): void {
    this.loggedIn = this.store
      .pipe(
        select('auth'),
        map(state => {
          return !!state.user;
        })
      );
  }

  logout() {
    this.store.dispatch(logout());
  }
}
