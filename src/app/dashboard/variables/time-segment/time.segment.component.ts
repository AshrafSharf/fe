import { VariableBreakdownComponent } from './../breakdown/breakdown.variable.component';
import { ValidationResult, VariableComponentBehavior, TimeSegment, VariableType, Subvariable } from './../../../shared/interfaces/variables';
import { VariableExpressionComponent } from './../expression/expression.variable.component';
import { VariableConstantComponent } from './../constant/constant.variable.component';
import { Component, OnInit, Input, Output, EventEmitter, ViewChild, SimpleChanges } from '@angular/core';
import { ModalDialogService } from '../../../services/modal-dialog.service';
import { VariableTableComponent } from '../table/table.variable.component';
import { Moment, unix } from 'moment';
import { OnChanges, DoCheck } from '@angular/core/src/metadata/lifecycle_hooks';
import {IShContextMenuItem, IShContextOptions, BeforeMenuEvent} from 'ng2-right-click-menu';
import { Utils } from '../../../shared/utils';
import { Config } from '../../../shared/config';

@Component({
    selector: 'time-segment',
    templateUrl: './time.segment.component.html',
    styleUrls: ['./time.segment.component.css']
})
export class TimeSegmentComponent implements OnInit, OnChanges, DoCheck {

    @Input('segment-id') segmentId:String;
    @Input('variable-name') variableName:String;
    @Input('variable-type') variableType:String;
    @Input('value-type') valueType:String;
    @Output('delete') deleted = new EventEmitter();
    @Input('is-expanded') isExpanded:Boolean = false;
    @Input('branch-id') branchId: String = '';
    @Input('time-segment') timeSegment: TimeSegment = null;
    @Input('composit-variable-type-list') compositVariableTypeList: Subvariable[];
    variableTypeList: Subvariable[] = Array<Subvariable>();
    variableTypeListPercentage = [];

    @ViewChild(VariableConstantComponent) variableConstant: VariableConstantComponent;
    @ViewChild(VariableExpressionComponent) variableExpression: VariableExpressionComponent;
    @ViewChild(VariableTableComponent) variableTable: VariableTableComponent;
    @ViewChild(VariableBreakdownComponent) variableBreakDown: VariableBreakdownComponent;

    endDate: any;
    startDate: any;

    contextMenuItemsDiscrete: IShContextMenuItem[];
    dataContext(i) {
        return {index: i};
    }

    selectedInputMethod = "constant";
    comment = '';

    datePickerConfig = { format : Config.getDateFormat() };

    constructor(
        private modal: ModalDialogService
    ) { }

    ngOnChanges(changes: SimpleChanges): void {
        //console.log(changes);
    }

    isSubvariableAdded(name) {
        for (var index = 0; index < this.variableTypeList.length; index++) {
            if (this.variableTypeList[index].name == name) {
                return false;
            }
        }
        return true;
    }

    isSubvariableRemoved(name) {
        for (var index = 0; index < this.compositVariableTypeList.length; index++) {
            if (this.compositVariableTypeList[index].name == name) {
                return false;
            }
        }

        return true;
    }

    ngDoCheck(): void {
        // make copy of the existing key-value pairs
        //if (this.timeSegment.subVariables == undefined || this.timeSegment.subVariables.length == 0) {
            if (this.compositVariableTypeList != undefined) {
                this.compositVariableTypeList.forEach(type => {
                    if (this.isSubvariableAdded(type.name)) {
                        if (this.variableType == 'breakdown') {
                            this.variableTypeList.push({name: type.name, value: type.value, probability: type.probability});
                            this.variableTypeListPercentage.push({name: type.name, value: (parseFloat(type.value.toString())*100).toString(), probability: type.probability});
                        }
                        else {
                            this.variableTypeList.push({name: type.name, value: type.value, probability: type.probability});
                        }
                    }
                });

                // check if anything is removed
                for (var index = 0; index < this.variableTypeList.length; index++) {
                    if (this.isSubvariableRemoved(this.variableTypeList[index].name)) {
                        this.variableTypeList.splice(index, 1);
                        this.variableTypeListPercentage.splice(index, 1);
                    }
                }
            }
        //}
    }

