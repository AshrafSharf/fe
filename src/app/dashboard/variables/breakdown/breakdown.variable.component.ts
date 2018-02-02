import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { OnChanges } from '@angular/core/src/metadata/lifecycle_hooks';
import { Subvariable, VariableComponentBehavior, ValidationResult, TimeSegment } from '../../../shared/interfaces/variables';

@Component({
    selector: 'variable-breakdown',
    templateUrl: 'breakdown.variable.component.html',
    styleUrls: ['breakdown.variable.component.css']
})

export class VariableBreakdownComponent implements OnInit, VariableComponentBehavior {
   
    @Input('time-segment') timeSegment:TimeSegment;
    @Input('branch-id') branchId:String;

    subvariableName:string = '';
    subvariableValue:string = '';
    selectedGrowthPeriod = 'monthly';
    constValue:string = '';
    growth:string = '';
    subvariableList: Subvariable[];

    constructor() { }

    ngOnInit() { 
        if (this.timeSegment != undefined) {
            this.constValue = this.timeSegment.constantValue.toString();
            this.selectedGrowthPeriod = this.timeSegment.growthPeriod.toString();
            this.subvariableList = this.timeSegment.breakdownInput;
        }
    }

    addVariable() {
        if (this.subvariableList == undefined) {
            this.subvariableList = [];
        } else {
            for (var index = 0; index < this.subvariableList.length; index++) {
                if (this.subvariableList[index].name == this.subvariableName) {
                    return;
                }
            }
        }

        this.subvariableList.push({name: this.subvariableName, value: this.subvariableValue, probability: '0'});
        this.subvariableName = '';
        this.subvariableValue = '';
    }

    deleteVariable(s) {
        for (var index = 0; index < this.subvariableList.length; index++) {
            if (this.subvariableList[index].name == s.name) {
                this.subvariableList.splice(index, 1);
                break;
            }
        }
    }

    isValid(): ValidationResult {
        var result: ValidationResult = { result: true, reason: '' };

        if (this.constValue.length == 0) {
            result.result = false;
            result.reason = 'Constant value is missing';
        } else if (this.subvariableList == undefined || this.subvariableList.length == 0) {
            result.result = false;
            result.reason = 'At least on subvariable is required';
        } else {
            let finalValue = 0;
            this.subvariableList.forEach((variable) => {
                finalValue += parseFloat(variable.value.toString());
            });
            if (finalValue != 1.0) {
                result.result = false;
                result.reason = 'The addition of values must be equal to 1.0';
            }
        }

        return result;
    }
    
    getInput() {
        return {
            constantValue: this.constValue,
            growth: this.growth,
            growthPeriod: this.selectedGrowthPeriod,
            breakdownInput: this.subvariableList
        }
    }
}