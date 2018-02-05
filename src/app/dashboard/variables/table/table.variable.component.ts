import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TableViewColumn } from '../../../shared/interfaces/tableview-column';
import { Moment } from 'moment';
import { VariableComponentBehavior, ValidationResult, TableInputPair, TimeSegment } from '../../../shared/interfaces/variables';
import {IShContextMenuItem, IShContextOptions, BeforeMenuEvent} from 'ng2-right-click-menu';
import { Utils } from '../../../shared/utils';

@Component({
    selector: 'variable-table',
    templateUrl: 'table.variable.component.html',
    styleUrls: ['./table.variable.component.css']
})
export class VariableTableComponent implements OnInit, OnChanges, VariableComponentBehavior {
    
    @Input('branch-id') branchId: String = '';
    @Input('start-time') startTime: Moment;
    @Input('end-time') endTime:Moment;
    @Input('variable-type') variableType: String = 'actual';
    @Input('time-segment') timeSegment:TimeSegment;

    columns:TableInputPair[] = Array<TableInputPair>();
    
    contextMenuItems: IShContextMenuItem[];
    dataContext(i) {
        return {index: i};
    }

    constructor() { 
        this.createTable();
    }

    createTable() {
        this.columns.splice(0, this.columns.length);
        if (this.timeSegment != undefined && this.timeSegment.tableInput != null) {
            this.timeSegment.tableInput.forEach(element => {
                this.columns.push(element);
            });

        } else if (this.startTime != undefined && this.endTime != undefined) {
            let date = this.startTime.clone();
            let endDate = this.endTime.clone();

            let count = endDate.diff(date, 'M') + 1;
            console.log("count: " + count);
            for (var index = 0; index < count; index++) {
                let year = date.year();
                let month = date.format('MMM');
                this.columns.push({key:month + " - " + year, value: '0'});
                date.add(1, 'M');
            }
        }
    }

    ngOnInit() { 
        this.contextMenuItems = [
            {
                label: 'cut',
                onClick: ($event) => {
                    let data = $event.dataContext;
                    Utils.setBuffer(this.columns);
                    for (var index = 0; index < this.columns.length; index++) {
                        this.columns[index].value = '0';
                    }
                }
            },
            {
                label: 'copy',
                onClick: ($event) => {
                    let data = $event.dataContext;
                    Utils.setBuffer(this.columns);
                }
            },
            {
                divider: true
            },
            {
                label: 'paste',
                disabled: () => {
                    console.log(Utils.getBuffer());
                    return Utils.getBuffer() == undefined;
                },
                onClick: ($event) => {
                    if (Utils.getBuffer() != undefined && Utils.getBuffer().length != 0) {
                        this.columns.splice(0, this.columns.length);
                        let tempColumns = Utils.getBuffer();
                        this.columns = new Array<TableInputPair>();
                        for (var index = 0; index < tempColumns.length; index++) {
                            this.columns.push({
                                key: tempColumns[index].key,
                                value: tempColumns[index].value
                            });
                        }
                    }
                }
            }
        ];
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.createTable();
    }

    isValid(): ValidationResult {
        var result: ValidationResult = { result: true, reason: '' };

        for (var index = 0; index < this.columns.length; index++) {
            let column = this.columns[index];
            if (column.value.length == 0) {
                result.result = false;
                result.reason = "Incomplete values";
                break;
            }
        }

        return result;
    }

    getInput() {
        let values:TableInputPair[] = [];
        for (var index = 0; index < this.columns.length; index++) {
            let column = this.columns[index];
            values.push({key: column.key, value: column.value});
        }

        return { tableInput:values };
    }

}