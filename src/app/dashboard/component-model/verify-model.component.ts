import { Component, OnInit, AfterViewInit, ViewChild, Output } from '@angular/core';
import { Branch } from '../../shared/interfaces/branch';
import { BranchService } from '../../services/branch.service';
import { MatchTableComponenet } from './match-table.component';
import { Modal } from 'ngx-modialog/plugins/bootstrap';
import { ActivatedRoute, Router } from "@angular/router";
import {Location} from "@angular/common";

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Layer, Stage, Node, Shape, Rect, Transform, Circle, Star, RegularPolygon, Label, Tag, Text, Group, Arrow  } from 'konva';
import { StageComponent } from 'ng2-konva';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { Moment } from 'moment';
import { AppVariableService } from '../../services/variable.services';
import { TemplateInterface, Template, Connection, ConnectorType } from '../component-model/templates/templates';
import { SystemModel } from '../../shared/interfaces/system-model';
import { Config } from '../../shared/config';
import { ComponentModel } from '../../shared/interfaces/component.model';
import { MicroServiceTemplate } from './templates/micro.service.template';
import { StaticTemplate } from './templates/static.template';
import { SingleInterfaceTemplate } from './templates/single.interface.template';
import { ModelService } from '../../services/model.service';
import { CircleShape } from './shapes/circle.shape';
import { DiamondShape } from './shapes/diamond.shape';
import { SquareShape } from './shapes/square.shape';
import { TriangleShape } from './shapes/triangle.shape';
import { InputTemplate } from './templates/input.template';
import { Ec2ComponentTemplate } from './templates/ec2.component.template';
import { ModelComponent } from '../../shared/interfaces/model-component';
import { SimulationService } from '../../services/simulation.service';

@Component({
    selector: 'verify-model',
    templateUrl: './verify-model.component.html',
    styleUrls: ['./verify-model.component.css']
})

export class VerifyModelComponent implements OnInit, AfterViewInit {
    @ViewChild(MatchTableComponenet) matchTable:MatchTableComponenet;
    @ViewChild(StageComponent) stageComponent: StageComponent;

    private stage: Stage;
    private layer: Layer;
    
    branches:Branch[] = Array<Branch>();
    models:SystemModel[] = Array<SystemModel>();
    simOutput:string;
    forecastBranchId:String=null;
    
    selectedForecastBranch:String = null
    selectedForecastBranchId:String=null;
	datePickerConfig = { format: Config.getDateFormat() };
    selectedDate:Moment;
    selectedModelId:string = null;
    systemModel:SystemModel = null;
    selectedModel = null;
    modelTitle:string = "";

    // list of templatea
    public templates: Array<Template> = new Array<Template>();
    public selectedTemplate:Template;
    
     // drawing area
    public width = 4000;
    public height = 4000;
    private fontSize = 15;

    inputVars:ModelComponent[] = new Array<ModelComponent>();

    //graphical arrow info
    public connectionSourceInterface: string = '';
    public connectionTargetInterface: string = '';
    private connections:Connection[] = new Array<Connection>();


     public configStage = Observable.of({
        width: this.width,
        height: this.height
    });

    constructor(
        private branchService:BranchService,
        private modal:Modal,
        private variableService:AppVariableService,
        private modelService:ModelService,
        private simService:SimulationService,
        private route:ActivatedRoute,
        private router:Router,
        private location: Location) {

    }

    ngOnInit() { 
        //TODO: Use selected Project ID. Currently models are not being associated with projects or branches
        this.reloadBranches("5aa31b14d49fee0db47f67c3");
        this.getSelectedModel();

    }

    ngAfterViewInit(){
     
    }

    getSelectedModel(){
        this.route
        .queryParams
        .subscribe(params => {
            var id = params["id"];
            console.log("id", id);
            if (id == undefined) return;
            this.selectedModelId = id;
            this.loadSelectedModel();
        });  
    }

    /**
     * Retrieves the system model from db 
     */
    loadSelectedModel(){
        console.log (this.selectedModelId);
        this.modelService.getModel(this.selectedModelId)
        .subscribe(result =>{
            this.systemModel = result.data as SystemModel
            console.log(this.systemModel);
            this.modelTitle = this.systemModel.title;
            this.drawDiagram(this.selectedModelId);
            this.getInputVariables();
        });
    }

    /** 
     * Set up the System Model environment
    */
    getInputVariables(){
        for (let component of this.systemModel.modelComponentList){
            let cptComp;
            if (component.templateName == "InputTemplate" ){
                //give input variables name for matching, along with a display name      
                this.inputVars.push(component);
            }
        }
    }

