import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../services/settings.service';

@Component({
    selector: 'app-configuration',
    templateUrl: 'settings.component.html',
    styleUrls: [
        'settings.component.css'
    ]
})

export class SettingsComponent implements OnInit {
    sigma = "";

    constructor(private service:SettingsService) {
    }

    ngOnInit() {
        this.service
            .getSettings()
            .subscribe(settings => {
                let data = settings.data as {id:String, key:String, value:String}[];
                data.forEach(setting => {
                    if (setting.key == "SIGMA") {
                        this.sigma = setting.value.toString();
                    }
                });
            });
    }

    onSave() {
        this.service
            .saveSettings([{key: 'SIGMA', value:this.sigma}])
            .subscribe(result => {
                console.log("settings saved")
            });
    }
}