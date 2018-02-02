import { Http, RequestOptions, Headers } from '@angular/http';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Router } from "@angular/router";
import { Utils } from './../shared/utils';
import { User } from '../shared/interfaces/user';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class SettingsService {

    constructor(private http: Http) { }

    getSettings() {
        let url = Utils.createUrl(Utils.routeSettings);
        return this.http
                .get(url, Utils.getRequestOptions())
                .map(result => result.json());
    }

    saveSettings(settings) {
        let url = Utils.createUrl(Utils.routeSettings);
        let body = settings;

        return this.http
                .post(url, body, Utils.getRequestOptions())
                .map(result => result.json());
    }

}