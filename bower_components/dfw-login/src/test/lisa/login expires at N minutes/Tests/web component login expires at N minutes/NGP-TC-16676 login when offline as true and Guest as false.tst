<?xml version="1.0" ?>

<TestCase name="NGP-TC-16676 login when offline as true and Guest as false" version="5">

<meta>
   <create version="9.5.1" buildNumber="9.5.1.6" author="admin" date="04/21/2017" host="CACDTL02RK216W" />
   <lastEdited version="9.5.1" buildNumber="9.5.1.6" author="admin" date="04/21/2017" host="CACDTL02RK216W" />
</meta>

<id>1740E51826E311E7B8B20CB120524153</id>
<Documentation>Put documentation of the Test Case here.</Documentation>
<IsInProject>true</IsInProject>
<sig>ZWQ9NSZ0Y3Y9NSZsaXNhdj05LjUuMSAoOS41LjEuNikmbm9kZXM9LTY5NjkyOTY3MA==</sig>
<subprocess>false</subprocess>

<initState>
</initState>

<resultState>
</resultState>

<deletedProps>
</deletedProps>

    <Node name="Read file config.js" log=""
          type="com.itko.lisa.test.FileNode" 
          version="1" 
          uid="1740E51926E311E7B8B20CB120524153" 
          think="500-1S" 
          useFilters="true" 
          quiet="true" 
          next="Java Script Step" > 


      <!-- Assertions -->
<CheckResult assertTrue="false" name="Ensure Result Equals" type="com.ca.lisa.apptest.json.AssertJSONEquals2">
<log>Assertion name: Ensure Result Equals checks for: false is of type: Ensure Result Equals.</log>
<then>fail</then>
<valueToAssertKey></valueToAssertKey>
        <jsonPath>$.offline</jsonPath>
        <expectedValue>false</expectedValue>
        <ignoreArrayOrder>false</ignoreArrayOrder>
</CheckResult>

<CheckResult assertTrue="false" name="Ensure Result Equals~1" type="com.ca.lisa.apptest.json.AssertJSONEquals2">
<log>Assertion name: Ensure Result Equals~1 checks for: false is of type: Ensure Result Equals.</log>
<then>fail</then>
<valueToAssertKey></valueToAssertKey>
        <jsonPath>$.guest</jsonPath>
        <expectedValue>true</expectedValue>
        <ignoreArrayOrder>false</ignoreArrayOrder>
</CheckResult>

<Loc>{{LISA_RELATIVE_PROJ_ROOT}}/Data/Login Expired At N Minutes/demo/config/config.js</Loc>
<charset>DEFAULT</charset>
<PropKey></PropKey>
<onFail>abort</onFail>
    </Node>


    <Node name="Java Script Step" log=""
          type="com.itko.lisa.test.ScriptNode" 
          version="1" 
          uid="1740E51A26E311E7B8B20CB120524153" 
          think="500-1S" 
          useFilters="true" 
          quiet="false" 
          next="Read file config.js~1" > 


      <!-- Assertions -->
<CheckResult assertTrue="true" name="Any Exception Then Fail" type="com.itko.lisa.dynexec.CheckInvocationEx">
<log>Assertion name: Any Exception Then Fail checks for: true is of type: Assert on Invocation Exception.</log>
<then>fail</then>
<valueToAssertKey></valueToAssertKey>
        <param>.*</param>
</CheckResult>

<onerror>abort</onerror>
<script>import java.io.RandomAccessFile;&#13;&#10;RandomAccessFile raf = new RandomAccessFile(&quot;{{LISA_RELATIVE_PROJ_ROOT}}/Data/Login Expired At N Minutes/demo/config/config.js&quot;, &quot;rw&quot;);&#13;&#10;String line = &quot;&quot;;&#13;&#10;long num = 0;&#13;&#10;while ((line = raf.readLine()) != null) {&#13;&#10;if(line.contains(&quot;\&quot;offline\&quot;&quot;)) {&#13;&#10;      num = raf.getFilePointer();&#13;&#10;         num = num - 21;&#13;&#10;   break;&#13;&#10;      }&#13;&#10;   }                             &#13;&#10;raf.seek(num);&#13;&#10;raf.write(&quot;  \&quot;offline\&quot;:  true&quot;.getBytes());&#13;&#10;String line = &quot;&quot;;&#13;&#10;long num = 0;&#13;&#10;while ((line = raf.readLine()) != null) {&#13;&#10;if(line.contains(&quot;\&quot;guest\&quot;&quot;)) {&#13;&#10;      num = raf.getFilePointer();&#13;&#10;         num = num - 18;&#13;&#10;   break;&#13;&#10;      }&#13;&#10;   }                             &#13;&#10;raf.seek(num);&#13;&#10;raf.write(&quot;  \&quot;guest\&quot;: false&quot;.getBytes());&#13;&#10;raf.close();&#13;&#10;</script>
    </Node>


    <Node name="Read file config.js~1" log=""
          type="com.itko.lisa.test.FileNode" 
          version="1" 
          uid="1740E51B26E311E7B8B20CB120524153" 
          think="500-1S" 
          useFilters="true" 
          quiet="true" 
          next="Open the web component login page" > 


      <!-- Assertions -->
