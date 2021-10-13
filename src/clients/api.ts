import { create } from 'apisauce'
var cote = require('cote');

const api = create({
	baseURL: 'http://localhost:4000',
	headers: { Accept: 'application/ckdr_ld+json' },
})
const authMonitor = res => console.log(res)
api.addMonitor(authMonitor)


// api.post('/resolve', { did: 'did:key:z6MkqvdGBinpPgDCFttHTPvCwtwrXxip2UnUpSXAXtExDEqf' }, { headers: { 'did': 'did:key:z6MkqvdGBinpPgDCFttHTPvCwtwrXxip2UnUpSXAXtExDEqf' } }).then((res) => {
// 	console.log(res);
// 	if (res.ok) {
// 		console.log(res.data);
// 	}
// }).catch((err) => {
// 	console.log(err);
// });

api.post('/register',
	{
		did: 'did:key:z6MkqvdGBinpPgDCFttHTPvCwtwrXxip2UnUpSXAXtExDEqf',
		requestType: 'member:new',
		email: 'bhavish@happymonk.co',
		phoneNumber: '8296133177',
		countrycode: '91',
		organisationName: 'Happymonk Technology PVt ltd',
		organisationGovernmentId: 'GST123456789',
		registrationType: 'organisation'
	},
	{
		headers: {}
	}
).then((res) => {
	console.log(res);
	if (res.ok) {
		console.log(res.data);
	}
}).catch((err) => {
	console.log(err);
});