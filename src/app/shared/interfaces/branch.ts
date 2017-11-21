export interface Branch {
    id: String;
    projectId: String;
    title: String;
    description: String;
    master: Boolean;
    ownerId: String;
    ownerName: String;
    timeUnit: String;
    startTime: String;
    endTime: String;
    actualsTime: String;
}