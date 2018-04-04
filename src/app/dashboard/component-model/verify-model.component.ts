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
import { TemplateInterface, Template } from '../component-model/templates/templates';
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
     // drawing area
    public width = 4000;
    public height = 4000;
     private fontSize = 15;

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
        //TODO: Use selected Project ID
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
            this.modelTitle = this.systemModel.title;
            console.log(this.modelTitle);
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
            }
            else if (component.templateName == "Circle" || component.templateName == "Diamond" ){
              cptComp = new InputVariable();
              this.environment.addInputVariable(cptComp);
            }
            //TODO: add more if cases with for other templates

            cptComp.order = component.order;
            cptComp.id = component.id;
            cptComp.setName(component.title);
            
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
       
      

        // let hookCode = "if (load.loadValues['tps'] < 700 ){ return latency; } " +
        //     "else{ return latency*2; } ";
       //c3if1.addHookCode("adjustLatencyToLoad", hookCode);

      //  });
    }

    /** 
     * Connect any Interfaces which have an output pointing to a Downstream Interface.
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

            //dont run simulation if a forecast has not been inported
            if (this.matchTable.inputVariableMatchings.length == 0){
                this.modal.alert()
                .title("Cannot Run Simulation")
                .body("Forecast variables need to be imported first")
                .open();
                return;
            }
        
        for (let inputVar of this.matchTable.inputVariableMatchings){
            //show warning if no value defined for an input variable
            if (inputVar.hasForecastMatch == false
            && inputVar.overrideValue == ""){
                this.modal.alert()
                .title("Cannot Run Simulation")
                .body("Inputs variables without values exist. Either create match these forecast variables\
                 or provide them overide values")
                 .open();
                 return;
            }
           
            if (inputVar.forecastValue != null && inputVar.overrideValue == ""){
                console.log("setting input var with id: " + inputVar.inputVarId + "to " +  inputVar.forecastValue);
                this.environment.setInputVariableComponent(inputVar.inputVarId, inputVar.forecastValue);
            }

            else{
                this.environment.setInputVariableComponent(inputVar.inputVarId, inputVar.overrideValue);
            }
        }
        console.log(this.environment);
        let o = this.environment.runSim();
        console.log(this.environment);
        console.log(o);
        this.simOutput =  this.displayOutput();
    } 

    reloadBranches(projectId:String = null, forceReload = false) {
        var id = projectId;
        console.log("project id: " + id);
        
        if (id != null) {
            this.branchService
                .getBranches(id)
                .subscribe(result => {
                    this.branches = result.data;
                    this.selectedForecastBranch = '';
                        if (this.selectedForecastBranchId != null) {
                            this.selectedForecastBranch = this.selectedForecastBranchId;
                        } else if (this.branches.length > 0) {
                            //this.forecastBranchId = this.branches[0].id;
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

    drawDiagram(id:string){
            this.modelService
                .getModel(id)
                .subscribe(result => {
                    if (result.status == 'OK') {

                        this.selectedModel = result.data as ComponentModel;
                        
                        this.modelTitle = this.selectedModel.title.toString();
                        
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
                            } else if (tempTemplate.templateName == 'Circle') {
                                template = new CircleShape(this);
                            } else if (tempTemplate.templateName == 'Diamond') {
                                template = new DiamondShape(this);
                            } else if (tempTemplate.templateName == 'Square') {
                                template = new SquareShape(this);
                            } else if (tempTemplate.templateName == 'Triangle') {
                                template = new TriangleShape(this);
                            }

                            template.identifier = tempTemplate.id;
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

                                template.interfaces.push(templateInterface);
                            }

                            // save template
                            this.templates.push(template);

                            // draw template
                            let x=0;
                            let y;
                            if (tempTemplate.modelComponentVisualProperties != null) {
                                 x =  parseFloat(tempTemplate.modelComponentVisualProperties.xPosition.toString());
                                 y = parseFloat(tempTemplate.modelComponentVisualProperties.yPosition.toString());
                            }
                            var group = template.createUI(x,y, false);
                            group.x = template
                            this.addGroup(group);
                        }
                    }
                    console.log(result);
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
        console.log(this.selectedComponent.displayName);
        this.showComponentOutput(template.identifier);
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


}
