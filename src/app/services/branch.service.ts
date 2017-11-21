import { Utils } from './../shared/utils';
import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class BranchService {
    constructor(private http: Http) { }
    
    // get all branches
    getBranches(projectId:String) {
        let url = Utils.createUrl(Utils.routeBranch) + "/project/" + projectId;
        return this.http
                .get(url)
                .map(result => result.json());
    }

    // get branch details
    getDetails(branchId:String) {
        let url = Utils.createUrl(Utils.routeBranch) + "/" + branchId;
        return this.http
                .get(url)
                .map(result => result.json());
    }

    deleteBranch(branchId:String) {
        let url = Utils.createUrl(Utils.routeBranch) + "/" + branchId;
        return this.http
                .delete(url)
                .map(result => result.json());
    }

    // create a new project
    createBranch(title:String, description:String, projectId:String,
        actuals:String, startTime:String, endTime:String, 
        owner:String, timeUnit:String) {

        let url = Utils.createUrl(Utils.routeBranch);

        let body = { 
            projectId:projectId,
            title: title, 
            ownerId: owner,
            ownerName: owner,
            description: description, 
            startTime: startTime,
            endTime: endTime,
            actuals: actuals,
            timeUnit: timeUnit,
            isMaster:false 
        };
        console.log(body);

        let header = new Headers({'Content-Type':'application/json'});
        let requestOptions = new RequestOptions( {headers:header} );

        return this.http
                .post(url, body, requestOptions)
                .map(result => result.json());
    }

    // update project
    updateBranch(title:String, description:String, projectId:String,
        actuals:String, startTime:String, endTime:String, 
        owner:String, timeUnit:String, branchId:String) {
        let url = Utils.createUrl(Utils.routeBranch) + "/" + branchId;

        let body = { 
            projectId:projectId,
            title: title, 
            ownerId: owner,
            ownerName: owner,
            description: description, 
            startTime: startTime,
            endTime: endTime,
            actuals: actuals,
            timeUnit: timeUnit,
            isMaster:false 
        };

        console.log(body);
        
        let header = new Headers({'Content-Type':'application/json'});
        let requestOptions = new RequestOptions( {headers:header} );

        return this.http
                .put(url, body, requestOptions)
                .map(result => result.json());
    }
}