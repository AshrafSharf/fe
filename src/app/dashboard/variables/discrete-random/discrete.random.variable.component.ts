import { Component, OnInit, Input } from '@angular/core';
import { DiscreteComponent } from '../../../shared/interfaces/variables';

@Component({
    selector: 'variable-discrete-random',
    templateUrl: 'discrete.random.variable.component.html',
    styleUrls: ['discrete.random.variable.component.css']
})
export class VariableDiscreteRandomComponent implements OnInit {
    @Input('branch-id') branchId: String;

    private title:String = '';
    private value:String = '';
    private percentage:String = '';
    private components:DiscreteComponent[] = [];

    constructor() { }

    ngOnInit() { }
    
    addComponent() {
        for (var index = 0; index < this.components.length; index++) {
            if (this.components[index].title == this.title) {
                return;
            }
        }

        this.components.push({title: this.title, id: '', value: this.value, percentage: this.percentage});
        this.title = '';
        this.value = '';
        this.percentage = '';
    }

    deleteComponent(c) {
        for (var index = 0; index < this.components.length; index++) {
            if (this.components[index].title == c.title) {
                this.components.splice(index, 1);
                break;
            }
        }
    }
}