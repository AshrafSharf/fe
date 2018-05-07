import { User } from "./user";

export interface Branch {
    id: String;
    projectId: String;
    title: String;
    description: String;
    isMaster: Boolean;
    ownerId: String;
    ownerName: String;
    timeUnit: String;
    actuals: String;
    startTime: String;
    endTime: String;
    isPrivate: Boolean;  
    usersWithAccess: Array<User>;
}
