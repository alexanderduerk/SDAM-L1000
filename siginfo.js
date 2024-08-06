const searchArg = require('./searchargs');

/** Typechecking functino to detect type errors early
 * @param {string, number, boolean}
 * @param {string, number, boolean}
 */
function checkType(value, expectedType) {
  if (typeof value !== expectedType) {
    //throw a type error
    throw new TypeError(`Expected ${expectedType}, got ${typeof value}`);
  }
}

/**
 * Datamodel defines all data for the pertubations table
 */
/**
 * Represents a pertubation with various attributes
 */
class Signature_info {
  /**
   * Constructor for the cellinfos class
   * @param {HashMap} keyValuePairs - Attributes and their values
   */
  constructor(keyValuePairs) {
    const expectedTypes = {
      pert_name: 'string',
      cmap_name: 'string',
      gene_target: 'string',
      moa: 'string',
      canonical_smiles: 'string',
      inchi_key: 'string',
      compound_aliases: 'string',
    };
    // use a dynamic constructor approach
    Object.keys(keyValuePairs).forEach((key) => {
      checkType(keyValuePairs[key], expectedTypes[key]);
      this[key] = keyValuePairs[key];
    });
  }
  /**
   * Write Function for inserting the instance into the db
   * @param {instance}
   */

  async createOne(dbconnection) {
    // get all columns
    const columns = Object.keys(this);
    // get all values
    const values = Object.values(this);
    // define the placeholder ?s
    const placeholders = columns.map(() => '?').join(',');
    // define sql statement
    const sql = `INSERT INTO signature_infos (${columns.join(',')}) VALUES (${placeholders})`;
    // Execute SQL statement with the instanced values
    const dbres = await dbconnection.run(sql, ...values);
    // return the newly inserted signature
    const newsigname = await dbconnection.get(
      `SELECT * FROM signatue_infos WHERE sig_name = ?`,
      this.sig_name
    );
    return newsigname;
  }

  /**
   * Delete Function for the pert_id table
   * @param {dbconnection, signature_infos}
   */
  // sql statement
  static async deleteOne(dbconnection, signame) {
    const sql = `DELETE FROM signature_infos WHERE sig_name = ?`;
    const dbres = await dbconnection.run(sql, `${signame}`);
    // return a console.log that the given pertubagens was deleted
    console.log(`signature_infos with sig_name: ${signame} was deleted`);
  }
  /**
   * Updates a single row in the "compound" table with the given id, column, and new value
   *
   * @param {object} dbconnection - The database connection object.
   * @param {number} id - The id of the row to update.
   * @param {string} column - The column to update.
   * @param {any} newvalue - The new value to set.
   * @return {Promise<object>} - A Promise that resolves to the updated row.
   */

  /**
   * Update/Patch Function for pert_id table
   * @param {dbconnection, signature_infos, column, newvalue}
   */
  static async updateOne(dbconnection, signame, column, newvalue) {
    const sql = `UPDATE signature_infos SET ${column} = ? WHERE sig_name = ${signame}`;
    const dbres = await dbconnection.run(sql, newvalue);
    // return a console.log that the given pertubagens was updated
    console.log(`Signature_info with ${signame} was updated`);
    const updatedSignatureinfo = await dbconnection.get(
      'SELECT * FROM signature_infos WHERE pert_id = ?',
      signame
    );
    return updatedSignatureinfo;
  }

  static async search(searcharg, limit, offset, dbconnection) {
    const searchSql =
      searcharg !== undefined && searcharg !== null
        ? searchArg.translateToSQL(searcharg, 'signature_infos')
        : 'SELECT * FROM signature_infos';
    console.log(
      `SQL generated to search Compounds:\n${JSON.stringify(searchSql)}`
    );
    // Query the database
    const dbResult = await dbconnection.all(searchSql);
    // Done
    console.log(dbResult);
    return dbResult;
  }
}

module.exports = Signature_info;
