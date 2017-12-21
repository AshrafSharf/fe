import { ValidationResult, VariableComponentBehavior, TimeSegment } from './../../../shared/interfaces/variables';
import { VariableExpressionComponent } from './../expression/expression.variable.component';
import { VariableConstantComponent } from './../constant/constant.variable.component';
import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ModalDialogService } from '../../../services/modal-dialog.service';
import { VariableTableComponent } from '../table/table.variable.component';
import { Moment, unix } from 'moment';

@Component({
    selector: 'time-segment',
    templateUrl: './time.segment.component.html',
    styleUrls: ['./time.segment.component.css']
})
export class TimeSegmentComponent implements OnInit {
    @Input('segment-id') segmentId:String;
    @Input('variable-type') variableType:String;
    @Output('delete') deleted = new EventEmitter();
    @Input('is-expanded') isExpanded:Boolean = false;
    @Input('branch-id') branchId: String = '';
    @Input('time-segment') timeSegment: TimeSegment = null;

    
    @ViewChild(VariableConstantComponent) variableConstant: VariableConstantComponent;
    @ViewChild(VariableExpressionComponent) variableExpression: VariableExpressionComponent;
    @ViewChild(VariableTableComponent) variableTable: VariableTableComponent;

    endDate: any;
    startDate: any;

    selectedInputMethod = 'constant';
    comment = '';
    
    datePickerConfig = { format : 'DD-MM-YYYY hh:mm' };
    
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
        if (this.timeSegment != null) {
            if (this.timeSegment.startTime != null) { 
                if (typeof(this.timeSegment.startTime) == "string") {
                    console.log("yes");
                    let date:Date;
                    if (this.timeSegment.startTime.length == 0) {
                        date = new Date();
                    } else {
                        //let time = Date.parse(this.timeSegment.startTime.toString());
                        let datePart = this.timeSegment.startTime.split(' ')[0];
                        let parts = datePart.split('-');
                        let day = parts[0]; 
                        let month = parts[1];
                        let year = parts[2];

                        date = new Date(`${month}/${day}/${year}`);
                    }

                    this.startDate = unix(date.getTime() / 1000);
                    this.endDate = this.startDate;
                
                } else {
                    console.log("no");
                    this.startDate = this.timeSegment.startTime;
                    this.endDate = this.startDate;
                }
            } 

            if (this.timeSegment.inputMethod != null) { this.selectedInputMethod = this.timeSegment.inputMethod.toString(); }
            if (this.timeSegment.description != null) { this.comment = this.timeSegment.description.toString(); }
        }
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
        } else if (this.selectedInputMethod == 'table') {
            // table
            result = this.variableTable.isValid();
            method = this.variableTable;
        }

        if (result.result) {            
            var input = method.getInput();

            if (typeof(this.startDate) != "string") {
                this.startDate = this.startDate.format("DD-MM-YYYY hh:mm");
            }
            input['startTime'] = this.startDate;
            input['description'] = this.comment;
            input['inputMethod'] = this.selectedInputMethod;
            
            result.reason = input;
        }

        return result;
    }
}
