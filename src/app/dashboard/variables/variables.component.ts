import { AppVariableTypeService } from './../../services/variable.type.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AppVariableService } from './../../services/variable.services';
import { UserService } from './../../services/user.service';
import { Project } from './../../shared/interfaces/project';
import { Component, Input, OnInit, ViewChildren, ElementRef, NgZone, ViewChild, SimpleChanges } from '@angular/core';
import { ProjectService } from '../../services/project.service';
import { Branch } from './../../shared/interfaces/branch';
import { BranchService } from '../../services/branch.service';
import {SettingsService} from '../../services/settings.service';
import { User } from '../../shared/interfaces/user';
import { TimeSegmentComponent } from './time-segment/time.segment.component';
import { ModalDialogService } from '../../services/modal-dialog.service';
import { Variable, TimeSegment, VariableType, Subvariable, TableInputPair } from '../../shared/interfaces/variables';
import { Moment, unix } from 'moment';
import 'nvd3';
import { Utils } from '../../shared/utils';
import { Modal } from 'ngx-modialog/plugins/bootstrap';
import * as jsPDF from 'jspdf'
import { Config } from '../../shared/config';


@Component({
    selector: 'variables',
    templateUrl: './variables.component.html',
    styleUrls: ['./variables.component.css']
})

export class VariablesComponent implements OnInit {
    @ViewChildren(TimeSegmentComponent) timeSegmentWidgets: TimeSegmentComponent[];

    projects: Project[] = Array<Project>();
    branches: Branch[] = Array<Branch>();
    variables: Variable[] = Array<Variable>();

    queryText: String = '';

    public lineChartData: Array<any> = [];
    public lineChartLabels: Array<{ key: number, value: string }> = [];

    compositeVariableList: Variable[] = Array<Variable>();
    columns: TableInputPair[] = Array<TableInputPair>();

    shouldDefineActualValues: Boolean = false;
    compositType = 'none';
    description = '';
    branchId = '';
    projectId = '';

    otherVarDecimal = "";
    breakdownVarDecimal= "";
    projectTitle: String = "";
    branchTitle: String = "";
    title: String = "";
    comma = '';

    @ViewChild('graph') svg;
    @ViewChild('linegraph') graph;

    selectedProject: String = '';
    selectedBranch: String = '';
    selectedVariable: Variable = null

    users: User[] = Array<User>();

    selectedInputMethodActual = 'table';
    variableName = '';
    valueType = 'integer';
    variableType = 'variable';
    ownerId: String = '';

    variableTypeList: Subvariable[] = Array<Subvariable>();
    selectedVariableTypeList: VariableType[] = Array<VariableType>();

    subvariableName: string = '';
    subvariableValue: string = '';
    subvariablePercentage: string = '';

    subvariableList: Subvariable[];
    compositVariableIds: { id: String }[] = Array<{ id: String }>();

    @Input() startDate: any;
    @Input() endDate: any;

    data;
    options;

    keys = new Array();

    private parentNativeElement: any;

    timeSegments: TimeSegment[] = Array<TimeSegment>();

    editSubvariableIndex = -1;
    myDataSets = null;

    ngOnChanges(changes: SimpleChanges): void {
        console.log(changes);
        this.createTable();
    }

    createTable() {
        this.columns.splice(0, this.columns.length);
        if (this.startDate != undefined && this.endDate != undefined) {
            let date = this.startDate.clone();
            let endDate = this.endDate.clone();

            let count = endDate.diff(date, 'M') + 1;
            for (var index = 0; index < count; index++) {
                let year = date.year();
                let month = date.format('MMM');
                this.columns.push({ key: month + " - " + year, value: '0' });
                date.add(1, 'M');
            }
        }
    }

    clearVariable() {
        this.editSubvariableIndex = -1;
        this.subvariableName = '';
        this.subvariableValue = '';
        this.subvariablePercentage = '';
    }

