#!/usr/bin/env node

"use strict"

const fs = require('fs');
const helper = require('./lib/helper.js');
const {resolve} = require('path');

(async () => {
	console.log('download')

	let page = 0;
	let pageSize = 5000;
	let count = 0;
	let data;

	let date = (new Date()).toISOString().slice(0,16).replace(/[^0-9]/g,'-');
	let xz = helper.lineXzipWriter(resolve(__dirname,'../data/0_archived/'+date+'_api_raw.ndjson.xz'));

	do {
		process.stderr.write('.');
		let url = 'https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=1%3D1&outFields=*&orderByFields=ObjectId%20ASC&resultOffset='+(page*pageSize)+'&resultRecordCount='+pageSize+'&f=json';
		data = await helper.fetch(url);
		try {
			data = JSON.parse(data);
			let line = JSON.stringify(data); // single line
			await xz.write(line);
		} catch (e) {
			console.log(url);
			console.log(data);
			throw e;
		}
		count += ((data || {}).features || []).length || 0;
		page++;
	} while (data.exceededTransferLimit)
	
	process.stderr.write(' '+count+'\n');
	
	console.log('close')
	await xz.close();
})()
