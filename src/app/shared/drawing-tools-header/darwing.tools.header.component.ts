import { Component, OnInit, Output,Input, EventEmitter } from '@angular/core';


@Component({
    selector: 'app-drawing-tools-header',
    templateUrl: './darwing.tools.header.component.html',
    styleUrls: ['./darwing.tools.header.component.css']
})

export class DrawingToolsHeaderComponent implements OnInit {

    @Output('static-template') staticTemplate = new EventEmitter();
    @Output('single-inheritance-template') singleInheritanceTemplate = new EventEmitter();
    @Output('generic-micro-service-template') genericMicroTemplate = new EventEmitter();
    @Output('java-micro-service-template') javaMicroServiceTemplate = new EventEmitter();
    @Output('shape-circle') shapeCircle = new EventEmitter();
    @Output('shape-diamond') shapeDiamond = new EventEmitter();
    @Output('shape-triangle') shapeTriangle = new EventEmitter();
    @Output('shape-square') shapeSquare = new EventEmitter();
    @Output('shape-label') shapeLabel = new EventEmitter();
    @Output('zoom-in') zoomInEvent = new EventEmitter();
    @Output('zoom-out') zoomOutEvent = new EventEmitter();
    @Output('save') saveEvent = new EventEmitter();
    @Output('cancel') cancelEvent = new EventEmitter();
    @Output('verify') verifyEvent = new EventEmitter();
    @Output('input-value') inputTemplate = new EventEmitter();
    @Output('start-group-selection') selectGroupEvent = new EventEmitter();
    @Output('stop-group-selection') stopSelectGroupEvent = new EventEmitter();
    @Output('group') groupEvent = new EventEmitter();
    @Output('ungroup') ungroupEvent = new EventEmitter();
    @Output('copy-group') copyGroupEvent = new EventEmitter();
    @Output('delete-group') deleteGroupEvent = new EventEmitter();
    @Output('ec2-micro-service-template') ec2MicroServiceTemplate = new EventEmitter();
    @Output('ec2-component-template') ec2ComponentTemplate = new EventEmitter();

    @Input('showModifyButtons') showModifyButtons = true;
    public sTemplateDisabled: boolean = false;
    public siTemplateDisabled: boolean = false;
    public gmsTemplateDisabled: boolean = false;
    public jmsTemplateDisabled: boolean = false;
    public ipTemplateDisabled: boolean = false;


    public circleTemplateDisabled: boolean = false;
    public diamondTemplateDisabled: boolean = false;
    public triangleTemplateDisabled: boolean = false;
    public squareTemplateDisabled: boolean = false;
    public labelTemplateDisabled: boolean = false;
    
    public zoomInDisabled: boolean = false;
    public zoomOutDisabled: boolean = false;

    @Input('pointer-disabled') pointerDisabled: boolean = false;
    @Input('group-disabled')  groupDisabled: boolean = true;

    @Input('ungroup-disabled')  ungroupDisabled: boolean = true;
    @Input('copy-group-disabled')  copyGroupDisabled: boolean = true;
    @Input('delete-group-disabled')  deleteGroupDisabled: boolean = true;

    public saveDisabled = false;
    public cancelDisabled = false;
    public verifyDisabled = false;
    
    constructor() { }

    ngOnInit() { }

    public setartSelectionForGroup() {
        if (this.pointerDisabled) {
            this.stopSelectGroupEvent.emit();
            this.pointerDisabled = false;
            
            this.groupDisabled = true;
            this.ungroupDisabled = false;
            this.sTemplateDisabled = false;
        } else {
            this.selectGroupEvent.emit();
            this.pointerDisabled = true;

            this.groupDisabled = false;
            this.ungroupDisabled = true;
            this.sTemplateDisabled = true;
        }
    }

    public group() {
        this.groupEvent.emit();

        this.pointerDisabled = false;
            
        this.groupDisabled = true;
        this.ungroupDisabled = true;
        this.sTemplateDisabled = false;
    }

    public ungroup() {
        this.ungroupEvent.emit();

        this.pointerDisabled = false;
            
        this.groupDisabled = true;
        this.ungroupDisabled = true;
        this.sTemplateDisabled = false;
    }

    public copyGroup(){
        this.copyGroupEvent.emit();
    }

    public deleteGroup(){
        this.deleteGroupEvent.emit();
    }

    public drawInputTemplate() {
        this.inputTemplate.emit();
    }

    public save(event) {
        this.saveEvent.emit(event);
    }

    public cancel() {
        this.cancelEvent.emit();        
    }

    public verify(event) {
        this.verifyEvent.emit(event);        
    }

    public drawStaticTemplate() {
        this.staticTemplate.emit();
    }

    public drawSingleInheritance() {
        this.singleInheritanceTemplate.emit();
    }

    public drawGenericMicroService() {
        this.genericMicroTemplate.emit();
    }

    public drawJavaMicroService() {
        this.javaMicroServiceTemplate.emit();
    }
    
    public drawEc2MicroServiceTemplate(){
        this.ec2MicroServiceTemplate.emit();
    }

    public drawEc2ComponentTemplate(){
        this.ec2ComponentTemplate.emit();
    }
    public drawCircle() {
        this.shapeCircle.emit();
    }

    public drawDiamond() {
        this.shapeDiamond.emit();
    }

    public drawTriangle() {
        this.shapeTriangle.emit();
    }

    public drawSquare() {
        this.shapeSquare.emit();
    }

    public drawLabel() {
        this.shapeLabel.emit();
    }

    public zoomIn() {
        this.zoomInEvent.emit();
    }

    public zoomOut() {
        this.zoomOutEvent.emit();
    }
}
