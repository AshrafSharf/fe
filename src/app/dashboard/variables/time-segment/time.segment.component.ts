import { VariableBreakdownComponent } from './../breakdown/breakdown.variable.component';
import { ValidationResult, VariableComponentBehavior, TimeSegment, VariableType, Subvariable } from './../../../shared/interfaces/variables';
import { VariableExpressionComponent } from './../expression/expression.variable.component';
import { VariableConstantComponent } from './../constant/constant.variable.component';
import { Component, OnInit, Input, Output, EventEmitter, ViewChild, SimpleChanges } from '@angular/core';
import { ModalDialogService } from '../../../services/modal-dialog.service';
import { VariableTableComponent } from '../table/table.variable.component';
import { Moment, unix } from 'moment';
import { OnChanges, DoCheck } from '@angular/core/src/metadata/lifecycle_hooks';

@Component({
    selector: 'time-segment',
    templateUrl: './time.segment.component.html',
    styleUrls: ['./time.segment.component.css']
})
export class TimeSegmentComponent implements OnInit, OnChanges, DoCheck {
    
    
    @Input('segment-id') segmentId:String;
    @Input('variable-type') variableType:String;
    @Output('delete') deleted = new EventEmitter();
    @Input('is-expanded') isExpanded:Boolean = false;
    @Input('branch-id') branchId: String = '';
    @Input('time-segment') timeSegment: TimeSegment = null;
    @Input('composit-variable-type-list') compositVariableTypeList: Subvariable[];
    variableTypeList: Subvariable[] = Array<Subvariable>();
    
    @ViewChild(VariableConstantComponent) variableConstant: VariableConstantComponent;
    @ViewChild(VariableExpressionComponent) variableExpression: VariableExpressionComponent;
    @ViewChild(VariableTableComponent) variableTable: VariableTableComponent;
    @ViewChild(VariableBreakdownComponent) variableBreakDown: VariableBreakdownComponent;

    endDate: any;
    startDate: any;
    selectedInputMethod = 'constant';
    comment = '';
    
    datePickerConfig = { format : 'DD-MM-YYYY hh:mm' };
    
    constructor(
        private modal: ModalDialogService
    ) { }

    ngOnChanges(changes: SimpleChanges): void {
        console.log(changes);
    }

    isSubvariableAdded(name) {
        for (var index = 0; index < this.variableTypeList.length; index++) {
            if (this.variableTypeList[index].name == name) {
                return true;
            }
        }

        return false;
    }

    ngDoCheck(): void {
        // make copy of the existing key-value pairs
        if (this.timeSegment.subVariables == undefined || this.timeSegment.subVariables.length == 0) {
            if (this.compositVariableTypeList != undefined) {
                this.compositVariableTypeList.forEach(type => {
                    if (!this.isSubvariableAdded(type.name)) {
                        this.variableTypeList.push({name: type.name, value: type.value, percentageTime: type.percentageTime});
                    }
                });
            }
        }
    }

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

            if (this.timeSegment.subVariables != undefined) {
                this.timeSegment.subVariables.forEach(type => {
                    if (!this.isSubvariableAdded(type.name)) {
                        this.variableTypeList.push({name: type.name, value: type.value, percentageTime: type.percentageTime});
                    }
                });
            }
        }
    }

    getTimeSegmentValues(): ValidationResult {
        var result: ValidationResult = { result:true, reason: '' };
        if (this.variableType == 'breakdown') {

            let finalValue = 0, finalPercentage = 0;
            this.variableTypeList.forEach((variable) => {
                finalValue += parseFloat(variable.value.toString());
                if (this.variableType == 'discrete') {
                    finalPercentage += parseFloat(variable.percentageTime.toString());
                }
            });

            if (this.variableType == 'breakdown' && finalValue != 1) {
                result.result = false;
                result.reason = "All the subvariable value must add up to 1.0"
            } else if (this.variableType == 'discrete' && finalPercentage != 100) {
                result.result = false;
                result.reason = "All the subvariable value must add up to 100%"
            } else {
                let input:any = {};
                if (typeof(this.startDate) != "string") {
                    this.startDate = this.startDate.format("DD-MM-YYYY hh:mm");
                }

                input['startTime'] = this.startDate;
                input['description'] = this.comment;
                input['subVariables'] = this.variableTypeList;
                result.reason = input;
            }
        } else {
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
            } else if (this.selectedInputMethod == 'breakdown') {
                // breakdown variable
                result = this.variableBreakDown.isValid();
                method = this.variableBreakDown;
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
        }

        return result;        
    }
}