<CheckResult assertTrue="false" name="Ensure Result Equals" type="com.ca.lisa.apptest.json.AssertJSONEquals2">
<log>Assertion name: Ensure Result Equals checks for: false is of type: Ensure Result Equals.</log>
<then>fail</then>
<valueToAssertKey></valueToAssertKey>
        <jsonPath>$.offline</jsonPath>
        <expectedValue>true</expectedValue>
        <ignoreArrayOrder>false</ignoreArrayOrder>
</CheckResult>

<CheckResult assertTrue="false" name="Ensure Result Equals~1" type="com.ca.lisa.apptest.json.AssertJSONEquals2">
<log>Assertion name: Ensure Result Equals~1 checks for: false is of type: Ensure Result Equals.</log>
<then>fail</then>
<valueToAssertKey></valueToAssertKey>
        <jsonPath>$.guest</jsonPath>
        <expectedValue>false</expectedValue>
        <ignoreArrayOrder>false</ignoreArrayOrder>
</CheckResult>

<Loc>{{LISA_RELATIVE_PROJ_ROOT}}/Data/Login Expired At N Minutes/demo/config/config.js</Loc>
<charset>DEFAULT</charset>
<PropKey></PropKey>
<onFail>abort</onFail>
    </Node>


    <Node name="Open the web component login page" log=""
          type="lisa.ui.uiMethods.uiMethods" 
          version="1" 
          uid="1740E51C26E311E7B8B20CB120524153" 
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
          uid="1740E51D26E311E7B8B20CB120524153" 
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
          uid="1740E51E26E311E7B8B20CB120524153" 
          think="500-1S" 
          useFilters="true" 
          quiet="false" 
          next="Verify Offline user is there" > 

<classname>SwitchToFrameByXpath</classname>
<Xpath>//iframe[@class=&apos;style-scope iron-component-page&apos;]</Xpath>
    </Node>


    <Node name="Verify Offline user is there" log=""
          type="lisa.ui.actions.uiNode" 
          version="1" 
          uid="1740E51F26E311E7B8B20CB120524153" 
          think="500-1S" 
          useFilters="true" 
          quiet="false" 
          next="Verify login otion is not there" > 


      <!-- Assertions -->
<CheckResult assertTrue="false" name="Ensure Result Contains String~5" type="com.itko.lisa.test.CheckResultContains">
<log>Assertion name: Ensure Result Contains String~5 checks for: false is of type: Result as String Contains Given String.</log>
<then>fail</then>
<valueToAssertKey></valueToAssertKey>
        <param>Offline User</param>
</CheckResult>

<xPath>xPath</xPath>
<actions>getText</actions>
<parameter1>/html/body/div/demo-snippet/div[1]/div[1]/div/span[2]</parameter1>
<false>false</false>
<checkboxOnError>false</checkboxOnError>
    </Node>


    <Node name="Verify login otion is not there" log=""
          type="lisa.ui.actions.uiNode" 
          version="1" 
          uid="1740E52026E311E7B8B20CB120524153" 
          think="500-1S" 
          useFilters="true" 
          quiet="false" 
          next="Java Script Step~2" > 


      <!-- Assertions -->
<CheckResult assertTrue="false" name="Ensure Result Contains String" type="com.itko.lisa.test.CheckResultContains">
<log>Assertion name: Ensure Result Contains String checks for: false is of type: Result as String Contains Given String.</log>
<then>fail</then>
<valueToAssertKey></valueToAssertKey>
        <param>Logout</param>
</CheckResult>

<xPath>xPath</xPath>
<actions>getText</actions>
<parameter1>/html/body/div/demo-snippet/div[1]/div[1]/div/span[1]/a</parameter1>
<false>false</false>
<checkboxOnError>false</checkboxOnError>
    </Node>


    <Node name="Java Script Step~2" log=""
          type="com.itko.lisa.test.ScriptNode" 
          version="1" 
          uid="6CD6FDFA26E311E7B8B20CB120524153" 
          think="500-1S" 
          useFilters="true" 
          quiet="false" 
          next="Read file config.js~2" > 


      <!-- Assertions -->
