import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Utils } from '../shared/utils';
import { LoaderService } from './loader.service';

@Injectable()
export class AppVariableService {

    constructor(
        private http: Http,
        private loaderService:LoaderService
    ) { }

    public getBreakdownVariables(branchId, type) {
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeVariable + "/findByVariableType/" + branchId + "/"  + type);
        return this.http
                .get(url, Utils.getRequestOptions())
                .map(result => {
                    this.loaderService.hide();
                    return result.json();
                });
    }

    public createVariable(body) {
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeVariable);
        console.log(body);
        return this.http
                .post(url, body, Utils.getRequestOptions())
                .map(result => {
                    this.loaderService.hide();
                    return result.json();
                });
    }

    public updateVariable(body, id) {
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeVariable) + "/" + id;
        console.log(body);
        return this.http
                .put(url, body, Utils.getRequestOptions())
                .map(result => {
                    this.loaderService.hide();
                    return result.json();
                });
    }

    public getVariables(branchId) {
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeVariable) + "/" + branchId;
        console.log(url);
        return this.http
                .get(url, Utils.getRequestOptions())
                .map(response => {
                    this.loaderService.hide();
                    return response.json()
                });
    }
    
    public getUserAccessVariables(branchId, userId) {
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeVariable) + "/" + branchId + "/user/" + userId;
        console.log(url);
        return this.http
            .get(url, Utils.getRequestOptions())
            .map(response => {
                this.loaderService.hide();
                return response.json()
            });
    }

    public getVariableByName(branchId, varName){
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeVariable) + "/" + branchId+ "/"+varName;
        return this.http
                .get(url, Utils.getRequestOptions())
                .map(response => {
                    this.loaderService.hide();
                    return response.json()
                });
    }

    public gerVariableValuesByDate(branchId, date){
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeVariable) + "/searchbydate/" + branchId + "/" + date;
        return this.http
                .get(url, Utils.getRequestOptions())
                .map(response =>{
                    this.loaderService.hide();
                    console.log(response);
                    return response.json();
                });
    }

    public calculateVariableValues(id) {
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeVariable) + "/docalc/" + id;
        return this.http
                .get(url, Utils.getRequestOptions())
                .map(response => {
                    this.loaderService.hide();
                    return response.json()
                });
    }

    public extendValuesForMonths(id, index) {
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeVariable) + "/doextendcalc/" + id + "/" + index;
        return this.http
                .get(url, Utils.getRequestOptions())
                .map(response => {
                    this.loaderService.hide();
                    return response.json()
                });
    }

    public getCalculationsFor(id, startDate, endDate) {
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeVariable) + "/doextendcalc/" + id + "/" + startDate + "/" + endDate;
        return this.http
                .get(url, Utils.getRequestOptions())
                .map(response => {
                    this.loaderService.hide();
                    return response.json()
                });
    }

    public getVariablesForSuggestions(branchId) {
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeVariable) + "/" + branchId + "/name";
        return this.http
                .get(url, Utils.getRequestOptions())
                .map(response => {
                    this.loaderService.hide();
                    return response.json()
                });
    }

    public deleteVariable(id) {
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeVariable) + "/" + id;
        return this.http
                .delete(url, Utils.getRequestOptions())
                .map(result => {
                    this.loaderService.hide();
                    return result.json()
                });
    }
}