    /** 
     * Import the values of forecast variables of a branch on a particular date
    */
    onImportForecastVariables(){
        this.forecastBranchId = this.selectedForecastBranch;
        console.log(this.selectedDate);
        let date:string = this.selectedDate.format("MM-YYYY");
        console.log(date);
        this.matchTable.getForecastVariables(this.forecastBranchId, date);
    }

    /**
     * Run the simulation on the environment
     */
    onRunSimulation(){
        //dont run simulation if a forecast branch has not been inported
        if (this.matchTable.inputVariableMatchings.length == 0){
            this.modal.alert()
            .title("Cannot Run Simulation")
            .body("Forecast variables need to be imported first")
            .open();
            return;
        }

        //show warning if no value defined for an input variable
        let inputVarValues:{[key:string]:number} = {};
        let matchings= [];
        for (let inputVar of this.matchTable.inputVariableMatchings){
            if (inputVar.hasForecastMatch == false
            && inputVar.overrideValue == ""){
                this.modal.alert()
                .title("Cannot Run Simulation")
                .body("Inputs variables without values exist. Either create match these forecast variables\
                 or provide them overide values")
                 .open();
                 return;
            }
  
            /*//set input variable load to the value of the matching forecast variable value
            if (inputVar.forecastValue != null && inputVar.overrideValue == ""){
                inputVarValues[inputVar.inputVariableName] = Number(inputVar.forecastValue);
            }

            //set input variable load to the override value
            else{
                inputVarValues[inputVar.inputVariableName] = Number(inputVar.overrideValue);
            }*/
            let matching = {
                "forecastVariableValue": inputVar.forecastValue,
			    "forecastVariableId": inputVar.forecastVarId,
			    "title": inputVar.inputVariableName,
			    "id":inputVar.inputVarId,
			    "modelId":this.selectedModelId
            }
            matchings.push(matching);
            
            
        }
        let body = {
            "modelInputList": matchings
        }
        console.log(body);
        this.simService.runSimulation(this.selectedModelId, body)
            .subscribe(result =>{
                this.simOutput = result.data;
            });
        //let o = this.environment.runSim();
        //this.simOutput =  this.displayOutput();
    } 

    reloadBranches(projectId:String = null, forceReload = false) {
        var id = projectId;

        if (id != null) {
            this.branchService
                .getBranches(id)
                .subscribe(result => {
                    this.branches = result.data;
                    this.selectedForecastBranch = '';
                        if (this.selectedForecastBranchId != null) {
                            this.selectedForecastBranch = this.selectedForecastBranchId;
                        } else if (this.branches.length > 0) {
                            this.selectedForecastBranch = this.branches[0].id;
                        }
                        console.log("SelectedBranch", this.selectedForecastBranch);
                });             
        }
    }

    public onEdit(){
        this.location.back();
    }

