import { Http, RequestOptions, Headers } from '@angular/http';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Router } from "@angular/router";
import { Utils } from './../shared/utils';
import { User } from '../shared/interfaces/user';
import { Observable } from 'rxjs/Observable';
import { LoaderService } from './loader.service';

@Injectable()
export class SettingsService {

    constructor(
        private http: Http,
        private loaderService:LoaderService) { }

    getSettings() {
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeSettings);
        return this.http
                .get(url, Utils.getRequestOptions())
                .map(result => {
                    this.loaderService.hide()
                    return result.json();
                });
    }

    saveSettings(settings) {
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeSettings);
        let body = settings;

        return this.http
                .post(url, body, Utils.getRequestOptions())
                .map(result => {
                    this.loaderService.hide()
                    return result.json();
                });
    }

    updateSettings(settings){
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeSettings);
        let body = settings;

        return this.http
            .put(url, body, Utils.getRequestOptions())
            .map(result => {
                this.loaderService.hide()
                return result.json();
            });
    }
    
    getLocal() {
        return Utils.localDev;        
    }

    setToLocal(local) {
        Utils.setToLocal(local);
    }
}