"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
  jobIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */
describe("POST /jobs", function() {
  const newJob = {
		title: "newJob",
		salary: 100000,
		equity: "0.05",
		companyHandle: "c1"
	}
	test("works for admin", async function()  {
		const resp = await request(app)
			.post('/jobs')
			.send(newJob)
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toBe(201);
		expect(resp.body).toEqual({
			job: {
				id: expect.any(Number),
				...newJob
			}
		});
	});
	test("unauthorized for non-admin user", async function() {
		const resp = await request(app)
			.post('/jobs')
			.send(newJob)
			.set("authorization", `Bearer ${u1Token}`);
		expect(resp.statusCode).toBe(401);
	});
	test("bad request with missing data", async function() {
		const resp = await request(app)
			.post('/jobs')
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toBe(400);
	});
	test("bad request with invalid data", async function() {
		const resp = await request(app)
			.post('/jobs')
			.send({
				...newJob,
				equity: "2"
			})
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toBe(400);
	})
});

/************************************** GET /jobs */

describe("GET /jobs", function() {
	test("works for an anonymous user: without filter", async function() {
		const resp = await request(app)
			.get('/jobs');
		expect(resp.statusCode).toBe(200);
		expect(resp.body).toEqual({
			jobs: [
			{
				id: jobIds[0],
				title: 'J1',
				salary: 10000,
				equity: '0.01',
				companyHandle: 'c1'
			},
			{
				id: jobIds[1],
				title: 'J2',
				salary: 20000,
				equity: '0.02',
				companyHandle: 'c1'
			},
			{
				id: jobIds[2],
				title: 'J3',
				salary: 30000,
				equity: '0.03',
				companyHandle: 'c2'
			}
		]});
	});
	test("ok for anonymous user: with filter", async function () {
		const resp = await request(app).get("/jobs")
		  .query({title: "J1"});
		expect(resp.body).toEqual({
		  jobs: [
				{
				  id: jobIds[0],
				  title: 'J1',
				  salary: 10000,
				  equity: '0.01',
				  companyHandle: "c1"
				}
			]
		});
	});
	
	test("bad request with invalid data", async function() {
	const resp = await request(app).get("/jobs")
		.query({hasEquity: 'invalid'});
	expect(resp.statusCode).toBe(400);
	});
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function() {
	test("works for an anonymous user", async function() {
		const resp = await request(app)
			.get(`/jobs/${jobIds[0]}`);
		expect(resp.statusCode).toBe(200);
		expect(resp.body).toEqual({
			job: {
				id: jobIds[0],
				title: "J1",
				salary: 10000,
				equity: "0.01",
				companyHandle: "c1"
			}
		});
	});
	test("not found for no such job", async function() {
		const resp = await request(app)
			.get('/jobs/-1');
		expect(resp.statusCode).toBe(404);
	})
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function() {
	const updateJob = {
		title: "newTitle",
		salary: 1000000,
		equity: "0.9"
	}
	test("works for admin", async function() {
		const resp = await request(app)
			.patch(`/jobs/${jobIds[1]}`)
			.send(updateJob)
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toBe(200);
		expect(resp.body).toEqual({
			job: {
				id: jobIds[1],
				companyHandle: 'c1',
				...updateJob
			}
		});
	});
	test("unauthorized for non-admin user", async function() {
		const resp = await request(app)
			.patch(`/jobs/${jobIds[1]}`)
			.send(updateJob)
			.set("authorization", `Bearer ${u1Token}`);
		expect(resp.statusCode).toBe(401)
	});
	test("bad request on change id attempt", async function() {
		const resp = await request(app)
			.patch(`/jobs/${jobIds[1]}`)
			.send({...updateJob, id: 5})
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toBe(400);
	});
	test("bad request on change companyHandle attempt", async function() {
		const resp = await request(app)
			.patch(`/jobs/${jobIds[1]}`)
			.send({...updateJob, companyHandle: "newHandle"})
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toBe(400);
	});
	test("bad request on invalid data", async function() {
		const resp = await request(app)
			.patch(`/jobs/${jobIds[1]}`)
			.send({...updateJob, equity: "invalid"})
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toBe(400)
	});
	test("not found for no such job", async function() {
		const resp = await request(app)
			.patch('/jobs/-1')
			.send(updateJob)
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toBe(404);
	});
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function() {
	test("works for admin", async function() {
		const resp = await request(app)
			.delete(`/jobs/${jobIds[2]}`)
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toBe(200);
		expect(resp.body).toEqual({deleted: `Job ${jobIds[2]}`});
	});
	test("unauthorized for non-admin user", async function() {
		const resp = await request(app)
			.delete(`/jobs/${jobIds[2]}`)
			.set("authorization", `Bearer ${u1Token}`);
		expect(resp.statusCode).toBe(401);
	});
	test("not found for no such job", async function() {
		const resp = await request(app)
			.delete('/jobs/-1')
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toBe(404);
	});
});