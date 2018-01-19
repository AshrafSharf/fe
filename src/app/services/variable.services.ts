import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Utils } from '../shared/utils';

@Injectable()
export class AppVariableService {
    
    constructor(private http: Http) { }

    public getBreakdownVariables(branchId, type) {
        let url = Utils.createUrl(Utils.routeVariable + "/findByVariableType/" + branchId + "/"  + type);
        return this.http
                .get(url, Utils.getRequestOptions())
                .map(result => result.json());
    }
    
    public createVariable(body) {
        let url = Utils.createUrl(Utils.routeVariable);
        console.log(body);
        return this.http
                .post(url, body, Utils.getRequestOptions())
                .map(result => result.json());
    }

    public updateVariable(body, id) {
        let url = Utils.createUrl(Utils.routeVariable) + "/" + id;
        console.log(body);
        return this.http
                .put(url, body, Utils.getRequestOptions())
                .map(result => result.json());
    }

    public getVariables(branchId) {
        let url = Utils.createUrl(Utils.routeVariable) + "/" + branchId;
        console.log(url);
        return this.http
                .get(url, Utils.getRequestOptions())
                .map(response => {
                    return response.json()
                });
    }

    public calculateVariableValues(id) {
        let url = Utils.createUrl(Utils.routeVariable) + "/docalc/" + id;
        
        return this.http
                .get(url, Utils.getRequestOptions())
                .map(response => {
                    return response.json()
                });
    }

    public extendValuesForMonths(id, index) {
        let url = Utils.createUrl(Utils.routeVariable) + "/doextendcalc/" + id + "/" + index;
        return this.http
                .get(url, Utils.getRequestOptions())
                .map(response => {
                    return response.json()
                });
    }

    public getVariablesForSuggestions(branchId) {
        let url = Utils.createUrl(Utils.routeVariable) + "/" + branchId + "/name";
        
        return this.http
                .get(url, Utils.getRequestOptions())
                .map(response => {
                    return response.json()
                });
    }

    public deleteVariable(id) {
        let url = Utils.createUrl(Utils.routeVariable) + "/" + id;
        return this.http
                .delete(url, Utils.getRequestOptions())
                .map(result => result.json());
    }
}