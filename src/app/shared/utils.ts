import { TableInputPair } from './interfaces/variables';
import { RequestOptions, Headers } from "@angular/http";
import { environment } from '../../environments/environment';
import { Moment, unix } from 'moment';


export class Utils {

    // base url
    static baseUrl:String = environment.apiUrl;
    static routeProject:String = "project";
    static routeBranch:String = "branch";
    static routeVariable:String = "variable";
    static routeUser:String = "user";
    static routeLogin:String = "login";
    static routeSettings:String = "settings";
    static routeVariableType:String = "variableType";

    static buffer:Array<TableInputPair>;

    // create url for route
    public static createUrl(route:String) {
        return `${this.baseUrl}\\${route}`;
    }

    // get the token
    public static getToken() {
        return sessionStorage["authorization_token"];
    }

    public static setBuffer(obj) {
        let inputs = obj as Array<TableInputPair>;
        this.buffer = new Array<TableInputPair>();
        for(var index = 0; index < inputs.length; index++) {
            let item = inputs[index];
            this.buffer.push({
                key: item.key,
                value: item.value
            });
        }
    }

    public static getBuffer() {
        return this.buffer;
    }

    public static getShadeOfColor(color, percent) {   
        var f = parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
        return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
    }

    public static getRandomColor(index) {
        var colors = [
            {name: 'blue', code: '#0000FF'},
            {name: 'Brown', code: '#A52A2A'},
            {name: 'CadetBlue', code: '#5F9EA0'},
            {name: 'Chartreuse', code: '#7FFF00'},
            {name: 'Coral', code: '#FF7F50'},
            {name: 'CornflowerBlue', code: '#6495ED'},
            {name: 'Crimson ', code: '#DC143C'},
            {name: 'DarkGreen', code: '#006400'},
            {name: 'red', code: '#ff0000'}
        ]

        var color = colors[index].code;
        if (index > colors.length) {
            index = 0;
        }

        console.log('index: ', index);
        /*
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }*/
        return color;
    }

    public static getRequestOptions() : RequestOptions {
        let header = new Headers({
            'Content-Type':'application/json', 
            'Authorization': Utils.getToken()
        });
        
        return new RequestOptions( {headers:header} );
    }

    public static getUserName() {
        return sessionStorage['user_name'];
    }

    public static getUserId() {
        return sessionStorage['user_id'];
    }

    public static getUniqueId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    public static fillMissingDates(keys) {
        let missing = false;
        // fill the gap 
        for (var index = 0; index < keys.length; index++) {
            //console.log(this.keys[index]);
            if (index + 1 < keys.length) {
                // get the difference
                let currentKey = keys[index];
                let currentParts = currentKey.split('-');
                let currentDate = new Date(`${currentParts[1]}/01/${currentParts[0]}`);
                let momentCurrentDate = unix(currentDate.getTime()/1000);

                let nextKey = keys[index + 1];
                let nextParts = nextKey.split('-');
                let nextDate = new Date(`${nextParts[1]}/01/${nextParts[0]}`);
                let momentNextDate = unix(nextDate.getTime()/1000);

                let monthDifference = momentNextDate.diff(momentCurrentDate, 'month');
                if (monthDifference > 1) {
                    // add the missing months
                    let startIndex = index + 1;
                    for (var monthIndex = 0; monthIndex < monthDifference; monthIndex++) {
                        let newDate = momentCurrentDate.add(1, 'month');
                        keys.splice(startIndex + monthIndex, 0, newDate.format('YYYY-MM'));
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
}
