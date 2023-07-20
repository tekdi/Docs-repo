"use strict";(self.webpackChunkmy_site=self.webpackChunkmy_site||[]).push([[1430],{3905:(e,t,A)=>{A.d(t,{Zo:()=>p,kt:()=>d});var a=A(7294);function n(e,t,A){return t in e?Object.defineProperty(e,t,{value:A,enumerable:!0,configurable:!0,writable:!0}):e[t]=A,e}function r(e,t){var A=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),A.push.apply(A,a)}return A}function o(e){for(var t=1;t<arguments.length;t++){var A=null!=arguments[t]?arguments[t]:{};t%2?r(Object(A),!0).forEach((function(t){n(e,t,A[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(A)):r(Object(A)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(A,t))}))}return e}function l(e,t){if(null==e)return{};var A,a,n=function(e,t){if(null==e)return{};var A,a,n={},r=Object.keys(e);for(a=0;a<r.length;a++)A=r[a],t.indexOf(A)>=0||(n[A]=e[A]);return n}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)A=r[a],t.indexOf(A)>=0||Object.prototype.propertyIsEnumerable.call(e,A)&&(n[A]=e[A])}return n}var s=a.createContext({}),i=function(e){var t=a.useContext(s),A=t;return e&&(A="function"==typeof e?e(t):o(o({},t),e)),A},p=function(e){var t=i(e.components);return a.createElement(s.Provider,{value:t},e.children)},u="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},m=a.forwardRef((function(e,t){var A=e.components,n=e.mdxType,r=e.originalType,s=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),u=i(A),m=n,d=u["".concat(s,".").concat(m)]||u[m]||c[m]||r;return A?a.createElement(d,o(o({ref:t},p),{},{components:A})):a.createElement(d,o({ref:t},p))}));function d(e,t){var A=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var r=A.length,o=new Array(r);o[0]=m;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l[u]="string"==typeof e?e:n,o[1]=l;for(var i=2;i<r;i++)o[i]=A[i];return a.createElement.apply(null,o)}return a.createElement.apply(null,A)}m.displayName="MDXCreateElement"},9052:(e,t,A)=>{A.r(t),A.d(t,{assets:()=>s,contentTitle:()=>o,default:()=>c,frontMatter:()=>r,metadata:()=>l,toc:()=>i});var a=A(7462),n=(A(7294),A(3905));const r={},o=void 0,l={unversionedId:"Learning/MetaBase",id:"Learning/MetaBase",title:"MetaBase",description:"Metabase is an open-source business intelligence platform. You can use Metabase to ask questions about your data, or embed Metabase in your app to let your customers explore their data on their own.",source:"@site/docs/Learning/MetaBase.md",sourceDirName:"Learning",slug:"/Learning/MetaBase",permalink:"/docs/Learning/MetaBase",draft:!1,tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"Graylog Installation with docker-compose file",permalink:"/docs/Learning/Graylog with Docker compose"},next:{title:"Monitore Storage in AWS EC2",permalink:"/docs/Learning/Monitor storage in AWS EC2"}},s={},i=[],p={toc:i},u="wrapper";function c(e){let{components:t,...r}=e;return(0,n.kt)(u,(0,a.Z)({},p,r,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("p",null,"Metabase is an open-source business intelligence platform. You can use Metabase to ask questions about your data, or embed Metabase in your app to let your customers explore their data on their own."),(0,n.kt)("h1",{id:"metabase-setup-installation-guide"},"Metabase setup installation guide"),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},"Running Metabase on Docker")),(0,n.kt)("p",null,"To run the matabase on docker you must have docker installed."),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"https://docs.docker.com/engine/install/ubuntu/"},"https://docs.docker.com/engine/install/ubuntu/")),(0,n.kt)("p",null,"Metabase provides an official Docker image via Dockerhub that can be used for deployments on any system that is running Docker."),(0,n.kt)("p",null,"Visit this link:\n",(0,n.kt)("a",{parentName:"p",href:"https://www.metabase.com/docs/latest/installation-and-operation/running-metabase-on-docker"},"https://www.metabase.com/docs/latest/installation-and-operation/running-metabase-on-docker")),(0,n.kt)("p",null,"Assuming you have Docker installed and running, get the latest Docker image:"),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre"},"docker pull metabase/metabase:latest\n")),(0,n.kt)("p",null,"Then start the Metabase container:"),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre"},"docker run -d -p 3000:3000 --name metabase metabase/metabase\n")),(0,n.kt)("p",null,"This will launch an Metabase server on port 3000 by default."),(0,n.kt)("p",null,"Once startup completes, you can access your Open Source Metabase at http://localhost:3000."),(0,n.kt)("p",null,"You can create the service using docker comspose file. Just create ",(0,n.kt)("inlineCode",{parentName:"p"},"docker-compose.yml")," file and paste below script"),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre"},"version: '3'\nservices:\n  metabase:\n    image: metabase/metabase\n    ports:\n      - \"3006:3000\"\n")),(0,n.kt)("p",null,"Create your admin account"),(0,n.kt)("p",null,"Connect to database by selecting ",(0,n.kt)("inlineCode",{parentName:"p"},"ADD DATABASE")),(0,n.kt)("p",null,"Select database type, host, port, db name, username, password, schemas."),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},"Answer the questions"),":"),(0,n.kt)("p",null,"What is your preferred language : English"),(0,n.kt)("p",null,"Then you will get the following table. In that you will have to accurate details as Name, Last name, Email-ID, Company name, Password Etc."),(0,n.kt)("p",null,(0,n.kt)("img",{alt:"mb_img",src:A(6514).Z,width:"716",height:"682"})),(0,n.kt)("p",null,"Then add Database in it."),(0,n.kt)("p",null,"If you want to add PostgresDB then directly select it from option or if you want to add another database like clickhouse then select ",(0,n.kt)("inlineCode",{parentName:"p"},"I\u2019ll add my data late"),"\n",(0,n.kt)("img",{alt:"mb_img",src:A(8034).Z,width:"725",height:"945"})),(0,n.kt)("p",null,"After selecting required database (here I have selected PostgresDB) Then add details of database in the next step in which you have to add "),(0,n.kt)("p",null,"Display name ",(0,n.kt)("strong",{parentName:"p"},"PostgresDB")),(0,n.kt)("p",null,"Hostname ",(0,n.kt)("a",{parentName:"p",href:"http://127.0.0.1"},"http://127.0.0.1")),(0,n.kt)("p",null,"Port (Port of DB) ex. 8432"),(0,n.kt)("p",null,"Database Name (ex.Postgres)"),(0,n.kt)("p",null,"Password of DB (ex.AS@#779LSJ!gh)\nThen save and add DB"),(0,n.kt)("p",null,(0,n.kt)("img",{alt:"mb_img",src:A(7711).Z,width:"715",height:"979"})),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},"Creating Dashboards"),": "),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"Step 1")," :\nHome > New > SQL Query"),(0,n.kt)("p",null,(0,n.kt)("img",{alt:"mb_img",src:A(7121).Z,width:"546",height:"359"})),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"Step 2")," :\nAdd Database (postgres_DB) and run a query in the box after that click on play button in the right bottom corner "),(0,n.kt)("p",null,(0,n.kt)("img",{alt:"mb_img",src:A(4291).Z,width:"1835",height:"432"})),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"Step 3")," :\nIn the left Bottom click on Visualization and select a visual (here i have selected gauges)\nAnd click on Done "),(0,n.kt)("p",null,(0,n.kt)("img",{alt:"mb_img",src:A(9489).Z,width:"1843",height:"976"})),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"Step 4")," :\nClick on right top corner Save button\nAfter that you will find out the following window in which you have to add Name of the query and Save"),(0,n.kt)("p",null,(0,n.kt)("img",{alt:"mb_img",src:A(5830).Z,width:"663",height:"519"})),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"Step 5")," :\nClick on Yes!please to add this on Dashboard and choose a Dashboard if exist or add new Dashboards\n(here selected ULP_DEV)"),(0,n.kt)("p",null,(0,n.kt)("img",{alt:"mb_img",src:A(582).Z,width:"527",height:"217"})),(0,n.kt)("p",null,(0,n.kt)("img",{alt:"mb_img",src:A(5437).Z,width:"659",height:"347"})),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"Step 6")," :\nAfter that add multiple queries and add to same Dashboards then final Dashboard will be of following type"),(0,n.kt)("p",null,(0,n.kt)("img",{alt:"mb_img",src:A(7406).Z,width:"1920",height:"1080"})))}c.isMDXComponent=!0},6514:(e,t,A)=>{A.d(t,{Z:()=>a});const a=A.p+"assets/images/image1-f205bda1046fa1383cf48e125ad94e52.png"},7406:(e,t,A)=>{A.d(t,{Z:()=>a});const a=A.p+"assets/images/image10-1e497c4c468231105ee06cb8f8c5c750.png"},8034:(e,t,A)=>{A.d(t,{Z:()=>a});const a=A.p+"assets/images/image2-cce4df8d5e6de4a386aa519718194115.png"},7711:(e,t,A)=>{A.d(t,{Z:()=>a});const a=A.p+"assets/images/image3-07f4c52e638be1c34b033b13e3645812.png"},7121:(e,t,A)=>{A.d(t,{Z:()=>a});const a=A.p+"assets/images/image4-43b8b8a57d2fe45ba91abb40b537b4aa.png"},4291:(e,t,A)=>{A.d(t,{Z:()=>a});const a=A.p+"assets/images/image5-b61f3c72d53532f78effffae51ec742c.png"},9489:(e,t,A)=>{A.d(t,{Z:()=>a});const a=A.p+"assets/images/image6-d07c82ad4b4a9a4177eda5178d6f9034.png"},5830:(e,t,A)=>{A.d(t,{Z:()=>a});const a=A.p+"assets/images/image7-c4c78670ff80ac0b91c5c12164dd554f.png"},582:(e,t,A)=>{A.d(t,{Z:()=>a});const a="data:image/png;base64,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"},5437:(e,t,A)=>{A.d(t,{Z:()=>a});const a=A.p+"assets/images/image9-5f75aaab02a8cd0667db43a625357b22.png"}}]);