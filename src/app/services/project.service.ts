import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Utils } from '../shared/utils';
import { LoaderService } from './loader.service';
import { User } from "../shared/interfaces/user";


@Injectable()
export class ProjectService {
    constructor(
        private http: Http,
        private loaderService:LoaderService) { }

    // get all projects
    getProjects() {
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeProject);
        return this.http
                .get(url, Utils.getRequestOptions())
                .map(result => {
                    this.loaderService.hide()
                    return result.json();
                });
    }

    // create a new project
    createProject(title:String, description:String, ownerId:String, ownerName:String, isPrivate:Boolean, usersWithAccess:Array<User> ) {
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeProject);
        let body = { title: title, description: description, ownerId: ownerId, ownerName: ownerName, isPrivate: isPrivate, usersWithAccess: usersWithAccess };

        return this.http
                .post(url, body, Utils.getRequestOptions())
                .map(result => {
                    this.loaderService.hide()
                    return result.json();
                });
    }

    // get details
    getDetails(id:String) {
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeProject) + "/" + id;
        return this.http
            .get(url, Utils.getRequestOptions())
            .map(result => {
                this.loaderService.hide()
                return result.json();
            });
    }

    getProjectByName(title:String){
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeProject) + "/search/" + title;
        return this.http
            .get(url, Utils.getRequestOptions())
            .map(result => {
                this.loaderService.hide()
                return result.json();
            });
    }

    // update project
    updateProject(id:String, title:String, description:String, owner: String, isPrivate: Boolean, usersWithAccess: Array<User>) {
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeProject) + "/" + id;

        let body = { id: id, title: title, description: description, ownerId: owner, isPrivate: isPrivate, usersWithAccess: usersWithAccess };
      //  console.log(body);
        return this.http
                .put(url, body, Utils.getRequestOptions())
                .map(result => {
                    this.loaderService.hide()
                    return result.json();
                });
    }

    // delete project
    deleteProject(id) {
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeProject) + "/" + id;
        return this.http
                .delete(url, Utils.getRequestOptions())
                .map(result => {
                    this.loaderService.hide()
                    return result.json();
                });
    }
}
