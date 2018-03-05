import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Utils } from '../shared/utils';
import { LoaderService } from './loader.service';

@Injectable()
export class AppVariableTypeService {
    
    constructor(
        private http: Http,
        private loaderService:LoaderService) { }
    
    public createType(body) {
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeVariableType);
        return this.http
                .post(url, body, Utils.getRequestOptions())
                .map(result => {
                    this.loaderService.hide();
                    return result.json();
                });
    }

    public updateType(body, id) {
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeVariableType) + "/" + id;
        return this.http
                .put(url, body, Utils.getRequestOptions())
                .map(result => {
                    this.loaderService.hide();
                    return result.json();
                });
    }

    public getTypes() {
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeVariableType);
        console.log(url);
        return this.http
                .get(url, Utils.getRequestOptions())
                .map(response => {
                    this.loaderService.hide();
                    return response.json()
                });
    }

    public findByType(type) {
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeVariableType) + '/searchByType/' + type;
        console.log(url);
        return this.http
                .get(url, Utils.getRequestOptions())
                .map(response => {
                    this.loaderService.hide();
                    return response.json()
                });
    }

    public getDetails(id) {
        
    }

    public deleteType(id) {
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeVariableType) + "/" + id;
        return this.http
                .delete(url, Utils.getRequestOptions())
                .map(result => {
                    this.loaderService.hide();
                    return result.json();
                });
    }
}