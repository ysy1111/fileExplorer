const {execSync} = require('child_process');


const calculateSizeD = itemFullStaticPath => {
    // clean the path by substituting space and tabs by '\ ', etc.
    // console.log(itemFullStaticPath);
    const itemFullStaticPathCleaned = itemFullStaticPath.replace(/\s/g,'\ ');

    // extract the size using command line; remove all the space and tabs; human readable size is the first item of the array
    const result = execSync(`du -sh "${itemFullStaticPathCleaned}"`).toString();
    let filesize = result.replace(/\s/g,'').split('/')[0];
    // console.log(filesize);

    //unit
    const filesizeUnit = filesize.replace(/\d|\./g,'');
    // console.log(filesizeUnit);

    //size number
    const filesizeNumber = filesize.replace(/[a-z]/i,'');
    // console.log(filesizeNumber);

    const units = "BKMGT";
    // B 10B -> 10 bytes -> 10*(1024)^0 bytes
    // K 10K -> 10*1024 bytes -> 10*(1024)^1 bytes
    // M 10M -> 10*1024*1024 bytes -> 10*(1024)^2 bytes
    // G 10G -> 10*1024*1024*1024 bytes -> 10*(1024)^3 bytes
    // T 10T -> 10*1024*1024*1024*1024 bytes -> 10*(1024)^4 bytes
    const filesizeBytes = filesizeNumber * Math.pow(1024,units.indexOf(filesizeUnit));
    // console.log(filesizeBytes);
    return [filesize, filesizeBytes]
}

module.exports = calculateSizeD;