import { VariableTypeComponent } from './../dashboard/variable-type/variable.type.component';
import { HomeComponent } from './../home/home.component';
import { UserService } from './../services/user.service';

import { Routes } from '@angular/router';
import { VariablesComponent } from '../dashboard/variables/variables.component';
import { ListItemComponent } from '../shared/list-item/list.item.component';
import { AppHeaderComponent } from '../shared/app-header/app.header.component';
import { ProjectsComponent } from '../dashboard/projects/projects.component';
import { DataFlowComponent } from '../dashboard/data-flow/data.flow.component';
import { BranchesComponent } from '../dashboard/branches/branches.component';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { ProjectListComponent } from '../dashboard/projects/project.list.component';
import { BranchListComponent } from '../dashboard/branches/branches-list.component';
import { ForecastTabularComponent } from '../dashboard/forecasts/tabular/forecast.tabular.component';
import { ForecastGraphicalComponent } from '../dashboard/forecasts/graphical/forecast.graphical.component';
import { ComponentModelComponent } from '../dashboard/component-model/model.component';
import { LoginComponent } from '../login/login.component';
import { SimulationComponent } from '../dashboard/simulation/simulation.component';
import { VariableListComponent } from '../dashboard/variables/variable-list.component';
import { VariableTypeListComponent } from '../dashboard/variable-type/variable.type.list.component';
import { SettingsComponent } from '../dashboard/settings/settings.component';

export const routes: Routes = [
    { path:'login', component: LoginComponent },
    { 
        path:'home', 
        component: HomeComponent,
        canActivate: [UserService],
        children: [
            { path:'project-list', component: ProjectListComponent, canActivate:[UserService] },
            { path:'create-project', component: ProjectsComponent, canActivate:[UserService] },
            { path:'branches-list', component: BranchListComponent, canActivate:[UserService] },
            { path:'create-branch', component: BranchesComponent, canActivate:[UserService] },
            { path:'variable-list', component: VariableListComponent, canActivate:[UserService] },
            { path:'create-variable', component: VariablesComponent, canActivate:[UserService] },
            { path:'forecast_tabular', component: ForecastTabularComponent, canActivate:[UserService] },
            { path:'forecast_graphical', component: ForecastGraphicalComponent, canActivate:[UserService] },
            { path:'component_model', component: ComponentModelComponent, canActivate:[UserService] },
            { path:'data_flow', component: DataFlowComponent, canActivate:[UserService] },
            { path:'login', component: LoginComponent },
            { path:'simulation', component: SimulationComponent, canActivate:[UserService] },
            { path:'variable-type-list', component: VariableTypeListComponent, canActivate: [UserService]},
            { path:'create-variable-type', component: VariableTypeComponent, canActivate: [UserService]},
            { path: 'settings', component: SettingsComponent, canActivate: [UserService]}
        ] 
    },

    { path:'**', redirectTo: 'home' },

];