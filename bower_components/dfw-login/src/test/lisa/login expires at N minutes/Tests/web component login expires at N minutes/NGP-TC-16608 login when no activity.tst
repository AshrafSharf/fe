<?xml version="1.0" encoding="UTF-8"?>
<TestCase name="NGP-TC-16608 login when no activity" version="5">

<meta>
   <create author="admin" buildNumber="9.5.1.6" date="04/17/2017" host="CACDTL02RK216W" version="9.5.1"/>
   <lastEdited author="admin" buildNumber="9.5.1.6" date="04/20/2017" host="CACDTL02RK216W" version="9.5.1"/>
</meta>

<id>9B72BCA6260111E7B01D0CB120524153</id>
<Documentation>Put documentation of the Test Case here.</Documentation>
<IsInProject>true</IsInProject>
<sig>ZWQ9NSZ0Y3Y9NSZsaXNhdj05LjUuMSAoOS41LjEuNikmbm9kZXM9Mjg3MDEzNDU=</sig>
<subprocess>false</subprocess>

<initState>
</initState>

<resultState>
</resultState>

<deletedProps>
</deletedProps>

    <Node log="" name="Open the web component login page" next="Click on Demo" quiet="false" think="500-1S" type="lisa.ui.uiMethods.uiMethods" uid="9B72BCA7260111E7B01D0CB120524153" useFilters="true" version="1"> 

<classname>GoToUrl</classname>
<BROWSER>firefox</BROWSER>
<URL>http://radhika.dtveng.net:8080/components/dfw-login/</URL>
<OS>windows</OS>
    </Node>


    <Node log="" name="Click on Demo" next="Switching the iframe to xpath" quiet="false" think="500-1S" type="lisa.ui.actions.uiNode" uid="9B72BCA8260111E7B01D0CB120524153" useFilters="true" version="1"> 

<xPath>xPath</xPath>
<actions>click</actions>
<parameter1>{{Demo}}</parameter1>
<false>false</false>
<checkboxOnError>false</checkboxOnError>
    </Node>


    <Node log="" name="Switching the iframe to xpath" next="Verify Guest Option is there" quiet="false" think="500-1S" type="lisa.ui.uiMethods.uiMethods" uid="9B72BCA9260111E7B01D0CB120524153" useFilters="true" version="1"> 

<classname>SwitchToFrameByXpath</classname>
<Xpath>//iframe[@class='style-scope iron-component-page']</Xpath>
    </Node>


    <Node log="" name="Verify Guest Option is there" next="Click on login on Demo" quiet="false" think="500-1S" type="lisa.ui.actions.uiNode" uid="9B72BCAA260111E7B01D0CB120524153" useFilters="true" version="1"> 


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


    <Node log="" name="Click on login on Demo" next="Send the CSP username" quiet="false" think="500-1S" type="lisa.ui.actions.uiNode" uid="9B72BCAB260111E7B01D0CB120524153" useFilters="true" version="1"> 

<xPath>xPath</xPath>
<actions>click</actions>
<parameter1>{{login}}</parameter1>
<false>false</false>
<checkboxOnError>false</checkboxOnError>
    </Node>


    <Node log="" name="Send the CSP username" next="Send the CSP password" quiet="false" think="500-1S" type="lisa.ui.actions.uiNode" uid="9B72BCAC260111E7B01D0CB120524153" useFilters="true" version="1"> 

<xPath>id</xPath>
<actions>sendKeys</actions>
<parameter1>idToken1</parameter1>
<parameter2>{{username}}</parameter2>
<false>false</false>
<checkboxOnError>false</checkboxOnError>
    </Node>


    <Node log="" name="Send the CSP password" next="Click on Login on CSP Page" quiet="false" think="500-1S" type="lisa.ui.actions.uiNode" uid="9B72BCAD260111E7B01D0CB120524153" useFilters="true" version="1"> 

<xPath>id</xPath>
<actions>sendKeys</actions>
<parameter1>idToken2</parameter1>
<parameter2>123123a</parameter2>
<false>false</false>
<checkboxOnError>false</checkboxOnError>
    </Node>


    <Node log="" name="Click on Login on CSP Page" next="Verify Welcome,Username message is there" quiet="false" think="500-1S" type="lisa.ui.actions.uiNode" uid="9B72BCAE260111E7B01D0CB120524153" useFilters="true" version="1"> 

