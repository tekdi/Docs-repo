**Docusaurus Installation and website hosting in Netlify**

**Requirements:**  Node.js version 16.14 or above. You can use nvm for managing multiple Node versions on a single machine installed.

**Installation:**

The easiest way to install Docusaurus is to use the command line tool that helps you scaffold a skeleton Docusaurus website. You can run this command anywhere in a new empty repository or within an existing repository, it will create a new directory containing the scaffolded files.

```
$ npx create-docusaurus@latest (yourwebsite name) classic
```

**Process to follow:**
To start the Docusaurus we have to run below command

```
$ npm run start
```

Once you run the command in a blank directory you will get some source files which can be editable. To access and to do the changes in these files you can use Visual code studio.
Then we have to create a git repository to push these codes. With the use of the terminal we can create git init and push this code to github.

**Build:**
Docusaurus is a modern static website generator so we need to build the website into a directory of static contents and put it on a web server so that it can be viewed. To build the website:

```
$ npm run build
```



**SITE HOSTING BY NETLIFY**

Hosting a website on Netlify is very easy.

Create an account in netlify using github account.

Once an account is created then authenticate the github repository from where we will pull the code to host the site.

Follow the instructions of hosting. Once a site gets hosted we will get one domain name which we can change as per our convenience.

You need to update this domain name in your `docusaurus.config.js` file and do the commit and push the code to the git repository.

Now you can have the access of website with the given domain name.
 

