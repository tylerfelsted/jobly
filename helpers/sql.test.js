const { sqlForPartialUpdate } = require("./sql");

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