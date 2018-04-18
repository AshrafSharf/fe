import { ComponentModel } from './../../shared/interfaces/component.model';
import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { StageComponent } from 'ng2-konva';
import { Layer, Stage, Node, Shape, Rect, Transform, Circle, Star, RegularPolygon, Label, Tag, Text, Group, Arrow } from 'konva';
import { ActivatedRoute, Router } from "@angular/router";
import { GenericMicroServiceTemplate } from './templates/generic.micro.service.template';
import { Template, TemplateEventsCallback, TemplateInterface, ConnectorType, Connection, TemplateGroup } from './templates/templates';
import { StaticTemplate } from './templates/static.template';
import { SingleInterfaceTemplate } from './templates/single.interface.template';
import { JavaMicroServiceTemplate } from './templates/java.micro.service.template';
import { ModelService } from '../../services/model.service';
import { CircleShape } from './shapes/circle.shape';
import { TriangleShape } from './shapes/triangle.shape';
import { SquareShape } from './shapes/square.shape';
import { DiamondShape } from './shapes/diamond.shape';
import { InputTemplate } from './templates/input.template';
import { Modal } from 'ngx-modialog/plugins/bootstrap';
import { ModelShape } from './shapes/model.shape';
import { Ec2MicroServiceTemplate } from './templates/ec2.micro.service.template';
import { Ec2ComponentTemplate } from './templates/ec2.component.template';



@Component({
    selector: 'component-model',
    templateUrl: './model.component.html',
    styleUrls: ['./model.component.css']
})
export class ComponentModelComponent implements OnInit, TemplateEventsCallback {

    @ViewChild(StageComponent) stageComponent:StageComponent;
    
    public instanceTypes:string[] = ["none", "t2.small","t2.medium","t2.large", "m5.large",
                                        "m5.xlarge", "m5.2xlarge"];

    private layer: Layer;
    private stage: Stage;

    // list of templatea
    public templates: Array<Template> = new Array<Template>();

    //list of labels
    public labels: Array<Text> = new Array<Text>();

    // selected template
    public selectedTemplate:Template = null;

    // Selected tab
    public selectedTab = 'component_properties';

    // drawing area
    public width = 4000;
    public height = 4000;

    // model title
    public modelTitle = '';

    // default font size
    private fontSize = 15;

    // model to edit
    private selectedModel: ComponentModel = null;
    public selectedId:String = null;

    // collapse
    public isVisualPropertiesSectionClosed = false;
    public isComponentPropertiesSectionClosed = false;

    // drawing arrow
    private startArrow: boolean = false;
    private lastPointerPosition;
    private arrowTargetTemplate: Template = null;
    public showConnectionsDialog = false;
    public connectionSourceInterface: string = '';
    public connectionTargetInterface: string = '';

    // connections
    private connections:Connection[] = new Array<Connection>();

