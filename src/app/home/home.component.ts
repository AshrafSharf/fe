import { Component, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {
    selectedMenu = 'home';
    
    constructor(private router: Router) {
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
      sessionStorage.removeItem('user_auth_status');
      this.router.navigate(['login']);
    }
}