    public cancelModel() {
        this.router.navigate(['home/component_model-list']);
    }


/*TODO create a seperate component for the model diagram functionaly 
so that the the drawing functions below can be removed*/
    drawDiagram(id:string){
        this.route
            .queryParams
            .subscribe(params => {
                var id = params["id"];
                if (id == undefined) return;

                this.modelService
                    .getModel(id)
                    .subscribe(result => {
                        if (result.status == 'OK') {

                            this.selectedModel = result.data as ComponentModel;
                           // this.selectedId = this.selectedModel.id;
                            this.modelTitle = this.selectedModel.title.toString();

                            let connectionList = this.selectedModel.modelInterfaceEndPointsList;
                            
                            // create templates
                            for (let index = 0; index < this.selectedModel.modelComponentList.length; index++) {

                                // create template
                                let tempTemplate = this.selectedModel.modelComponentList[index];
                                var template: Template;
                                if (tempTemplate.templateName == 'Ec2ComponentTemplate') {
                                    template = new Ec2ComponentTemplate(this);
                                } else if (tempTemplate.templateName == 'MicroServiceTemplate') {
                                    template = new MicroServiceTemplate(this);
                                } else if (tempTemplate.templateName == 'StaticTemplate') {
                                    template = new StaticTemplate(this);
                                } else if (tempTemplate.templateName == 'SingleInterfaceTemplate') {
                                    template = new SingleInterfaceTemplate(this);
                                } else if (tempTemplate.templateName == 'InputTemplate') {
                                    template = new InputTemplate(this);
                                } else if (tempTemplate.templateName == 'Circle') {
                                    template = new CircleShape(this);
                                } else if (tempTemplate.templateName == 'Diamond') {
                                    template = new DiamondShape(this);
                                } else if (tempTemplate.templateName == 'Square') {
                                    template = new SquareShape(this);
                                } else if (tempTemplate.templateName == 'Triangle') {
                                    template = new TriangleShape(this);
                                }
                                
                                template.name = tempTemplate.title;


                                // get interfaces from template
                                for (let interfaceIndex = 0;interfaceIndex < tempTemplate.modelComponentInterfaceList.length; interfaceIndex++) {
                                    let tempInterface = tempTemplate.modelComponentInterfaceList[interfaceIndex];

                                    var templateInterface = new TemplateInterface();
                                    templateInterface.name = tempInterface.title;
                                    templateInterface.latency = tempInterface.latency;
                                    

                                    // get properties of interface
                                    for (let propertyIndex = 0; propertyIndex < tempInterface.modelInterfacePropertiesList.length; propertyIndex ++) {
                                        let property = tempInterface.modelInterfacePropertiesList[propertyIndex];
                                        templateInterface.properties.push({ name: property.key, value: property.value});
                                    }

                                    // get downstream interfaces
                                   /* for (let dInterfaceIndex = 0; dInterfaceIndex < tempInterface.modelInterfaceEndPointsList.length; dInterfaceIndex ++) {
                                        let dInterface = tempInterface.modelInterfaceEndPointsList[dInterfaceIndex];
                                        templateInterface.downstreamInterfaces.push( { component: dInterface.outputModelInterfaceId, connectedInterface: dInterface.inputModelInterfaceId });
                                    }*/

                                    for (let connection of connectionList){
                                        if (connection.inputModelInterfaceId == tempInterface.id){

                                            templateInterface.downstreamInterfaces.push( { component: connection.outputComponentName, interface:connection.outputInterfaceName, connectedComponent:connection.inputComponentName, connectedInterface:connection.inputInterfaceName });
                                          //  templateInterface.downstreamInterfaces.push( { component: connection.outputInterfaceName, connectedInterface: connection.inputInterfaceName });

                                        }
                                    }

                                    template.interfaces.push(templateInterface);
                                }

                                // get properties of component
                                if (tempTemplate.modelComponentPropertiesList !=null){
                                    for (let propertyIndex = 0; propertyIndex < tempTemplate.modelComponentPropertiesList.length; propertyIndex ++) {
                                        let property = tempTemplate.modelComponentPropertiesList[propertyIndex];  
                                        template.modelComponentPropertiesList.push({ name: property.key, value: property.value});
                                    }
                                }

                                //get fixed properties of component
                                if (tempTemplate.fixedProperties !=null){
                                    for (let propertyIndex = 0; propertyIndex < tempTemplate.fixedProperties.length; propertyIndex ++) {
                                        let property = tempTemplate.fixedProperties[propertyIndex];
                                        console.log(property);
                                        if (property !=null){
                                            template.fixedProperties.push({ name: property.key, value: property.value});
                                        }
                                    }
                                    console.log(template.fixedProperties);
                                }
                                
                                // save template
                                this.templates.push(template);

                                // draw template
                                let x = 0; let y;
                                if (tempTemplate.modelComponentVisualProperties != null) {
                                    x = parseFloat(tempTemplate.modelComponentVisualProperties.xPosition.toString());
                                    y = parseFloat(tempTemplate.modelComponentVisualProperties.yPosition.toString());
                                }

                                var group = template.createUI(x, y, false);
                                this.addGroup(group);
                            }

                            // create connections
                            for (let index = 0; index < this.selectedModel.modelInterfaceEndPointsList.length; index++) {
                                let tempConnection = this.selectedModel.modelInterfaceEndPointsList[index];

                                let source = this.getTemplateByName(tempConnection.inputComponentName);
                                let target = this.getTemplateByName(tempConnection.outputComponentName);

                                var connection = new Connection();
                                connection.inputComponentName = source.identifier.toString();
                                connection.outputComponentName = target.identifier.toString();
                                connection.inputInterfaceName = tempConnection.inputInterfaceName.toString();
                                connection.outputInterfaceName =  tempConnection.outputInterfaceName.toString();

                                this.connections.push(connection);
                            }

                            this.drawConnections();

                               // create shape templates
                               for (let shape of this.selectedModel.shapesList) {
                                
                                // create shape
                                var template: Template;
                               
                                 if (shape.templateName == 'Circle') {
                                    template = new CircleShape(this);
                                } else if (shape.templateName == 'Diamond') {
                                    template = new DiamondShape(this);
                                } else if (shape.templateName == 'Square') {
                                    template = new SquareShape(this);
                                } else if (shape.templateName == 'Triangle') {
                                     template = new TriangleShape(this);
                                }
                                template.name = shape.title;

                                // save shape
                                this.templates.push(template);

                                // draw template
                                let x = 0; let y;
                                if (shape.modelComponentVisualProperties != null) {
                                    x = parseFloat(shape.modelComponentVisualProperties.xPosition.toString());
                                    y = parseFloat(shape.modelComponentVisualProperties.yPosition.toString());
                                }

                                var group = template.createUI(x, y, false);
                                this.addGroup(group);
                            }


                            //create labels
                            for (let label of this.selectedModel.labelList){
                                this.addLabel(Number(label.xposition), Number(label.yposition), label.text);
                            }

                        }
                        console.log(result);
                    });
            });
    }