<CheckResult assertTrue="true" name="Any Exception Then Fail" type="com.itko.lisa.dynexec.CheckInvocationEx">
<log>Assertion name: Any Exception Then Fail checks for: true is of type: Assert on Invocation Exception.</log>
<then>fail</then>
<valueToAssertKey></valueToAssertKey>
        <param>.*</param>
</CheckResult>

<onerror>abort</onerror>
<script>import java.io.RandomAccessFile;&#13;&#10;RandomAccessFile raf = new RandomAccessFile(&quot;{{LISA_RELATIVE_PROJ_ROOT}}/Data/Login Expired At N Minutes/demo/config/config.js&quot;, &quot;rw&quot;);&#13;&#10;String line = &quot;&quot;;&#13;&#10;long num = 0;&#13;&#10;while ((line = raf.readLine()) != null) {&#13;&#10;if(line.contains(&quot;\&quot;offline\&quot;&quot;)) {&#13;&#10;      num = raf.getFilePointer();&#13;&#10;         num = num - 21;&#13;&#10;   break;&#13;&#10;      }&#13;&#10;   }                             &#13;&#10;raf.seek(num);&#13;&#10;raf.write(&quot;  \&quot;offline\&quot;: false&quot;.getBytes());&#13;&#10;String line = &quot;&quot;;&#13;&#10;long num = 0;&#13;&#10;while ((line = raf.readLine()) != null) {&#13;&#10;if(line.contains(&quot;\&quot;guest\&quot;&quot;)) {&#13;&#10;      num = raf.getFilePointer();&#13;&#10;         num = num - 18;&#13;&#10;   break;&#13;&#10;      }&#13;&#10;   }                             &#13;&#10;raf.seek(num);&#13;&#10;raf.write(&quot;  \&quot;guest\&quot;:  true&quot;.getBytes());&#13;&#10;raf.close();&#13;&#10;</script>
    </Node>


    <Node name="Read file config.js~2" log=""
          type="com.itko.lisa.test.FileNode" 
          version="1" 
          uid="1740E52226E311E7B8B20CB120524153" 
          think="500-1S" 
          useFilters="true" 
          quiet="true" 
          next="end" > 


      <!-- Assertions -->
<CheckResult assertTrue="false" name="Ensure Result Equals" type="com.ca.lisa.apptest.json.AssertJSONEquals2">
<log>Assertion name: Ensure Result Equals checks for: false is of type: Ensure Result Equals.</log>
<then>fail</then>
<valueToAssertKey></valueToAssertKey>
        <jsonPath>$.offline</jsonPath>
        <expectedValue>false</expectedValue>
        <ignoreArrayOrder>false</ignoreArrayOrder>
</CheckResult>

<CheckResult assertTrue="false" name="Ensure Result Equals~1" type="com.ca.lisa.apptest.json.AssertJSONEquals2">
<log>Assertion name: Ensure Result Equals~1 checks for: false is of type: Ensure Result Equals.</log>
<then>fail</then>
<valueToAssertKey></valueToAssertKey>
        <jsonPath>$.guest</jsonPath>
        <expectedValue>true</expectedValue>
        <ignoreArrayOrder>false</ignoreArrayOrder>
</CheckResult>

<Loc>{{LISA_RELATIVE_PROJ_ROOT}}/Data/Login Expired At N Minutes/demo/config/config.js</Loc>
<charset>DEFAULT</charset>
<PropKey></PropKey>
<onFail>abort</onFail>
    </Node>


    <Node name="abort" log=""
          type="com.itko.lisa.test.AbortStep" 
          version="1" 
          uid="1740E52526E311E7B8B20CB120524153" 
          think="0h" 
          useFilters="true" 
          quiet="true" 
          next="" > 

    </Node>


    <Node name="fail" log=""
          type="com.itko.lisa.test.Abend" 
          version="1" 
          uid="1740E52426E311E7B8B20CB120524153" 
          think="0h" 
          useFilters="true" 
          quiet="true" 
          next="abort" > 

    </Node>


    <Node name="end" log=""
          type="com.itko.lisa.test.NormalEnd" 
          version="1" 
          uid="1740E52326E311E7B8B20CB120524153" 
          think="0h" 
          useFilters="true" 
          quiet="true" 
          next="fail" > 

    </Node>


</TestCase>
