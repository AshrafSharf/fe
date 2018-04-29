# \<dfw-status-dialog\>



This component is a specialized dialog for simple acknowledgement responses or confirmations. It
is a wrapper around the `paper-dialog` component and is specialized for 4 types of dialogs:
success, warning, error and info.

## Installation
`bower install http://developer-ui.ds.dtveng.net/cdn/data/web-components/dfw-status-dialog.tar.gz --save`

This will install `<dfw-status-dialog>` in directory `bower_components/dfw-status-dialog`. To include
in an application

```html
<link rel="import" href="bower_components/dfw-status-dialog/dfw-status-dialog.html">
```

## Usage
For a confirmation dialog:
```html
<dfw-status-dialog
  confirm
  confirm-button-text="Yes"
  cancel-button-text="No"
  status-type="error"
  message="This is the message for the dialog" answer="{{answer}}"></dfw-status-dialog>
```
For an acknowledgement dialog:
```html
<dfw-status-dialog
  status-type="success"
  message="This is the message for the dialog"></dfw-status-dialog>
```
