import { ValidationResult } from './../../../shared/interfaces/variables';
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

    constructor() { }

    ngOnInit() { }

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