import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Utils } from '../shared/utils';


@Injectable()
export class ProjectService {
    constructor(private http: Http) { }
    
    // get all projects
    getProjects() {
        let url = Utils.createUrl(Utils.routeProject);
        return this.http
                .get(url, Utils.getRequestOptions())
                .map(result => result.json());
    }

    // create a new project
    createProject(title:String, description:String, owner:String) {
        let url = Utils.createUrl(Utils.routeProject);
        let body = { title: title, description: description, ownerId: owner, ownerName: owner };

        return this.http
                .post(url, body, Utils.getRequestOptions())
                .map(result => result.json());
    }

    // get details
    getDetails(id:String) {
        let url = Utils.createUrl(Utils.routeProject) + "/" + id;
        return this.http
            .get(url, Utils.getRequestOptions())
            .map(result => result.json());
    }

    // update project
    updateProject(id:String, title:String, description:String, owner: String) {
        let url = Utils.createUrl(Utils.routeProject) + "/" + id;

        let body = { id: id, title: title, description: description, ownerId: owner };
        console.log(body);

        return this.http
                .put(url, body, Utils.getRequestOptions())
                .map(result => {
                    console.log('result', result);
                    result.json()
                });
    }

    // delete project
    deleteProject(id) {
        let url = Utils.createUrl(Utils.routeProject) + "/" + id;
        return this.http
                .delete(url, Utils.getRequestOptions())
                .map(result => result.json());
    }
}