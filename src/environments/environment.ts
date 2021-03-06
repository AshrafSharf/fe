// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  local: true,
  //apiUrl: 'http://ec2-34-243-45-92.eu-west-1.compute.amazonaws.com:8443',
  apiUrl: 'http://localhost:8443/', 
  modelApiUrl: "http://ec2-34-243-45-92.eu-west-1.compute.amazonaws.com:8080"
};
