[![Build Status](http://egjenkins.dtvops.net:8080/view/Iconics/job/Iconics.web-components/job/Iconics.web-component-login/badge/icon)](http://egjenkins.dtvops.net:8080/view/Iconics/job/Iconics.web-components/job/Iconics.web-component-login/)

# \<dfw-login\>

This component uses the sso api to insure the user is logged in. The default behavior is if the user is not logged in, it will
redirect to the OpenAM login page. After login it will return to this page. If the allow-guest property is set, it will
not redirect. This will allow areas of the current page to be seen. If the offline property is used, it will
return a user `name` of "Offline User" and `failed` to false. It is dependent on the the main html file of an application
to include the config.js file.

## Installation
`bower install http://developer-ui.ds.dtveng.net/cdn/data/web-components/dfw-login.tar.gz --save`

This will install  `<dfw-login>` in directory `bower_components/dfw-login`. To include
in an application

```html
<link rel="import" href="bower_components/dfw-login/dfw-login.html">
```
## Usage

```HTML
  <dfw-login  id="dfw-login" failed="{{failed}}" user-name="{{userName}}"></dfw-login>
  <template is="dom-if" if="{{!failed}}">
    <div>Hello {{userName}}</div>
  </template>
  <template is="dom-if" if="{{failed}}">
    <div>Sorry. Login failed</div>
  </template>
```
## Example with allow-guest property

```HTML
<dfw-login id="dfw-login" allow-guest failed="{{failed}}" user-name="{{userName}}"></dfw-login>
  <template is="dom-if" if="{{!failed}}">
    <div>Hello {{userName}}</div>
  </template>
  <template is="dom-if" if="{{failed}}">
    <div>Content for guest</div>
  </template>
```
## Example with offline property

```HTML
  <dfw-login  id="dfw-login" offline failed="{{failed}}" user-name="{{userName}}"></dfw-login>
  <template is="dom-if" if="{{!failed}}">
    <div>Hello {{userName}}</div>
  </template>
  <template is="dom-if" if="{{failed}}">
    <div>Sorry. Login failed</div>
  </template>
```
