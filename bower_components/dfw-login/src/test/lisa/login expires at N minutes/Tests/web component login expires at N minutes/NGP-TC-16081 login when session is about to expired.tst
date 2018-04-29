<?xml version="1.0" ?>

<TestCase name="NGP-TC-16081 login when session is about to expired" version="5">

<meta>
   <create version="9.5.1" buildNumber="9.5.1.6" author="admin" date="04/17/2017" host="CACDTL02RK216W" />
   <lastEdited version="9.5.1" buildNumber="9.5.1.6" author="admin" date="04/20/2017" host="CACDTL02RK216W" />
</meta>

<id>8C9812B8254F11E7BB12BE2520524153</id>
<Documentation>Put documentation of the Test Case here.</Documentation>
<IsInProject>true</IsInProject>
<sig>ZWQ9NSZ0Y3Y9NSZsaXNhdj05LjUuMSAoOS41LjEuNikmbm9kZXM9LTE4MjA3NTIyNzQ=</sig>
<subprocess>false</subprocess>

<initState>
</initState>

<resultState>
</resultState>

<deletedProps>
</deletedProps>

    <Node name="Open the web component login page" log=""
          type="lisa.ui.uiMethods.uiMethods" 
          version="1" 
          uid="8C9812B9254F11E7BB12BE2520524153" 
          think="500-1S" 
          useFilters="true" 
          quiet="false" 
          next="Click on Demo" > 

<classname>GoToUrl</classname>
<BROWSER>firefox</BROWSER>
<URL>http://radhika.dtveng.net:8080/components/dfw-login/</URL>
<OS>windows</OS>
    </Node>


    <Node name="Click on Demo" log=""
          type="lisa.ui.actions.uiNode" 
          version="1" 
          uid="8C9812BA254F11E7BB12BE2520524153" 
          think="500-1S" 
          useFilters="true" 
          quiet="false" 
          next="Switching the iframe to xpath" > 

<xPath>xPath</xPath>
<actions>click</actions>
<parameter1>{{Demo}}</parameter1>
<false>false</false>
<checkboxOnError>false</checkboxOnError>
    </Node>


    <Node name="Switching the iframe to xpath" log=""
          type="lisa.ui.uiMethods.uiMethods" 
          version="1" 
          uid="8C9812BB254F11E7BB12BE2520524153" 
          think="500-1S" 
          useFilters="true" 
          quiet="false" 
          next="Verify Guest Option is there" > 

<classname>SwitchToFrameByXpath</classname>
<Xpath>//iframe[@class=&apos;style-scope iron-component-page&apos;]</Xpath>
    </Node>


    <Node name="Verify Guest Option is there" log=""
          type="lisa.ui.actions.uiNode" 
          version="1" 
          uid="8C9812BC254F11E7BB12BE2520524153" 
          think="500-1S" 
          useFilters="true" 
          quiet="false" 
          next="Click on login on Demo" > 


      <!-- Assertions -->
<CheckResult assertTrue="false" name="Ensure Result Contains String~5" type="com.itko.lisa.test.CheckResultContains">
<log>Assertion name: Ensure Result Contains String~5 checks for: false is of type: Result as String Contains Given String.</log>
<then>fail</then>
<valueToAssertKey></valueToAssertKey>
        <param>Guest</param>
</CheckResult>

<xPath>xPath</xPath>
<actions>getText</actions>
<parameter1>{{Guest}}</parameter1>
<false>false</false>
<checkboxOnError>false</checkboxOnError>
    </Node>


    <Node name="Click on login on Demo" log=""
          type="lisa.ui.actions.uiNode" 
          version="1" 
          uid="8C9812BD254F11E7BB12BE2520524153" 
          think="500-1S" 
          useFilters="true" 
          quiet="false" 
          next="Send the CSP username" > 

<xPath>xPath</xPath>
<actions>click</actions>
<parameter1>{{login}}</parameter1>
<false>false</false>
<checkboxOnError>false</checkboxOnError>
    </Node>


    <Node name="Send the CSP username" log=""
          type="lisa.ui.actions.uiNode" 
          version="1" 
          uid="8C9812BE254F11E7BB12BE2520524153" 
          think="500-1S" 
          useFilters="true" 
          quiet="false" 
          next="Send the CSP password" > 

