import { ValidationResult, TimeSegment, KeyValuePair } from './../../../shared/interfaces/variables';
import { Component, OnInit, Input, ViewChildren } from '@angular/core';
import { AppVariableService } from '../../../services/variable.services';
import { AutocompleteInputComponent } from '../../../shared/auto-complete-input/autocomplete.input.component';
import { QueryList } from '@angular/core/src/linker/query_list';

@Component({
    selector: 'variable-distribution',
    templateUrl: './distribution.variable.component.html',
    styleUrls: ['./distribution.variable.component.css']
})

export class VariableDistributionComponent implements OnInit {
    @Input('distribution') distribution = 1;
    @Input('parametric') parametric: String;
    //@Input('mean') mean: String;
    @Input('deviation') deviation: String;
    @Input('sigma') sigma: String;
    @Input('time-segment') timeSegment: TimeSegment;
    @Input('branch-id') branchId: String = '';
    @Input('input-method') inputMethod: String = '';
    @ViewChildren(AutocompleteInputComponent) autoCompleteInputs: AutocompleteInputComponent[];

    variables: KeyValuePair[] = Array<KeyValuePair>();
    public method;

    constructor(
        private variableService: AppVariableService) { }

    ngOnInit() {
        if (this.timeSegment != null || this.timeSegment != undefined) {
            this.setDistributionType(this.timeSegment.distributionType);
            this.setInputMethodType(this.inputMethod);
            //if (this.timeSegment.mean != undefined) { this.mean = this.timeSegment.mean; }
            if (this.timeSegment.stdDeviation != undefined) { this.deviation = this.timeSegment.stdDeviation; }
            if (this.timeSegment.userSelectedParametricsStdDeviation != undefined) { this.sigma = this.timeSegment.userSelectedParametricsStdDeviation.toString(); }
            if (this.timeSegment.userSelectedParametrics != undefined) { this.parametric = this.timeSegment.userSelectedParametrics; }
        }

        console.log(this.branchId);
        this.setInputMethodType(this.inputMethod);
        this.variableService
            .getVariablesForSuggestions(this.branchId)
            .subscribe(response => {
                console.log(response);
                this.variables = response.data as Array<KeyValuePair>;
            });
    }

    setInputMethodType(type:String) {
        if (type == "constant") {
            this.method = 1;
        } else if (type == "expression") {
            this.method = 2;
        } else if (type == "table") {
            this.method = 3;
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

    public getCompletedWords() {
        var words = [];
        this.autoCompleteInputs.forEach(control => {
            words.push(control.completedWords);
        });

        var expression = "";
        if (this.method == 2 && this.distribution ==3) {
            words[0].forEach(word => {
                if (word.type == 'variable') {
                    expression += `EXP_${word.id} `;
                } else {
                    expression += `${word.title} `;
                }
            });
        }

        return expression;
    }


    public isValid(): ValidationResult {
        var values = [];
        var result: ValidationResult = { result: true, reason: '' };
        if (this.method == 1) {
            if (this.distribution == 2) {
                if (this.parametric.length == 0) {
                    result.result = false;
                    result.reason = 'User parametric value is missing';
                }
            } else if (this.distribution == 3) {
                //if (this.mean.length == 0) {
                //    result.result = false;
                //    result.reason = 'Mean value is missing';
                //} else
                if (this.deviation.length == 0) {
                    result.result = false;
                    result.reason = 'Standard Deviation value is missing';
                }
            }
        }
        else if (this.method == 2) {
            this.autoCompleteInputs.forEach(control => {
                values.push(control.getInput());
            });
            //this.mean = values[0]
            this.deviation = values[0];

            if (this.distribution == 2) {
                if (this.parametric.length == 0) {
                    result.result = false;
                    result.reason = 'User parametric value is missing';
                }
            } else if (this.distribution == 3) {
                //if (this.mean.length == 0) {
                //    result.result = false;
                //    result.reason = 'Mean value is missing';
                //} else
                if (this.deviation.length == 0) {
                    result.result = false;
                    result.reason = 'Standard Deviation value is missing';
                }
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