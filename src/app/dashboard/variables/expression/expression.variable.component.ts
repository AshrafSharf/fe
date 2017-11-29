import { AutocompleteInputComponent } from './../../../shared/auto-complete-input/autocomplete.input.component';
import { VariableComponentBehavior, ValidationResult, KeyValuePair } from './../../../shared/interfaces/variables';
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { AppVariableService } from '../../../services/variable.services';
import { VariableDistributionComponent } from '../distribution/distribution.variable.component';

@Component({
    selector: 'variable-expression',
    templateUrl: './expression.variable.component.html',
    styleUrls: ['./expression.variable.component.css']
})

export class VariableExpressionComponent implements OnInit, VariableComponentBehavior {
    @Input('branch-id') branchId: String = '';
    @ViewChild(AutocompleteInputComponent) autoCompleteInput: AutocompleteInputComponent;
    variables: KeyValuePair[] = Array<KeyValuePair>(); 
    @ViewChild(VariableDistributionComponent) distributionComponent:VariableDistributionComponent;
    
    constructor(
        private variableService: AppVariableService) { }

    ngOnInit() {
        console.log(this.branchId);
        this.variableService
            .getVariablesForSuggestions(this.branchId)
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
            distributionType: this.distributionComponent.distributionType,
            mean: this.distributionComponent.mean,
            stdDeviation: this.distributionComponent.deviation,
            userSelectedParametrics: this.distributionComponent.parametric,
            userSelectedParametricsStdDeviation: this.distributionComponent.sigma
        };
    }
}