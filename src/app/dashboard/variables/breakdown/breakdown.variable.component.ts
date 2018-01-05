import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { OnChanges } from '@angular/core/src/metadata/lifecycle_hooks';
import { Subvariable } from '../../../shared/interfaces/variables';

@Component({
    selector: 'variable-breakdown',
    templateUrl: 'breakdown.variable.component.html',
    styleUrls: ['breakdown.variable.component.css']
})

export class VariableBreakdownComponent implements OnInit {
   
    @Input('sub-variable-list') subvariableList: {id:String, title:String, value:String}[];
    @Input('branch-id') branchId:String;
    subvariables:Subvariable[] = [];
    subvariableName:string = '';
    subvariableValue:string = '';
    selectedGrowthPeriod = 'monthly';
    constValue:string = '';
    growth:string = '';

    constructor() { }

    ngOnInit() { }


    addVariable() {
        for (var index = 0; index < this.subvariables.length; index++) {
            if (this.subvariables[index].title == this.subvariableName) {
                return;
            }
        }

        this.subvariables.push({title: this.subvariableName, id: '', value: this.subvariableValue});
        this.subvariableName = '';
        this.subvariableValue = '';
    }

    deleteVariable(s) {
        for (var index = 0; index < this.subvariables.length; index++) {
            if (this.subvariables[index].title == s.title) {
                this.subvariables.splice(index, 1);
                break;
            }
        }
    }
}