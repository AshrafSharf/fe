import { Component, OnInit, AfterViewInit, ViewChild, Output } from '@angular/core';
import { CptEnvironment } from '../../shared/modelling/cpt-environment';
import { CptMicroserviceComponent, CptMicroserviceInterface } from '../../shared/modelling/templates/cpt-microservice';
import { CptOutput } from '../../shared/modelling/cpt-output';
import { Branch } from '../../shared/interfaces/branch';
import { BranchService } from '../../services/branch.service';
import { MatchTableComponenet } from './match-table.component';
import { Modal } from 'ngx-modialog/plugins/bootstrap';
import { CptLoad } from '../../shared/modelling/cpt-load';
import { ActivatedRoute, Router } from "@angular/router";
import {Location} from "@angular/common";

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Layer, Stage, Node, Shape, Rect, Transform, Circle, Star, RegularPolygon, Label, Tag, Text, Group, Arrow  } from 'konva';
import { StageComponent } from 'ng2-konva';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { Moment } from 'moment';
import { AppVariableService } from '../../services/variable.services';
import { GenericMicroServiceTemplate } from '../component-model/templates/generic.micro.service.template';
import { TemplateInterface, Template, Connection, ConnectorType } from '../component-model/templates/templates';
import { CptComponent } from '../../shared/modelling/cpt-component';
import { SystemModel } from '../../shared/interfaces/system-model';
import { CptInterface, CptInterfaceOutput } from '../../shared/modelling/cpt-interface';
import { Config } from '../../shared/config';
import { ComponentModel } from '../../shared/interfaces/component.model';
import { JavaMicroServiceTemplate } from './templates/java.micro.service.template';
import { StaticTemplate } from './templates/static.template';
import { SingleInterfaceTemplate } from './templates/single.interface.template';
import { ModelService } from '../../services/model.service';
import { CircleShape } from './shapes/circle.shape';
import { DiamondShape } from './shapes/diamond.shape';
import { SquareShape } from './shapes/square.shape';
import { TriangleShape } from './shapes/triangle.shape';
import { CptInputVariable } from '../../shared/modelling/cpt-input-variable';
import { InputVariable } from '../../shared/modelling/templates/input-variable';
import { InputTemplate } from './templates/input.template';
import { Ec2MicroServiceTemplate } from './templates/ec2.micro.service.template';

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
    environment:CptEnvironment =  CptEnvironment.get();
    simOutput:string;
    forecastBranchId:String=null;
    
    selectedForecastBranch:String = null
    selectedForecastBranchId:String=null;
	datePickerConfig = { format: Config.getDateFormat() };
    selectedDate:Moment;
    selectedModelId:string = null;
    systemModel:SystemModel = null;
    selectedModel = null;
    selectedComponent:CptComponent = null;
    modelTitle:string = "";

    // list of templatea
    public templates: Array<Template> = new Array<Template>();
    public selectedTemplate:Template;
    
     // drawing area
    public width = 4000;
    public height = 4000;
     private fontSize = 15;

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
            this.clearEnvironment();
            this.setupEnvironment();
        });
    }

    /** 
     * Set up the System Model environment
    */
    setupEnvironment(){
        this.environment = CptEnvironment.get();

        for (let component of this.systemModel.modelComponentList){
            let cptComp;
            if (component.templateName == "GenericMicroServiceTemplate"){
                cptComp = new CptMicroserviceComponent();
                cptComp.setName(component.title);
            }
            if (component.templateName == "Ec2MicroServiceTemplate"){
                cptComp = new CptMicroserviceComponent();
                cptComp.setName(component.title);
            }
            else if (component.templateName == "InputTemplate" ){
                //give input variables name for matching, along with a display name      
                cptComp = new InputVariable();
                cptComp.setName( component.displayName);  
                cptComp.name = component.title;          
                this.environment.addInputVariable(cptComp);        
            }
            //TODO: add more if cases with for other templates

            cptComp.order = component.order;
            cptComp.id = component.id;
            
            
            //set up interfaces
            for (let interf of component.modelComponentInterfaceList){
                let cptInt = cptComp.addInterface(interf.title);
                cptInt.id = interf.id;
                cptInt.componentId = component.id;
                cptInt.latency = Number(interf.latency);
                
                //add custom properties
                for (let property of interf.modelInterfacePropertiesList){
                    cptInt.addProperty( property.key,  property.value);
                }
            }
            
            this.environment.registerComponent(cptComp);
        }
       
        this.connectInterfaces();
       console.log(this.environment.envComponents);
      

        // let hookCode = "if (load.loadValues['tps'] < 700 ){ return latency; } " +
        //     "else{ return latency*2; } ";
       //c3if1.addHookCode("adjustLatencyToLoad", hookCode);

      //  });
    }

    /** 
     * Connect Interfaces to their downstream interfaces
    */
    connectInterfaces(){
        for (let connection of this.systemModel.modelInterfaceEndPointsList){
            let interf = this.environment.getInterface(connection.inputModelInterfaceId);
            let cptOutput = interf.addOutput() as CptInterfaceOutput;
            cptOutput.downstreamInterfaceId = connection.outputModelInterfaceId;
        }

    }

    /** 
     * Reset the attributes of each interface to their inital state
    */
    resetEnvironment(){
       for (let component of this.systemModel.modelComponentList){
           for (let interf of component.modelComponentInterfaceList){
               let cptIf = this.environment.getInterface(interf.id) as CptMicroserviceInterface;
               cptIf.latency = Number(interf.latency);
               cptIf.load.loadValues["tps"] = 0;
               for (let property of interf.modelInterfacePropertiesList){
                   if(cptIf.load.loadValues.hasOwnProperty(property.key)){
                        cptIf.load.loadValues[property.key] = 0;
                    }
               }
           }
       }
    }

    clearEnvironment(){
        this.environment.envComponents = [];
        this.environment.inputVars = [];
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
        this.resetEnvironment();

        //dont run simulation if a forecast branch has not been inported
        if (this.matchTable.inputVariableMatchings.length == 0){
            this.modal.alert()
            .title("Cannot Run Simulation")
            .body("Forecast variables need to be imported first")
            .open();
            return;
        }

        //show warning if no value defined for an input variable
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
           
            //set input variable load to the value of the matching forecast variable value
            if (inputVar.forecastValue != null && inputVar.overrideValue == ""){
                console.log("setting input var with id: " + inputVar.inputVarId + "to " +  inputVar.forecastValue);
                this.environment.setInputVariableComponent(inputVar.inputVarId, inputVar.forecastValue);
            }

            //set input variable load to the override value
            else{
                this.environment.setInputVariableComponent(inputVar.inputVarId, inputVar.overrideValue);
            }
        }
    
        let o = this.environment.runSim();
        console.log(o);
        this.simOutput =  this.displayOutput();
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

    displayOutput(){
        let outputString = "";
        let comps = this.environment.envComponents;
        for (let comp of comps){
            if (!(comp instanceof InputVariable)){
                outputString+= comp.displayName+": \n";
                let interfaces = comp.getInterfaces();
                for (let interf of interfaces){
                    outputString+=interf.displayName + ": \n" ;
                    for (let key in interf.load.loadValues){
                        outputString += key+ ":" + interf.load.loadValues[key] + " \n";
                    }
                    if (comp instanceof CptMicroserviceComponent){
                        outputString += "latency: " + interf.getStats().val["lat"] + " \n";       
                    }   
                }
            }
            
        }
        return outputString;
    }

    public showComponentOutput(componentId:string){
        let comp = this.environment.getComponent(componentId);
        console.log(comp.getOutput());
       // this.selectedTemplateOutput = comp.getOutput();
        for(let interf of comp.getInterfaces()){
            let output = interf.getOutput();
            for (let property in output.getVal()){
                console.log(property, output.getVal()[property]);
            }
        }
        console.log(comp.toJSON());

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
                                if (tempTemplate.templateName == 'GenericMicroServiceTemplate') {
                                    template = new GenericMicroServiceTemplate(this);
                                } else if (tempTemplate.templateName == 'JavaMicroServiceTemplate') {
                                    template = new JavaMicroServiceTemplate(this);
                                } else if (tempTemplate.templateName == 'StaticTemplate') {
                                    template = new StaticTemplate(this);
                                } else if (tempTemplate.templateName == 'SingleInterfaceTemplate') {
                                    template = new SingleInterfaceTemplate(this);
                                } else if (tempTemplate.templateName == 'Ec2MicroServiceTemplate') {
                                    template = new Ec2MicroServiceTemplate(this);
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

                                if (template instanceof Ec2MicroServiceTemplate){
                                    template.instanceType = tempTemplate.instanceType;
                                }


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
                                        template.fixedProperties.push({ name: property.key, value: property.value});
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
        this.selectedComponent = this.environment.getComponent(template.identifier);
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
