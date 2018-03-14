import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
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
import { GenericMicroServiceTemplate } from '../component-model/models/generic.micro.service.template';
import { TemplateInterface } from '../component-model/models/templates';


@Component({
    selector: 'simulation',
    templateUrl: './simulation.component.html',
    styleUrls: ['./simulation.component.css']
})

export class SimulationComponent implements OnInit, AfterViewInit {
    @ViewChild(MatchTableComponenet) matchTable:MatchTableComponenet;
    @ViewChild(Layer) layer: Layer;
    @ViewChild(StageComponent) stage: StageComponent;
    
    branches:Branch[] = Array<Branch>();
    
    environment:CptEnvironment;
    simOutput:string;
    inputVariables:string[] = [];
    forecastBranchId:String=null;
    
    selectedForecastBranch:String = null
    selectedForecastBranchId:String=null;

    selectedDate:Moment;
    
     // drawing area
     public width = 750;
     public height = 520;
     private fontSize = 15;

     public configStage = Observable.of({
        width: this.width,
        height: this.height
    });

    constructor(
        private branchService:BranchService,
        private modal:Modal,
        private variableService:AppVariableService,
        private route:ActivatedRoute,
        private router:Router,
        private location: Location) {

    }

    ngOnInit() { 
        //TODO: Use selected Project ID
        this.reloadBranches("5aa31b14d49fee0db47f67c3");
        this.setupEnvironment();
    }

    ngAfterViewInit(){
      //  this.drawModel();
    }

    /** 
     * Set up the System Model environment
    */
    setupEnvironment(){
        //TODO: Use APIS to retrieve enviroment data
        this.environment = CptEnvironment.get();
        let c1 = new CptMicroserviceComponent();
        c1.order = 0;
        c1.setName("Comp1");
       // this.addJavaMicroService("Comp1", 100,100);
        let c1if1 = c1.addInterface("Comp1If1");
        c1if1.latency=10;
        c1if1.inputLoadVariable="A";
        this.inputVariables.push("A");
        this.inputVariables.push("iosSubs");
        let c1if1o1 = c1if1.addOutput();
        c1if1o1.multiplier = 0.5;
        let c1if1o2 = c1if1.addOutput();
        this.environment.registerComponent(c1);

        
        let c2 = new CptMicroserviceComponent();
        c2.order = 1;
        c2.setName("Comp2");
        let c2if1 = c2.addInterface("Comp2If1");
        let c2if1o1 = c2if1.addOutput();
        c2if1.latency = 20;
        this.environment.registerComponent(c2);
        c1if1o1.connect(c2if1);


        let c3 = new CptMicroserviceComponent();
        c3.order = 2;
        c3.setName("Comp3");
        let c3if1 = c3.addInterface("Comp3If1");
        c3if1.latency = 5;
        c2if1o1.connect(c3if1);
        c1if1o2.connect(c3if1);
        this.environment.registerComponent(c3);

        // let hookCode = "if (load.loadValues['tps'] < 700 ){ return latency; } " +
        //     "else{ return latency*2; } ";
       //c3if1.addHookCode("adjustLatencyToLoad", hookCode);
    }

    /** 
     * Reset the attributes of each interface to their inital state
    */
    resetEnvironment(){
        //TODO: Use Model APIs to get original values
       let components= this.environment.envComponents as CptMicroserviceComponent[];
       for (let comp of components){
           let interfaces = comp.getInterfaces();
           for (let interf of interfaces){
                if (interf.displayName == "Comp1If1"){
                    interf.latency = 10;
                }
                else if(interf.displayName =="Comp2If1"){
                    interf.latency = 20;
                }
                else if(interf.displayName == "Comp3If1"){
                    interf.latency = 5;
                }
              
                //reset each load value
                for (let key in interf.load.loadValues){
                    interf.load.loadValues[key] = 0;
                }
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
        this.resetEnvironment();
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
                this.environment.setInputVariables(inputVar.inputVariableName,
                    inputVar.forecastValue);
            }
            else{
                this.environment.setInputVariables(inputVar.inputVariableName,
                    inputVar.overrideValue);
            }
        }
        let o = this.environment.runSim();
        console.log(o);
        this.displayOutput(o);
        this.simOutput = JSON.stringify(o, null,4);
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
                            console.log("hello");
                            //this.forecastBranchId = this.branches[0].id;
                            this.selectedForecastBranch = this.branches[0].id;
                        }
                        console.log("SelectedBranch", this.selectedForecastBranch);
                });             
        }
    }

    public addGenericMicroService(name:string) {
        let t = new GenericMicroServiceTemplate(this);
        //this.templates.push(t);
        t.name = name;
        this.addGroup(t.createUI());
        return t;
    }
    public addInterface(temp:GenericMicroServiceTemplate, name:string) {
            let intf = new TemplateInterface();
            intf.name = name;
            temp.interfaces.push(intf);
    }
    private addGroup(group) {
        var st:Stage = this.stage.getStage();
        var layer:Layer = st.getChildren()[0];

        layer.add(group);
        layer.draw();
    }
    private reloadTemplateUI(template) {
        var st:Stage = this.stage.getStage();
        var layer:Layer = st.getChildren()[0];

        template.uiGroup.remove();
        layer.add(template.reloadUI());
        layer.draw();
    }

    drawModel(){
        let comp1 = this.addGenericMicroService("Comp1");
        this.addInterface(comp1, "Comp1If1");
        this.reloadTemplateUI(comp1);

        let comp2 = this.addGenericMicroService("Comp2");
        this.addInterface(comp2, "Comp2If1");
        this.reloadTemplateUI(comp2);

        let comp3 = this.addGenericMicroService("Comp3");
        this.addInterface(comp3, "Comp3If1");
        this.reloadTemplateUI(comp3);
        
    }
    onEdit(){
       this.location.back();
    }

    displayOutput(o){
        console.log(o);
    }
}