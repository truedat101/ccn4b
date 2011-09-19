## Overview
The browser is arguably the single most important platform for software development today, boasting support of strong standards for development (HTML5/Javascript/CSS3) and an equally vast ecosystem of developer communities supporting application development targeting the web (Java, PHP, Ruby). The browser now supports all screens, including TV Settop box, Mobile, Tablet, Desktop, and Laptop. This project offers a browser-based adaptation of the CCN protocol for the browser.

## What is CCN4B.js

This is a placeholder project.  It will eventually contain the complete collection of CCN4B related libraries as a single project.  Current work on CCN4B.js is going on in different repositories.  See information below.

The CCN4B.js project is an open source project which is a proof of concept. Short for Content Centric Networking for Browsers, CCN4B is a small CCNx client API written in Javascript (JS), that utilizes the evented model of development of JS. APIs are written to be asynchronous. Web application developers can choose to deploy this API in the client side of the web application (in script tag), or on the server-side of the web application, as a module import for a Server-Side Javascript platform called Node.js. The balance between client side and server side processing will be explored as well, as the decision can about where to handle the workload of communication to web services can be distributed between client and server side with equal ease. The approach does not require a special plugin to the browser or underlying native layer implemented beyond solid browser implementation of web standards. Likewise, the cost/benet of using Javascript as a client API vs. existing alternatives will be mentioned. Further discussion of future concept work, such as adding CCNx Protocol as a transport layer into Socket.io will be briely mentioned.

## Organization

CCN4B.js is to be organized similar to an umbrella JSR, such that it contains references to various components that must be delivered as part of the project to implement the design requirements.  It is expected CCN4B.js will be deployed as a Node.js module.  This module will refernce all of the dependencies needed to deliver a complete solution.  

## Code 

* https://github.com/truedat101/ccn4bnode
* https://github.com/truedat101/ccn4bname.js

## Building

TODO

## Running

TODO

## Interesting Use Cases

TODO

## Attributions

The great work of the Project CCNx team: https://github.com/ProjectCCNx/ccnx
