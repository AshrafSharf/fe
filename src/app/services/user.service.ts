import { Http, RequestOptions, Headers } from '@angular/http';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Router } from "@angular/router";
import { Utils } from './../shared/utils';
import { User } from '../shared/interfaces/user';
import { Observable } from 'rxjs/Observable';
import { LoaderService } from './loader.service';

@Injectable()
export class UserService implements CanActivate {
    
    constructor(
        private router: Router,
        private http: Http,
        private loaderService:LoaderService) {}

    
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {  
        if (sessionStorage.getItem('user_auth_status') == '1') {
            return true;
        }
        this.router.navigate(['login']);
        return false;

    }

    getUserByName(username:String) {
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeUser) + "/username/" + username;
        let header = new Headers({'Content-Type':'application/json'});
        return this.http
                .get(url, Utils.getRequestOptions())
                .map(result => {
                    this.loaderService.hide();
                    return result.json();
                });
    }

    authenticateUser(username:String, password:String) {
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeLogin);
        let body = { userName: username, password: password };

        let header = new Headers({'Content-Type':'application/json'});
        let requestOptions = new RequestOptions( {headers:header, withCredentials: true} );

        return this.http
                .post(url, body, requestOptions)
                .map(result => {
                    console.log (result);
                    this.loaderService.hide();
                    return result.json();
                })
                .catch((error: any) => {
                    this.loaderService.hide();
                    return Observable.throw(error);
                });
    }

    getOwners(callback: (users:User[])=> void) {
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeUser);
        this.http
            .get(url, Utils.getRequestOptions())
            .map(result => result.json())
            .subscribe(result => {
                this.loaderService.hide();
                callback(result.data as User[]);
            });
    }

    createUser(userName:String, password:String) {
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeUser);
        let body = { userName: userName, password: password};

        return this.http
            .post(url, body, Utils.getRequestOptions())
            .map(result => {
                this.loaderService.hide()
                return result.json();
            });
    }

    updateUser(id:String, userName:String, password:String, roleId: String, projectId: String, branchId: String) {
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeUser) + "/" + id;

        let body = { id: id, userName: userName, password: password, roleId: roleId, projectId: projectId, branchId: branchId };
        return this.http
            .put(url, body, Utils.getRequestOptions())
            .map(result => {
                this.loaderService.hide()
                return result.json();
            });
    }

    deleteUser(id) {
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeUser) + "/" + id;
        return this.http
            .delete(url, Utils.getRequestOptions())
            .map(result => {
                this.loaderService.hide()
                return result.json();
            });
    }

    getUsers() {
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeUser);
        return this.http
            .get(url, Utils.getRequestOptions())
            .map(result => {
                this.loaderService.hide()
                return result.json();
            });
    }
    
    getLoggedInUser() {
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeUser) + "/username/" + Utils.getUserName();
        return this.http
            .get(url, Utils.getRequestOptions())
            .map(result => {
                this.loaderService.hide()
                return result.json();
            });
    }
    
}
