import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CptEnvironment } from '../../shared/modelling/cpt-environment';
import { CptMicroserviceComponent, CptMicroserviceInterface } from '../../shared/modelling/templates/cpt-microservice';
import { CptOutput } from '../../shared/modelling/cpt-output';
import { Branch } from '../../shared/interfaces/branch';
import { BranchService } from '../../services/branch.service';
import { MatchTableComponenet } from './match-table.component';
import { Modal } from 'ngx-modialog/plugins/bootstrap';
import { CptLoad } from '../../shared/modelling/cpt-load';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Layer, Stage, Node, Shape, Rect, Transform, Circle, Star, RegularPolygon, Label, Tag, Text, Group, Arrow  } from 'konva';
import { StageComponent } from 'ng2-konva';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { Moment } from 'moment';
import { AppVariableService } from '../../services/variable.services';


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
        public modal:Modal,
        public variableService:AppVariableService) {

    }

    ngOnInit() { 
        //TODO: Use selected Project ID
        this.reloadBranches("5aa31b14d49fee0db47f67c3");
        this.forecastBranchId="5aa31b14d49fee0db47f67c4";
        this.setupEnvironment();
    }

    ngAfterViewInit(){
        this.drawModel();
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
        //TODO: Use new API to get the values of forecast variables for a specific date
        this.forecastBranchId = this.selectedForecastBranch;
    }

    /**
     * Run the simulation on the environment
     */
    onRunSimulation(){
        this.resetEnvironment();
        for (let index = 0; index < this.matchTable.inputVariableMatchings.length; index ++){
            //show warning if no value defined for an input variable
            if (this.matchTable.inputVariableMatchings[index].hasForecastMatch == false
            && this.matchTable.inputVariableMatchings[index].value == ""){
                this.modal.alert()
                .title("Cannot Run Simulation")
                .body("Inputs variables without values exist. Either create match these forecast variables\
                 or provide them overide values")
                 .open();
                 return;
            }
            //TODO: if no override value provided, set input variable value to value of forecast
            this.environment.setInputVariables(this.matchTable.inputVariableMatchings[index].inputVariableName,
                this.matchTable.inputVariableMatchings[index].value);
        }
        let o = this.environment.runSim();
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


    public addMicroService(name:string, positionX:number, positionY:number) {
        var st:Stage = this.stage.getStage();
        var layer:Layer = st.getChildren()[0];
            
        let group = new Group({
            x : positionX,
            y : positionY
        });
            
        let rect = new Rect({
             x : 0,
            y : 0,
            width : 100,
            height : 150,
            fill : 'green',
            stroke : 'black'
        });
            
        let label = new Text({
            x : 10,
            y : 10,
            text:name,
            fontSize: this.fontSize,
            fill: 'white'
        });
            
        group.add(rect);
        group.add(label);
        layer.add(group);
        layer.draw();
    }


    public addMicroServiceInterface(name:string, positionX:number, positionY:number) {
        var st:Stage = this.stage.getStage();
        var layer:Layer = st.getChildren()[0];
            
        let group = new Group({
            x : positionX,
            y : positionY
        });
            
        let rect = new Rect({
             x : 0,
            y : 0,
            width : 80,
            height : 50,
            fill : 'white',
            stroke : 'black'
        });
            
        let label = new Text({
            x : 10,
            y : 10,
            text:name,
            fontSize: this.fontSize,
            fill: 'black'
        });
            
        group.add(rect);
        group.add(label);
        layer.add(group);
        layer.draw();
    }

    drawArrow(name:string, positionX:number, positionY:number, endX, endY){
        var st:Stage = this.stage.getStage();
        var layer:Layer = st.getChildren()[0];

        let group = new Group({
            x : positionX,
            y : positionY
        });

        let arrow = new Arrow({
            x: 0,
            y: 0,
            points: [0,0, endX, endY],
            pointerLength: 10,
            pointerWidth : 10,
            fill: 'black',
            stroke: 'black',
            strokeWidth: 4
        });

        group.add(arrow);
        //group.add(label);
        layer.add(group);
        layer.draw();
    }

    drawModel(){
        this.addMicroService("Comp1", 100,100); 
        this.addMicroService("Comp2", 300,100);  
        this.addMicroService("Comp3", 300,300);
        this.addMicroServiceInterface("Comp1If1", 110,150);   
        this.addMicroServiceInterface("Comp2If1", 310,150);
        this.addMicroServiceInterface("Comp3If1", 310,350);  
        this.drawArrow("0.5", 185,180, 130, 0 );    
        this.drawArrow("", 185,180, 130, 200 );      
    }
}