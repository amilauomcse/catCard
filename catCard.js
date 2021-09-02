const {writeFile} = require('fs');
const axios = require("axios");
const blend = require('@mapbox/blend');
const config = require('./config.js');
const argv = require('minimist')(process.argv.slice(2));
require('console-stamp')(console, 'HH:MM:ss.l]');
const {
    toby = 'Toby',
    cody = 'Cody',
    width = 400,
    height = 500,
    color = 'White',
    size = 100,
} = argv;
const catCard = {};

catCard.generateUrl = (name, width, height, color, size) => {
    return `${config.api}${name}?width=${width}&height=${height}&color=${color}&s=${size}`;
}
catCard.getRandomCat = async (name, width, height, color, size) => {
    try {
        const response = await axios.request({
            method: 'GET',
            url: catCard.generateUrl(name, width, height, color, size),
            responseType: 'arraybuffer',
            responseEncoding: 'binary'
        });
        return response.data
    } catch (error) {
        throw error;
    }
};

catCard.combineCats = files => {
    return new Promise((resolve, reject) => {
        blend(files, {
            width: width * 2,
            height: height,
            format: 'jpeg',
        }, (fileCombineError, finalFile) => {
            if (fileCombineError) {
                reject(fileCombineError);
            } else {
                resolve(finalFile);
            }
        });
    });
}

catCard.writeFileToLocation = (location, file) => {
    return new Promise((resolve, reject) => {
        writeFile(location, file, 'binary', (fileWriteError) => {
            if (fileWriteError) {
                reject(fileWriteError);
            } else {
                resolve(`File saved to - ${location}`)
            }
        });
    });
}

catCard.generateCatCard = async () => {
    try {
        const cats = await Promise.all([catCard.getRandomCat(toby, width, height, color, size),
            catCard.getRandomCat(cody, width, height, color, size)]);
        const combinedCat = await catCard.combineCats(cats.map((cat, catIndex) => {
            return {
                buffer: Buffer.from(cat, 'binary'),
                x: width * catIndex,
                y: 0,
            }
        }));
        const fileLocation = await catCard.writeFileToLocation(`${process.cwd()}/${config.outputPath}`, combinedCat);
        console.log(fileLocation);
    } catch (error) {
        console.error(error);
    }
}


module.exports = catCard;