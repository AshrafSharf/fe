import { Utils } from './../shared/utils';
import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';

@Injectable()
export class BranchService {
    constructor(private http: Http) { }
    
    // get all branches from project
    getBranches(projectId:String) {
        let url = Utils.createUrl(Utils.routeBranch) + "/project/" + projectId;
        return this.http
                .get(url, Utils.getRequestOptions())
                .map(result => result.json());
    }

    // get branch details by id
    getDetails(branchId:String) {
        let url = Utils.createUrl(Utils.routeBranch) + "/" + branchId;
        return this.http
                .get(url, Utils.getRequestOptions())
                .map(result => result.json());
    }

    // delete branch by id
    deleteBranch(branchId:String) {
        let url = Utils.createUrl(Utils.routeBranch) + "/" + branchId;
        return this.http
                .delete(url, Utils.getRequestOptions())
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
            description: description, 
            startTime: startTime,
            endTime: endTime,
            actuals: actuals,
            timeUnit: timeUnit,
            isMaster:false 
        };
        console.log(body);
        return this.http
                .post(url, body, Utils.getRequestOptions())
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
            description: description, 
            startTime: startTime,
            endTime: endTime,
            actuals: actuals,
            timeUnit: timeUnit,
            isMaster:false 
        };

        console.log(body);
        
        return this.http
                .put(url, body, Utils.getRequestOptions())
                .map(result => result.json());
    }
}