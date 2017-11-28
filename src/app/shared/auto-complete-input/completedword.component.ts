import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'completed-word',
    templateUrl: './completedword.component.html',
    styleUrls: ['./completedword.component.css']
})

export class CompletedWordComponent implements OnInit {
    @Input('title') title: String = '';
    @Input('is-operator') isOperator: boolean = false;
    @Input('is-const-value') isConstValue: boolean = false;
    @Output('deleted') deleteEvent = new EventEmitter();

    constructor() { }

    ngOnInit() { }

    deleteWord() {
        this.deleteEvent.emit(this.title);
    }
}