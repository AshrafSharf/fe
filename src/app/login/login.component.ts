import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { Modal } from 'ngx-modialog/plugins/bootstrap';

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
    userName:String = '';
    password:String = '';

    constructor(
        private modal: Modal,
        private ueserService: UserService,
        private router: Router) { }

    ngOnInit() { }

    login() {
        if (this.userName.length == 0) { 
            this.modal.alert().body('Please enter user name').open();
        } else if (this.password.length == 0) { 
            this.modal.alert().body('Please enter password').open();
        } else {
            this.ueserService
                .authenticateUser(this.userName, this.password)
                .subscribe(result => {
                    sessionStorage["user_auth_status"] = "1";
                    this.router.navigate(['home']);
                }, 
                error => {
                    this.modal.alert()
                    .title('error')
                    .body('Invalid user name or password')
                    .open();
                });
        }
    }

    toggleCheckbox(event) {

    }
}