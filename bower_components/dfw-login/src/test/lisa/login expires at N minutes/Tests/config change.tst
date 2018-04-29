<?xml version="1.0" ?>

<TestCase name="config change" version="5">

<meta>
   <create version="9.5.1" buildNumber="9.5.1.6" author="admin" date="04/21/2017" host="CACDTL02RK216W" />
   <lastEdited version="9.5.1" buildNumber="9.5.1.6" author="admin" date="04/21/2017" host="CACDTL02RK216W" />
</meta>

<id>BA73D12326C311E7B8B20CB120524153</id>
<Documentation>Put documentation of the Test Case here.</Documentation>
<IsInProject>true</IsInProject>
<sig>ZWQ9NSZ0Y3Y9NSZsaXNhdj05LjUuMSAoOS41LjEuNikmbm9kZXM9LTE3ODAxNzM3MTU=</sig>
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
          uid="F6FBBA8D26C311E7B8B20CB120524153" 
          think="500-1S" 
          useFilters="true" 
          quiet="true" 
          next="Java Script Step~6" > 

<Loc>{{LISA_RELATIVE_PROJ_ROOT}}/Data/Login Expired At N Minutes/demo/config/config.js</Loc>
<charset>DEFAULT</charset>
<PropKey></PropKey>
<onFail>abort</onFail>
    </Node>


    <Node name="Java Script Step~6" log=""
          type="com.itko.lisa.test.ScriptNode" 
          version="1" 
          uid="2B40779326C411E7B8B20CB120524153" 
          think="500-1S" 
          useFilters="true" 
          quiet="false" 
          next="Java Script Step" > 


      <!-- Assertions -->
<CheckResult assertTrue="true" name="Any Exception Then Fail" type="com.itko.lisa.dynexec.CheckInvocationEx">
<log>Assertion name: Any Exception Then Fail checks for: true is of type: Assert on Invocation Exception.</log>
<then>fail</then>
<valueToAssertKey></valueToAssertKey>
        <param>.*</param>
</CheckResult>

<onerror>abort</onerror>
<script>import java.io.RandomAccessFile;&#13;&#10;RandomAccessFile raf = new RandomAccessFile(&quot;{{LISA_RELATIVE_PROJ_ROOT}}/Data/Login Expired At N Minutes/demo/config/config - Copy.js&quot;, &quot;rw&quot;);&#13;&#10;String line = &quot;&quot;;&#13;&#10;long num = 0;&#13;&#10;while ((line = raf.readLine()) != null) {&#13;&#10;if(line.contains(&quot;\&quot;guest\&quot;&quot;)) {&#13;&#10;      num = raf.getFilePointer();&#13;&#10;         num = num - 18;&#13;&#10;   break;&#13;&#10;      }&#13;&#10;   }                             &#13;&#10;raf.seek(num);&#13;&#10;raf.write(&quot;  \&quot;guest\&quot;:  true&quot;.getBytes());&#13;&#10;raf.close();&#13;&#10;</script>
    </Node>


    <Node name="Java Script Step" log=""
          type="com.itko.lisa.test.ScriptNode" 
          version="1" 
          uid="72355F8E26C611E7B8B20CB120524153" 
          think="500-1S" 
          useFilters="true" 
          quiet="false" 
          next="end" > 


      <!-- Assertions -->
<CheckResult assertTrue="true" name="Any Exception Then Fail" type="com.itko.lisa.dynexec.CheckInvocationEx">
<log>Assertion name: Any Exception Then Fail checks for: true is of type: Assert on Invocation Exception.</log>
<then>fail</then>
<valueToAssertKey></valueToAssertKey>
        <param>.*</param>
</CheckResult>

<onerror>abort</onerror>
<script>import java.io.RandomAccessFile;&#13;&#10;RandomAccessFile raf = new RandomAccessFile(&quot;{{LISA_RELATIVE_PROJ_ROOT}}/Data/Login Expired At N Minutes/demo/config/config - Copy.js&quot;, &quot;rw&quot;);&#13;&#10;String line = &quot;&quot;;&#13;&#10;long num = 0;&#13;&#10;while ((line = raf.readLine()) != null) {&#13;&#10;if(line.contains(&quot;\&quot;offline\&quot;&quot;)) {&#13;&#10;      num = raf.getFilePointer();&#13;&#10;         num = num - 21;&#13;&#10;   break;&#13;&#10;      }&#13;&#10;   }                             &#13;&#10;raf.seek(num);&#13;&#10;raf.write(&quot;  \&quot;offline\&quot;:  true&quot;.getBytes());&#13;&#10;raf.close();&#13;&#10;</script>
    </Node>


    <Node name="abort" log=""
          type="com.itko.lisa.test.AbortStep" 
          version="1" 
          uid="BA73D12526C311E7B8B20CB120524153" 
          think="0h" 
          useFilters="true" 
          quiet="true" 
          next="" > 

    </Node>


    <Node name="fail" log=""
          type="com.itko.lisa.test.Abend" 
          version="1" 
          uid="BA73D12726C311E7B8B20CB120524153" 
          think="0h" 
          useFilters="true" 
          quiet="true" 
          next="abort" > 

    </Node>


    <Node name="end" log=""
          type="com.itko.lisa.test.NormalEnd" 
          version="1" 
          uid="BA73D12926C311E7B8B20CB120524153" 
          think="0h" 
          useFilters="true" 
          quiet="true" 
          next="fail" > 

    </Node>


</TestCase>
