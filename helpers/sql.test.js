const { sqlForPartialUpdate, sqlForFilterParams } = require("./sql");

describe("sqlForPartialUpdate", () => {
  test("works", () => {
    const data = {
      firstName: "Test",
      lastName: "User",
      email: "testuser@test.com",
      isAdmin: false
    }
    const jsToSql = {
      firstName: "first_name",
      lastName: "last_name",
      isAdmin: "is_admin"
    }
    const results = sqlForPartialUpdate(data, jsToSql);
    expect(results).toEqual({
      setCols: `"first_name"=$1, "last_name"=$2, "email"=$3, "is_admin"=$4`,
      values: Object.values(data)
    });
  });
  test("throws error when no data is passed in", () => {
    expect(() => {
      sqlForPartialUpdate({}, {})
    }).toThrow();
  });
});

describe("sqlForFilterParams companies", () => {
  test("works with all parameters", () => {
    const params = {
      name: 'test',
      minEmployees: 10,
      maxEmployees: 100
    }
    const results = sqlForFilterParams(params);
    expect(results).toEqual({
      sql: `name ILIKE $1 AND num_employees >= $2 AND num_employees <= $3`,
      values: ['%test%', 10, 100]
    });
  });
  test("works with only name and maxEmployees", () => {
    const params = {
      name: 'test',
      maxEmployees: 100
    }
    const results = sqlForFilterParams(params);
    expect(results).toEqual({
      sql: `name ILIKE $1 AND num_employees <= $2`,
      values: ['%test%', 100]
    });
  });
  test("works with only name and minEmployees", () => {
    const params = {
      name: 'test',
      minEmployees: 10
    }
    const results = sqlForFilterParams(params);
    expect(results).toEqual({
      sql: `name ILIKE $1 AND num_employees >= $2`,
      values: ['%test%', 10]
    });
  });
  test("works with only minEmployees and maxEmployees", () => {
    const params = {
      minEmployees: 10,
      maxEmployees: 100
    }
    const results = sqlForFilterParams(params);
    expect(results).toEqual({
      sql: `num_employees >= $1 AND num_employees <= $2`,
      values: [10, 100]
    });
  });
  test("works with only name", () => {
    const params = {
      name: "test"
    }
    const results = sqlForFilterParams(params);
    expect(results).toEqual({
      sql: `name ILIKE $1`,
      values: ['%test%']
    });
  });
  test("works with only minEmployees", () => {
    const params = {
      minEmployees: 10
    }
    const results = sqlForFilterParams(params);
    expect(results).toEqual({
      sql: `num_employees >= $1`,
      values: [10]
    });
  });
  test("works with only maxEmployees", () => {
      const params = {
      maxEmployees: 100
    }
    const results = sqlForFilterParams(params);
    expect(results).toEqual({
      sql: `num_employees <= $1`,
      values: [100]
    });
  });
});

describe("sqlForFilterParams jobs", () => {
  test("works with all parameters", () => {
    const params = {
      hasEquity: 'true',
      minSalary: 40000,
      title: 'title'
    }
    const results = sqlForFilterParams(params);
    expect(results).toEqual({
      sql: `equity > 0 AND salary >= $1 AND title ILIKE $2`,
      values: [40000, '%title%']
    });
  });
  test("works with only hasEquity = true", () => {
    const params = {
      hasEquity: 'true',
    }
    const results = sqlForFilterParams(params);
    expect(results).toEqual({
      sql: `equity > 0`,
      values: []
    });
  });
  test("works with only hasEquity = false", () => {
    const params = {
      hasEquity: 'false'
    }
    const results = sqlForFilterParams(params);
    expect(results).toEqual({
      sql: ``,
      values: []
    });
  });
  test("works with hasEquity = false and minSalary", () => {
    const params = {
      hasEquity: 'false',
      minSalary: 40000
    }
    const results = sqlForFilterParams(params);
    expect(results).toEqual({
      sql: `salary >= $1`,
      values: [40000]
    });
  });
  test("works with only minSalary", () => {
    const params = {
      minSalary: 40000
    }
    const results = sqlForFilterParams(params);
    expect(results).toEqual({
      sql: `salary >= $1`,
      values: [40000]
    });
  });
  test("works with only title", () => {
    const params = {
      title: 'title'
    }
    const results = sqlForFilterParams(params);
    expect(results).toEqual({
      sql: `title ILIKE $1`,
      values: ['%title%']
    });
  });
  test("works with hasEquity = true and minSalary", () => {
    const params = {
      hasEquity: 'true',
      minSalary: 40000
    }
    const results = sqlForFilterParams(params);
    expect(results).toEqual({
      sql: `equity > 0 AND salary >= $1`,
      values: [40000]
    });
  });
  test("works with hasEquity = true and title", () => {
    const params = {
      hasEquity: 'true',
      title: 'title'
    }
    const results = sqlForFilterParams(params);
    expect(results).toEqual({
      sql: `equity > 0 AND title ILIKE $1`,
      values: ['%title%']
    });
  });
  test("works with minSalary and title", () => {
    const params = {
      minSalary: 40000,
      title: 'title'
    }
    const results = sqlForFilterParams(params);
    expect(results).toEqual({
      sql: `salary >= $1 AND title ILIKE $2`,
      values: [40000, '%title%']
    });
  });
});