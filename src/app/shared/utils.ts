
export class Utils {

    // base url
    static baseUrl:String = "http://ec2-34-241-101-149.eu-west-1.compute.amazonaws.com:8443";
    static routeProject:String = "project";
    static routeBranch:String = "branch";
    static routeVariable:String = "variable";
    static routeUser:String = "user";
    static routeLogin:String = "login";


    // create url for route
    public static createUrl(route:String) {
        return `${this.baseUrl}\\${route}`;
    }
}