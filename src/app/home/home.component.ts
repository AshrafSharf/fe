import { Component, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { Modal } from 'ngx-modialog/plugins/bootstrap';
import { Utils } from '../shared/utils';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {
    selectedMenu = 'home';
    userName = Utils.getUserName();
    
    constructor(
      private modal:Modal,       
      private router: Router) {
      router.events
          .subscribe(event => {
            if (event instanceof NavigationStart) {
              console.log(event);
              this.selectedMenu = event.url.substr(1);
            }
          });
    }
    
    ngOnInit() { }

    logout(event) {
      event.preventDefault();
      const dialog =
          this.modal
              .confirm()
              .title('Confirmation')
              .body('Are you sure you want logout?')
              .okBtn('Yes').okBtnClass('btn btn-primary')
              .cancelBtn('No')
              .open();
      dialog.then(promise => {
          promise.result.then(result => {
            sessionStorage.removeItem('user_auth_status');
            this.router.navigate(['login']);
          });
      });
    }
}