<xPath>id</xPath>
<actions>sendKeys</actions>
<parameter1>idToken1</parameter1>
<parameter2>{{username}}</parameter2>
<false>false</false>
<checkboxOnError>false</checkboxOnError>
    </Node>


    <Node name="Send the CSP password" log=""
          type="lisa.ui.actions.uiNode" 
          version="1" 
          uid="8C9812BF254F11E7BB12BE2520524153" 
          think="500-1S" 
          useFilters="true" 
          quiet="false" 
          next="Click on Login on CSP Page" > 

<xPath>id</xPath>
<actions>sendKeys</actions>
<parameter1>idToken2</parameter1>
<parameter2>123123a</parameter2>
<false>false</false>
<checkboxOnError>false</checkboxOnError>
    </Node>


    <Node name="Click on Login on CSP Page" log=""
          type="lisa.ui.actions.uiNode" 
          version="1" 
          uid="8C9812C0254F11E7BB12BE2520524153" 
          think="500-1S" 
          useFilters="true" 
          quiet="false" 
          next="Verify Welcome,Username message is there" > 

<xPath>id</xPath>
<actions>click</actions>
<parameter1>loginButton_0</parameter1>
<false>false</false>
<checkboxOnError>false</checkboxOnError>
    </Node>


    <Node name="Verify Welcome,Username message is there" log=""
          type="lisa.ui.actions.uiNode" 
          version="1" 
          uid="8C9812C1254F11E7BB12BE2520524153" 
          think="500-1S" 
          useFilters="true" 
          quiet="false" 
          next="waitforfewmins~1" > 


      <!-- Assertions -->
<CheckResult assertTrue="false" name="Ensure Result Contains String" type="com.itko.lisa.test.CheckResultContains">
<log>Assertion name: Ensure Result Contains String checks for: false is of type: Result as String Contains Given String.</log>
<then>fail</then>
<valueToAssertKey></valueToAssertKey>
        <param>{{username}}</param>
</CheckResult>

<xPath>xPath</xPath>
<actions>getText</actions>
<parameter1>{{usernameonloginpage}}</parameter1>
<false>false</false>
<checkboxOnError>false</checkboxOnError>
    </Node>


    <Node name="waitforfewmins~1" log=""
          type="com.itko.lisa.test.UserScriptNode" 
          version="1" 
          uid="8C9812C2254F11E7BB12BE2520524153" 
          think="500-1S" 
          useFilters="true" 
          quiet="false" 
          next="Verify that Warning i sthere" > 


      <!-- Assertions -->
<CheckResult assertTrue="true" name="Any Exception Then Fail" type="com.itko.lisa.dynexec.CheckInvocationEx">
<log>Assertion name: Any Exception Then Fail checks for: true is of type: Assert on Invocation Exception.</log>
<then>fail</then>
<valueToAssertKey></valueToAssertKey>
        <param>.*</param>
</CheckResult>

<onerror>abort</onerror>
<language>BeanShell</language>
<copyProps>TestExecProps</copyProps>
<script>Thread.sleep(360000);</script>
    </Node>


    <Node name="Verify that Warning i sthere" log=""
          type="lisa.ui.actions.uiNode" 
          version="1" 
          uid="8C9812C3254F11E7BB12BE2520524153" 
          think="500-1S" 
          useFilters="true" 
          quiet="false" 
          next="Get the Warning message" > 


      <!-- Assertions -->
<CheckResult assertTrue="false" name="Ensure Result Contains String~6" type="com.itko.lisa.test.CheckResultContains">
<log>Assertion name: Ensure Result Contains String~6 checks for: false is of type: Result as String Contains Given String.</log>
<then>fail</then>
<valueToAssertKey></valueToAssertKey>
        <param>true</param>
</CheckResult>

