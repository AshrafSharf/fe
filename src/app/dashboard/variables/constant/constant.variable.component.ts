import { VariableComponentBehavior, TimeSegment } from './../../../shared/interfaces/variables';
import { VariableDistributionComponent } from './../distribution/distribution.variable.component';
import { Component, OnInit, Input ,ViewChild } from '@angular/core';
import { ValidationResult } from '../../../shared/interfaces/variables';

@Component({
    selector: 'variable-constant',
    templateUrl: './constant.variable.component.html',
    styleUrls: ['./constant.variable.component.css']
})

export class VariableConstantComponent implements OnInit, VariableComponentBehavior {
    @Input('branch-id') branchId: String = '';
    @Input('const-value') constValue: String = '';
    @Input('growth') growth: String = '';
    @Input('time-segment') timeSegment: TimeSegment;
    @ViewChild(VariableDistributionComponent) distributionComponent:VariableDistributionComponent;
    
    constructor() { }

    ngOnInit() { 
        if (this.timeSegment != null || this.timeSegment != undefined) {
            this.constValue = '' + this.timeSegment.constantValue;
            this.growth = '' + this.timeSegment.growth;
        }
    }

    public isValid(): ValidationResult {
        var result: ValidationResult = { result: true, reason: '' };

        if (this.constValue.length == 0) {
            result.result = false;
            result.reason = 'Constant value is missing';
        } else {
            result = this.distributionComponent.isValid()
        }

        return result;
    }

    getInput() {
        return {
            constantValue: this.constValue,
            growth: this.growth,
            distributionType: this.distributionComponent.distributionType,
            mean: this.distributionComponent.mean,
            stdDeviation: this.distributionComponent.deviation,
            userSelectedParametrics: this.distributionComponent.parametric,
            userSelectedParametricsStdDeviation: this.distributionComponent.sigma
        }
    }
}