import { ValidationResult, VariableComponentBehavior } from './../../../shared/interfaces/variables';
import { VariableExpressionComponent } from './../expression/expression.variable.component';
import { VariableConstantComponent } from './../constant/constant.variable.component';
import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ModalDialogService } from '../../../services/modal-dialog.service';

@Component({
    selector: 'time-segment',
    templateUrl: './time.segment.component.html',
    styleUrls: ['./time.segment.component.css']
})
export class TimeSegmentComponent implements OnInit {
    @Input('segment-id') segmentId:String;
    @Output('delete') deleted = new EventEmitter();
    @Input('is-expanded') isExpanded:Boolean = false;
    @Input('branch-id') branchId: String = '';

    
    @ViewChild(VariableConstantComponent) variableConstant: VariableConstantComponent;
    @ViewChild(VariableExpressionComponent) variableExpression: VariableExpressionComponent;

    startDate = '';
    selectedInputMethod = 'constant';
    comment = '';
    
    constructor(
        private modal: ModalDialogService
    ) { }

    onDelete() {
        this.deleted.emit();
    }

    toggleCollapse() {
        this.isExpanded = !this.isExpanded;
    }

    ngOnInit() {

    }

    getTimeSegmentValues(): ValidationResult {

        var result: ValidationResult = { result:true, reason: '' };
        var method: VariableComponentBehavior;

        if (this.startDate == undefined) {
            result.result = false;
            result.reason = 'start date is missing';
        } else if (this.selectedInputMethod == 'constant') {
            // constant
            result = this.variableConstant.isValid();
            method = this.variableConstant;
        } else if (this.selectedInputMethod == 'expression') {
            // expression
            result = this.variableExpression.isValid();
            method = this.variableExpression;
        }

        if (result.result) {            
            var input = method.getInput();
            input['startTime'] = this.startDate;
            input['description'] = this.comment;
            input['inputMethod'] = this.selectedInputMethod;
            
            result.reason = input;
        }

        return result;
    }
}