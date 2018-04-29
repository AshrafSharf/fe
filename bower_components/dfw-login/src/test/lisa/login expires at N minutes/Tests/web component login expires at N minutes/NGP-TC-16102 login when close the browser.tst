<?xml version="1.0" encoding="UTF-8"?>
<TestCase name="NGP-TC-16102 login when close the browser" version="5">

<meta>
   <create author="admin" buildNumber="9.5.1.6" date="04/17/2017" host="CACDTL02RK216W" version="9.5.1"/>
   <lastEdited author="admin" buildNumber="9.5.1.6" date="04/19/2017" host="CACDTL02RK216W" version="9.5.1"/>
</meta>

<id>9786B05D254F11E7BB12BE2520524153</id>
<Documentation>Put documentation of the Test Case here.</Documentation>
<IsInProject>true</IsInProject>
<sig>ZWQ9NSZ0Y3Y9NSZsaXNhdj05LjUuMSAoOS41LjEuNikmbm9kZXM9MjEwODYxNjExOA==</sig>
<subprocess>false</subprocess>

<initState>
</initState>

<resultState>
</resultState>

<deletedProps>
</deletedProps>

    <Node log="" name="Open the web component login" next="Click on Demo" quiet="false" think="500-1S" type="lisa.ui.uiMethods.uiMethods" uid="9786B05E254F11E7BB12BE2520524153" useFilters="true" version="1"> 

<classname>GoToUrl</classname>
<BROWSER>firefox</BROWSER>
<URL>http://radhika.dtveng.net:8080/components/dfw-login/</URL>
<OS>windows</OS>
    </Node>


    <Node log="" name="Click on Demo" next="Switching the iframe to xpath" quiet="false" think="500-1S" type="lisa.ui.actions.uiNode" uid="9786B05F254F11E7BB12BE2520524153" useFilters="true" version="1"> 

<xPath>xPath</xPath>
<actions>click</actions>
<parameter1>{{Demo}}</parameter1>
<false>false</false>
<checkboxOnError>false</checkboxOnError>
    </Node>


    <Node log="" name="Switching the iframe to xpath" next="Verify Guest Option is there" quiet="false" think="500-1S" type="lisa.ui.uiMethods.uiMethods" uid="9786B060254F11E7BB12BE2520524153" useFilters="true" version="1"> 

<classname>SwitchToFrameByXpath</classname>
<Xpath>//iframe[@class='style-scope iron-component-page']</Xpath>
    </Node>


    <Node log="" name="Verify Guest Option is there" next="Click on login on Demo" quiet="false" think="500-1S" type="lisa.ui.actions.uiNode" uid="9786D771254F11E7BB12BE2520524153" useFilters="true" version="1"> 


      <!-- Assertions -->
<CheckResult assertTrue="false" name="Ensure Result Contains String~5" type="com.itko.lisa.test.CheckResultContains">
<log>Assertion name: Ensure Result Contains String~5 checks for: false is of type: Result as String Contains Given String.</log>
<then>fail</then>
<valueToAssertKey/>
        <param>Guest</param>
</CheckResult>

<xPath>xPath</xPath>
<actions>getText</actions>
<parameter1>{{Guest}}</parameter1>
<false>false</false>
<checkboxOnError>false</checkboxOnError>
    </Node>


    <Node log="" name="Click on login on Demo" next="Send the CSP username" quiet="false" think="500-1S" type="lisa.ui.actions.uiNode" uid="9786D772254F11E7BB12BE2520524153" useFilters="true" version="1"> 

<xPath>xPath</xPath>
<actions>click</actions>
<parameter1>{{login}}</parameter1>
<false>false</false>
<checkboxOnError>false</checkboxOnError>
    </Node>


    <Node log="" name="Send the CSP username" next="Send the CSP password" quiet="false" think="500-1S" type="lisa.ui.actions.uiNode" uid="9786D773254F11E7BB12BE2520524153" useFilters="true" version="1"> 

<xPath>id</xPath>
<actions>sendKeys</actions>
<parameter1>idToken1</parameter1>
<parameter2>{{username}}</parameter2>
<false>false</false>
<checkboxOnError>false</checkboxOnError>
    </Node>


    <Node log="" name="Send the CSP password" next="Click on Login on CSP Page" quiet="false" think="500-1S" type="lisa.ui.actions.uiNode" uid="9786D774254F11E7BB12BE2520524153" useFilters="true" version="1"> 