<xPath>id</xPath>
<actions>isElementVisible</actions>
<parameter1>plainDialog</parameter1>
<false>false</false>
<checkboxOnError>false</checkboxOnError>
    </Node>


    <Node name="Get the Warning message" log=""
          type="lisa.ui.actions.uiNode" 
          version="1" 
          uid="8C9812C4254F11E7BB12BE2520524153" 
          think="500-1S" 
          useFilters="true" 
          quiet="false" 
          next="Cancel the warning" > 


      <!-- Assertions -->
<CheckResult assertTrue="false" name="Ensure Non-Empty Result" type="com.itko.lisa.test.CheckResultAny">
<log>Assertion name: Ensure Non-Empty Result checks for: false is of type: Any Non-Empty Result.</log>
<then>fail</then>
<valueToAssertKey></valueToAssertKey>
</CheckResult>

<xPath>xPath</xPath>
<actions>getText</actions>
<parameter1>{{warningmsg}}</parameter1>
<false>false</false>
<checkboxOnError>false</checkboxOnError>
    </Node>


    <Node name="Cancel the warning" log=""
          type="lisa.ui.actions.uiNode" 
          version="1" 
          uid="8C9812C5254F11E7BB12BE2520524153" 
          think="500-1S" 
          useFilters="true" 
          quiet="false" 
          next="Verify Welcome,Username message is there~1" > 

<xPath>xPath</xPath>
<actions>click</actions>
<parameter1>{{warningclick}}</parameter1>
<false>false</false>
<checkboxOnError>false</checkboxOnError>
    </Node>


    <Node name="Verify Welcome,Username message is there~1" log=""
          type="lisa.ui.actions.uiNode" 
          version="1" 
          uid="7BEE1B725F311E7B01D0CB120524153" 
          think="500-1S" 
          useFilters="true" 
          quiet="false" 
          next="Verify Logout option is there" > 


      <!-- Assertions -->
<CheckResult assertTrue="false" name="Ensure Result Contains String" type="com.itko.lisa.test.CheckResultContains">
<log>Assertion name: Ensure Result Contains String checks for: false is of type: Result as String Contains Given String.</log>
<then>fail</then>
<valueToAssertKey></valueToAssertKey>
        <param>{{username}}</param>
</CheckResult>

<xPath>xPath</xPath>
<actions>getText</actions>
<parameter1>{{usernameonloginpage}}</parameter1>
<false>false</false>
<checkboxOnError>false</checkboxOnError>
    </Node>


    <Node name="Verify Logout option is there" log=""
          type="lisa.ui.actions.uiNode" 
          version="1" 
          uid="10CADB6A25F311E7B01D0CB120524153" 
          think="500-1S" 
          useFilters="true" 
          quiet="false" 
          next="end" > 


      <!-- Assertions -->
<CheckResult assertTrue="false" name="Ensure Result Contains String~9" type="com.itko.lisa.test.CheckResultContains">
<log>Assertion name: Ensure Result Contains String~9 checks for: false is of type: Result as String Contains Given String.</log>
<then>fail</then>
<valueToAssertKey></valueToAssertKey>
        <param>Logout</param>
</CheckResult>

<xPath>xPath</xPath>
<actions>getText</actions>
<parameter1>{{logoutondemo}}</parameter1>
<false>false</false>
<checkboxOnError>false</checkboxOnError>
    </Node>


    <Node name="end" log=""
          type="com.itko.lisa.test.NormalEnd" 
          version="1" 
          uid="8C9812CC254F11E7BB12BE2520524153" 
          think="0h" 
          useFilters="true" 
          quiet="true" 
          next="fail" > 

    </Node>


    <Node name="fail" log=""
          type="com.itko.lisa.test.Abend" 
          version="1" 
          uid="8C9812CB254F11E7BB12BE2520524153" 
          think="0h" 
          useFilters="true" 
          quiet="true" 
          next="abort" > 

    </Node>


    <Node name="abort" log=""
          type="com.itko.lisa.test.AbortStep" 
          version="1" 
          uid="8C9812CA254F11E7BB12BE2520524153" 
          think="0h" 
          useFilters="true" 
          quiet="true" 
          next="" > 

    </Node>


</TestCase>
