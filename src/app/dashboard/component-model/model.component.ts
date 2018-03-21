import { ComponentModel } from './../../shared/interfaces/component.model';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { StageComponent } from 'ng2-konva';
import { Layer, Stage, Node, Shape, Rect, Transform, Circle, Star, RegularPolygon, Label, Tag, Text, Group } from 'konva';
import { ActivatedRoute, Router } from "@angular/router";
import { GenericMicroServiceTemplate } from './templates/generic.micro.service.template';
import { Template, TemplateEventsCallback, TemplateInterface } from './templates/templates';
import { StaticTemplate } from './templates/static.template';
import { SingleInterfaceTemplate } from './templates/single.interface.template';
import { JavaMicroServiceTemplate } from './templates/java.micro.service.template';
import { ModelService } from '../../services/model.service';



@Component({
    selector: 'component-model',
    templateUrl: './model.component.html',
    styleUrls: ['./model.component.css']
})
export class ComponentModelComponent implements OnInit, TemplateEventsCallback {

    @ViewChild(StageComponent) stageComponent:StageComponent;
    
    private layer: Layer;
    private stage: Stage;

    // list of templatea
    public templates: Array<Template> = new Array<Template>();

    // selected template
    public selectedTemplate:Template = null;

    // drawing area
    public width = 800;
    public height = 600;

    // model title
    public modelTitle = '';

    private fontSize = 15;


