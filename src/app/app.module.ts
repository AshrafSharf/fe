import { AppVariableTypeService } from './services/variable.type.service';
import { VariableTypeListComponent } from './dashboard/variable-type/variable.type.list.component';
import { VariableTableComponent } from './dashboard/variables/table/table.variable.component';
import { CompletedWordComponent } from './shared/auto-complete-input/completedword.component';
import { AutocompleteInputComponent } from './shared/auto-complete-input/autocomplete.input.component';
import { VariableListComponent } from './dashboard/variables/variable-list.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { BranchService } from './services/branch.service';
import { ProjectService } from './services/project.service';
import { VariableConstantComponent } from './dashboard/variables/constant/constant.variable.component';
import { TimeSegmentComponent } from './dashboard/variables/time-segment/time.segment.component';
import { ComponentModelComponent } from './dashboard/component-model/model.component';
import { SimulationComponent } from './dashboard/simulation/simulation.component';
import { ForecastGraphicalComponent } from './dashboard/forecasts/graphical/forecast.graphical.component';
import { ForecastTabularComponent } from './dashboard/forecasts/tabular/forecast.tabular.component';
import { VariablesComponent } from './dashboard/variables/variables.component';
import { ListItemComponent } from './shared/list-item/list.item.component';
import { AppHeaderComponent } from './shared/app-header/app.header.component';
import { ProjectsComponent } from './dashboard/projects/projects.component';
import { DataFlowComponent } from './dashboard/data-flow/data.flow.component';
import { BranchesComponent } from './dashboard/branches/branches.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { NgDatepickerModule } from 'ng2-datepicker';
import { DpDatePickerModule } from 'ng2-date-picker';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { NvD3Module } from 'ng2-nvd3';

import { ModalModule } from 'ngx-modialog';
import { BootstrapModalModule } from 'ngx-modialog/plugins/bootstrap';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFontAwesomeModule } from 'angular-font-awesome/angular-font-awesome';
import { routes } from './shared/routes';
import {ShContextMenuModule} from 'ng2-right-click-menu';

import { AppComponent } from './app.component';
import * as $ from 'jquery';

import { TableViewComponent } from './shared/table-view/table.view.component';
import { ProjectListComponent } from './dashboard/projects/project.list.component';
import { BranchListComponent } from './dashboard/branches/branches-list.component';
import { UserService } from './services/user.service';
import { RoleService } from './services/roles.service';
import { VariableDistributionComponent } from './dashboard/variables/distribution/distribution.variable.component';
import { ModalDialogService } from './services/modal-dialog.service';
import { VariableExpressionComponent } from './dashboard/variables/expression/expression.variable.component';
import { AppVariableService } from './services/variable.services';
import { D3Service } from 'd3-ng2-service';
import { NgxLineChartModule } from 'ngx-line-chart';
import { ChartsModule } from 'ng2-charts';
import { VariableBreakdownComponent } from './dashboard/variables/breakdown/breakdown.variable.component';
import { VariableDiscreteRandomComponent } from './dashboard/variables/discrete-random/discrete.random.variable.component';
import { VariableTypeComponent } from './dashboard/variable-type/variable.type.component';
import { SettingsComponent } from './dashboard/settings/settings.component';
import { SettingsService } from './services/settings.service';
import { LoaderService } from './services/loader.service';
import { LoaderComponent } from './shared/loader/loader.component';
import { MatchTableComponenet } from './dashboard/component-model/match-table.component';
import { KonvaModule } from 'ng2-konva';
import { VerifyModelComponent } from './dashboard/component-model/verify-model.component';
import { ModelService } from './services/model.service';
import { ComponentModelListComponent } from './dashboard/component-model/model.list.component';


@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    BranchesComponent,
    DataFlowComponent,
    ProjectsComponent,
    AppHeaderComponent,
    ListItemComponent,
    VariablesComponent,
    VariableListComponent,
    ForecastTabularComponent,
    ForecastGraphicalComponent,
    SimulationComponent,
    MatchTableComponenet,
    ComponentModelComponent,
    VerifyModelComponent,
    TimeSegmentComponent,

    ComponentModelComponent,
    ComponentModelListComponent,
    
    VariableConstantComponent,
    VariableDistributionComponent,
    VariableExpressionComponent,
    VariableTableComponent,
    VariableBreakdownComponent,
    VariableDiscreteRandomComponent,
    
    VariableTypeComponent,
    VariableTypeListComponent,
    
    TableViewComponent,
    ProjectListComponent,
    BranchListComponent,
    LoginComponent,
    HomeComponent,

    AutocompleteInputComponent,
    CompletedWordComponent,

    SettingsComponent,
    LoaderComponent
  ],
  imports: [
    ChartsModule,
    NgxLineChartModule,
    BrowserModule,
    HttpModule,
    FormsModule,
    BrowserAnimationsModule,
    AngularFontAwesomeModule,
    ModalModule.forRoot(),
    BootstrapModalModule,
    NgDatepickerModule,
    DpDatePickerModule,
    RouterModule.forRoot(routes),
    NvD3Module,
    ShContextMenuModule,
    KonvaModule
  ],
  providers: [
    {provide: LocationStrategy, useClass: HashLocationStrategy},
    ProjectService,
    BranchService,
    UserService,
    RoleService,
    ModalDialogService,
    AppVariableService,
    AppVariableTypeService,
    D3Service,
    SettingsService,
    LoaderService,
    ModelService

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
