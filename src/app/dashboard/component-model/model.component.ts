import { ComponentModel } from './../../shared/interfaces/component.model';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { StageComponent } from 'ng2-konva';
import { Layer, Stage, Node, Shape, Rect, Transform, Circle, Star, RegularPolygon, Label, Tag, Text, Group, Arrow } from 'konva';
import { ActivatedRoute, Router } from "@angular/router";
import { GenericMicroServiceTemplate } from './templates/generic.micro.service.template';
import { Template, TemplateEventsCallback, TemplateInterface, ConnectorType, Connection } from './templates/templates';
import { StaticTemplate } from './templates/static.template';
import { SingleInterfaceTemplate } from './templates/single.interface.template';
import { JavaMicroServiceTemplate } from './templates/java.micro.service.template';
import { ModelService } from '../../services/model.service';
import { CircleShape } from './shapes/circle.shape';
import { TriangleShape } from './shapes/triangle.shape';
import { SquareShape } from './shapes/square.shape';
import { DiamondShape } from './shapes/diamond.shape';


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
    public width = 4000;
    public height = 4000;

    // model title
    public modelTitle = '';

    // default font size
    private fontSize = 15;


    // model to edit
    private selectedModel: ComponentModel = null;
    public selectedId:String =null;

    // collapse
    public isVisualPropertiesSectionClosed = false;
    public isComponentPropertiesSectionClosed = false;

    // drawing arrow
    private startArrow: boolean = false;
    private lastPointerPosition;
    private arrowTargetTemplate: Template = null;

    // connections
    private connections:Connection[] = new Array<Connection>();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private service:ModelService) { }

    public toggleVisualProperties() {
        this.isVisualPropertiesSectionClosed = !this.isVisualPropertiesSectionClosed;
    }

    public toggleComponentProperties() {
        this.isComponentPropertiesSectionClosed = !this.isComponentPropertiesSectionClosed;
    }

    public getComponentX() {
        let template = this.getSelectedTemplate();
        if (template != null) {
            return parseInt(template.getX());
        }
        return '-';
    }

    public getComponentY() {
        let template = this.getSelectedTemplate();
        if (template != null) {
            return parseInt(template.getY());
        }
        return '-';
    }

    public getComponentWidth() {
        let template = this.getSelectedTemplate();
        if (template != null) {
            return parseInt(template.getWidth());
        }
        return '-';
    }

    public getComponentHeight() {
        let template = this.getSelectedTemplate();
        if (template != null) {
            return parseInt(template.getHeight());
        }
        return '-';
    }

    public getComponentColor() {
        let template = this.getSelectedTemplate();
        if (template != null) {
            return template.getHeaderColor();
        }
        return '-';
    }

    ngOnInit() {
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

    private addEditorEventHandler() {
        this.stage = this.stageComponent.getStage();
        this.layer = this.stage.getChildren()[0];

        var tempArrow: Arrow = null;
        this.stage.on('contentMousedown.proto', () => {
            this.lastPointerPosition = this.stage.getPointerPosition();
        });

        this.stage.on('contentMouseup.proto', () => {
            this.startArrow = false;
            if (this.arrowTargetTemplate == null) return;

            let source = this.getSelectedTemplate();
            let target = this.arrowTargetTemplate;

            // let sourceConnector = source.getConnectorPosition(ConnectorType.RIGHT);
            // let targetConnector = target.getConnectorPosition(ConnectorType.LEFT);

            var connection = new Connection();
            connection.inputComponentName = source.identifier.toString();
            connection.outputComponentName = target.identifier.toString();
            this.connections.push(connection);

            //connection.inputInterfaceName = 

            // let arrow = new Arrow({
            //     x: sourceConnector.x,
            //     y: sourceConnector.y,
            //     points: [0, 0, targetConnector.x - sourceConnector.x, targetConnector.y - sourceConnector.y],
            //     pointerLength: 10,
            //     pointerWidth : 10,
            //     fill: 'black',
            //     stroke: 'black',
            //     strokeWidth: 4
            // });
            // this.layer.add(arrow);
            // this.layer.draw();

            this.drawConnections();
            
            this.arrowTargetTemplate.hideConnectors();
            this.arrowTargetTemplate = null;
        });

        this.stage.on('contentMousemove.proto', (e) => {
            if (!this.startArrow) return;

            let currentPoint = this.stage.getPointerPosition();
            let x = currentPoint.x - this.lastPointerPosition.x;
            let y = currentPoint.y - this.lastPointerPosition.y;

            let currentBox = {
                x: currentPoint.x,
                y: currentPoint.y, 
                width: 10, 
                height: 10
            }

            let found = false;
            for (let index = 0; index < this.templates.length; index++) {
                let template = this.templates[index];
                if (template.identifier == this.selectedTemplate.identifier) continue;

                let box = {
                    x: template.getX(),
                    y: template.getY(),
                    width: template.getWidth(),
                    height: template.getHeight()
                }

                if (this.haveIntersection(currentBox, box)) {
                    this.arrowTargetTemplate = template;
                    console.log('found found found: ', template.name);
                    template.showConnectors();
                } else {
                    this.arrowTargetTemplate = null;
                    template.hideConnectors();
                }
            }

            if (tempArrow) { tempArrow.remove(); }

            tempArrow = new Arrow({
                x: this.lastPointerPosition.x,
                y: this.lastPointerPosition.y,
                points: [0, 0, x, y],
                pointerLength: 10,
                pointerWidth : 10,
                fill: 'black',
                stroke: 'black',
                strokeWidth: 4
            });
            this.layer.add(tempArrow);
            this.layer.draw();

            tempArrow.remove();
        });
    }

    haveIntersection(r1, r2) {
        return ((r1.x > (r2.x - 10)) && (r1.x < (r2.x + r2.width + 10)));
    }

    drawArrow(connector) {
        this.startArrow = true;
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

    public configStage = Observable.of({
        width: this.width,
        height: this.height
    });

    public addCircle() {
        let t = new CircleShape(this);
        this.templates.push(t);
        this.addGroup(t.createUI());
    }

    public addTriangle() {
        let t = new TriangleShape(this);
        this.templates.push(t);
        this.addGroup(t.createUI());
    }

    public addSquare() {
        let t = new SquareShape(this);
        this.templates.push(t);
        this.addGroup(t.createUI());
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
        let t = new DiamondShape(this);
        this.templates.push(t);
        this.addGroup(t.createUI());
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
        if (this.selectedTemplate != null && this.selectedTemplate.identifier != template.identifier) {
            let template = this.getSelectedTemplate();
            template.deselectTemplate();
        }
        this.selectedTemplate = template.clone();
        this.layer.draw();        
    }

    public addInterface() {
        if (this.selectedTemplate != null) {
            let intf = new TemplateInterface();
            this.selectedTemplate.interfaces.push(intf);
        }
    }

    public cancelPropertyChanges() {
        this.selectedTemplate = null;
        this.deselectTemplates();
    }

    public savePropertyChanges() {
        for (let index = 0; index < this.templates.length; index++) {
            var template = this.templates[index];
            if (template.identifier == this.selectedTemplate.identifier) {
                // found the one to update

                template.name = this.selectedTemplate.name;
                template.interfaces = this.selectedTemplate.interfaces;
                template.modelComponentPropertiesList = this.selectedTemplate.modelComponentPropertiesList;

                this.reloadTemplateUI(template);
                break;
            }
        }
    }

    private reloadTemplateUI(template:Template) {
        template.uiGroup.remove();
        this.layer.add(template.reloadUI());
        template.select();
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
                    this.deselectTemplates();
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

    public deselectTemplates() {
        this.templates.forEach(template => {
            let tmp = this.getTemplateById(template.identifier);
            tmp.deselectTemplate();
            this.layer.draw();
        });
    }

    // delete interface
    public onDelete(index) {
        this.selectedTemplate.interfaces.splice(index, 1);
    }

    // add property to interface
    public onAddProperty(index) {
        let intf = this.selectedTemplate.interfaces[index];
        intf.properties.push({ name: '', value: ''});
    }

    // add property to component
    public onAddComponentProperty() {
        this.selectedTemplate.modelComponentPropertiesList.push({ name: '', value: ''});
    }

    public onAddDownstreamInterface(index) {
        let intf = this.selectedTemplate.interfaces[index];
        intf.downstreamInterfaces.push({ component: '', interface: '', connectedComponent:'', connectedInterface: '' })
    }

    public onDeleteProperty(index, propertyIndex) {
        let intf = this.selectedTemplate.interfaces[index];
        intf.properties.splice(propertyIndex, 1);
    }

    public onDeleteComponentProperty(index, propertyIndex) {
        this.selectedTemplate.modelComponentPropertiesList.splice(propertyIndex, 1);
    }

    public onDeleteDownstreamInterface(index, propertyIndex) {
        let intf = this.selectedTemplate.interfaces[index];
        intf.downstreamInterfaces.splice(propertyIndex, 1);
    }

    public saveModel() {
        var components = [];
        var connections = [];

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
                        inputComponentName: template.name,
                        inputInterfaceName:  intf.name,
                        outputComponentName: intf.downstreamInterfaces[intIndex].component,
                        outputInterfaceName: intf.downstreamInterfaces[intIndex].interface
                    }
                    dinterfaces.push(intObject);
                    connections.push(intObject);
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
                color: template.getHeaderColor(),
                height: '' + template.getHeight(),
                id: '',
                shape: '',
                width: '' + template.getWidth(),
                xPosition: '' + template.uiGroup.getAttrs().x,
                yPosition: '' + template.uiGroup.getAttrs().y
            }

            var modelComponentPropertiesList = [];
            for (let propIndex = 0; propIndex < template.modelComponentPropertiesList.length; propIndex ++) {
                let prop = template.modelComponentPropertiesList[propIndex];
                var propObject = {
                    key: prop.name,
                    value: prop.value,
                }

                modelComponentPropertiesList.push(propObject);
            }

            var component = {
                title: template.name,
                templateName: template.type,
                modelComponentPropertiesList: modelComponentPropertiesList,
                modelComponentInterfaceList: interfaces,
                modelComponentVisualProperties: visualProperties
                
            }

            components.push(component);
        }

        var body = {            
            modelBranchId: "test-branch",
            modelComponentList: components,
            modelInterfaceEndPointsList:connections,

            title: this.modelTitle
        }

        if (this.selectedModel == null) {
            // create a model
            console.log(body);
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
}
