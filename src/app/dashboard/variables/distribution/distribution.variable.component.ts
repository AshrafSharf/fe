import { ValidationResult, TimeSegment } from './../../../shared/interfaces/variables';
import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'variable-distribution',
    templateUrl: './distribution.variable.component.html',
    styleUrls: ['./distribution.variable.component.css']
})

export class VariableDistributionComponent implements OnInit {
    @Input('distribution') distribution = 1;
    @Input('parametric') parametric: String;
    @Input('mean') mean: String;
    @Input('deviation') deviation: String;
    @Input('sigma') sigma: String;
    @Input('time-segment') timeSegment: TimeSegment;

    constructor() { }

    ngOnInit() {
        if (this.timeSegment != null || this.timeSegment != undefined) {
            this.setDistributionType(this.timeSegment.distributionType);
            if (this.timeSegment.mean != undefined) { this.mean = this.timeSegment.mean; }
            if (this.timeSegment.stdDeviation != undefined) { this.deviation = this.timeSegment.stdDeviation; } 
            if (this.timeSegment.userSelectedParametricsStdDeviation != undefined) { this.sigma = this.timeSegment.userSelectedParametricsStdDeviation.toString(); }
            if (this.timeSegment.userSelectedParametrics != undefined) { this.parametric = this.timeSegment.userSelectedParametrics; }
        }
    }

    setDistributionType(type:String) {
        if (type == "none") {
            this.distribution = 1;
        } else if (type == "percentage") {
            this.distribution = 2;
        } else if (type == "gaussian") {
            this.distribution = 3;
        }
    }

    public isValid(): ValidationResult {
        var result: ValidationResult = { result: true, reason: '' };
        if (this.distribution == 2) {
            if (this.parametric.length == 0) {
                result.result = false;
                result.reason = 'User parametric value is missing';
            }
        } else if (this.distribution == 3) {
            if (this.mean.length == 0) {
                result.result = false;
                result.reason = 'Mean value is missing';
            } else if (this.deviation.length == 0) {
                result.result = false;
                result.reason = 'Standard Deviation value is missing';
            }
        }

        return result;
    }

    public get distributionType(): String {
        var type = '';
        if (this.distribution == 1) {
            type = 'none';
        } else if (this.distribution == 2) {
            type = 'percentage';
        } else if (this.distribution == 3) {
            type = 'gaussian';
        }

        return type;
    }
}