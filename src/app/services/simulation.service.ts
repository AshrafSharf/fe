import { Utils } from './../shared/utils';
import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { LoaderService } from './loader.service';

@Injectable()
export class SimulationService {
    constructor(
        private http: Http,
        private loaderService:LoaderService) { }
    
    // get all simulations from project
    getSimulationsByProject(projectId:String) {
        this.loaderService.show();
        let url = Utils.createModelUrl(Utils.routeSimulation) +"/modelproject/" + projectId;
        return this.http
                .get(url, Utils.getRequestOptions())
                .map(result => {
                     this.loaderService.hide()
                    return result.json();
                });
    }

    // get simulation details by id
    getDetails(SimulationId:String) {
        this.loaderService.show();
        let url = Utils.createModelUrl(Utils.routeSimulation) + "/" + SimulationId;
        return this.http
                .get(url, Utils.getRequestOptions())
                .map(result => {
                    this.loaderService.hide()
                    return result.json();
                });
    }


    // delete simulation by id
    deleteSimulation(simulationId:string) {
        this.loaderService.show();
        let url = Utils.createModelUrl(Utils.routeSimulation) + "/" + simulationId;
        return this.http
                .delete(url, Utils.getRequestOptions())
                .map(result => {
                    this.loaderService.hide()
                    return result.json();
                });
    }

    // create a new simulation
    createSimulation(body) {

        this.loaderService.show();
        let url = Utils.createModelUrl(Utils.routeSimulation);
        console.log(body);
        return this.http
                .post(url, body, Utils.getRequestOptions())
                .map(result => {
                    this.loaderService.hide()
                    return result.json();
                });
    }

    // update simulation
    updateSimulation(body, id) {
        this.loaderService.show();
        let url = Utils.createModelUrl(Utils.routeSimulation) + "/" + id;
        
        return this.http
                .put(url, body, Utils.getRequestOptions())
                .map(result => {
                    this.loaderService.hide()
                    return result.json();
                });
    }

    //run the simulation 
    runSimulation(id){
        this.loaderService.show();
        let url = Utils.createModelUrl(Utils.routeSimulation) + "/run/" + id;
        return this.http
        .get(url, Utils.getRequestOptions())
        .map(result => {
            this.loaderService.hide()
            console.log(result);
            return result.json();
        });
    }
}