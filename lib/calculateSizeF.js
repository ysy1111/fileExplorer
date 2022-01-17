
const calculateSizeF = stats => {
    //size in bytes
    const filesizeBytes = stats.size;
    const units="BKMGT";

    //size in human readable format
    //......1024......1024^2......1024^3......1024^4
    const index = Math.floor(getBaseLog(1024,filesizeBytes));
    const filesizeHuman = (filesizeBytes/Math.pow(1024,index)).toFixed(1);
    const fileSizeUnit = units[index];

    filesize = `${filesizeHuman}${fileSizeUnit}`;
    return [filesize, filesizeBytes]
}

function getBaseLog(x, y) {
    return Math.log(y) / Math.log(x);
  }

module.exports = calculateSizeF;