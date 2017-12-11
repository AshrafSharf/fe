import { Http, RequestOptions, Headers } from '@angular/http';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Router } from "@angular/router";
import { Utils } from './../shared/utils';
import { User } from '../shared/interfaces/user';

@Injectable()
export class UserService implements CanActivate {
    
    constructor(
        private router: Router,
        private http: Http) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        console.log("canActiviate");
        if (sessionStorage.getItem('user_auth_status') == '1') {
            return true;
        }
        console.log("canActiviate");
        
        this.router.navigate(['login']);
        return false;
    }

    authenticateUser(username:String, password:String) {
        let url = Utils.createUrl(Utils.routeLogin);
        let body = { userName: username, password: password };

        let header = new Headers({'Content-Type':'application/json'});
        let requestOptions = new RequestOptions( {headers:header} );

        return this.http
                .post(url, body, requestOptions)
                .map(result => result.json());
    }

    getOwners(callback: (users:User[])=> void) {
        let url = Utils.createUrl(Utils.routeUser);
        this.http
            .get(url)
            .map(result => result.json())
            .subscribe(result => {
                callback(result.data as User[]);
            });
    }

}