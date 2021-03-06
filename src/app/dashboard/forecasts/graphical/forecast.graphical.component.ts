import {Component, OnInit} from '@angular/core';
import {Project} from '../../../shared/interfaces/project';
import {Branch} from '../../../shared/interfaces/branch';
import {Router} from '@angular/router';
import {BranchService} from '../../../services/branch.service';
import {ProjectService} from '../../../services/project.service';
import {AppVariableService} from '../../../services/variable.services';
import {Variable} from '../../../shared/interfaces/variables';
import {ModalDialogService} from '../../../services/modal-dialog.service';
import {SettingsService} from '../../../services/settings.service';
import 'nvd3';
import {Utils} from '../../../shared/utils';
import {Moment, unix} from 'moment';
import {Config} from '../../../shared/config';


@Component({
  selector: 'forecast-graphical',
  templateUrl: './forecast.graphical.component.html',
  styleUrls: ['./forecast.graphical.component.css']
})

export class ForecastGraphicalComponent implements OnInit {
  projects: Project[] = new Array<Project>();
  branches: Branch[] = new Array<Branch>();
  variables: Variable[] = new Array<Variable>();
  filteredVariables: Variable[] = new Array<Variable>();
  private exludedVariables: String[] = new Array<String>();
  searchName: String = '';
  searchType: String = '';
  searchOwner: String = '';

  breakdownVariables: Boolean = true;
  discreteVariables: Boolean = false;
  breakdownLines: Boolean = true;
  distributionLines: Boolean = true;

  startDate: Moment;
  endDate: Moment;

  datePickerConfig = {format: Config.getDateFormat()};
  decimal = "";
  comma = "";

  public lineChartData: Array<any> = [];
  public lineChartLabels: Array<{key: number, value: string}> = [];

  public lineChartColors: Array<any> = [];
  private navigationIndex = 0;

  currentProject: String;
  currentBranch: String;

  data;
  options;

  minStartDate: Moment = unix(new Date().getTime() / 1000);

  constructor(
    private router: Router,
    private branchService: BranchService,
    private projectService: ProjectService,
    private variableService: AppVariableService,
    private settingsService: SettingsService,
    private modal: ModalDialogService) {
  }

  ngOnInit() {
    this.initDates();
    this.reloadProjects();
  }

  initDates() {
    let currentDate = new Date();
    currentDate.setDate(1);
    currentDate.setHours(0, 0, 0, 0);
    this.minStartDate = unix(currentDate.getTime() / 1000);
    this.startDate = this.minStartDate;
    this.endDate = unix(currentDate.getTime() / 1000).add(12, 'months');
  }

  resetDates() {
    let currentDate = new Date();
    currentDate.setDate(1);
    currentDate.setHours(0, 0, 0, 0);
    let date = unix(currentDate.getTime() / 1000).subtract(6, 'months');
    if (this.minStartDate.isBefore(date)) {
      this.startDate = date;
    } else {
      this.startDate = this.minStartDate;
    }
    this.endDate = unix(currentDate.getTime() / 1000).add(12, 'months');
  }

  /** 
  Find the minium start date. Iterate over all the timesegments and find the smallest date
  */
  findMinimumStartDate() {
    // reset the minimum start date
    let currentDate = new Date();
    currentDate.setDate(1);
    currentDate.setHours(0, 0, 0, 0);
    this.minStartDate = unix(currentDate.getTime() / 1000);

    // get the lowest possible start date
    for (var index = 0; index < this.variables.length; index++) {
      let variable = this.variables[index];
      let dates = [];
      for (var resultIndex = 0; resultIndex < variable.timeSegment.length; resultIndex++) {
        let timeSegment = variable.timeSegment[resultIndex];
        dates.push(timeSegment.startTime);
      }

      if (variable.hasActual) {
        dates.push(variable.actualTimeSegment.startTime);
      }

      // sort the date
      dates.sort(function(d1, d2) {
        let values1 = d1.split('-');
        let date1 = new Date(`${values1[0]}/01/${values1[1]}`);
        let m1 = unix(date1.getTime() / 1000);

        let values2 = d2.split('-');
        let date2 = new Date(`${values2[0]}/01/${values2[1]}`);
        let m2 = unix(date2.getTime() / 1000);

        if (m1.isAfter(m2)) {
          return 1;
        } else if (m2.isAfter(m1)) {
          return -1;
        } else {
          return 0;
        }
      });

      if (dates.length > 0) {
        let components = dates[0].split('-');
        let month = components[0];
        let year = components[1];

        let date = new Date(`${month}/01/${year}`);
        let moment = unix(date.getTime() / 1000);
        if (moment.isBefore(this.minStartDate)) {
          this.minStartDate = moment;
        }
      }
    }

    // check if the minimum date is before 6 months
    let date = unix(currentDate.getTime() / 1000).subtract(6, 'months');
    if (this.minStartDate.isBefore(date)) {
      this.startDate = date;
    } else {
      this.startDate = this.minStartDate;
    }
  }