<xPath>id</xPath>
<actions>click</actions>
<parameter1>loginButton_0</parameter1>
<false>false</false>
<checkboxOnError>false</checkboxOnError>
    </Node>


    <Node log="" name="Verify Welcome,Username message is there" next="waitforfewmins~1" quiet="false" think="500-1S" type="lisa.ui.actions.uiNode" uid="9B72BCAF260111E7B01D0CB120524153" useFilters="true" version="1"> 


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


    <Node log="" name="waitforfewmins~1" next="Verify that Warning i sthere" quiet="false" think="500-1S" type="com.itko.lisa.test.UserScriptNode" uid="9B72BCB0260111E7B01D0CB120524153" useFilters="true" version="1"> 


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


    <Node log="" name="Verify that Warning i sthere" next="Get the Warning message" quiet="false" think="500-1S" type="lisa.ui.actions.uiNode" uid="9B72BCB1260111E7B01D0CB120524153" useFilters="true" version="1"> 


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


    <Node log="" name="Get the Warning message" next="Verify Welcome,Username message is there still" quiet="false" think="500-1S" type="lisa.ui.actions.uiNode" uid="9B72BCB2260111E7B01D0CB120524153" useFilters="true" version="1"> 


      <!-- Assertions -->
<CheckResult assertTrue="false" name="Ensure Non-Empty Result" type="com.itko.lisa.test.CheckResultAny">
<log>Assertion name: Ensure Non-Empty Result checks for: false is of type: Any Non-Empty Result.</log>
<then>fail</then>
<valueToAssertKey/>
</CheckResult>

<xPath>xPath</xPath>
<actions>getText</actions>
<parameter1>{{warningmsg}}</parameter1>
<false>false</false>
<checkboxOnError>false</checkboxOnError>
    </Node>


    <Node log="" name="Verify Welcome,Username message is there still" next="Verify Logout option is there" quiet="false" think="500-1S" type="lisa.ui.actions.uiNode" uid="9B72BCB3260111E7B01D0CB120524153" useFilters="true" version="1"> 


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


    <Node log="" name="Verify Logout option is there" next="waitforfewmins" quiet="false" think="500-1S" type="lisa.ui.actions.uiNode" uid="9B72BCB4260111E7B01D0CB120524153" useFilters="true" version="1"> 


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


    <Node log="" name="waitforfewmins" next="Refresh the page" quiet="false" think="500-1S" type="com.itko.lisa.test.UserScriptNode" uid="9B72BCB5260111E7B01D0CB120524153" useFilters="true" version="1"> 


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
<script>Thread.sleep(300000);&#xd;
Thread.sleep(300000);&#xd;
Thread.sleep(300000);&#xd;
Thread.sleep(300000);&#xd;
Thread.sleep(300000);&#xd;
Thread.sleep(300000);&#xd;
Thread.sleep(300000);&#xd;
</script>
    </Node>


    <Node log="" name="Refresh the page" next="Click on Demo~1" quiet="false" think="500-1S" type="lisa.ui.uiMethods.uiMethods" uid="9B72BCB6260111E7B01D0CB120524153" useFilters="true" version="1"> 

<classname>ChangeUrl</classname>
<URL>http://radhika.dtveng.net:8080/components/dfw-login/</URL>
    </Node>


    <Node log="" name="Click on Demo~1" next="Switching the iframe to xpath~1" quiet="false" think="500-1S" type="lisa.ui.actions.uiNode" uid="9B72BCB7260111E7B01D0CB120524153" useFilters="true" version="1"> 

<xPath>xPath</xPath>
<actions>click</actions>
<parameter1>{{Demo}}</parameter1>
<false>false</false>
<checkboxOnError>false</checkboxOnError>
    </Node>


    <Node log="" name="Switching the iframe to xpath~1" next="Verify Guest Option is there~1" quiet="false" think="500-1S" type="lisa.ui.uiMethods.uiMethods" uid="9B72BCB8260111E7B01D0CB120524153" useFilters="true" version="1"> 

<classname>SwitchToFrameByXpath</classname>
<Xpath>//iframe[@class='style-scope iron-component-page']</Xpath>
    </Node>


    <Node log="" name="Verify Guest Option is there~1" next="Verify login option is there" quiet="false" think="500-1S" type="lisa.ui.actions.uiNode" uid="9B72BCB9260111E7B01D0CB120524153" useFilters="true" version="1"> 


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


    <Node log="" name="Verify login option is there" next="end" quiet="false" think="500-1S" type="lisa.ui.actions.uiNode" uid="9B72BCBA260111E7B01D0CB120524153" useFilters="true" version="1"> 


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
<false>false</false>
<checkboxOnError>false</checkboxOnError>
    </Node>


    <Node log="" name="abort" next="" quiet="true" think="0h" type="com.itko.lisa.test.AbortStep" uid="9B72BCBB260111E7B01D0CB120524153" useFilters="true" version="1"> 

    </Node>


    <Node log="" name="fail" next="abort" quiet="true" think="0h" type="com.itko.lisa.test.Abend" uid="9B72BCBC260111E7B01D0CB120524153" useFilters="true" version="1"> 

    </Node>


    <Node log="" name="end" next="fail" quiet="true" think="0h" type="com.itko.lisa.test.NormalEnd" uid="9B72BCBD260111E7B01D0CB120524153" useFilters="true" version="1"> 

    </Node>


</TestCase>