    private addGroup(group) {
        this.addEditorEventHandler();
        this.layer.add(group);
        this.layer.draw();
    }

    public addLabel(x?,y?, text?) {
        var st:Stage = this.stage.getStage();
        var layer:Layer = st.getChildren()[0];
        let label;
        if(x !=null && y !=null && text!=null){
            console.log("hello");
            label = new Text({
                x : x,
                y : y,
                text: text,
                fontSize: this.fontSize,
                draggable: true
            });
        }
        layer.add(label);

        layer.draw();
    }

    private addEditorEventHandler() {
        this.stage = this.stageComponent.getStage();
        this.layer = this.stage.getChildren()[0];
    }

    public templateClicked(template: any) {
        if (this.selectedTemplate != null && this.selectedTemplate.identifier != template.identifier) {
            let template = this.getSelectedTemplate();
            template.deselectTemplate();
            
        }
        this.selectedTemplate = template.clone();
       // this.showComponentOutput(template.identifier);
        this.layer.draw(); 
    }

    private getSelectedTemplate() {
        if (this.selectedTemplate != null) {      
            return this.getTemplateById(this.selectedTemplate.identifier);
        }
        return null;
    }

    private getTemplateById(id) {
        for (let index = 0; index < this.templates.length; index++) {
            var template = this.templates[index];
            if (template.identifier == id) {
                return template;
            }
        }

        return null;
    }

    public zoomMinus() {
        var scaleBy = 1.02;
        var oldScale = this.stage.scaleX();

        var newScale = oldScale / scaleBy;
        this.stage.scale({ x: newScale, y: newScale });
        this.width -= 50;
        this.stage.setWidth(this.width);
        this.height -= 50;
        this.stage.setHeight(this.height);
        this.stage.batchDraw();
    }

    public zoomPlus() {
        var scaleBy = 1.02;
        var oldScale = this.stage.scaleX();

        var newScale = oldScale * scaleBy;
        this.stage.scale({ x: newScale, y: newScale });
        this.width += 50;
        this.stage.setWidth(this.width);

        this.height += 50;
        this.stage.setHeight(this.height);

        this.stage.batchDraw();
    }

    public drawConnections() {
        for (var index = 0; index < this.connections.length; index++) {
            var connection = this.connections[index];

            if (connection.arrow) connection.arrow.remove();

            // get source and target to get the  latest positions
            let source = this.getTemplateById(connection.inputComponentName);
            let target = this.getTemplateById(connection.outputComponentName);

            let sourceConnector = source.getConnectorPosition(ConnectorType.RIGHT);
            let targetConnector = target.getConnectorPosition(ConnectorType.LEFT);
            connection.arrow = new Arrow({
                // x: connection.visualProperties.sourceX,
                // y: connection.visualProperties.sourceY,
                // points: [0, 0, connection.visualProperties.targetX - connection.visualProperties.sourceX, 
                //                connection.visualProperties.targetY - connection.visualProperties.sourceY],
                x: sourceConnector.x,
                y: sourceConnector.y,
                points: [0, 0, targetConnector.x - sourceConnector.x, targetConnector.y - sourceConnector.y],
                pointerLength: 5,
                pointerWidth : 5,
                fill: 'black',
                stroke: 'black',
                strokeWidth: 2
            });
            this.layer.add(connection.arrow);
        }
        
        this.layer.draw();
    }

    private getTemplateByName(name) {
        for (let index = 0; index < this.templates.length; index++) {
            var template = this.templates[index];
            if (template.name == name) {
                return template;
            }
        }

        return null;
    }


}