    editVariable(index) {
        console.log('edit : ', index);

        this.editSubvariableIndex = index;
        this.subvariableName = this.subvariableList[index].name.toString();
        this.subvariableValue = this.subvariableList[index].value.toString();
        if (this.variableType == 'discrete') {
            this.subvariablePercentage = this.subvariableList[index].probability.toString();
        }
    }

    addVariable() {
        if (this.subvariableList == undefined) {
            this.subvariableList = [];
        }

        if (this.editSubvariableIndex != -1) {
           // this.subvariableList[this.editSubvariableIndex].name = this.subvariableName;
           // this.subvariableList[this.editSubvariableIndex].value = this.subvariableValue;
            if (this.valueType == 'discrete') {
                this.subvariableList[this.editSubvariableIndex].probability = this.subvariablePercentage;
            }
            this.subvariableList[this.editSubvariableIndex].name = this.subvariableName;
            this.subvariableList[this.editSubvariableIndex].value = this.subvariableValue;
        } else {
            console.log('adding');

            if (this.variableType == 'breakdown') {
                // add new
                for (var index = 0; index < this.subvariableList.length; index++) {
                    if (this.subvariableList[index].name == this.subvariableName) {
                        this.modal.showError('A subvariable already exists with this name');
                        return;
                    }
                }
            }
            

            this.subvariableList.push({
                name: this.subvariableName,
                value: this.subvariableValue,
                probability: this.subvariablePercentage
            });
        }

        this.clearVariable();
    }

    deleteVariable(i) {
        // for (var index = 0; index < this.subvariableList.length; index++) {
        //     if (this.subvariableList[index].name == s.name) {
        //         this.subvariableList.splice(index, 1);
        //         break;
        //     }
        // }

        this.subvariableList.splice(i, 1);
    }

