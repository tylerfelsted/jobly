"use strict"

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate, sqlForFilterParams } = require("../helpers/sql");

// related functions for job

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, companyHandle }
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws BadRequestError if companyHandle is not in database.
   * */
  static async create({title, salary, equity, companyHandle}) {
    // check that the company exists
    const companyCheck = db.query(
      `SELECT handle 
      FROM companies 
      WHERE hanlde = $1`,
      [companyHandle]);
    
    if(!companyCheck.rows[0]) {
      throw new BadRequestError(`Company does not exist: ${companyHandle}`);
    }

    const result = db.query(
      `INSERT INTO jobs (title, salary, equity, company_handle)
      VALUES ($1, $2, $3, $4)
      RETURNING id, title, salary, equity, company_handle AS companyHandle`,
      [title, salary, equity, companyHandle]);

    const job = results.rows[0]

    return job;
  }

  /** Find all jobs.
   * 
   * can pass in optional filter data:
   * { title, minSalary, hasEquity }
   *
   * Returns [{ id, title, salary, equity, companyHandle }, ...]
   * */
  static async findAll(data) {
    let filtersSql = ``
    let values = [];
    if(Object.keys(data).length) {
      const filters = sqlForFilterParams(data);
      console.log(filters);
      filtersSql = `WHERE ${filters.sql}`;
      values = filters.values;
    }
    const companiesRes = await db.query(
          `SELECT id,
                  title,
                  salary,
                  equity,
                  company_handle AS companyHandle
           FROM jobs ${filtersSql}
           ORDER BY title`, values);
    return companiesRes.rows;
  }

  /** Given a job id, return data about job.
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const results = db.query(
      `SELECT id, title, salary, equity, company_handle AS companyHandle
      FROM jobs
      WHERE id=$1`,
      [id]);

    const job = results.rows[0];

    if(!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          companyHandle: "company_handle"
        });
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, 
                                title, 
                                salary, 
                                equity, 
                                company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No company: ${job}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

   static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
        [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
  }
}