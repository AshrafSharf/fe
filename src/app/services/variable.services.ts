import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Utils } from '../shared/utils';

@Injectable()
export class AppVariableService {
    
    constructor(private http: Http) { }
    
    public createVariable(body) {
        let url = Utils.createUrl(Utils.routeVariable);
        console.log(body);

        let header = new Headers({'Content-Type':'application/json'});
        let requestOptions = new RequestOptions( {headers:header} );

        return this.http
                .post(url, body, requestOptions)
                .map(result => result.json());
    }

    public getVariables(branchId) {
        let url = Utils.createUrl(Utils.routeVariable) + "/" + branchId;
        
        return this.http
                .get(url)
                .map(response => {
                    return response.json()
                });
    }
}