    formatXAxisValue(colIndex: number) {
        if (this.selectedVariable || this.selectedVariable == undefined) {
            return '';
        }

        if (this.selectedVariable.timeSegment.length > 0) {
            var element = this.selectedVariable.timeSegment[0];
            if (element.timeSegmentResponse != null || element.timeSegmentResponse != undefined) {
                if (element.timeSegmentResponse.resultMap.length > 0) {
                    var value = element.timeSegmentResponse.resultMap[0];

                    if (value.data.length > 0) {
                        console.log(value.data);
                        return value.data[colIndex].title;
                    }
                }
            }
        }
    }

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private modalDialog: Modal,
        private variableService: AppVariableService,
        private variableTypeService: AppVariableTypeService,
        private modal: ModalDialogService,
        private userService: UserService,
        private projectService: ProjectService,
        private branchService: BranchService,
        private settingsService: SettingsService,
        element: ElementRef,
        private ngZone: NgZone) {

        this.parentNativeElement = element.nativeElement;
    }

    isTypeSelected(id) {
        for (var index = 0; index < this.compositeVariableList.length; index++) {
            if (this.compositeVariableList[index].id == id) {
                return this.compositeVariableList[index];
            }
        }

        return null;
    }

    onVariableTypeSelectionChange(event) {
        let id = event.target.value;
        let status = event.target.checked;

        for (var index = 0; index < this.compositeVariableList.length; index++) {
            if (this.compositeVariableList[index].id == id) {
                this.compositeVariableList[index].isSelected = status;
                break;
            }
        }
    }

    ngOnInit() {
        this.userService
            .getOwners((users) => {
                this.users = users;
                this.ownerId = (this.users.length > 0) ? Utils.getUserId() : '';
            })

        this.route.queryParams.subscribe(params => {
            console.log(params);
            this.projectId = params['projectId'];
            this.branchId = params['branchId'];
            var varId = params['variableId'];

            this.projectService
                .getDetails(this.projectId)
                .subscribe(result => {
                    //this.selectedProject = result.data as Project;

                    this.projectTitle = result.data.title;
                });

            this.branchService
                .getDetails(this.branchId)
                .subscribe(result => {
                    //this.selectedProject = result.data as Project;

                    this.branchTitle = result.data.title;
                });

            this.variableService
                .getVariables(this.branchId)
                .subscribe(response => {
                    console.log(response);
                    var variables = response.data as Array<Variable>;
                    for (var index = 0; index < variables.length; index++) {
                        var variable = variables[index];
                        if (variable.id == varId) {
                            this.selectVariable(variable);
                            break;
                        }
                    }
                })
        });
    }

    getXTitle(titleIndex) {
        for (var index = 0; index < this.lineChartLabels.length; index++) {
            if (this.lineChartLabels[index].key == titleIndex) {
                return this.lineChartLabels[index].value;
            }
        }

        return '';
    }

    onCompositTypeChanged(event) {
        let type = event.target.value;
        if (type != 'none') {
            this.loadCompositeVariables(type);
        }
    }

    loadCompositeVariables(type) {
        this.variableService
            .getBreakdownVariables(this.branchId, type)
            .subscribe(response => {
                if (response.status == 'OK') {
                    this.variableTypeList.splice(0, this.variableTypeList.length);
                    let types: Variable[] = response.data as Array<Variable>;
                    for (var index = 0; index < types.length; index++) {
                        let varType = types[index];
                        if (this.isCompositeVariableSelectedInVariable(varType.id.toString()) != null) {
                            varType.isSelected = true;
                        }
                        this.compositeVariableList.push(varType);
                    }
                }
            });
    }

    isCompositeVariableSelectedInVariable(id) {
        for (var index = 0; index < this.compositVariableIds.length; index++) {
            if (this.compositVariableIds[index].id == id) {
                return this.compositVariableIds[index];
            }
        }

        return null;
    }

    addTimeSegment() {
        this.timeSegments.push({
            constantValue: 0,
            description: '',
            inputMethod: 'constant',
            distributionType: 'none',
            growth: 0,
            tableInput: null,
            //mean: '',
            startTime: '',
            stdDeviation: '',
            timeSegmentResponse: {
                resultMap: Array()
            },
            userSelectedParametrics: '',
            userSelectedParametricsStdDeviation: '',
            growthPeriod: 0,
            breakdownInput: [],
            completedWordsArray: [],
            subVariables: []
        });
    }

    selectBranch(event) {
        this.reloadBranches(event.target.value);
    }

    fillMissingDates(keys) {
        let missing = false;
        // fill the gap 
        for (var index = 0; index < keys.length; index++) {
            //console.log(this.keys[index]);
            if (index + 1 < keys.length) {
                // get the difference
                let currentKey = keys[index];
                let currentParts = currentKey.split('-');
                let currentDate = new Date(`${currentParts[0]}/01/${currentParts[1]}`);
                let momentCurrentDate = unix(currentDate.getTime()/1000);

                let nextKey = keys[index + 1];
                let nextParts = nextKey.split('-');
                let nextDate = new Date(`${nextParts[0]}/01/${nextParts[1]}`);
                let momentNextDate = unix(nextDate.getTime()/1000);

                let monthDifference = momentNextDate.diff(momentCurrentDate, 'month');
                if (monthDifference > 1) {
                    // add the missing months
                    let startIndex = index + 1;
                    for (var monthIndex = 0; monthIndex < monthDifference - 1; monthIndex++) {
                        let newDate = momentCurrentDate.add(1, 'month');
                        keys.splice(startIndex + monthIndex, 0, newDate.format(Config.getDateFormat()));
                    }

                    missing = true;
                    break;
                }
            }
        }

        if (missing) {
            this.fillMissingDates(keys);
        }

        return keys;
    }

    selectVariable(variable: Variable) {
        this.title = variable.title;
        this.shouldDefineActualValues = variable.hasActual;
        if (variable.hasActual) {
            this.columns = variable.actualTimeSegment.tableInput;
            this.selectedInputMethodActual = variable.actualTimeSegment.inputMethod.toString();
            if (this.selectedInputMethodActual == 'table') {
                this.columns = variable.actualTimeSegment.tableInput;

                var date: Date;
                if (variable.actualTimeSegment.startTime.length == 0) {
                    date = new Date();
                } else {
                    //let time = Date.parse(this.timeSegment.startTime.toString());
                    let datePart = variable.actualTimeSegment.startTime.split(' ')[0];
                    let parts = datePart.split('-');
                    //let day = parts[0];
                    let month = parts[0];
                    let year = parts[1];

                    date = new Date(`${month}/01/${year}`);
                }
                this.startDate = unix(date.getTime() / 1000);

                if (variable.actualTimeSegment.endTime.length == 0) {
                    date = new Date();
                } else {
                    //let time = Date.parse(this.timeSegment.startTime.toString());
                    let datePart = variable.actualTimeSegment.endTime.split(' ')[0];
                    let parts = datePart.split('-');
                    // let day = parts[0];
                    let month = parts[0];
                    let year = parts[1];

                    date = new Date(`${month}/01/${year}`);
                }
                this.endDate = unix(date.getTime() / 1000);
            } else {
                this.queryText = variable.actualTimeSegment.query;
            }
        }

        this.selectedVariable = variable;
        this.description = variable.description.toString();
        this.variableName = variable.title.toString();
        this.ownerId = variable.ownerId;
        this.valueType = variable.valueType.toString();
        this.variableType = variable.variableType.toString();
        this.subvariableList = variable.subVariables;
        this.compositVariableIds = variable.compositeVariables;
        this.timeSegments.splice(0, this.timeSegments.length);
        this.compositType = variable.compositeType.toString();

        if (this.compositType.length > 0) {
            this.loadCompositeVariables(this.compositType);
        }

        for (var timeSegmentIndex = 0; timeSegmentIndex < variable.timeSegment.length; timeSegmentIndex++) {
            let element = variable.timeSegment[timeSegmentIndex];
            this.timeSegments.push(element);
        }

        var chartType = 'lineChart';
        var isStackChart = false;
        var minValue = 0;
        var maxValue = 0;

        // change the chart
        var tempLineChartData: Array<any> = new Array<any>();
        if (this.valueType == 'discrete') {
            chartType = 'multiBarChart';
            isStackChart = true;

            // this.options.chart.showControls = false;

            let keySet = new Set();
            let titleSet = new Set();
            for (var timeSegmentIndex = 0; timeSegmentIndex < variable.timeSegment.length; timeSegmentIndex++) {
                let element = variable.timeSegment[timeSegmentIndex];
                keySet.add(element.startTime);

                for (var index = 0; index < element.subVariables.length; index++) {
                    titleSet.add(element.subVariables[index].name);
                }
            }

            // needed for sorting
            keySet.forEach(key => {
                this.keys.push(key);
            });

            // sort the keys (sort the months and years)
            this.keys.sort();

            let currentKey = this.keys[0];
            let currentParts = currentKey.split('-');
            let currentDate = new Date(`${currentParts[1]}/01/${currentParts[0]}`);
            let momentCurrentDate = unix(currentDate.getTime()/1000);

            let nextKey = this.keys[this.keys.length - 1];
            let nextParts = nextKey.split('-');
            let nextDate = new Date(`${nextParts[1]}/01/${nextParts[0]}`);
            let momentNextDate = unix(nextDate.getTime()/1000);

            if (momentNextDate.diff(momentCurrentDate, 'months') < 18) {
                // add last date
                let finalDate = momentCurrentDate.add(18, 'months');
                this.keys.push(finalDate.format(Config.getDateFormat()));
            }

            // fill the missing dates
            this.fillMissingDates(this.keys);

            console.log(this.keys);

            var keyIndex = 1;
            titleSet.forEach(key => {
                var dataValues = [];

                var lastValues:any;
                var dateIndex = 0;
                this.keys.forEach(date => {

                    var dateFound = false;
                    for (var timeSegmentIndex = 0; timeSegmentIndex < variable.timeSegment.length; timeSegmentIndex++) {
                        let element = variable.timeSegment[timeSegmentIndex];
                        if (element.startTime == date) {
                            var keyFound = false;
    
                            var value:String = '';
                            for (var index = 0; index < element.subVariables.length; index++) {
                                let item = element.subVariables[index];
                                if (item.name == key) {
                                    keyFound = true;
                                    value = item.probability;
                                    break;
                                }
                            }
        
                            if (!keyFound) {
                                value = '0';
                            }
        
                           
                            dataValues.push({ x: dateIndex, y: value })

                            dateFound = true;
                            lastValues = value;
                            break;
                        }
                    }

                    if (!dateFound) {
                        dataValues.push({ x: dateIndex, y: lastValues })
                    }
                    dateIndex += 1;
                    
                });

                tempLineChartData.push({
                    values: dataValues,
                    key: 'value: ' + keyIndex
                });
                keyIndex += 1;


            });
            minValue = 0;
            maxValue = 100;

        } else {
            var keyIndex = 0;
            if (variable.allTimesegmentsResultList != undefined || variable.allTimesegmentsResultList != null) {
                var color = Utils.getRandomColor(0);
                for (var index = 0; index < variable.allTimesegmentsResultList.length; index++) {
                    var dataValues = [];
                    let item = variable.allTimesegmentsResultList[index];
                    for (var dataIndex = 0; dataIndex < item.data.length; dataIndex++) {
                        var valueItem = item.data[dataIndex];
                        var labelIndex = this.isLabelAdded(valueItem.title);
                        if (labelIndex == -1) {
                            this.lineChartLabels.push(
                                {
                                    key: keyIndex,
                                    value: valueItem.title.toString()
                                }
                            );
                            labelIndex = keyIndex;
                            keyIndex += 1;
                        }
                        var num = parseFloat(valueItem.value.toString());
                        if (num < minValue) minValue = num;
                        if (num > maxValue) maxValue = num;

                        //dataValues.push({ x: labelIndex, y: d3.format('0.0f')(num)});
                        dataValues.push({x: labelIndex, y: num });
                    }

                    if (index == 0) {
                        //add variable name to the base line
                        var itemKey = (item.title == "-total") ? this.selectedVariable.title +"" + item.title : item.title;
                        tempLineChartData.push({
                            values: dataValues,
                            key: itemKey,
                            color: color
                        });
                    } else {
                        if (variable.variableType != 'breakdown') {

                            if (index % 2 != 0) {
                                // odd
                                color = Utils.getShadeOfColor(color, 0.5);
                            }
                            
                            var itemKey =item.title;
                             //add total title to the sigma of the base line
                            if (item.calculationType == "GAUSSIAN_CALCULATION" && variable.compositeType == "breakdown"){
                                itemKey = item.title + "."+ "total";
                            }
     
                            tempLineChartData.push({
                                values: dataValues,
                                key: itemKey,
                                classed: 'dashed',
                                color: color
                            });
                        } else {
                            tempLineChartData.push({
                                values: dataValues,
                                key: item.title,
                                color: color
                            });
                        }
                    }
                }
            }
        }
        var varDec = this.otherVarDecimal;
        var breakdownDec = this.breakdownVarDecimal;
        var com = this.comma;
        this.settingsService
        .getSettings()
        .subscribe(settings => {
            let data = settings.data as {id:String, key:String, value:String}[];
            data.forEach(setting => {
                if (setting.key == "VARIABLE_DECIMAL"){
                    this.otherVarDecimal = setting.value.toString();
                    varDec = setting.value.toString();
                }
                else if (setting.key == "BREAKDOWN_DECIMAL"){
                    this.breakdownVarDecimal = setting.value.toString();
                    breakdownDec = setting.value.toString();
                }
                  //add comma separator if it was ticked in settings
                 else if (setting.key == "COMMA_CHECK"){
                    var commaCheck = setting.value.toString();
                    this.comma = (commaCheck == "true" ? "," : "");
                    com = (commaCheck == "true" ? "," : "");
                }
            });

            this.options = {
                chart: {
                    type: chartType,
                    reduceXTicks: false,
                    stacked: isStackChart,
                    height: 600,
                    x: (d) => { return d.x; },
                    y: function (d) { return d.y; },
                    useInteractiveGuideline: true,
                    interactiveLayer: {
                        tooltip: {
                            valueFormatter:(d, i) => {
                                if (this.variableType == 'breakdown' && this.valueType == 'real'){
                                    return d3.format(com +".0"+breakdownDec+"f")(d);
                                }else if (this.valueType == "real"){
                                    return d3.format(com +".0"+varDec+"f")(d);
                                }

                                return d3.format(com+".0f")(d);
                            }
                        }
                    },
                    xAxis: {
                        axisLabel: '',
                        tickFormat: (d) => {
                            if (this.valueType == 'discrete') {
                                return this.keys[d];
                            } else {
                                let pair = this.lineChartLabels[d];
                                if (pair == undefined) return '';
                                return pair.value;
                            }
                        }
                    },
                    yAxis: {
                        axisLabel: '',
                        tickFormat: (d) => {
                            // if (this.variableType == 'breakdown' && this.valueType == 'real'){
                            //     return d3.format(com+".0"+breakdownDec+"f")(d);
                            // }else if (this.valueType == "real"){
                            //     return d3.format(com+".0"+varDec+"f")(d);
                            // }

                            //return d3.format(com+".0f")(d);
                            return Utils.formatNumber(d);
                        },
                        axisLabelDistance: -10
                    },
                    yDomain: [minValue, maxValue],

                    showLegend: true,
                },
            };
        });
        this.lineChartData = tempLineChartData;
    }

    isLabelAdded(title): number {
        for (var index = 0; index < this.lineChartLabels.length; index++) {
            if (this.lineChartLabels[index].value == title) {
                return this.lineChartLabels[index].key;
            }
        }

        return -1;
    }

    reloadProjects() {
        this.selectedVariable = null;
        this.variables.splice(0, this.variables.length);

        this.projectService
            .getProjects()
            .subscribe(result => {
                if (result.status == "OK") {
                    this.projects = result.data;
                    this.selectedProject = '';
                    if (this.projects.length > 0) {
                        this.selectedProject = this.projects[0].id;
                    }
                    this.reloadBranches();
                }
            });
    }

    reloadBranches(projectId: String = null) {
        this.selectedVariable = null;
        this.variables.splice(0, this.variables.length);

        var id = projectId;
        if ((projectId == null) && (this.projects.length > 0)) {
            id = this.projects[0].id;
        }

        if (id != null) {
            this.branchService
                .getBranches(id)
                .subscribe(result => {
                    this.branches = result.data;
                    this.selectedBranch = '';
                    if (this.branches.length > 0) {
                        this.selectedBranch = this.branches[0].id;
                        this.reloadVariables();
                    }
                });
        }
    }


    reloadVariables() {
        this.selectedVariable = null;
        this.variableService
            .getVariables(this.selectedBranch)
            .subscribe(response => {
                this.variables = response.data as Array<Variable>;
            })
    }


    onDeleteSegment() {
        this.timeSegments.pop();
    }

    onSave(event) {
        let finalValue = 0, finalPercentage = 0, value = 0, decimalSize = 0;
        if (this.subvariableList != undefined) {
            this.subvariableList.forEach((variable) => {
                decimalSize = variable.value.length - 2;
                value += parseFloat(variable.value.toString());
                if (value > 1) {
                    finalValue = value;
                }
                else {
                    finalValue = parseFloat(value.toPrecision(decimalSize));
                }
                
                if (this.variableType == 'discrete') {
                    finalPercentage += parseFloat(variable.probability.toString());
                }
            });
        }

        if (this.variableName.length == 0) {
            this.modal.showError('Variable name is mandatory');

        } else if (this.variableName.match(/[^0-9a-zA-Z_-]/)) {
            this.modal.showError('Names can only include Alphabetical characters,underscores and 			hyphens');
        } else if (this.variableType.length == 0) {

            this.modal.showError('Variable type is mandatory');
        } else if (this.ownerId.length == 0) {
            this.modal.showError('Owner Id is mandatory');
        } else if (this.variableType == 'breakdown' && finalValue != 1.0) {
            this.modal.showError('All the subvariables value must add upto 1.0');
        } else if (this.variableType == 'discrete' && finalPercentage != 100.0) {
            this.modal.showError('All the subvariables value must add upto 100%');
        } else if ((this.variableType == 'breakdown' || this.variableType == 'discrete') && (this.timeSegmentWidgets == undefined || this.timeSegmentWidgets.length == 0)) {
            this.modal.showError(this.variableType + ' requires at lease one time segment');
        } else {

            var timeSegmentValues = Array();

            let lastResult = null;
            this.timeSegmentWidgets.forEach(segment => {
                var result = segment.getTimeSegmentValues();
                if (result.result) {
                    timeSegmentValues.push(result.reason);
                } else {
                    lastResult = result;
                }
            });

            if (timeSegmentValues.length != this.timeSegmentWidgets.length) {
                this.modal.showError(lastResult.reason.toString(), 'Incomplete definition');
            } else {

                let tempCompositeVariables: { id: String }[] = Array<{ id: String }>();
                this.compositeVariableList.forEach(variable => {
                    if (variable.isSelected) {
                        tempCompositeVariables.push({ id: variable.id });
                    }
                });

                if (this.shouldDefineActualValues && this.selectedInputMethodActual == 'table') {
                    if (typeof (this.startDate) != "string") {
                        this.startDate = this.startDate.format(Config.getDateFormat());
                    }

                    if (typeof (this.endDate) != "string") {
                        this.endDate = this.endDate.format(Config.getDateFormat());
                    }
                }

                let actualTimeSegment: TimeSegment = {
                    userSelectedParametrics: '',
                    startTime: this.startDate,
                    endTime: this.endDate,
                    inputMethod: this.selectedInputMethodActual,
                    tableInput: this.columns,
                    growth: 0,
                    growthPeriod: 0,
                    distributionType: 'none',
                    description: '',
                    constantValue: 0,
                    //mean: '',
                    stdDeviation: '',
                    userSelectedParametricsStdDeviation: '',
                    breakdownInput: [],
                    completedWordsArray: [],
                    subVariables: [],
                    query: this.queryText
                }

                let body = {
                    description: this.description,
                    branchId: this.branchId,
                    ownerId: this.ownerId,
                    timeSegment: timeSegmentValues,
                    title: this.variableName,
                    variableType: this.variableType,
                    valueType: this.valueType,
                    subVariables: this.subvariableList,
                    compositeVariables: tempCompositeVariables,
                    compositeType: this.compositType,
                    hasActual: this.shouldDefineActualValues,
                    actualTimeSegment: actualTimeSegment
                }

                if (this.selectedVariable == null) {
                    this.variableService
                        .createVariable(body)
                        .subscribe(response => {
                            if (response.status == "UNPROCESSABLE_ENTITY") {
                                this.modal.showError("Failed to create variable called \"" + this.variableName +
                                    "\". This name is already associated with another variable in this branch");
                            } else {
                                this.variableService
                                    .calculateVariableValues(this.branchId)
                                    .subscribe(response => {
                                        this.selectedVariable = null;
                                        if (event.srcElement.name == "saveAndExit") {
                                            this.onCancel();
                                        } else {
                                            this.refreshPage();
                                        }

                                    });
                            }
                        });
                } else {
                    this.variableService
                        .updateVariable(body, this.selectedVariable.id)
                        .subscribe(response => {
                            if (response.status == "UNPROCESSABLE_ENTITY") {
                                this.modal.showError("Failed to update variable called \"" + this.variableName + "\". This name is already associated with another 					variable in this branch");
                            } else {
                                this.variableService
                                    .calculateVariableValues(this.branchId)
                                    .subscribe(response => {
                                        this.selectedVariable = null;
                                        if (event.srcElement.name == "saveAndExit") {
                                            this.onCancel();
                                        } else {
                                            location.reload();
                                        }
                                    });
                            }
                        });
                }
            }
        }
    }

    onDelete() {
        const dialog = this.modalDialog
            .confirm()
            .title("Confirmation")
            .body("Are you sure you want to delete this varaible")
            .okBtn("Yes").okBtnClass("btn btn-danger")
            .cancelBtn("No")
            .open();
        dialog.then(promise => {
            promise.result.then(result => {
                this.variableService.deleteVariable(this.selectedVariable.id)
                    .subscribe(result => {
                        if (result.status == "OK") {
                            this.selectedVariable = null;
                            this.onCancel();
                        }
                    });
            });
        });
    }

    onCancel() {
        this.selectedVariable = null;
        this.router.navigate(['/home/variable-list'], {
            queryParams: {
                projectId: this.projectId,
                branchId: this.branchId
            }
        });
        // this.variableName = '';
        // this.ownerId = '';
        // this.valueType = '';
        // this.variableType = '';
        // this.timeSegments.splice(0, this.timeSegments.length);
    }

    onVariableTypeChanged() {
        if (this.subvariableList != undefined) {
            this.subvariableList.splice(0, this.subvariableList.length);
        }
    }

    refreshPage() {
        this.variableService
            .getVariableByName(this.branchId, this.variableName)
            .subscribe(result => {
                console.log("result", result);
                this.selectedVariable = result.data as Variable
                this.router.navigate(["home/create-variable"], {
                    queryParams: {
                        projectId: this.projectId,
                        branchId: this.branchId,
                        variableId: this.selectedVariable.id
                    }
                });
            });
    }

    generatePDF() {
        /*
         var svg = document.querySelector('svg');
         var svgData = new XMLSerializer().serializeToString( svg );

         //console.log(html);
         var imgsrc = 'data:image/svg+xml;base64,' + btoa(svgData);
         var img = '<img src="' + imgsrc + '">';
         d3.select("#svgdataurl").html(img);


         var canvas = document.createElement('canvas');
         var context = canvas.getContext("2d");

         var image = new Image;
         image.src = imgsrc;
         image.onload = function () {
         context.drawImage(image, 0, 0);

         //save and serve it as an actual filename
         //binaryblob();

         var a = document.createElement("a");
         a.download = "sample.png";
         a.href = canvas.toDataURL("image/png");

         var doc = new jsPDF();
         doc.addImage(a.href, "png", 0,0);
         doc.save("test.pdf");

         var pngimg = '<img src="' + a.href + '">';
         d3.select("#pngdataurl").html(pngimg);
         a.click();
         }
         */
    }


    binaryblob(){
        var byteString = atob(document.querySelector("canvas").toDataURL().replace(/^data:image\/(png|jpg);base64,/, ""));
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        var dataView = new DataView(ab);
        var blob = new Blob([dataView], {type: "image/png"});
        var DOMURL = self.URL;
        var newurl = DOMURL.createObjectURL(blob);

        var img = '<img src="'+newurl+'">';
        d3.select("#img").html(img);
    }

    defineActualValues(event) {
        this.shouldDefineActualValues = event.target.checked;
    }

    valuePasted(event) {
        let tempEvent = event as any;
        let data = tempEvent.clipboardData.getData('text/plain') as String;

        let parts = data.split('\t');
        var partIndex = 0;

        let id = parseInt(tempEvent.target.id)

        // lenght
        let count = this.columns.length - id;
        if (count > parts.length) {
            count = parts.length;
        }

        count += id;
        for (var index = id; index < count; index++) {
            let pair = this.columns[index];
            pair['value'] = parts[partIndex];
            partIndex += 1;
        }
        return false;
    }
}
