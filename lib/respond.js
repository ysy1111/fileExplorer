


// require node modules
const url=require("url");
const path=require("path");
const fs = require("fs");

//file imports
const buildBreadcrumb = require('./breadcrumb.js');
const buildMainContent = require('./mainContent.js');
const getMimeType = require('./getMimeType.js');


//static base bath: location of your static folder
const staticBasePath = path.join(__dirname,'..','static');
// console.log(path.join(__dirname,'..','static'));


// respond to a request
// Following is function passed to createServer used to create the server
let count = 0;
const respond = (request, response) => {

    let pathname = url.parse(request.url).pathname;
    // console.log(pathname);
    // if favicon.ico stop
    if (pathname === '/favicon.ico'){
        return false;
    }
    // before working with the pathname, you need to decode it
    // decodeURIComponent change the url into a readable format
    // e.g. %20 => space
    pathname = decodeURIComponent(pathname);
    // get the corresponding full static path located in the static folder
    const fullStaticPath = path.join(staticBasePath,pathname);
    // console.log(fullStaticPath);
    // Can we find something in fullStaticPath?
        // no: send '404: File Not Found!'
    if (!fs.existsSync(fullStaticPath)){
        response.write(`404: File Not Found`);
        response.end()
        return false
    }



    //We found something
    // is it a file or directory?
    let stats;
    try{    
        stats = fs.lstatSync(fullStaticPath);

    }catch(err){
        console.log(`lstatSync error: ${err}`)
    }

    //It is a directory:
    if (stats.isDirectory()){
        // get content from the template server.html
        let data = fs.readFileSync(path.join(staticBasePath,'project_files/index.html'),'utf-8');
        // build the page title
        let pathElement = pathname.split('/').reverse();
        pathElement = pathElement.filter(x => x!='');
        let folderName = pathElement[0];
        if (folderName===undefined){
            folderName = 'Home';
        }
        // console.log(pathElement[0]);
        // console.log(data);
        
        
        // build breadcrumb
        const breadcrumb = buildBreadcrumb(pathElement);
        
        // build table rows (main_content)
        const mainContent = buildMainContent(fullStaticPath,pathname);

        // fill the template data with: the page title, breadcrumb and table rows (main_content)
        data = data.replace('page_title',folderName);
        data = data.replace('pathname',breadcrumb);
        data = data.replace('mainContent',mainContent);
        // print data to  the webpage
        response.statusCode = 200;
        response.write(data);
        return response.end();

    }
    // It is not a directory but not a file either
    // send: 401: Access denied!
    if (!stats.isFile()){
        response.statusCode = 401;
        response.write('401: Access denied!');
        console.log('not a file!');
        return response.end();
    }

    // It is a file
    // Let's get the file extension
    let fileDetails = {};
    fileDetails.extname = path.extname(fullStaticPath);
    console.log(fileDetails.extname);
    // get the file size and add it to the response header
    let stat;
    try{
        stat = fs.statSync(fullStaticPath);
    }catch(err){
        console.log(`err: ${err}`);
    }
    fileDetails.size = stat.size;
    // get the file mime type and add it to the response header
    getMimeType(fileDetails.extname)
    .then(mime => {
        //store headers here
        let head = {};
        let options = {};

        // response status code
        let statusCode = 200;

        // set "Content-Type" for all file types
        head['Content-Type'] = mime;

        

        
        // pdf files? -> display in browser
        if(fileDetails.extname ==='.pdf'){
            head['Content-Disposition'] = 'inline';
            // head['Content-Disposition'] = 'attachment;filename=file.pdf';
        }
        // audio/video file? -> stream in ranges
        if(RegExp('audio').test(mime) || RegExp('video').test(mime)){
            head['Accept-Ranges'] = 'bytes';

            const range = request.headers.range;
            if(range){
                //bytes = 5210112 - end
                const start_end = range.replace(/bytes=/,"").split('-');
                const start = parseInt(start_end[0]);
                const end = start_end[1] ? parseInt(start_end[1]) : fileDetails.size - 1;

                //headers
                //Content-Range
                head['Content-Range'] = `bytes ${start}-${end}/${fileDetails.size}`;
                //Content-Length
                head['Content-Length'] = end - start + 1;
                statusCode = 206;

                //options
                options = {start,end};
            }
            
        }
        //all other files stream in a normal way
        const fileStream = fs.createReadStream(fullStaticPath,options);

        // stream chunks to your response object
        response.writeHead(statusCode,head);
        fileStream.pipe(response);

        //events: close and error
        fileStream.on('close', () => {
            return response.end();
        });
        fileStream.on('error', error => {
            console.log(error.code);
            response.statusCode = 404;
            response.write('404: FileStream error! ');
            return response.end();
        });
    })
    .catch(err => {
        response.statusCode = 500;
        response.write('500: Internal server error!');
        console.log(`Promise error: ${err}`);
        return response.end()
    })




}

module.exports = respond;