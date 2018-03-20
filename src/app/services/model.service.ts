import { Http, RequestOptions, Headers } from '@angular/http';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Router } from "@angular/router";
import { Utils } from './../shared/utils';
import { User } from '../shared/interfaces/user';
import { Observable } from 'rxjs/Observable';
import { LoaderService } from './loader.service';

@Injectable()
export class ModelService {

    constructor(
        private router: Router,
        private http: Http,
        private loaderService:LoaderService) {}


    public createModel(body) {
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeModel);
        console.log(body);
        return this.http
                .post(url, body, Utils.getRequestOptions())
                .map(result => {
                    this.loaderService.hide();
                    return result.json();
                });
    }

    public updateModel(id, body) {
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeModel) + '/' + id;
        console.log(body);
        return this.http
                .put(url, body, Utils.getRequestOptions())
                .map(result => {
                    this.loaderService.hide();
                    return result.json();
                });
    }

    public getModel(id) {
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeModel) + "/model/" + id;
        return this.http
            .get(url, Utils.getRequestOptions())
            .map(result => {
                this.loaderService.hide()
                return result.json();
            });
    }

    public deleteModel(modelId) {
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeModel) + "/" + modelId;
        return this.http
                .delete(url, Utils.getRequestOptions())
                .map(result => {
                    this.loaderService.hide()
                    return result.json();
                });
    }

    public getModels(branchId) {
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeModel + "/" + branchId);
        return this.http
                .get(url, Utils.getRequestOptions())
                .map(result => {
                    this.loaderService.hide();
                    return result.json();
                });
    }
    
}