  toggleBreakdownVariables(event) {
    this.searchName = "", this.searchType = "", this.searchOwner = "";
    this.breakdownVariables = event.target.checked;
    this.filteredVariables.splice(0, this.filteredVariables.length);
    for (var index = 0; index < this.variables.length; index++) {
      let variable = this.variables[index];
      if (this.shouldSkipVariable(variable) == true) {

        for (var excludeIndex = 0; excludeIndex < this.exludedVariables.length; excludeIndex++) {
          if (this.exludedVariables[excludeIndex] == variable.id) {
            this.exludedVariables.splice(excludeIndex, 1);
            break;
          }
        }

        this.exludedVariables.push(variable.id);
        continue;
      }

      this.filteredVariables.push(variable);
    }
    this.clearChart();
    setTimeout(() => {this.renderChart();}, 100);
  }

  toggleBreakdownLines(event) {
    this.breakdownLines = event.target.checked;
    this.clearChart();
    setTimeout(() => {this.renderChart();}, 100);
  }

  shouldSkipVariable(variable): Boolean {
    if ((variable.variableType == 'breakdown') && (!this.breakdownVariables)) {
      return true;
    }

    if ((variable.valueType == 'discrete') && (!this.discreteVariables)) {
      return true;
    }

    return false;
  }

  toggleDiscreteVariables(event) {
    this.discreteVariables = event.target.checked;
    this.filteredVariables.splice(0, this.filteredVariables.length);
    for (var index = 0; index < this.variables.length; index++) {
      let variable = this.variables[index];
      if (this.shouldSkipVariable(variable) == true) {
        continue;
      }

      this.filteredVariables.push(variable);
    }
    this.clearChart();
    setTimeout(() => {this.renderChart();}, 100);
  }

  toggleDistributionLines(event) {
    this.distributionLines = event.target.checked;
    this.clearChart();
    setTimeout(() => {this.renderChart();}, 100);
  }

  loadPreviousMonths() {
    this.navigationIndex -= 1;
    this.reloadMonths();
  }

  loadNextMonths() {
    this.navigationIndex += 1;
    this.reloadMonths();
  }

  filterResult(event, type) {
    this.filteredVariables.splice(0, this.filteredVariables.length);

    for (var index = 0; index < this.variables.length; index++) {
      var variable = this.variables[index];
      if ((variable.title.toLowerCase().indexOf(this.searchName.toLowerCase()) >= 0) &&
        (variable.variableType.toLowerCase().indexOf(this.searchType.toLowerCase()) >= 0) &&
        (variable.ownerName.toLowerCase().indexOf(this.searchOwner.toLowerCase()) >= 0)) {

        if (this.shouldSkipVariable(variable) == true) {
          continue;
        }

        this.filteredVariables.push(variable);
      }
    }
  }

  reloadMonths() {
    this.variableService
      .extendValuesForMonths(this.currentBranch, this.navigationIndex)
      .subscribe(result => {
        console.log(result);
        this.variables = result.data as Array<Variable>;
        this.clearChart();
        setTimeout(() => {this.renderChart();}, 100);
      })
  }

