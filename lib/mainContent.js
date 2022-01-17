//import node module
const fs = require("fs");
const path = require("path");
//import files
const calculateSizeD = require('./calculateSizeD.js');
const calculateSizeF = require('./calculateSizeF.js');


const buildMainContent = (fullStaticPath,pathname) => {
    let mainContent = '';
    // loop through the elements inside the folder
    let items;
    try{
        items = fs.readdirSync(fullStaticPath);
        // console.log(items);
    }catch(err){
        console.log(`readdirSync error: ${err}`);
        return `<div class="alert alert-danger">Internal Server Error</div>`;
    }
    //remove .DS_Store
    items = items.filter(element => element !== '.DS_Store');

    // Home directory, remove project_files
    if(pathname === '/'){
        items = items.filter(element => element !== 'project_files');
    }

    items.forEach(item => {
        let itemDetails = {};
        //name
        itemDetails.name = item

        //link
        const link = path.join(pathname, itemDetails.name);

        //size

        //icon
        const itemFullStaticPath = path.join(fullStaticPath,itemDetails.name);
        try{
            itemDetails.stats = fs.statSync(itemFullStaticPath);
            // console.log(itemDetails.stats);
        }catch(err){
            console.log(`statSync error: ${err}`);
            mainContent = `<div class="alert alert-danger">Internal Server Error</div>`;
            return false;
        }
        

        if (itemDetails.stats.isDirectory()){
            itemDetails.icon = '<ion-icon name="folder"></ion-icon>';

            [itemDetails.size, itemDetails.sizeBytes] = calculateSizeD(itemFullStaticPath);
        }else if (itemDetails.stats.isFile()){
            itemDetails.icon = '<ion-icon name="document"></ion-icon>';

            [itemDetails.size, itemDetails.sizeBytes] = calculateSizeF(itemDetails.stats);
        }
        // last modified: when was the file last change? (unix timestamp)
        itemDetails.timeStamp = parseInt(itemDetails.stats.mtimeMs);
        
        //convert timestamp to a data
        itemDetails.date = new Date(itemDetails.timeStamp);
        itemDetails.date = itemDetails.date.toLocaleString();

        // console.log(itemDetails.date)



        //update mainContent
        mainContent += `
    <tr data-name="${itemDetails.name}" data-size="${itemDetails.sizeBytes}" data-time="${itemDetails.timeStamp}">
        <td>${itemDetails.icon}<a href="${link}" target='${itemDetails.stats.isFile()?"_blank":""}'>${itemDetails.name}</a></td>
        <td>${itemDetails.size}</td>
        <td>${itemDetails.date}</td>
    </tr>
    `
    })

    return mainContent;
}

module.exports = buildMainContent;