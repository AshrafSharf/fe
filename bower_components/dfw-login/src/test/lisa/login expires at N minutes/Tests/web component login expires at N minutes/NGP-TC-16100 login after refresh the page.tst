<?xml version="1.0" ?>

<TestCase name="NGP-TC-16100 login after refresh the page" version="5">

<meta>
   <create version="9.5.1" buildNumber="9.5.1.6" author="admin" date="04/17/2017" host="CACDTL02RK216W" />
   <lastEdited version="9.5.1" buildNumber="9.5.1.6" author="admin" date="04/20/2017" host="CACDTL02RK216W" />
</meta>

<id>9143C093254F11E7BB12BE2520524153</id>
<Documentation>Put documentation of the Test Case here.</Documentation>
<IsInProject>true</IsInProject>
<sig>ZWQ9NSZ0Y3Y9NSZsaXNhdj05LjUuMSAoOS41LjEuNikmbm9kZXM9MTg4MTY1MjQzNQ==</sig>
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
          uid="9143C094254F11E7BB12BE2520524153" 
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
          uid="9143C095254F11E7BB12BE2520524153" 
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
          uid="9143C096254F11E7BB12BE2520524153" 
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
          uid="9143C097254F11E7BB12BE2520524153" 
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
          uid="9143C098254F11E7BB12BE2520524153" 
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
          uid="9143C099254F11E7BB12BE2520524153" 
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
          uid="9143C09A254F11E7BB12BE2520524153" 
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
          uid="9143C09B254F11E7BB12BE2520524153" 
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
          uid="9143C09C254F11E7BB12BE2520524153" 
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
          uid="9143C09D254F11E7BB12BE2520524153" 
          think="500-1S" 
          useFilters="true" 
          quiet="false" 
          next="Verify Warning i sthere" > 


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


    <Node name="Verify Warning i sthere" log=""
          type="lisa.ui.actions.uiNode" 
          version="1" 
          uid="9143C09E254F11E7BB12BE2520524153" 
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
          uid="9143C09F254F11E7BB12BE2520524153" 
          think="500-1S" 
          useFilters="true" 
          quiet="false" 
          next="Verify Welcome,Username message is there still" > 


      <!-- Assertions -->
<CheckResult assertTrue="false" name="Ensure Result Contains String~8" type="com.itko.lisa.test.CheckResultContains">
<log>Assertion name: Ensure Result Contains String~8 checks for: false is of type: Result as String Contains Given String.</log>
<then>fail</then>
<valueToAssertKey></valueToAssertKey>
        <param>Session timeout in</param>
</CheckResult>

<xPath>xPath</xPath>
<actions>getText</actions>
<parameter1>{{warningmsg}}</parameter1>
<false>false</false>
<checkboxOnError>false</checkboxOnError>
    </Node>


    <Node name="Verify Welcome,Username message is there still" log=""
          type="lisa.ui.actions.uiNode" 
          version="1" 
          uid="9143C0A0254F11E7BB12BE2520524153" 
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
          uid="9143C0A1254F11E7BB12BE2520524153" 
          think="500-1S" 
          useFilters="true" 
          quiet="false" 
          next="Refresh the page" > 


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


    <Node name="Refresh the page" log=""
          type="lisa.ui.uiMethods.uiMethods" 
          version="1" 
          uid="9143C0A2254F11E7BB12BE2520524153" 
          think="500-1S" 
          useFilters="true" 
          quiet="false" 
          next="Click on Demo~1" > 

<classname>ChangeUrl</classname>
<URL>http://radhika.dtveng.net:8080/components/dfw-login/</URL>
    </Node>


    <Node name="Click on Demo~1" log=""
          type="lisa.ui.actions.uiNode" 
          version="1" 
          uid="9143C0A3254F11E7BB12BE2520524153" 
          think="500-1S" 
          useFilters="true" 
          quiet="false" 
          next="Switching the iframe to xpath~1" > 

<xPath>xPath</xPath>
<actions>click</actions>
<parameter1>{{Demo}}</parameter1>
<false>false</false>
<checkboxOnError>false</checkboxOnError>
    </Node>


    <Node name="Switching the iframe to xpath~1" log=""
          type="lisa.ui.uiMethods.uiMethods" 
          version="1" 
          uid="9143C0A4254F11E7BB12BE2520524153" 
          think="500-1S" 
          useFilters="true" 
          quiet="false" 
          next="Verify Warning will come immediately" > 

<classname>SwitchToFrameByXpath</classname>
<Xpath>//iframe[@class=&apos;style-scope iron-component-page&apos;]</Xpath>
    </Node>


    <Node name="Verify Warning will come immediately" log=""
          type="lisa.ui.actions.uiNode" 
          version="1" 
          uid="9143C0A5254F11E7BB12BE2520524153" 
          think="500-1S" 
          useFilters="true" 
          quiet="false" 
          next="Get the Warning message~1" > 


      <!-- Assertions -->
<CheckResult assertTrue="false" name="Ensure Result Contains String~7" type="com.itko.lisa.test.CheckResultContains">
<log>Assertion name: Ensure Result Contains String~7 checks for: false is of type: Result as String Contains Given String.</log>
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


    <Node name="Get the Warning message~1" log=""
          type="lisa.ui.actions.uiNode" 
          version="1" 
          uid="9143C0A6254F11E7BB12BE2520524153" 
          think="500-1S" 
          useFilters="true" 
          quiet="false" 
          next="Verify Welcome,Username message is there still~1" > 


      <!-- Assertions -->
<CheckResult assertTrue="false" name="Ensure Result Contains String~8" type="com.itko.lisa.test.CheckResultContains">
<log>Assertion name: Ensure Result Contains String~8 checks for: false is of type: Result as String Contains Given String.</log>
<then>fail</then>
<valueToAssertKey></valueToAssertKey>
        <param>Session timeout in</param>
</CheckResult>

<xPath>xPath</xPath>
<actions>getText</actions>
<parameter1>{{warningmsg}}</parameter1>
<false>false</false>
<checkboxOnError>false</checkboxOnError>
    </Node>


    <Node name="Verify Welcome,Username message is there still~1" log=""
          type="lisa.ui.actions.uiNode" 
          version="1" 
          uid="9143C0A7254F11E7BB12BE2520524153" 
          think="500-1S" 
          useFilters="true" 
          quiet="false" 
          next="Verify Logout option is there~1" > 


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


    <Node name="Verify Logout option is there~1" log=""
          type="lisa.ui.actions.uiNode" 
          version="1" 
          uid="9143C0A8254F11E7BB12BE2520524153" 
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
          uid="9143C0AB254F11E7BB12BE2520524153" 
          think="0h" 
          useFilters="true" 
          quiet="true" 
          next="fail" > 

    </Node>


    <Node name="fail" log=""
          type="com.itko.lisa.test.Abend" 
          version="1" 
          uid="9143C0AA254F11E7BB12BE2520524153" 
          think="0h" 
          useFilters="true" 
          quiet="true" 
          next="abort" > 

    </Node>


    <Node name="abort" log=""
          type="com.itko.lisa.test.AbortStep" 
          version="1" 
          uid="9143C0A9254F11E7BB12BE2520524153" 
          think="0h" 
          useFilters="true" 
          quiet="true" 
          next="" > 

    </Node>


</TestCase>
