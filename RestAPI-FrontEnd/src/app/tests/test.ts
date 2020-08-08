/*
import {Subscription} from 'rxjs';
import {EventData} from './../../../models/Event';
import {AuthService} from './../../../services/auth.service';
import {FlashMessagesService} from 'angular2-flash-messages';
import {NgxSpinnerService} from 'ngx-spinner';
import {EventsService} from './../../../services/events.service';
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {catchError, finalize, switchMap, take, tap} from 'rxjs/operators';

@Component({
  selector: 'app-category-events',
  templateUrl: './category-events.component.html',
  styleUrls: ['./category-events.component.css']
})
export class CategoryEventsComponent implements OnInit {

  subRoute: Subscription;
  subEvents: Subscription;

  id: string;
  events: EventData[];
  isFetched = false;
  //paging
  page = 1;
  totalItem: number;

  paramCheck1: string = null;


  constructor(private eventSrv: EventsService,
              private spinner: NgxSpinnerService,
              private flashmessage: FlashMessagesService,
              private authSrv: AuthService,
              private route: ActivatedRoute, private router: Router) {
  }

  ngOnInit() {
    this.getEvents();
  }

  getEvents() {

    // detect for change in categoryID
    this.subRoute = this.route.params
      .pipe
      (
        tap((params) => { // tap operator is a void function that u can do anything before u want to continue the pipe
          this.spinner.show();
          this.id = params.id;
          this.paramCheck1 = this.id;
          // check paging if past category is not equal to new category = need to change the page back to 1 !
          if (this.paramCheck1 !== null && this.paramCheck1 !== params.id) {
            this.page = 1;
          }
        }),
        switchMap(() => { // Switching Observable after the previous one COMPLETES
          return this.eventSrv.getEventsByCategory(this.id, this.page)
            .pipe(
              take(1),
              tap((events: any) => {
                this.events = events.data;
                this.totalItem = events.count;
                console.log('sub!');
                this.isFetched = true;
              }));
        }),
        catchError(err => {// we catch an error from 'this.eventSrv.getEventsByCategory' or 'this.route.params' if there is any error
          if (err.status === 401) {
            this.authSrv.logout();
            return this.router.navigateByUrl('/login');
          }
          const error = err.error.message || err.error.errors[0].msg;
          this.flashmessage.show(error, {cssClass: 'alert-danger text-center font-weight-bold', timeout: 3000});
          setTimeout(() => {
            this.router.navigateByUrl('/');
          }, 3000);
        }),
        finalize(() => { // we call this when the overall Observable Completed or an Error occurred
          this.spinner.hide();
        })
      ).subscribe();
  }

  pageChanged(e) {
    this.page = e;
    //unsubscribe for ReSubscribe again in the func
    this.subEvents.unsubscribe();
    this.subRoute.unsubscribe();
    this.getEvents();
  }

}

*/
