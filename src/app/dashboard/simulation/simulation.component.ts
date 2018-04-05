import { Component, OnInit, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../shared/interfaces/user';
import { Utils } from '../../shared/utils';
import { BranchService } from '../../services/branch.service';
import { Branch } from '../../shared/interfaces/branch';
import { Config } from '../../shared/config';
import { Moment, unix } from 'moment';
import { MatchTableComponenet } from '../component-model/match-table.component';
import { Modal } from 'ngx-modialog/plugins/bootstrap';
import { ModelVariable } from '../../shared/interfaces/model-variable';
import { ModelService } from '../../services/model.service';
import { SystemModel } from '../../shared/interfaces/system-model';
import { ModelBranch } from '../../shared/interfaces/model-branch';
import { SimulationService } from '../../services/simulation.service';
import { InputVariableMatching } from '../../shared/interfaces/input-variable-matching';
import { InputVariable } from "../../shared/modelling/templates/input-variable";
import { Simulation } from '../../shared/interfaces/simulation';
import * as moment from 'moment';

@Component({
    selector: 'simulation',
    templateUrl: './simulation.component.html',
    styleUrls: ['./simulation.component.css']
})

export class SimulationComponent implements OnInit{
    @ViewChild(MatchTableComponenet) matchTable:MatchTableComponenet;

    title:string;
    ownerId:string = "";
    ownerName:string;
    description:string;
    modelBranchId:string;
    forecastBranchId:string;
    startDate:Moment;
    endDate:Moment;
    iterations:string;
    modelId:string = "";

    selectedProjectTitle:string;
    selectedProjectId:string;
    selectedSimulation:Simulation;
    selectedSimulationId:string;
    
    users: User[] = Array<User>();
    forecastBranches: Branch[] = Array<Branch>();
    modelBranches:ModelBranch[] = Array<ModelBranch>();

    inputVariables:InputVariable[] = [];
    variableMatchings:InputVariableMatching[] = [];

     //dd-MM-yyyy hh:mm
     datePickerConfig = { format : Config.getDateFormat() };

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private userService: UserService,
        private forecastBranchService:BranchService,
        private modal:Modal,
        private modelService:ModelService,
        private simulationService:SimulationService) {

    }

    ngOnInit(){
        this.startDate = moment();
        this.endDate = moment();
         // get the project and branch Id from route params
         this.route.queryParams.subscribe(params => {
            this.selectedProjectId = params['projectId'];
            this.selectedProjectTitle = params['title'];
            var simulationId = params['id'];
            if (simulationId == undefined) return;
            this.selectedSimulationId = simulationId;
            this.simulationService
                .getDetails(simulationId)
                .subscribe(result => {
                    this.selectedSimulation = result.data as Simulation;

                    this.title = this.selectedSimulation.title;
                    this.description = this.selectedSimulation.description;
                    this.ownerId = this.selectedSimulation.ownerId;
                    this.startDate = moment(this.selectedSimulation.startDate, "MM-YYYY");
                    this.endDate = moment(this.selectedSimulation.endDate, "MM-YYYY");
                    this.iterations = this.selectedSimulation.iterations
                });
        });

        // get all the users
        this.userService
            .getOwners(users => {
                this.users = users;
                if (this.ownerId == "") {
                    this.ownerId = Utils.getUserId();
                    //this.ownerName = Utils.getUserName();
                }
            });
        
        //TODO: Use APIs rather hard coding model branches
        let modelA = {title:"ModelBranch", id: "test-branch"} as ModelBranch;
        this.modelBranches.push(modelA);


        if(this.modelBranchId==null){
            this.modelBranchId = this.modelBranches[0].id;
        }

        //set date to current date
        if (this.startDate == undefined){
            let date =new Date();
            this.startDate = unix(date.getTime() / 1000);
        }
        this.route.queryParams.subscribe(params => {
            this.selectedProjectId = params['projectId'];
            this.selectedProjectTitle = params['title'];
        });

         //get forecast branches
         this.forecastBranchService.getBranches(this.selectedProjectId)
         .subscribe(result =>{
             this.forecastBranches = result.data;
             this.forecastBranchId = result.data[0].id;
              //get matchings
                this.getInputVariables();
            });
    }

    /** 
     * Imports the forecast variables from the selected date and select forecast and 
     * performs input variable matching
    */
   getForecastVariables(){
       console.log(this.startDate);
       let date:string = this.startDate.format("MM-YYYY");
       this.matchTable.getForecastVariables(this.forecastBranchId, date);
       this.variableMatchings = this.matchTable.inputVariableMatchings;
   }

   /** 
    * Gets rhe input variables of the model and runs input variable matching
   */
   getInputVariables(){
    console.log(this.modelBranchId);
    this.modelService.getModels(this.modelBranchId)
    .subscribe(result=>{
        let model = result.data[1] as SystemModel;
        console.log(result);
       /* if ( model.modelVariableInputList !=undefined){
            this.inputVariables = model.modelVariableInputList;
            this.getForecastVariables();
        }*/
       for (let template of model.modelComponentList){
            if (template.templateName != "GenericMicroServiceTemplate"){
                console.log(template);
                let cptComp = new InputVariable();
                cptComp.order = template.order;
                cptComp.id = template.id;
                cptComp.setName(template.title);
                for (let interf of template.modelComponentInterfaceList){
                    let cptInt = cptComp.addInterface(interf.title);
                    cptInt.id = interf.id;
                    cptInt.componentId = template.id;
                }
                    this.inputVariables.push(cptComp);

            }
        }
        this.getForecastVariables();
    });

   }

   onSave(){
       this.users.forEach(user => {
           if (user.id == this.ownerId) {
               this.ownerName = (user.userName).toString();
           }
       });

       var match = true;
       this.matchTable.inputVariableMatchings.forEach(inputVar => {
           if(inputVar.hasForecastMatch == false) {
               match = false;
           }
       });

       if(!match) {
           this.modal.alert()
               .title("Warning")
               .body("There must be at least 1 matching input variable")
               .open();
       }
       else {
           let body = {
               modelProjectId:this.selectedProjectId,
               title:this.title,
               description:this.description,
               startDate: this.startDate.format(Config.getDateFormat()),
               endDate:this.endDate.format(Config.getDateFormat()),
               ownerId:this.ownerId,
               ownerName:this.ownerName,
               forecastBranchId:this.forecastBranchId,
               modelBranchId:this.modelBranchId,
               iterations:this.iterations,
               inputVariableMatchings:this.variableMatchings
           };

           if (this.selectedSimulation != null) {
               // update existing
               this.simulationService
                   .updateSimulation(body, this.selectedSimulationId)
                   .subscribe(result => {
                       console.log(result);
                       this.clearInputs();

                   });
           } else {
               //create new
               this.simulationService
                   .createSimulation(body)
                   .subscribe(result => {
                       console.log(result);
                       this.clearInputs();
                   });
           }
       }
   }


     // clear inputs
     clearInputs() {
        this.title = "";
        this.description = "";
        this.selectedSimulation = null;
        this.forecastBranchId = "";
        this.modelBranchId="";
        this.startDate = null;
        this.endDate = null;

        this.router.navigate(['/home/simulation-list'], { queryParams: {
            projectId: this.selectedProjectId
        }});
        
    }

}
