import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Utils } from '../shared/utils';
import { LoaderService } from './loader.service';


@Injectable()
export class UserGroupService {
    constructor(
        private http: Http,
        private loaderService:LoaderService) { }

    // get all userGroup
    getUserGroup() {
        this.loaderService.show();
        let url = Utils.createUrl(Utils.routeUserGroup);
        return this.http
            .get(url, Utils.getRequestOptions())
            .map(result => {
                this.loaderService.hide()
                return result.json();
            });
    }

}
