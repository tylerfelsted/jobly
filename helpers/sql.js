const { BadRequestError } = require("../expressError");


/*** Helper function to generate the sql for partial updates of a user or company
 * 
 * Input is an object with the data to be updated, and an object which changes variable names to a sql format
 * 
 * Example:
 * Input ({ firstName, lastName, password, email, isAdmin },
 *        {firstName: "first_name", lastName: "last_name", isAdmin: "is_admin"})
 * 
 * Output {
 *    setCols: "first_name=$1, last_name=$2, password=$3, email=$4, is_admin=$5",
 *    values: { firstName, lastName, password, email, isAdmin }
 * }
 * 
 * Throws BadRequestError if no data is passed in
 * 
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