    onDelete() {
        this.deleted.emit();
    }

    toggleCollapse() {
        this.isExpanded = !this.isExpanded;
    }

    addDiscreteVariable() {
        if (this.variableTypeList == undefined) {
            this.variableTypeList = new Array<Subvariable>();
        }

        this.variableTypeList.push({
            name: Utils.getUniqueId(),
            value: '',
            probability: ''
        });
    }

    ngOnInit() {
        this.contextMenuItemsDiscrete = [
            {
                label: 'delete',
                onClick: ($event) => {
                    let data = $event.dataContext;
                    this.variableTypeList.splice(data.index, 1);
                }
            }
        ];

        if (this.timeSegment != null) {
            if (this.timeSegment.startTime != null) {
                if (typeof(this.timeSegment.startTime) == "string") {
                    let date:Date;
                    if (this.timeSegment.startTime.length == 0) {
                        date = new Date();
                    } else {
                        let parts = this.timeSegment.startTime.split('-');
                        let month = parts[0];
                        let year = parts[1];

                        date = new Date(`${month}/01/${year}`);
                    }
                    this.startDate = unix(date.getTime() / 1000);

                    if (this.timeSegment.inputMethod == "table") {
                        let parts = this.timeSegment.endTime.split('-');
                        let month = parts[0];
                        let year = parts[1];

                        date = new Date(`${month}/01/${year}`);
                        this.endDate = unix(date.getTime() / 1000);
                    } else {
                        this.endDate = this.startDate;
                    }


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
                    if (this.isSubvariableAdded(type.name)) {
                        this.variableTypeList.push({name: type.name, value: type.value, probability: type.probability});
                        this.variableTypeListPercentage.push({name: type.name, value: (parseFloat(type.value.toString())*100).toString(), probability: type.probability});
                    }
                });
            }
        }
    }

    getTimeSegmentValues(): ValidationResult {
        var result: ValidationResult = { result:true, reason: '' };
        if ((this.variableType == 'breakdown') || (this.valueType == 'discrete')) {

            let finalValue = 0, finalPercentage = 0, value = 0;
            if (this.variableType == 'breakdown') {
                this.variableTypeListPercentage.forEach((variable) => {
                    value = parseFloat(variable.value.toString());

                    finalValue += value;
                });
            }
            if (this.valueType == 'discrete') {
                this.variableTypeList.forEach(variable => {
                    finalPercentage += parseFloat(variable.probability.toString());
                });
            }

            finalValue = finalValue / 100;
            if (this.variableType == 'breakdown' && finalValue != 1) {
                result.result = false;
                result.reason = "All the subvariable value must add up to 100%"
            } else if (this.valueType == 'discrete' && finalPercentage != 100) {
                result.result = false;
                result.reason = "All the subvariable value must add up to 100%"
            } else {
                let input:any = {};
                if (typeof(this.startDate) != "string") {
                    this.startDate = this.startDate.format(Config.getDateFormat());
                }

                for (var index = 0; index < this.variableTypeListPercentage.length; index ++) {
                    this.variableTypeList[index].value = (parseFloat(this.variableTypeListPercentage[index].value.toString())/100).toString();
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
                    input['startTime'] = this.startDate.format('MM-YYYY');
                }

                if (typeof(this.endDate) != "string") {
                    input['endTime'] = this.endDate.format('MM-YYYY');
                }

                input['description'] = this.comment;
                input['inputMethod'] = this.selectedInputMethod;

                result.reason = input;
            }
        }

        return result;
    }

    changeDates(){
        console.log(this.selectedInputMethod);
        if (this.selectedInputMethod == 'table'&& this.timeSegment.startTime == "") {
            let tableStartDate = new Date();
            tableStartDate.setMonth(tableStartDate.getMonth()-6);
            this.startDate = unix(tableStartDate.getTime()/1000);
            let tableEndDate = new Date();
            tableEndDate.setMonth(tableEndDate.getMonth()+12);
            console.log("table end date", tableEndDate);
            this.endDate = unix(tableEndDate.getTime()/1000);
        }
        else{
            this.startDate = unix(new Date().getTime() /1000);
        }

    }

}
