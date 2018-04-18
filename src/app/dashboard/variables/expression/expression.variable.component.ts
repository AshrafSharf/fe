import { AutocompleteInputComponent } from './../../../shared/auto-complete-input/autocomplete.input.component';
import { VariableComponentBehavior, ValidationResult, KeyValuePair, TimeSegment } from './../../../shared/interfaces/variables';
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { AppVariableService } from '../../../services/variable.services';
import { VariableDistributionComponent } from '../distribution/distribution.variable.component';
import {Utils} from "../../../shared/utils";

@Component({
    selector: 'variable-expression',
    templateUrl: './expression.variable.component.html',
    styleUrls: ['./expression.variable.component.css']
})

export class VariableExpressionComponent implements OnInit, VariableComponentBehavior {
    @Input('branch-id') branchId: String = '';
    @Input('variable-name') variableName:String;
    @Input('time-segment') timeSegment:TimeSegment;
    @Input('input-method') inputMethod: String = '';
    @ViewChild(AutocompleteInputComponent) autoCompleteInput: AutocompleteInputComponent;
    variables: KeyValuePair[] = Array<KeyValuePair>();
    @ViewChild(VariableDistributionComponent) distributionComponent:VariableDistributionComponent;

    constructor(
        private variableService: AppVariableService) { }

    ngOnInit() {
        this.variableService
            .getUserAccessVariables(this.branchId, Utils.getUserId())
            .subscribe(response => {
                console.log(response);
                this.variables = response.data as Array<KeyValuePair>;
            });
    }

    isValid(): ValidationResult {
        return this.autoCompleteInput.isValid();
    }

    getInput() {
        return {
            expression: this.autoCompleteInput.getInput(),
            completedWordsArray: this.autoCompleteInput.completedWords,
            distributionType: this.distributionComponent.distributionType,
            //mean: this.distributionComponent.mean,
            stdDevCompletedWordsArray: this.distributionComponent.getCompletedWords(),
            stdDeviation: this.distributionComponent.getExpression(),
            userSelectedParametrics: this.distributionComponent.parametric,
            userSelectedParametricsStdDeviation: this.distributionComponent.sigma
        };
    }
}