    // model to edit
    private selectedModel: ComponentModel = null;
    private selectedId:String =null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private service:ModelService) { }


    ngOnInit() { 
        //this.addDrawingEditor();

        this.route
            .queryParams
            .subscribe(params => {
                var id = params["id"];
                if (id == undefined) return;

                this.service
                    .getModel(id)
                    .subscribe(result => {
                        if (result.status == 'OK') {

                            this.selectedModel = result.data as ComponentModel;
                            this.selectedId = this.selectedModel.id;
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
                                }

                                template.identifier = tempTemplate.id;

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
                                    for (let dInterfaceIndex = 0; dInterfaceIndex < tempInterface.modelInterfaceEndPointsList.length; dInterfaceIndex ++) {
                                        let dInterface = tempInterface.modelInterfaceEndPointsList[dInterfaceIndex];
                                        templateInterface.downstreamInterfaces.push( { component: dInterface.outputModelInterfaceId, connectedInterface: dInterface.inputModelInterfaceId });
                                    }

                                    template.interfaces.push(templateInterface);
                                }

                                // save template
                                this.templates.push(template);

                                // draw template
                                let x = 0; let y;
                                if (tempTemplate.modelComponentVisualProperties != null) {
                                    x = parseFloat(tempTemplate.modelComponentVisualProperties.xPosition.toString());
                                    y = parseFloat(tempTemplate.modelComponentVisualProperties.yPosition.toString());
                                }

                                var group = template.createUI(x, y);
                                this.addGroup(group);
                            }
                        }
                        console.log(result);
                    });
            });
    }

    private addEditorEventHandler() {
        this.stage = this.stageComponent.getStage();
        this.layer = this.stage.getChildren()[0];
    }

    private addDrawingEditor() {
        this.stage = new Stage({
            container: 'container',
            width: this.width,
            height: this.height
        });

        this.layer = new Layer();
        this.stage.add(this.layer);

        // var scaleBy = 1.01;
        // window.addEventListener('wheel', (e) => {
        //     e.preventDefault();
        //     var oldScale = this.stage.scaleX();

        //     var mousePointTo = {
        //         x: this.stage.getPointerPosition().x / oldScale - this.stage.x() / oldScale,
        //         y: this.stage.getPointerPosition().y / oldScale - this.stage.y() / oldScale,
        //     };

        //     var newScale = e.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
        //     this.stage.scale({ x: newScale, y: newScale });

        //     var newPos = {
        //         x: -(mousePointTo.x - this.stage.getPointerPosition().x / newScale) * newScale,
        //         y: -(mousePointTo.y - this.stage.getPointerPosition().y / newScale) * newScale
        //     };
        //     this.stage.position(newPos);
        //     this.stage.batchDraw();
        // });
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

        this.layer.add(rect);
        this.layer.draw();
    }

    public addStatic() {
        let t = new StaticTemplate(this);
        this.templates.push(t);
        this.addGroup(t.createUI());
    }

    public addSingleInterface() {
        let t = new SingleInterfaceTemplate(this);
        this.templates.push(t);
        this.addGroup(t.createUI());
    }

    public addGenericMicroService() {
        let t = new GenericMicroServiceTemplate(this);
        this.templates.push(t);
        this.addGroup(t.createUI());
    }

    public addJavaMicroService() {
        let t = new JavaMicroServiceTemplate(this);
        this.templates.push(t);
        this.addGroup(t.createUI());
    }

    private addGroup(group) {
        this.addEditorEventHandler();
        this.layer.add(group);
        this.layer.draw();
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
        template.uiGroup.remove();
        this.layer.add(template.reloadUI());
        this.layer.draw();
    }

    public deleteShape() {
        if (this.selectedTemplate != null) {
            for (let index = 0; index < this.templates.length; index++) {
                var template = this.templates[index];
                if (template.identifier == this.selectedTemplate.identifier) {
                    // found the one to update
                    template.uiGroup.remove();

                    this.layer.draw();

                    this.templates.splice(index, 1);     
                    
                    this.selectedTemplate = null;
                    break;
                }
            }
            
        }
    }

    public onVerify(){
        this.router.navigate(["home/verify-model"], { queryParams: {
            id: this.selectedModel.id
        }});
    }

    public onDelete(index) {
        this.selectedTemplate.interfaces.splice(index, 1);
    }

    public onAddProperty(index) {
        let intf = this.selectedTemplate.interfaces[index];
        intf.properties.push({ name: '', value: ''});
    }

    public onAddDownstreamInterface(index) {
        let intf = this.selectedTemplate.interfaces[index];
        intf.downstreamInterfaces.push({ component: '', connectedInterface: '' })
    }

    public onDeleteProperty(index, propertyIndex) {
        let intf = this.selectedTemplate.interfaces[index];
        intf.properties.splice(propertyIndex, 1);
    }

    public onDeleteDownstreamInterface(index, propertyIndex) {
        let intf = this.selectedTemplate.interfaces[index];
        intf.downstreamInterfaces.splice(propertyIndex, 1);

    }

    public saveModel() {
        var components = [];

        // get components
        for (let index = 0; index < this.templates.length; index++) {
            var template = this.templates[index];

            var interfaces = [];
            // get all interfaces
            for (let intfIndex = 0; intfIndex < template.interfaces.length; intfIndex++) {
                var intf = template.interfaces[intfIndex];
                
                var properties = [];
                // get all component properties
                for (let propIndex = 0; propIndex < intf.properties.length; propIndex++) {
                    var propObject = {
                        key: intf.properties[propIndex].name,
                        value: intf.properties[propIndex].value,
                    }
                    properties.push(propObject);
                }

                var dinterfaces = [];
                // get all component downstream interfaces
                for (let intIndex = 0; intIndex < intf.downstreamInterfaces.length; intIndex++) {
                    var intObject = {
                        inputModelInterfaceId: intf.downstreamInterfaces[intIndex].connectedInterface,
                        outputModelInterfaceId: intf.downstreamInterfaces[intIndex].component
                    }
                    dinterfaces.push(intObject);
                }

                var intfObj = {
                    title: intf.name,
                    latency: intf.latency,
                    modelInterfacePropertiesList: properties,
                    modelInterfaceEndPointsList: dinterfaces
                }

                interfaces.push(intfObj);
            }

            var visualProperties = {
                color: 'red',
                height: '', //template.uiGroup.height,
                id: '',
                shape: '',
                width: '', //template.uiGroup.width,
                xPosition: '' + template.uiGroup.getAttrs().x,
                yPosition: '' + template.uiGroup.getAttrs().y
            }

            var component = {
                title: template.name,
                templateName: template.type,
                modelComponentInterfaceList: interfaces,
                modelComponentVisualProperties: visualProperties
            }

            components.push(component);
        }

        var body = {            
            modelBranchId: "test-branch",
            modelComponentList: components,
            title: this.modelTitle
        }

        if (this.selectedModel == null) {
            // create a model
            this.service
                .createModel(body)
                .subscribe(result => {
                    console.log(result)
                    this.router.navigate(['home/component_model-list']);
                });
        } else {
            // update the model
            this.service
                .updateModel(this.selectedModel.id, body)
                .subscribe(result => {
                    console.log(result)
                    this.router.navigate(['home/component_model-list']);
                });
        }

    }

    public cancelModel() {
        this.router.navigate(['home/component_model-list']);
    }
}