<xPath>id</xPath>
<actions>sendKeys</actions>
<parameter1>idToken2</parameter1>
<parameter2>123123a</parameter2>
<false>false</false>
<checkboxOnError>false</checkboxOnError>
    </Node>


    <Node log="" name="Click on Login on CSP Page" next="Verify Welcome,Username message is there" quiet="false" think="500-1S" type="lisa.ui.actions.uiNode" uid="9786D775254F11E7BB12BE2520524153" useFilters="true" version="1"> 

<xPath>id</xPath>
<actions>click</actions>
<parameter1>loginButton_0</parameter1>
<false>false</false>
<checkboxOnError>false</checkboxOnError>
    </Node>


    <Node log="" name="Verify Welcome,Username message is there" next="waitforfewmins~1" quiet="false" think="500-1S" type="lisa.ui.actions.uiNode" uid="9786D776254F11E7BB12BE2520524153" useFilters="true" version="1"> 


      <!-- Assertions -->
<CheckResult assertTrue="false" name="Ensure Result Contains String" type="com.itko.lisa.test.CheckResultContains">
<log>Assertion name: Ensure Result Contains String checks for: false is of type: Result as String Contains Given String.</log>
<then>fail</then>
<valueToAssertKey/>
        <param>{{username}}</param>
</CheckResult>

<xPath>xPath</xPath>
<actions>getText</actions>
<parameter1>{{usernameonloginpage}}</parameter1>
<false>false</false>
<checkboxOnError>false</checkboxOnError>
    </Node>


    <Node log="" name="waitforfewmins~1" next="Verify Warning i sthere" quiet="false" think="500-1S" type="com.itko.lisa.test.UserScriptNode" uid="9786D777254F11E7BB12BE2520524153" useFilters="true" version="1"> 


      <!-- Assertions -->
<CheckResult assertTrue="true" name="Any Exception Then Fail" type="com.itko.lisa.dynexec.CheckInvocationEx">
<log>Assertion name: Any Exception Then Fail checks for: true is of type: Assert on Invocation Exception.</log>
<then>fail</then>
<valueToAssertKey/>
        <param>.*</param>
</CheckResult>

<onerror>abort</onerror>
<language>BeanShell</language>
<copyProps>TestExecProps</copyProps>
<script>Thread.sleep(360000);</script>
    </Node>


    <Node log="" name="Verify Warning i sthere" next="Get the Warning message" quiet="false" think="500-1S" type="lisa.ui.actions.uiNode" uid="9786D778254F11E7BB12BE2520524153" useFilters="true" version="1"> 


      <!-- Assertions -->
<CheckResult assertTrue="false" name="Ensure Result Contains String~6" type="com.itko.lisa.test.CheckResultContains">
<log>Assertion name: Ensure Result Contains String~6 checks for: false is of type: Result as String Contains Given String.</log>
<then>fail</then>
<valueToAssertKey/>
        <param>true</param>
</CheckResult>

<xPath>id</xPath>
<actions>isElementVisible</actions>
<parameter1>plainDialog</parameter1>
<false>false</false>
<checkboxOnError>false</checkboxOnError>
    </Node>


    <Node log="" name="Get the Warning message" next="Verify Welcome,Username message is there still" quiet="false" think="500-1S" type="lisa.ui.actions.uiNode" uid="9786D779254F11E7BB12BE2520524153" useFilters="true" version="1"> 


      <!-- Assertions -->
<CheckResult assertTrue="false" name="Ensure Result Contains String~8" type="com.itko.lisa.test.CheckResultContains">
<log>Assertion name: Ensure Result Contains String~8 checks for: false is of type: Result as String Contains Given String.</log>
<then>fail</then>
<valueToAssertKey/>
        <param>Session timeout in</param>
</CheckResult>

<xPath>xPath</xPath>
<actions>getText</actions>
<parameter1>{{warningmsg}}</parameter1>
<false>false</false>
<checkboxOnError>false</checkboxOnError>
    </Node>


    <Node log="" name="Verify Welcome,Username message is there still" next="Verify Logout option is there" quiet="false" think="500-1S" type="lisa.ui.actions.uiNode" uid="9786D77A254F11E7BB12BE2520524153" useFilters="true" version="1"> 


      <!-- Assertions -->
<CheckResult assertTrue="false" name="Ensure Result Contains String" type="com.itko.lisa.test.CheckResultContains">
<log>Assertion name: Ensure Result Contains String checks for: false is of type: Result as String Contains Given String.</log>
<then>fail</then>
<valueToAssertKey/>
        <param>{{username}}</param>
</CheckResult>

<xPath>xPath</xPath>
<actions>getText</actions>
<parameter1>{{usernameonloginpage}}</parameter1>
<false>false</false>
<checkboxOnError>false</checkboxOnError>
    </Node>


    <Node log="" name="Verify Logout option is there" next="Close the Browser" quiet="false" think="500-1S" type="lisa.ui.actions.uiNode" uid="9786D77B254F11E7BB12BE2520524153" useFilters="true" version="1"> 


      <!-- Assertions -->
