const ee = require('@google/earthengine');

const maskClouds = (image, qaBand, bitMasks, additionalMask = null) => {
    // Get the pixel QA band.
    const qa = image.select(qaBand);

    // Create a mask using bitwiseAnd operation and provided bitMasks.
    let mask = bitMasks.reduce((accMask, bitmask) => {
        return accMask.and(qa.bitwiseAnd(bitmask).eq(0));
    }, ee.Image.constant(1)); // Start with a mask that is all ones (i.e., everything is included).

    if (additionalMask) {
        const addMask = image.mask().reduce(ee.Reducer.min());
        mask = mask.and(addMask);
    }
    return image.updateMask(mask);
};

// Función para transformar el objeto
const transformData = function(data) {
    const result = {};
    
    Object.keys(data).forEach(key => {
      const [metric, stat] = key.split('_');
      
      if (!result[metric]) {
        result[metric] = {};
      }
      
      result[metric][stat] = data[key];
    });
    
    return result;
  }

module.exports = {
    maskClouds,
    transformData
};