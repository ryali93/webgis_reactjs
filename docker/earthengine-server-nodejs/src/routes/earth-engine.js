const router = require('express').Router();
const ee = require('@google/earthengine');
const geeMethodsCtrl = require('../controller/gee-methods-ctrl');
const utils = require('../controller/utils');

const e = require('express');

router.get('/get-mapid', async(request, response) => {
    // Return the mapid of the image with GET method
    const { id, area, indices, gee_type, scale, start_date, end_date, vis, cloud_cover } = request.query;
    const data = await geeMethodsCtrl.get_mapid(id, area, indices, gee_type, scale, start_date, end_date, vis, cloud_cover);
    if (typeof data === 'undefined' || !('urlFormat' in data)) {
        console.log('Error: data is undefined or urlFormat is not in data');
    } else {
        response.send(data.urlFormat);
    }
});

router.post('/post-mapid', async(request, response) => {
    // Return the mapid of the image with POST method
    const { id, area, indices, gee_type, scale, start_date, end_date, vis, cloud_cover } = request.body;
    // console.log(request.body);
    const data = await geeMethodsCtrl.post_mapid(id, area, indices, gee_type, scale, start_date, end_date, vis, cloud_cover);
    // response.status(200).send(data)
    if (typeof data === 'undefined' || !('urlFormat' in data)) {
        console.log('Error: data is undefined or urlFormat is not in data');
    } else {
        response.send(data.urlFormat);
    }
});

router.get('/get-available-dates', async(request, response) => {
    // Return the available dates of the image collection with GET method
    const { id, area, cloud_cover } = request.query;
    const data = await geeMethodsCtrl.get_available_dates(id, area, cloud_cover);
    response.send(data);
});

router.get('/get-ts', async(request, response) => {
    // Return the time series for an area of the image collection with GET method
    const { id, area, indices, reducer, scale, start_date, end_date, cloud_cover } = request.query;
    const data = await geeMethodsCtrl.get_time_series(id, area, indices, reducer, scale, start_date, end_date, cloud_cover);
    if (typeof data === 'undefined') {
        console.log('Error: data is undefined or urlFormat is not in data');
    } else {
        response.send(data);
    }
});

router.post('/post-ts', async(request, response) => {
    // Return the time series for an area of the image collection with POST method
    const { id, area, indices, reducer, scale, start_date, end_date, cloud_cover } = request.body;
    const data = await geeMethodsCtrl.post_time_series(id, area, indices, reducer, scale, start_date, end_date, cloud_cover);
    if (typeof data === 'undefined') {
        console.log('Error: data is too big or does not exist');
    } else {
        response.send(data);
    }
});

router.get('/get-indices-area', async(request, response) => {
    // Return the indices for an area of the image collection with GET method
    const { id, area, reducer, scale, start_date, end_date, cloud_cover, index } = request.query;
    const data = await geeMethodsCtrl.get_indices(id, area, reducer, scale, start_date, end_date, cloud_cover, index);
    if (typeof data === 'undefined') {
        console.log('Error: data is undefined or urlFormat is not in data');
    } else {
        response.send(data);
    }
});

router.get('/get-indices-point', async(request, response) => {
    // Return the indices for a point of the image collection with GET method
    const { id, point, reducer, scale, start_date, end_date, cloud_cover, index } = request.query;
    const data = await geeMethodsCtrl.get_indices_point(id, point, reducer, scale, start_date, end_date, cloud_cover, index);
    if (typeof data === 'undefined') {
        console.log('Error: data is undefined or urlFormat is not in data');
    } else {
        response.send(data);
    }
});

router.get('/get-hillshade', async(request, response) => {
    // Return the hillshade of the specific area with GET method
    const { area } = request.query;
    const data = await geeMethodsCtrl.get_hillshade(area);
    if (typeof data === 'undefined' || !('urlFormat' in data)) {
        console.log('Error: data is undefined or urlFormat is not in data');
    } else {
        response.send(data.urlFormat);
    }
});

router.get('/get-hotspot', async(request, response) => {
    // Return the hotspot (flame front) of the specific area with GET method
    const { area, start_date, end_date } = request.query;
    console.log(area, start_date, end_date)
    const data = await geeMethodsCtrl.get_hotspot(area, start_date, end_date);
    if (typeof data === 'undefined') {
        console.log('Error: data is undefined');
    } else {
        response.send(data);
    }
});

router.get('/get-burned', async(request, response) => {
    // Return the burned area of the specific area with GET method
    const { area, start_date, end_date } = request.query;
    console.log(area, start_date, end_date)
    const data = await geeMethodsCtrl.get_burned(area, start_date, end_date);
    if (typeof data === 'undefined') {
        console.log('Error: data is undefined');
    } else {
        response.send(data);
    }
});

router.get('/get-flood', async(request, response) => {
    // Return the flood area of the specific area with GET method
    const { area, start_date, end_date } = request.query;
    console.log(area, start_date, end_date)
    const data = await geeMethodsCtrl.get_flood(area, start_date, end_date);
    if (typeof data === 'undefined') {
        console.log('Error: data is undefined');
    } else {
        response.send(data);
    }
});

router.get('/display-img', async(request, response) => {
    // Return patches for an area of the image collection with GET method
    const {id, geometry, indices, scale, start_date, end_date, cloud_cover} = request.query;
    const data = await geeMethodsCtrl.display_img(id, geometry, indices, scale, start_date, end_date, cloud_cover);
    if (typeof data === 'undefined') {
        console.log('Error: data is undefined or urlFormat is not in data');
    } else {
        response.send(data);
        console.log(data)
    }
});

router.post('/post-fire-risk', async(request, response) => {
    // Return the mapid of the image with POST method
    const { geometry, date_eval } = request.body;
    const data = await geeMethodsCtrl.fire_risk(geometry, date_eval);
    console.log(data)
    if (typeof data === 'undefined') {
        console.log('Error: data is undefined or urlFormat is not in data');
    } else {
        response.send(data);
    }
});

router.post('/post-statistics', async(request, response) => {
    // Return the statistics of the image with POST method
    const { id, geometry, indices, gee_type, start_date, end_date } = request.body;
    const data = await geeMethodsCtrl.post_statistics(id, geometry, indices, gee_type, start_date, end_date);
    if (typeof data === 'undefined') {
        console.log('Error: data is undefined or urlFormat is not in data');
    } else {
        response.send(utils.transformData(data));
        console.log(utils.transformData(data))
    }
});

router.post('/post-carbon', async(request, response) => {
    // Return the statistics of the image with POST method
    const { geometry } = request.body;
    const data = await geeMethodsCtrl.post_carbon(geometry);
    if (typeof data === 'undefined') {
        console.log('Error: data is undefined or urlFormat is not in data');
    } else {
        response.send(utils.transformData(data));
        console.log(utils.transformData(data))
    }
});

module.exports = router;
