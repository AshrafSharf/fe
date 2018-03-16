import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Utils } from '../shared/utils';
import { LoaderService } from './loader.service';

@Injectable()
export class SystemModelService {
    constructor(
        private http: Http,
        private loaderService:LoaderService) { }

      // get model by model branch id
      getModel(modelBranchId:string) {
        this.loaderService.show();
        let url = Utils.createModelUrl(Utils.routeSystemModel) + "/" + modelBranchId;

        console.log(url);
        return this.http
                .get(url, Utils.getRequestOptions())
                .map(result => {
                    this.loaderService.hide()
                    console.log(result);
                    return result.json();
                });
    }   
}