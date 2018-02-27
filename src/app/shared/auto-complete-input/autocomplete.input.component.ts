import { ValidationResult } from './../interfaces/variables';
import { SelectedWord } from './../interfaces/auto-complete-input';
import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { KeyValuePair, VariableComponentBehavior } from '../interfaces/variables';

@Component({
    selector: 'autocomplete-input',
    templateUrl: './autocomplete.input.component.html',
    styleUrls: ['./autocomplete.input.component.css']
})

export class AutocompleteInputComponent implements OnInit, VariableComponentBehavior {
    
    @ViewChild('input') input:any;

    mathExpressions = [
        "*", "+", "/", "%", "-", "^", "(", ")"
    ];

    @Input('variables') variables: KeyValuePair[] = Array<KeyValuePair>();

    expression: String[] = Array<String>();
    suggestions: KeyValuePair[] = Array<KeyValuePair>();

    @Input('completedWords') completedWords: SelectedWord[] = new Array<SelectedWord>();

    isError: boolean = false;

    constructor() {
        if (this.completedWords == undefined) {
            this.completedWords = Array<SelectedWord>();
        }
    }

    ngOnInit() { }

    onDelete(title) {
        this.completedWords.splice(this.completedWords.indexOf(title), 1);
    }

    onFocus(event) {
        console.log(event);
        if (this.input.nativeElement.value.length > 0) {
            this.onSpacePressed(false);
        }
    }

    onKeyup(event) {
        this.suggestions = Array<KeyValuePair>();
        this.mathExpressions.forEach(element => {
            if (event.target.value.length > 0) {
                if (element.toLowerCase().indexOf(event.target.value.toLowerCase()) !== -1) {
                    this.completedWords.push({
                        title: element,
                        type: 'operator',
                        id: ''
                    });
                    this.input.nativeElement.value = '';
                }
            }
        });

        this.variables.forEach(element => {
            if (event.target.value.length > 0) {
                if (element.title.toLowerCase().indexOf(event.target.value.toLowerCase()) !== -1) {
                    this.suggestions.push(element);
                }
            }
        });

        if (event.code == "Space") {
            if (this.input.nativeElement.value.trim().length != 0) {
                this.onSpacePressed();
            }
        }
    }

    onSpacePressed(shouldFocus = true) {
        var value = parseInt(this.input.nativeElement.value.trim());
        if (isNaN(value)) {
            this.isError = true;
        } else {
            if (this.completedWords == undefined) this.completedWords = new Array<SelectedWord>();
            this.completedWords.push({
                title: parseInt(this.input.nativeElement.value.trim()).toString(),
                type: 'const',
                id: ''
            });
            this.clearInput(shouldFocus);
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

    clearInput(shouldFocus = true) {
        this.input.nativeElement.value = '';
        this.suggestions.splice(0, this.suggestions.length);
        if (shouldFocus) {
            this.input.nativeElement.focus();
        }
    }

    selectWord(word) {
        if (this.completedWords == undefined) {
            this.completedWords = Array<SelectedWord>();
        }
        this.completedWords.push({
            title: word.title,
            type: 'variable',
            id: word.id
        });
        this.clearInput();
    }

    isValid(): ValidationResult {
        var result: ValidationResult = {reason: '', result: true};
        if (this.completedWords.length == 0) {
            result.result = false;
            result.reason = 'expression is empty';
        }

        return result;
    }

    getInput() {
        var expression = "";
        this.completedWords.forEach(word => {
            if (word.type == 'variable') {
                expression += `EXP_${word.id} `;
            } else {
                expression += `${word.title} `;
            }
        });

        return expression;
    }
}