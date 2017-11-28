import { SelectedWord } from './../interfaces/auto-complete-input';
import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
    selector: 'autocomplete-input',
    templateUrl: './autocomplete.input.component.html',
    styleUrls: ['./autocomplete.input.component.css']
})

export class AutocompleteInputComponent implements OnInit {
    @ViewChild('input') input:any;

    mathExpressions = [
        "*", "+", "/", "%", "-", "^", "(", ")"
    ];

    variables = [
        "DTVE Accounts",
        "Cumulative DTVN Accounts",
        "Cumulative Front Porch Accounts",
        "NFL Accounts",
        "DFW Platform Accounts (AWS)",
        "DTVN Platform Accounts (Azure)",
        "DTVE Platform Accounts (POP)",
        "NFL Platform Accounts (POP)",
        "DTVE Streams (including FP)",
        "DTVN Streams (including FP)",
        "NFL Streams",
        "DFW Platform Streams (AWS)",
        "DTVN Platform Streams (Azure)",
        "DTVE Platform Streams (POP)",
        "NFL Platform Streams (POP)",
        "DTVE Peak Concurrent Streams  (including FP)",
        "DTVN Peak Concurrent Streams  (including FP)",
        "NFL Peak Concurrent Streams",
        "DFW Platform Peak Concurrent Streams (AWS)",
        "DTVN Platform Peak Concurrent Streams (Azure)",
        "DTVE Peak Concurrent Streams (POP)",
        "NFL Platform Peak Concurrent Streams (POP)"
    ];

    expression: String[] = Array<String>();
    suggestions: String[] = Array<String>();

    completedWords: SelectedWord[] = Array<SelectedWord>();

    isError: boolean = false;

    constructor() {
        
    }

    ngOnInit() { }

    onDelete(title) {
        this.completedWords.splice(this.completedWords.indexOf(title), 1);
    }

    onKeyup(event) {
        this.suggestions = Array<String>();
        this.mathExpressions.forEach(element => {
            if (event.target.value.length > 0) {
                if (element.toLowerCase().indexOf(event.target.value.toLowerCase()) !== -1) {
                    this.completedWords.push({
                        title: element,
                        type: 'operator'
                    });
                    this.input.nativeElement.value = '';
                }
            }
        });

        this.variables.forEach(element => {
            if (event.target.value.length > 0) {
                if (element.toLowerCase().indexOf(event.target.value.toLowerCase()) !== -1) {
                    this.suggestions.push(element);
                }
            }
        });

        if (event.code == "Space") {
            if (this.input.nativeElement.value.trim().length != 0) {
                var value = parseInt(this.input.nativeElement.value.trim());
                if (isNaN(value)) {
                    this.isError = true;
                } else {
                    this.completedWords.push({
                        title: parseInt(this.input.nativeElement.value.trim()).toString(),
                        type: 'const'
                    });
                    this.clearInput();
                }
            }
        }
    }

    onKeydown(event) {
        this.isError = false;
        if (event.code == "Backspace") {
            if (this.input.nativeElement.value.length == 0) {
                this.completedWords.pop();
            }
        }
    }

    clearInput() {
        this.input.nativeElement.value = '';
        this.input.nativeElement.focus();
        this.suggestions.splice(0, this.suggestions.length);
    }

    selectWord(word) {
        this.completedWords.push({
            title: word,
            type: 'word'
        });
        this.clearInput();
    }
}