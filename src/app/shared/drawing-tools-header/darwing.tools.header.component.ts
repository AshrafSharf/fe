import { Component, OnInit, Output, EventEmitter } from '@angular/core';


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

    constructor() { }

    ngOnInit() { }

    public drawInputTemplate() {
        this.inputTemplate.emit();
    }

    public save() {
        this.saveEvent.emit();
    }

    public cancel() {
        this.cancelEvent.emit();        
    }

    public verify() {
        this.verifyEvent.emit();        
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