  selectBranch(event) {
    this.reloadBranches(event.target.value);
  }

  selectVariables(event) {
    Utils.selectProject(this.currentProject);
    Utils.selectBranch(this.currentProject, event.target.value);
    this.reloadVariables(event.target.value);
  }

  reloadProjects() {
    this.projectService
      .getProjects()
      .subscribe(result => {
        if (result.status == "OK") {
          console.log(result);
          this.projects = result.data;
          this.reloadBranches();
        }
      });
  }

  reloadBranches(projectId: String = null) {
    var id = projectId;
    if (projectId == null) {
      if (Utils.getLastSelectedProject() != undefined && Utils.getLastSelectedProject() != "null") {
        id = Utils.getLastSelectedProject();
      } else if (this.projects.length > 0) {
        id = this.projects[0].id;
      }
    }

    this.currentProject = id.toString();
    Utils.selectProject(this.currentProject);

    if (id != null) {
      this.branchService
        .getBranches(id)
        .subscribe(result => {
          if (result.status == "OK") {
            console.log(result);
            this.branches = result.data as Array<Branch>;
            this.reloadVariables();
          }
        });
    }
  }

  isVariableExcluded(id) {
    this.exludedVariables.forEach(varId => {
      if (varId == id) {
        return true;
      }
    })

    return false;
  }

  clearAllVariables() {
    this.filteredVariables.splice(0, this.filteredVariables.length);

    this.exludedVariables.splice(0, this.exludedVariables.length);
    this.variables.forEach(variable => {
      this.exludedVariables.push(variable.id);
      this.filteredVariables.push(variable);
    })
  }

  reloadVariables(branchId: String = null) {
    var id = branchId;
    if (branchId == null) {
      if (Utils.getLastSelectedBranch() != undefined) {
        let bId = Utils.getLastSelectedBranch();
        let ids = bId.split('-');
        if (this.currentProject == ids[0]) {
          if (ids[1] != "null") {
            id = ids[1];
          }
        } else {
          if (this.branches.length > 0) {
            id = this.branches[0].id;
          }
        }
      } else if (this.branches.length > 0) {
        id = this.branches[0].id;
      }
    }

    this.currentBranch = id;
    this.navigationIndex = 0;

    if (id != null) {
      this.variableService
        .getUserAccessVariables(id, Utils.getUserId())
        .subscribe(result => {
          if (result.status == "OK") {
            this.variables = result.data as Array<Variable>;
            this.initDates();
            this.findMinimumStartDate();
            this.processVariableData();
          }
        });
      // this.variableService
      //     .getVariables(id)
      //     .subscribe(result => {
      //         if (result.status == "OK") {
      //             this.variables = result.data as Array<Variable>;
      //             this.initDates();
      //             this.findMinimumStartDate();
      //             this.processVariableData();
      //         }
      //     });
    }
  }

  processVariableData() {
    this.filteredVariables.splice(0, this.filteredVariables.length);

    this.exludedVariables = [];
    this.variables.forEach(variable => {
      if (!this.shouldSkipVariable(variable)) {
        this.exludedVariables.push(variable.id);
        this.filteredVariables.push(variable);
      }
    })

    this.clearChart();
    setTimeout(() => {this.renderChart();}, 100);
  }

  isLabelAdded(title): number {
    for (var index = 0; index < this.lineChartLabels.length; index++) {
      if (this.lineChartLabels[index].value == title) {
        return this.lineChartLabels[index].key;
      }
    }

    return -1;
  }

  excludeVariable(event) {
    if (event.target.checked == false) {
      this.exludedVariables.push(event.target.value);
    } else {
      for (var index = 0; index < this.exludedVariables.length; index++) {
        if (this.exludedVariables[index] == event.target.value) {
          this.exludedVariables.splice(index, 1);
          break;
        }
      }
    }

    this.clearChart();
    setTimeout(() => {this.renderChart();}, 100);
  }

  clearChart() {
    this.lineChartLabels.splice(0, this.lineChartLabels.length);
    this.lineChartColors.splice(0, this.lineChartColors.length);
    this.lineChartData.splice(0, this.lineChartData.length);
  }

