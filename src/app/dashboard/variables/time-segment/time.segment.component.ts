import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

// for datetimepicker
var $: any;

@Component({
    selector: 'time-segment',
    templateUrl: './time.segment.component.html',
    styleUrls: ['./time.segment.component.css']
})
export class TimeSegmentComponent implements OnInit {
    @Input('segment-id') segmentId:String;
    @Output('delete') deleted = new EventEmitter();
    @Input('is-expanded') isExpanded:Boolean = false;
    
    constructor() { }

    onDelete() {
        this.deleted.emit();
    }

    toggleCollapse() {
        this.isExpanded = !this.isExpanded;
    }

    ngOnInit() {
        // $('#startDateExp').datetimepicker({
        //     viewMode: 'years',
        //     format: 'MM/YYYY'
        // });
     }
}