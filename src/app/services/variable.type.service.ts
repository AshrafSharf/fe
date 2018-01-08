import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Utils } from '../shared/utils';

@Injectable()
export class AppVariableTypeService {
    
    constructor(private http: Http) { }
    
    public createType(body) {
        let url = Utils.createUrl(Utils.routeVariableType);
        console.log(body);
        return this.http
                .post(url, body, Utils.getRequestOptions())
                .map(result => result.json());
    }

    public updateType(body, id) {
        let url = Utils.createUrl(Utils.routeVariableType) + "/" + id;
        console.log(body);
        return this.http
                .put(url, body, Utils.getRequestOptions())
                .map(result => result.json());
    }

    public getTypes() {
        let url = Utils.createUrl(Utils.routeVariableType);
        console.log(url);
        return this.http
                .get(url, Utils.getRequestOptions())
                .map(response => {
                    return response.json()
                });
    }

    public findByType(type) {
        let url = Utils.createUrl(Utils.routeVariableType) + '/searchByType/' + type;
        console.log(url);
        return this.http
                .get(url, Utils.getRequestOptions())
                .map(response => {
                    return response.json()
                });
    }

    public getDetails(id) {
        
    }

    public deleteType(id) {
        let url = Utils.createUrl(Utils.routeVariableType) + "/" + id;
        return this.http
                .delete(url, Utils.getRequestOptions())
                .map(result => result.json());
    }
}