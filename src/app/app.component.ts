import { Component } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app'; 
  selectedMenu = 'home'; // 'form', 'home'
  
  constructor(router: Router) {
    router.events
        .subscribe(event => {
          if (event instanceof NavigationStart) {
            console.log(event);
            this.selectedMenu = event.url.substr(1);
          }
        });
  }
}
