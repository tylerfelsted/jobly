"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const { findAll } = require("./job.js");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  jobIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function() {
  test("works", async function() {
    const job = await Job.create({
      title: "testJob",
      salary: 100000,
      equity: 0.05,
      companyHandle: "c1"
    });
    expect(job).toEqual({
      id: expect.any(Number),
      title: "testJob",
      salary: 100000,
      equity: "0.05",
      companyHandle: "c1"
    });
    const result = await db.query(`
      SELECT id, title, salary, equity, company_handle AS "companyHandle"
      FROM jobs
      WHERE title = 'testJob'`);

    expect(result.rows).toEqual([{
      id: expect.any(Number),
      title: "testJob",
      salary: 100000,
      equity: "0.05",
      companyHandle: "c1"
    }]);
  });
  test("bad request with unknown company", async function() {
    try{
      await Job.create({
        title: "testJob",
        salary: 100000,
        equity: 0.05,
        companyHandle: 'badHandle'
      });
      fail();
    } catch(err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function() {
  test("works", async function() {
    const filterParams = {};
    let jobs = await Job.findAll(filterParams);
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "J1",
        salary: 10000,
        equity: "0.01",
        companyHandle: "c1"
      },
      {
        id: expect.any(Number),
        title: "J2",
        salary: 20000,
        equity: "0.02",
        companyHandle: "c1"
      },
      {
        id: expect.any(Number),
        title: "J3",
        salary: 30000,
        equity: "0.03",
        companyHandle: "c2"
      },
      {
        id: expect.any(Number),
        title: "J4",
        salary: 10000,
        equity: "0",
        companyHandle: "c2"
      }
    ]);
  });
  test("works: with all filters", async function() {
    const filterParams = {
      hasEquity: true,
      minSalary: 20000,
      title: '3'
    }
    const jobs = await Job.findAll(filterParams);
    expect(jobs).toEqual([{
      id: expect.any(Number),
      title: "J3",
      salary: 30000,
      equity: "0.03",
      companyHandle: "c2"
    }]);
  });
  test("works: hasEquity = true", async function() {
    const filterParams = {
      hasEquity: 'true'
    }
    const jobs = await Job.findAll(filterParams);
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "J1",
        salary: 10000,
        equity: "0.01",
        companyHandle: "c1"
      },
      {
        id: expect.any(Number),
        title: "J2",
        salary: 20000,
        equity: "0.02",
        companyHandle: "c1"
      },
      {
        id: expect.any(Number),
        title: "J3",
        salary: 30000,
        equity: "0.03",
        companyHandle: "c2"
      }
    ]);
  });
  test("works: hasEquity = false", async function() {
    const filterParams = {
      hasEquity: 'false'
    }
    const jobs = await Job.findAll(filterParams);
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "J1",
        salary: 10000,
        equity: "0.01",
        companyHandle: "c1"
      },
      {
        id: expect.any(Number),
        title: "J2",
        salary: 20000,
        equity: "0.02",
        companyHandle: "c1"
      },
      {
        id: expect.any(Number),
        title: "J3",
        salary: 30000,
        equity: "0.03",
        companyHandle: "c2"
      },
      {
        id: expect.any(Number),
        title: "J4",
        salary: 10000,
        equity: "0",
        companyHandle: "c2"
      }
    ]);
  });
  test("works: minSalary = 20000", async function() {
    const filterParams = {
      minSalary: 20000
    }
    const jobs = await Job.findAll(filterParams);
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "J2",
        salary: 20000,
        equity: "0.02",
        companyHandle: "c1"
      },
      {
        id: expect.any(Number),
        title: "J3",
        salary: 30000,
        equity: "0.03",
        companyHandle: "c2"
      }
    ]);
  });
  test("works: title = J1", async function() {
    const filterParams = {
      title: 'J1'
    }
    const jobs = await Job.findAll(filterParams);
    expect(jobs).toEqual([{
      id: expect.any(Number),
      title: "J1",
      salary: 10000,
      equity: "0.01",
      companyHandle: "c1"
    }]);
  });
});

/************************************** get */

describe("get", function() {
  test("works", async function() {
    const job = await Job.get(jobIds[0]);
    expect(job).toEqual({
      id: jobIds[0],
      title: "J1",
      salary: 10000,
      equity: "0.01",
      companyHandle: "c1"
    });
  });
  test("not found if no such job", async function() {
    try{
      await Job.get(-1);
      fail();
    } catch(err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  })
});

/************************************** update */

describe("update", function() {
  test("works", async function() {
    const job = await Job.update(jobIds[1], {
      title: "newTitle",
      salary: 1000000,
      equity: 0.7
    });
    expect(job).toEqual({
      id: jobIds[1],
      title: "newTitle",
      salary: 1000000,
      equity: "0.7",
      companyHandle: "c1"
    });
    const result = await db.query(`
      SELECT id, title, salary, equity, company_handle AS "companyHandle"
      FROM jobs
      WHERE id = ${jobIds[1]}`);
    expect(result.rows[0]).toEqual({
      id: jobIds[1],
      title: "newTitle",
      salary: 1000000,
      equity: "0.7",
      companyHandle: "c1"
    });
  });
  test("works: null fields", async function() {
    const job = await Job.update(jobIds[1], {
      title: "newTitle",
      salary: null,
      equity: null
    });
    expect(job).toEqual({
      id: jobIds[1],
      title: "newTitle",
      salary: null,
      equity: null,
      companyHandle: "c1"
    });
    const result = await db.query(`
      SELECT id, title, salary, equity, company_handle AS "companyHandle"
      FROM jobs
      WHERE id = ${jobIds[1]}`);
    expect(result.rows[0]).toEqual({
      id: jobIds[1],
      title: "newTitle",
      salary: null,
      equity: null,
      companyHandle: "c1"
    });
  });
  test("not found if no such job", async function() {
    try{
      await Job.update(-1, {
        title: "newTitle",
        salary: 1000000,
        equity: 0.7
      });
      fail();
    } catch(err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
  test("bad request if no data", async function() {
    try{
      await Job.update(jobIds[1], {});
      fail();
    } catch(err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  })
});

/************************************** remove */

describe("remove", function() {
  test("works", async function() {
    await Job.remove(jobIds[2]);
    const result = await db.query(`
      SELECT id FROM jobs WHERE id = ${jobIds[2]}
    `);
    expect(result.rows.length).toEqual(0);
  });
  test("not found if no such job", async function() {
    try{
      await Job.remove(-1);
      fail();
    } catch(err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});