  renderChart() {
    this.lineChartLabels.splice(0, this.lineChartLabels.length);
    this.lineChartColors.splice(0, this.lineChartColors.length);
    this.lineChartData.splice(0, this.lineChartData.length);

    var totalSegments = 0;
    var minValue = 0;
    var maxValue = 0;

    // collect all keys
    var keyIndex = 0;
    /*
    for (var variableIndex = 0; variableIndex < this.variables.length; variableIndex ++) {
        let variable = this.variables[variableIndex];

        let skipVariable = false;
        for (var index = 0; index < this.exludedVariables.length; index++) {
            if (this.exludedVariables[index] == variable.id) {
                skipVariable = true;
                break;
            }
        }


        let finished = false;

        if (skipVariable) continue;
        if (variable.allTimesegmentsResultList != undefined || variable.allTimesegmentsResultList != null) {
            for (var index = 0; index < variable.allTimesegmentsResultList.length; index++) {
                let alreadyExecuted = false;
                var dataValues = [];
                var counter = 0;

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

                        keyIndex += 1;
                    }
                }
            }
        }
    }
    */

    this.lineChartLabels.splice(0, this.lineChartLabels.length);
    let months = this.endDate.diff(this.startDate, 'months') + 1;
    let tempDate = this.startDate.clone();
    for (var index = 0; index < months; index++) {
      this.lineChartLabels.push(
        {
          key: index,
          value: tempDate.format('YYYY-MM')
        }
      );

      tempDate.add(1, 'months');
    }
    console.log(this.lineChartLabels);

    var colorIndex = 0;
    for (var variableIndex = 0; variableIndex < this.variables.length; variableIndex++) {
      let variable = this.variables[variableIndex];

      let skipVariable = false;
      for (var index = 0; index < this.exludedVariables.length; index++) {
        if (this.exludedVariables[index] == variable.id) {
          skipVariable = true;
          break;
        }
      }

      if (skipVariable) continue;

      if (variable.allTimesegmentsResultList != undefined || variable.allTimesegmentsResultList != null) {
        if (variable.allTimesegmentsResultList != undefined || variable.allTimesegmentsResultList != null) {
          var color = Utils.getRandomColor(colorIndex);
          colorIndex += 1;
          for (var index = 0; index < variable.allTimesegmentsResultList.length; index++) {
            var dataValues = [];
            let item = variable.allTimesegmentsResultList[index];

            this.lineChartLabels.forEach(pair => {
              let found = false;
              for (var dataIndex = 0; dataIndex < item.data.length; dataIndex++) {
                var valueItem = item.data[dataIndex];
                if (pair.value == valueItem.title) {
                  found = true;
                  //var num = parseInt(valueItem.value.toString());
                  var num = parseFloat(valueItem.value.toString());
                  if (num < minValue) minValue = num;
                  if (num > maxValue) maxValue = num;

                  dataValues.push({x: pair.key, y: num});
                  break;
                }
              }

              if (!found) {
                dataValues.push({x: pair.key, y: undefined});
              }
            });


            if (index == 0) {
              if (variable.variableType == 'breakdown') {
                if (this.breakdownVariables) {
                  var itemKey = (item.title == "-total") ? variable.title + "" + item.title : item.title;
                  console.log(itemKey);
                  this.lineChartData.push({
                    values: dataValues,
                    key: itemKey,
                    color: color
                  });
                }
              }
              else {
                var itemKey = (item.title == "-total") ? variable.title + "" + item.title : item.title;
                console.log(itemKey);
                this.lineChartData.push({
                  values: dataValues,
                  key: itemKey,
                  color: color
                });
              }
            } else {
              if (variable.variableType != 'breakdown') {
                var itemKey: String = variable.title.toString() + '_' + item.title.toString();

                if (index % 2 != 0) {
                  // odd
                  color = Utils.getShadeOfColor(color, 0.5);
                }

                //add title total to the sigma of the base line if it has subvariables
                if (item.calculationType == "GAUSSIAN_CALCULATION" && variable.compositeType == "breakdown") {
                  itemKey = item.title + "." + "total";
                }

                if (item.calculationType == "GAUSSIAN_CALCULATION") {
                  if (this.distributionLines != false) {
                    this.lineChartData.push({
                      values: dataValues,
                      key: itemKey,
                      classed: 'dashed',
                      color: color,
                    });
                  }
                }
                else if (item.calculationType == "SUBVARIABLE_CALCULATION") {
                  if (this.breakdownLines != false) {
                    this.lineChartData.push({
                      values: dataValues,
                      key: itemKey,
                      //classed: 'dotted',
                      color: color
                    });
                  }
                }
                else if (item.calculationType == "GAUSSIAN_SUBVARIABLE_CALCULATION") {
                  if (this.breakdownLines != false && this.distributionLines != false) {
                    this.lineChartData.push({
                      values: dataValues,
                      key: itemKey,
                      classed: 'dotted',
                      color: color
                    });
                  }
                }


              } else {
                if (this.breakdownVariables == false) continue;
                if (this.breakdownLines == false) continue;

                color = Utils.getShadeOfColor(color, 0.5);
                this.lineChartData.push({
                  values: dataValues,
                  key: variable.title + "" + item.title,
                  color: color
                });
              }
            }
          }
        }
      }
    }
    var dec = this.decimal;
    var com = this.comma;
    this.settingsService
      .getSettings()
      .subscribe(settings => {
        let data = settings.data as {id: String, key: String, value: String}[];
        data.forEach(setting => {
          if (setting.key == "VARIABLE_DECIMAL") {
            this.decimal = setting.value.toString();
            dec = setting.value.toString();
          }
          else if (setting.key == "COMMA_CHECK") {
            var commaCheck = setting.value.toString();
            this.comma = (commaCheck == "true" ? "," : "");
            com = (commaCheck == "true" ? "," : "");
          }
        });
        this.options = {
          chart: {
            type: 'lineChart',
            height: 450,
            x: (d) => {return d.x;},
            y: function(d) {return d.y;},
            useInteractiveGuideline: true,
            interactiveLayer: {
              tooltip: {
                valueFormatter: (d, i) => {
                  return d3.format(com + ".0" + dec + "f")(d);
                }
              }
            },
            xAxis: {
              axisLabel: '',
              tickFormat: (d) => {
                let pair = this.lineChartLabels[d];
                if (pair == undefined) return '';
                return pair.value;
              }
            },
            yAxis: {
              axisLabel: '',
              tickFormat: function(d) {
                return Utils.formatNumber(d);
                // return d3.format(com+".0"+dec+"f")(d);
              },
              axisLabelDistance: -10
            },
            yDomain: [minValue, maxValue],
            showLegend: true,
            clipEdge: false
          },
        };
      });
  }

  reloadGraph() {
    if (this.startDate.isBefore(this.minStartDate)) {
      this.modal.showError('Start date can not be less than ' + this.minStartDate.format("MM-YYYY") + '. Please select correct start date.')
    } else if (this.endDate.isBefore(this.startDate)) {
      this.modal.showError("End date can not be less than start date. Please correct end date.");
    } else {
      this.variableService
        .getCalculationsFor(
        this.currentBranch,
        this.startDate.format(Config.getDateFormat()),
        this.endDate.format(Config.getDateFormat()))
        .subscribe(result => {
          console.log(result);
          var extendedVars = result.data as Array<Variable>;
          var finalVars = result.data as Array<Variable>;
          var position = [];

          extendedVars.forEach(exVar => {
            var match = false;
            for (var index = 0; index < this.variables.length; index++) {
              if (exVar.title == this.variables[index].title) {
                match = true;
                break;
              }
            }
            if (!match) {
              position.push(extendedVars.indexOf(exVar));
            }
          });

          if (position.length != 0) {
            for (var index = position.length - 1; index >= 0; index--) {
              finalVars.splice(position[index], 1);
            }
          }
          this.variables = finalVars;
          setTimeout(() => {this.renderChart();}, 100);
        });
    }
  }

}
