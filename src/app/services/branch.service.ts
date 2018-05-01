import { Utils } from './../shared/utils';
import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { LoaderService } from './loader.service';

@Injectable()
export class BranchService {
    constructor(
        private http: Http,
        private loaderService:LoaderService) { }
    
    // get all branches from project
    getBranches(projectId:String) {
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeBranch) + "/project/" + projectId;
        return this.http
                .get(url, Utils.getRequestOptions())
                .map(result => {
                    this.loaderService.hide()
                    return result.json();
                });
    }

    // get branch details by id
    getDetails(branchId:String) {
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeBranch) + "/" + branchId;
        return this.http
                .get(url, Utils.getRequestOptions())
                .map(result => {
                    this.loaderService.hide()
                    return result.json();
                });
    }

    getBranchByName(projectId: String, branchName:String){
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeBranch) + "/" + projectId +"/" + branchName;
        return this.http
            .get(url, Utils.getRequestOptions())
            .map(result => {
                this.loaderService.hide()
                return result.json();
            });
    }

    // delete branch by id
    deleteBranch(branchId:String) {
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeBranch) + "/" + branchId;
        return this.http
                .delete(url, Utils.getRequestOptions())
                .map(result => {
                    this.loaderService.hide()
                    return result.json();
                });
    }

    // create a new project
    createBranch(title:String, description:String, projectId:String,
        actuals:String, startTime:String, endTime:String, 
        owner:String, timeUnit:String) {

        this.loaderService.show();
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
            isMaster:false,
            isPrivate: false

        };
        console.log(body);
        return this.http
                .post(url, body, Utils.getRequestOptions())
                .map(result => {
                    this.loaderService.hide()
                    return result.json();
                });
    }

    // update project
    updateBranch(title:String, description:String, projectId:String,
        actuals:String, startTime:String, endTime:String, 
        owner:String, timeUnit:String, branchId:String) {
        this.loaderService.show();
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
            isMaster:false,
            isPrivate: false
        };

        console.log(body);
        
        return this.http
                .put(url, body, Utils.getRequestOptions())
                .map(result => {
                    this.loaderService.hide()
                    return result.json();
                });
    }
}