<CheckResult assertTrue="false" name="Ensure Result Contains String~9" type="com.itko.lisa.test.CheckResultContains">
<log>Assertion name: Ensure Result Contains String~9 checks for: false is of type: Result as String Contains Given String.</log>
<then>fail</then>
<valueToAssertKey/>
        <param>Logout</param>
</CheckResult>

<xPath>xPath</xPath>
<actions>getText</actions>
<parameter1>{{logoutondemo}}</parameter1>
<false>false</false>
<checkboxOnError>false</checkboxOnError>
    </Node>


    <Node log="" name="Close the Browser" next="Open =web component login page again" quiet="false" think="500-1S" type="lisa.ui.uiMethods.uiMethods" uid="9786D77C254F11E7BB12BE2520524153" useFilters="true" version="1"> 

<classname>CloseDriver</classname>
    </Node>


    <Node log="" name="Open =web component login page again" next="Click on Demo~1" quiet="false" think="500-1S" type="lisa.ui.uiMethods.uiMethods" uid="9786D77D254F11E7BB12BE2520524153" useFilters="true" version="1"> 

<classname>GoToUrl</classname>
<BROWSER>firefox</BROWSER>
<URL>http://radhika.dtveng.net:8080/components/dfw-login/</URL>
<OS>windows</OS>
    </Node>


    <Node log="" name="Click on Demo~1" next="Switching the iframe to xpath~1" quiet="false" think="500-1S" type="lisa.ui.actions.uiNode" uid="9786D77E254F11E7BB12BE2520524153" useFilters="true" version="1"> 

<xPath>xPath</xPath>
<actions>click</actions>
<parameter1>{{Demo}}</parameter1>
<false>false</false>
<checkboxOnError>false</checkboxOnError>
    </Node>


    <Node log="" name="Switching the iframe to xpath~1" next="Verify Guest Option is there~1" quiet="false" think="500-1S" type="lisa.ui.uiMethods.uiMethods" uid="9786D77F254F11E7BB12BE2520524153" useFilters="true" version="1"> 

<classname>SwitchToFrameByXpath</classname>
<Xpath>//iframe[@class='style-scope iron-component-page']</Xpath>
    </Node>


    <Node log="" name="Verify Guest Option is there~1" next="Verify login option is there" quiet="false" think="500-1S" type="lisa.ui.actions.uiNode" uid="9786D780254F11E7BB12BE2520524153" useFilters="true" version="1"> 


      <!-- Assertions -->
<CheckResult assertTrue="false" name="Ensure Result Contains String~5" type="com.itko.lisa.test.CheckResultContains">
<log>Assertion name: Ensure Result Contains String~5 checks for: false is of type: Result as String Contains Given String.</log>
<then>fail</then>
<valueToAssertKey/>
        <param>Guest</param>
</CheckResult>

<xPath>xPath</xPath>
<actions>getText</actions>
<parameter1>{{Guest}}</parameter1>
<false>false</false>
<checkboxOnError>false</checkboxOnError>
    </Node>


    <Node log="" name="Verify login option is there" next="end" quiet="false" think="500-1S" type="lisa.ui.actions.uiNode" uid="9786D781254F11E7BB12BE2520524153" useFilters="true" version="1"> 


      <!-- Assertions -->
<CheckResult assertTrue="false" name="Ensure Result Contains String~10" type="com.itko.lisa.test.CheckResultContains">
<log>Assertion name: Ensure Result Contains String~10 checks for: false is of type: Result as String Contains Given String.</log>
<then>fail</then>
<valueToAssertKey/>
        <param>Login</param>
</CheckResult>

<xPath>xPath</xPath>
<actions>getText</actions>
<parameter1>{{login}}</parameter1>
<parameter2/>
<false>false</false>
<checkboxOnError>false</checkboxOnError>
    </Node>


    <Node log="" name="abort" next="" quiet="true" think="0h" type="com.itko.lisa.test.AbortStep" uid="9786D782254F11E7BB12BE2520524153" useFilters="true" version="1"> 

    </Node>


    <Node log="" name="fail" next="abort" quiet="true" think="0h" type="com.itko.lisa.test.Abend" uid="9786D783254F11E7BB12BE2520524153" useFilters="true" version="1"> 

    </Node>


    <Node log="" name="end" next="fail" quiet="true" think="0h" type="com.itko.lisa.test.NormalEnd" uid="9786D784254F11E7BB12BE2520524153" useFilters="true" version="1"> 

    </Node>


</TestCase>