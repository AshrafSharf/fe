import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { StageComponent } from 'ng2-konva';
import { Layer, Stage, Node, Shape, Rect, Transform, Circle, Star, RegularPolygon, Label, Tag, Text, Group } from 'konva';

@Component({
    selector: 'component-model',
    templateUrl: './model.component.html',
    styleUrls: ['./model.component.css']
})

export class ComponentModelComponent implements OnInit {
    @ViewChild(Layer) layer: Layer;
    @ViewChild(StageComponent) stage: StageComponent;

    // list of drawing elements
    public list: Array<any> = [];

    // drawing area
    public width = 1000;
    public height = 800;

    private fontSize = 15;

    constructor() { }

    ngOnInit() { 
        
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
            fill : 'yellow',
            stroke : 'black'
        })

        let label = new Text({
            x : 10,
            y : 10,
            text:'Generic Micro Service template',
            fontSize: this.fontSize,
            fill: 'black'
        });

        group.add(rect);
        group.add(label);
        layer.add(group);

        layer.draw();
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
}