    // grouping and ungrouping
    private selectedTemplates: Template[] = new Array<Template>();
    private startSelection = false;
    private groupSelectionStarted = false;
    private templateGroups: TemplateGroup[] = new Array<TemplateGroup>();
    public selectedGroup:TemplateGroup = null;
    private shiftKey:boolean = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private service:ModelService,
        public modal:Modal) { }

    @HostListener('window:keydown', ['$event'])
    handleKeyboardEventDown(event: KeyboardEvent) {
        if (event.key == 'Shift') {
            this.shiftKey = true;
        }
    }

    @HostListener('window:keyup', ['$event'])
    handleKeyboardEventUp(event: KeyboardEvent) {
        if (event.key == 'Shift') {
            this.shiftKey = false;
        }
    }

    public toggleVisualProperties() {
        this.isVisualPropertiesSectionClosed = !this.isVisualPropertiesSectionClosed;
    }

    public toggleComponentProperties() {
        this.isComponentPropertiesSectionClosed = !this.isComponentPropertiesSectionClosed;
    }

    public canAddInterface() {
        let template = this.getSelectedTemplate();
        if (template != null) {
            return template.canAddInterface();
        }
        return false;
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

    public groupTemplates() {
        if (this.selectedTemplates.length == 0) return;

        var group = new TemplateGroup();
        group.addTemplates(this.selectedTemplates);
        this.templateGroups.push(group);

        for (var index = 0;index < this.selectedTemplates.length; index++) {
            this.selectedTemplates[index].deselectTemplate();
            this.selectedTemplates[index].hideConnectors();
        }

        this.layer.add(group.group);
        this.layer.draw();

        this.groupSelectionStarted = false;
    }

    public ungroupTemplates() {
        if (this.selectedGroup == null) return;
        this.selectedGroup.ungroup();
        for (var index = 0; index < this.templateGroups.length; index++) {
            if  (this.templateGroups[index].identifer == this.selectedGroup.identifer) {
                this.templateGroups.splice(index, 1);
                break;
            }
        }
        this.selectedGroup = null;
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
                            
                            // create component templates
                            for (let index = 0; index < this.selectedModel.modelComponentList.length; index++) {

                                // create template
                                let tempTemplate = this.selectedModel.modelComponentList[index];
                                var template: Template;
                                if (tempTemplate.templateName == 'GenericMicroServiceTemplate') {
                                    template = new GenericMicroServiceTemplate(this);
                                } else if (tempTemplate.templateName == 'Ec2ComponentTemplate') {
                                    template = new Ec2ComponentTemplate(this);
                                } else if (tempTemplate.templateName == 'JavaMicroServiceTemplate') {
                                    template = new JavaMicroServiceTemplate(this);
                                } else if (tempTemplate.templateName == 'StaticTemplate') {
                                    template = new StaticTemplate(this);
                                } else if (tempTemplate.templateName == 'SingleInterfaceTemplate') {
                                    template = new SingleInterfaceTemplate(this);
                                } else if (tempTemplate.templateName == 'InputTemplate') {
                                    template = new InputTemplate(this);
                                } else if (tempTemplate.templateName == 'Ec2MicroServiceTemplate') {
                                    template = new Ec2MicroServiceTemplate(this);
                                }

                                template.name = tempTemplate.title;

                                if (template instanceof JavaMicroServiceTemplate || template instanceof Ec2ComponentTemplate){
                                    console.log(tempTemplate.instanceType);
                                    template.instanceType = tempTemplate.instanceType;
                                    console.log(template.instanceType);
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
                                        if (property != null){
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

                                var group = template.createUI(x, y);
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
                                connection.connectionProperties = tempConnection.outputProperties
                                this.connections.push(connection);
                                
                            }
                            console.log(this.connections);
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

                                var group = template.createUI(x, y);
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

    public changeTab(tab) {
        this.selectedTab = tab;
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

    currentSelection: {x: number, y: number, width: number, height: number};
    private addEditorEventHandler() {
        this.stage = this.stageComponent.getStage();
        this.layer = this.stage.getChildren()[0];

        var tempArrow: Arrow = null;
        var tempPolygon: Rect = null;

        // this.stage.on('contentClick', () => {
        //     console.log('content click on ' + JSON.stringify(this.stage.getPointerPosition()));
        // });

        this.stage.on('contentMousedown.proto', () => {
            this.lastPointerPosition = this.stage.getPointerPosition();
            //this.startSelection = true;

            if (!this.startArrow) {
                if (this.selectedTemplate) {
                    this.selectedTemplate.hideConnectors();
                    this.getSelectedTemplate().deselectTemplate();
                    this.selectedTemplate = null;
                    this.layer.draw();
                }
            }
            
            if (this.selectedGroup) {
                this.selectedGroup.deselect();
                this.selectedGroup = null;
                this.layer.draw();
            }

            this.selectedTemplates.forEach(template => {
                template.hideConnectors();
                this.layer.draw();
            });

            if (!this.groupSelectionStarted) {
                this.selectedTemplates.splice(0, this.selectedTemplates.length);
            }
        });

        this.stage.on('contentMouseup.proto', () => {
            if (this.startArrow) {
                if (tempArrow) {
                    tempArrow.remove();
                    this.layer.draw();
                }
    
                this.startArrow = false;
                if (this.arrowTargetTemplate == null) {
                    return;
                }
    
                this.showConnectionsDialog = true;
            } else if (this.startSelection) {                
                this.currentSelection = {
                    x: this.lastPointerPosition.x,
                    y: this.lastPointerPosition.y, 
                    width: tempPolygon.width(), 
                    height: tempPolygon.height()
                }
    
                let found = false;
                for (let index = 0; index < this.templates.length; index++) {
                    let template = this.templates[index];

                    let box = {
                        x: template.getX(),
                        y: template.getY(),
                        width: template.getWidth(),
                        height: template.getHeight()
                    }
    
                    if (this.containsTemplate(this.currentSelection, box)) {
                        template.showConnectors();
                        this.selectedTemplates.push(template);
                    }
                }

                if (tempPolygon) {
                    tempPolygon.remove();
                    this.layer.draw();
                }
                    
                this.startSelection = false;
            }
        });

        this.stage.on('contentMousemove.proto', (e) => {
            if (this.startArrow) {
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
                        template.showConnectors();
                        break;
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
                    pointerLength: 5,
                    pointerWidth : 5,
                    fill: 'black',
                    stroke: 'black',
                    strokeWidth: 2
                });
    
                this.layer.add(tempArrow);
                this.layer.draw();
    
                tempArrow.remove();
            } else if (this.startSelection == true) {
                let x1 = this.lastPointerPosition.x;
                let y1 = this.lastPointerPosition.y;

                let currentPoint = this.stage.getPointerPosition();
                let x2 = currentPoint.x;// - this.lastPointerPosition.x;
                let y2 = currentPoint.y;// - this.lastPointerPosition.y;
    
                tempPolygon = new Rect({
                    x: x1,
                    y: y1,
                    width: (x2 - x1),
                    height: (y2 - y1),
                    stroke: 'blue',
                    strokeWidth: 1
                });
    
                this.layer.add(tempPolygon);
                this.layer.draw();
    
                tempPolygon.remove();
            }
        });
    }

    public copyGroup() {
        if (this.selectedGroup == null) return;

        var newGroup = new TemplateGroup();
        let templates:Template[] = this.selectedGroup.getTemplates();
        for (var index = 0; index < templates.length; index++) {
            let temp = templates[index];
            var template: Template = temp.cloneWithoutId();
            var ui = template.createUI(temp.getX() + 5, temp.getY() + 5);
            newGroup.addTemplate(template);
            this.templates.push(template);
            this.layer.add(ui);
        }

        this.templateGroups.push(newGroup);

        this.layer.draw();
    }

    public deleteGroup() {
        if (this.selectedGroup == null) return;

        const dialog =
            this.modal
                .confirm()
                .title('Confirmation')
                .body('Are you sure you want to delete this group?')
                .okBtn('Yes').okBtnClass('btn btn-danger')
                .cancelBtn('No')
                .open();
        dialog.then(promise => {
            promise.result.then(result => {
                this.selectedGroup.deleteGroup();
                this.selectedTemplate = null;
                this.selectedGroup = null;
                this.layer.draw();
            });
        });
    }

    public makeConnection() {

        let source = this.getSelectedTemplate();
        let target = this.arrowTargetTemplate;

        // let sourceConnector = source.getConnectorPosition(ConnectorType.RIGHT);
        // let targetConnector = target.getConnectorPosition(ConnectorType.LEFT);

        var connection = new Connection();
        connection.inputComponentName = source.identifier.toString();
        connection.outputComponentName = target.identifier.toString();
        connection.inputInterfaceName = this.connectionSourceInterface;
        connection.outputInterfaceName =  this.connectionTargetInterface;
        console.log(source.getType());
        if (source.getType()=="JavaMicroServiceTemplate"){
            connection.connectionProperties.push({
                key:"sequence #",
                value:"-1"
            });
            connection.connectionProperties.push({
                key:"multiplier",
                value:"1"
            });
            
            connection.connectionProperties.push({
                key:"probability",
                value:"1"
            });

            console.log(connection.connectionProperties);
        }

        this.connections.push(connection);

        this.drawConnections();

        this.arrowTargetTemplate.hideConnectors();
        this.arrowTargetTemplate = null;
        this.selectedTemplate.hideConnectors();

        this.layer.draw();
        this.showConnectionsDialog = false;
    }

    public cancelConnection() {
        this.arrowTargetTemplate.hideConnectors();
        this.arrowTargetTemplate = null;
        this.selectedTemplate.hideConnectors();

        this.layer.draw();
        this.showConnectionsDialog = false;
    }

    public getDownstreamInterfaces( ifName:String){
        let selectedIfConnections = [];
        for (let connection of this.connections){
            if ( connection.inputInterfaceName == ifName){
                selectedIfConnections.push(connection);
            }
        }
        return selectedIfConnections;
    }
    private haveIntersection(r1, r2) {

        return (((r1.x > (r2.x - 10)) && (r1.x < (r2.x + r2.width + 10))) &&
               ((r1.y > (r2.y)) && (r1.y < (r2.y + r2.height + 10))));
    }

    private containsTemplate(r1, r2) {
        let x1 = r1.x;
        let y1 = r1.y;

        let x2 = x1;
        let y2 = y1 + r1.height;

        let x3 = r2.x;
        let y3 = r2.y;

        let x4 = x3;
        let y4 = y3 + r2.height;

        let result = ((x1 <= x3) && (y1 <= y3)) && 
               ((x2 <= x4) && (y2 >= y4)) && 
               (r1.width >= r2.width) &&
               (r1.height >= r2.height);
        return result;
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
        else{
            label = new Text({
                x : Math.random() * 800,
                y : Math.random() * 800,
                text:'this is a label',
                fontSize: this.fontSize,
                draggable: true
            });
        }

        layer.add(label);

        layer.draw();

        label.on('dblclick', () => {
           console.log(label);
            
            // first we need to find its positon
            var textPosition = label.getAbsolutePosition();
            var stageBox = st.container().getBoundingClientRect();

            var areaPosition = {
                x: textPosition.x + stageBox.left,
                y: textPosition.y + stageBox.top
            };

            // create textarea and style it
            var textarea = document.createElement('textarea');
            document.body.appendChild(textarea);

            textarea.value = label.text();
            textarea.style.position = 'absolute';
            textarea.style.top = areaPosition.y + 'px';
            textarea.style.left = areaPosition.x + 'px';
            textarea.style.width = String(label.width());

            textarea.focus();


            textarea.addEventListener('keydown', function (e) {
                // hide on enter
                if (e.keyCode === 13) {
                    label.text(textarea.value);
                    layer.draw();
                    document.body.removeChild(textarea);
                }
            });
        });

        this.labels.push(label);
    }

    public onDoubleClick(event) {
        
        event.cancelBubble = true;
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
         //add EC2/Pod Properties
         t.fixedProperties.push({
            name: 'Volume per Pod (tps)',
            value: "0"
        });

        t.fixedProperties.push( {
            name: '# Pods per Instance',
            value: "0"
        });
        this.templates.push(t);
        this.addGroup(t.createUI());
    }

    public addEc2Component(){
        let t = new Ec2ComponentTemplate(this);
         //add EC2 property
         t.fixedProperties.push({
            name: 'Volume per instance',
            value: "0"
        });
        this.templates.push(t);
        console.log(t);
        this.addGroup(t.createUI());
    }

    public addEc2MicroService(){
        let t = new Ec2MicroServiceTemplate(this);

        //add EC2/Pod Properties
        t.fixedProperties.push({
                name: 'Volume per Pod (tps)',
                value: "0"
            }
        );

        t.fixedProperties.push( {
            name: '# Pods per Instance',
            value: "0"
        });

        this.templates.push(t);
        console.log(t);
        this.addGroup(t.createUI());
    }

    public addInputTemplate(){
        let t = new InputTemplate(this);
        t.interfaces = new Array<TemplateInterface>();

        var templateInterface = new TemplateInterface();
        templateInterface.name = 'internal_interface';
        templateInterface.latency = '0';
        t.interfaces.push(templateInterface);

        t.fixedProperties.push({
            name: 'Display Name',
            value: ''
        });

        this.templates.push(t);
        this.addGroup(t.createUI());
    }

    private addGroup(group) {
        this.addEditorEventHandler();
        this.layer.add(group);
        this.layer.draw();
    }

    public startGroupSelection() {
        this.groupSelectionStarted = true;
    }

    public stopGroupSelection() {
        this.groupSelectionStarted = false;
    }

    public templateClicked(template: any) {
        this.selectedTab = 'component_properties';
        if (this.selectedTemplate != null && this.selectedTemplate.identifier != template.identifier) {
            let template = this.getSelectedTemplate();
            template.deselectTemplate();
        }

        if (this.groupSelectionStarted) {
            if (this.shiftKey) {
                // shift key is pressed.. allow user to create group
                var temp = template as Template;

                let found = false;
                for (var index = 0; index < this.selectedTemplates.length; index++) {
                    if (this.selectedTemplates[index].identifier == temp.identifier) {
                        found = true;
                        this.selectedTemplates[index].deselectTemplate();
                        this.selectedTemplates.splice(index, 1);
                        break;
                    }
                }

                if (!found) {
                    temp.select();
                    this.selectedTemplates.push(template);
                }
            } else {
                this.selectedTemplate = template;
            }

        } else {
            this.selectedTemplate = null;

            if (this.selectedGroup != null) {
                this.selectedGroup.deselect();
            }

            // check if this is a part of any group
            let foundInGroup = false;
            for (var index = 0; index < this.templateGroups.length; index++) {
                if (this.templateGroups[index].contains(template.identifier)) {
                    this.selectedGroup = this.templateGroups[index];
                    foundInGroup = true;
                    break;
                }
            } 
    
            if (foundInGroup) {
                this.selectedGroup.select();
            }
            
            this.selectedTemplate = template.clone();
            console.log(this.selectedTemplate);
        }

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
                //save instanceType if applicable
                if(this.selectedTemplate instanceof JavaMicroServiceTemplate && template instanceof JavaMicroServiceTemplate){
                    template.instanceType = this.selectedTemplate.instanceType;
                }else if (this.selectedTemplate instanceof Ec2ComponentTemplate && template instanceof Ec2ComponentTemplate){
                        template.instanceType = this.selectedTemplate.instanceType;
                }
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

    public saveModel(event) {
        if (this.modelTitle.length == 0) {
            this.modal.alert()
                .title('Warning')
                .body('Please enter model title')
                .open();
        } else {

            var components = [];
            var connections = [];
            var shapes = [];
            var labels = [];

            for (let label of this.labels){
                 let storedLabel = {
                    text: label.text(),
                    color: "black",
                    height: '' + label.getHeight(),
                    width: '' + label.getWidth(),
                    xposition: '' + label.position().x,
                    yposition: '' + label.position().y
                }
                labels.push(storedLabel);
            }
            
            
            // get components
            for (let index = 0; index < this.templates.length; index++) {
                var displayName;
                var instanceType;
                var template = this.templates[index];
                if((template instanceof ModelShape)){
                
                    var visualProperties = {
                        color: template.getHeaderColor(),
                        height: '' + template.getHeight(),
                        id: '',
                        shape: '',
                        width: '' + template.getWidth(),
                        xPosition: '' + template.uiGroup.getAttrs().x,
                        yPosition: '' + template.uiGroup.getAttrs().y
                    }
                    var shape = {
                        title: template.name,
                        templateName: template.type,
                        modelComponentPropertiesList: [],
                        modelComponentInterfaceList: [],
                        modelComponentVisualProperties: visualProperties
                    }

                    shapes.push(shape);
                }

                if(!(template instanceof ModelShape)){
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

                        // get all component downstream interfaces
                        for (let intIndex = 0; intIndex < intf.downstreamInterfaces.length; intIndex++) {
                            var intObject = {
                                inputModelInterfaceName:  template.name +"_"+ intf.name,
                                outputModelInterfaceName: intf.downstreamInterfaces[intIndex].component
                            }
                            //dinterfaces.push(intObject);
                            //connections.push(intObject);
                        }
                    

                        var intfObj = {
                            title: intf.name,
                            latency: intf.latency,
                            modelInterfacePropertiesList: properties
                            //modelInterfaceEndPointsList: dinterfaces
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

                    var fixedPropertiesList = [];

                    if (template.fixedProperties != null){
                        for (let prop of template.fixedProperties){
                             var propObj = {
                                key: prop.name,
                                value:prop.value
                            }
                            fixedPropertiesList.push(propObj);
                        }
                    }

                    if (template instanceof InputTemplate){
                        displayName = template.getTitle();
                    
                    }

                    if (template instanceof JavaMicroServiceTemplate || template instanceof Ec2ComponentTemplate){
                        instanceType = template.instanceType;
                    }

                    var component = {
                        title: template.name,
                        displayName: displayName,
                        instanceType: instanceType,
                        fixedProperties: fixedPropertiesList,
                        templateName: template.type,
                        modelComponentPropertiesList: modelComponentPropertiesList,
                        modelComponentInterfaceList: interfaces,
                        modelComponentVisualProperties: visualProperties
                        
                    }
                    components.push(component);
                }
            }
            for (var index = 0; index < this.connections.length; index++) {
                var connection = this.connections[index];
                let source = this.getTemplateById(connection.inputComponentName);
                let target = this.getTemplateById(connection.outputComponentName);

                console.log( connection.connectionProperties);
                var interfaceObj = {
                    inputComponentName: source.name,
                    inputInterfaceName: connection.inputInterfaceName,
                    outputComponentName: target.name,
                    outputInterfaceName: connection.outputInterfaceName,
                    outputProperties: connection.connectionProperties
                }

                connections.push(interfaceObj);
            }
            console.log(shapes);
            console.log(this.labels);
            var body = {            
                modelBranchId: "test-branch",
                modelComponentList: components,
                modelInterfaceEndPointsList:connections,
                shapesList: shapes,
                labelList: labels,
                title: this.modelTitle
            }

            if (this.selectedModel == null) {
                // create a model
                console.log(body);
                this.service
                    .createModel(body)
                    .subscribe(result => {
                        console.log(result)
                        if (event.srcElement.id == "verify") {
                            this.onVerify();
                        }
                        else{
                            this.router.navigate(['home/component_model-list']);
                        }
                    });
            } else {
                // update the model
                this.service
                    .updateModel(this.selectedModel.id, body)
                    .subscribe(result => {
                        console.log(result)
                        console.log(event);
                        if (event.srcElement.id == "verify") {
                            this.onVerify();
                        }
                        else{
                            this.router.navigate(['home/component_model-list']);
                        }
                    });
            }
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

    private getTemplateByName(name) {
        for (let index = 0; index < this.templates.length; index++) {
            var template = this.templates[index];
            if (template.name == name) {
                return template;
            }
        }

        return null;
    }

    public handle(event){
        event.preventDefault();
    }
}
