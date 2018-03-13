import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { StageComponent } from 'ng2-konva';
import { Layer, Stage, Node, Shape, Rect, Transform, Circle, Star, RegularPolygon, Label, Tag, Text, Group } from 'konva';
import { GenericMicroServiceTemplate } from './models/generic.micro.service.template';
import { Template, TemplateEventsCallback, TemplateInterface } from './models/templates';
import { ActivatedRoute, Router } from "@angular/router";

@Component({
    selector: 'component-model',
    templateUrl: './model.component.html',
    styleUrls: ['./model.component.css']
})

export class ComponentModelComponent implements OnInit, TemplateEventsCallback {

    @ViewChild(Layer) layer: Layer;
    @ViewChild(StageComponent) stage: StageComponent;

    // list of templatea
    public templates: Array<Template> = new Array<Template>();

    // selected template
    public selectedTemplate:Template = null;

    // drawing area
    public width = 1000;
    public height = 800;

    private fontSize = 15;

    constructor(
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() { 
    }

    private addMouseHandler() {
        var st:Stage = this.stage.getStage();
        var layer:Layer = st.getChildren()[0];
       
        st.on('click', (event) => {
            this.selectedTemplate = null;
        });
    }

    public configStage = Observable.of({
        width: this.width,
        height: this.height
    });

    public addCircle() {
        var st:Stage = this.stage.getStage();
        var layer:Layer = st.getChildren()[0];

        let rect = new Circle({
            x : Math.random() * 800,
            y : Math.random() * 800,
            radius: 80,
            fill: 'red',
            stroke: 'black',
            draggable: true
        })
        layer.add(rect);

        layer.draw();
    }

    public addTriangle() {
        var st:Stage = this.stage.getStage();
        var layer:Layer = st.getChildren()[0];

        let rect = new RegularPolygon({
            x : Math.random() * 800,
            y : Math.random() * 800,
            sides: 3,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 2,
            draggable: true
        })
        layer.add(rect);

        layer.draw();
    }

    public addSquare() {
        var st:Stage = this.stage.getStage();
        var layer:Layer = st.getChildren()[0];

        let rect = new Rect({
            x : Math.random() * 800,
            y : Math.random() * 800,
            width: 100,
            height: 100,
            fill: 'yellow',
            stroke: 'black',
            draggable: true
        })
        layer.add(rect);

        layer.draw();
    }

    public addLabel() {
        var st:Stage = this.stage.getStage();
        var layer:Layer = st.getChildren()[0];

        let label = new Text({
            x : Math.random() * 800,
            y : Math.random() * 800,
            text:'this is a label',
            fontSize: this.fontSize,
            draggable: true
        });

        layer.add(label);

        layer.draw();
    }

    public addDiamond() {
        var st:Stage = this.stage.getStage();
        var layer:Layer = st.getChildren()[0];

        let rect = new Star({
            x : Math.random() * 800,
            y : Math.random() * 800,
            numPoints: 4,
            innerRadius: 40,
            outerRadius: 70,
            fill: 'yellow',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true
        })
        layer.add(rect);

        layer.draw();
    }

    public addStatic() {
        var st:Stage = this.stage.getStage();
        var layer:Layer = st.getChildren()[0];

        let group = new Group({
            x : Math.random() * 800,
            y : Math.random() * 800,
            draggable: true
        })

        let rect = new Rect({
            x : 0,
            y : 0,
            width : 230,
            height : 120,
            fill : '#00D2FF',
            stroke : 'black'
        })

        let label = new Text({
            x : 10,
            y : 10,
            text:'staic template',
            fontSize: this.fontSize
        });

        group.add(rect);
        group.add(label);

        layer.add(group);

        layer.draw();
    }

    public addSingleInterface() {
        var st:Stage = this.stage.getStage();
        var layer:Layer = st.getChildren()[0];

        let group = new Group({
            x : Math.random() * 800,
            y : Math.random() * 800,
            draggable: true
        })

        let rect = new Rect({
            x : 0,
            y : 0,
            width : 230,
            height : 100,
            fill : 'blue',
            stroke : 'black'
        })

        let label = new Text({
            x : 10,
            y : 10,
            text:'single inheritance template',
            fontSize: this.fontSize,
            fill: 'white'
        });

        group.add(rect);
        group.add(label);

        layer.add(group);

        layer.draw();
    }

    public addGenericMicroService() {
        let t = new GenericMicroServiceTemplate(this);
        this.templates.push(t);
        
        this.addGroup(t.createUI());

        this.addMouseHandler();
    }

    public addJavaMicroService() {
        var st:Stage = this.stage.getStage();
        var layer:Layer = st.getChildren()[0];

        let group = new Group({
            x : Math.random() * 800,
            y : Math.random() * 800,
            draggable: true
        })

        let rect = new Rect({
            x : 0,
            y : 0,
            width : 230,
            height : 100,
            fill : 'green',
            stroke : 'black'
        })

        let label = new Text({
            x : 10,
            y : 10,
            text:'Java Micro Service template',
            fontSize: this.fontSize,
            fill: 'white'
        });

        group.add(rect);
        group.add(label);
        layer.add(group);

        layer.draw();
    }

    private generateUI() {
        var st:Stage = this.stage.getStage();
        var layer:Layer = st.getChildren()[0];

        for (var index = 0; index < this.templates.length; index++) {
            let template = this.templates[index];
            layer.add(template.createUI());
        }
        layer.draw();

    }

    private addGroup(group) {
        var st:Stage = this.stage.getStage();
        var layer:Layer = st.getChildren()[0];

        layer.add(group);
        layer.draw();
    }

    public templateClicked(template: any) {
        this.selectedTemplate = template.clone();
    }

    public addInterface() {
        if (this.selectedTemplate != null) {
            let intf = new TemplateInterface();
            this.selectedTemplate.interfaces.push(intf);
        }
    }

    public cancelPropertyChanges() {
        this.selectedTemplate = null;
    }

    public savePropertyChanges() {
        for (let index = 0; index < this.templates.length; index++) {
            var template = this.templates[index];
            if (template.identifier == this.selectedTemplate.identifier) {
                // found the one to update

                template.name = this.selectedTemplate.name;
                template.interfaces = this.selectedTemplate.interfaces;

                this.reloadTemplateUI(template);
                break;
            }
        }
    }

    private reloadTemplateUI(template) {
        var st:Stage = this.stage.getStage();
        var layer:Layer = st.getChildren()[0];

        template.uiGroup.remove();
        layer.add(template.reloadUI());
        layer.draw();
    }

    public deleteShape() {
        if (this.selectedTemplate != null) {
            for (let index = 0; index < this.templates.length; index++) {
                var template = this.templates[index];
                if (template.identifier == this.selectedTemplate.identifier) {
                    // found the one to update
                    template.uiGroup.remove();

                    var st:Stage = this.stage.getStage();
                    var layer:Layer = st.getChildren()[0];
                    layer.draw();

                    this.templates.splice(index, 1);     
                    
                    this.selectedTemplate = null;
                    break;
                }
            }
            
        }
    }

    public onVerify(){
        this.router.navigate(["home/verify-model"]);
    }
}