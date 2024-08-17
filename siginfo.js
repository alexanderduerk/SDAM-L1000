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
 * Datamodel defines all data for the signature table
 */
/**
 * Represents a signature with various attributes
 */

class Signatureinfo {
  /**
   * Constructor for the cellinfos class
   * @param {HashMap} keyValuePairs - Attributes and their values
   */
  constructor(keyValuePairs) {
    const expectedTypes = {
      sig_name: 'string',
      pert_name: 'string',
      cmap_name: 'string',
      pert_type: 'string',
      cell_name: 'string',
      bead_batch: 'string',
      pert_dose: 'string',
      pert_time: 'string',
      nsamples: 'number',
      cc_q75: 'number',
      ss_ngene: 'number',
      tas: 'number',
      pct_self_rank_q25: 'number',
      wt: 'string',
      median_recall_rank_spearman: 'number',
      median_recall_rank_wtcs_50: 'number',
      median_recall_score_spearman: 'number',
      median_recall_score_wtcs_50: 'number',
      batch_effect_tstat: 'number',
      batch_effect_tstat_pct: 'number',
      is_hiq: 'boolean',
      qc_pass: 'boolean',
      det_wells: 'string',
      det_plates: 'string',
      distil_ids: 'string',
      project_code: 'string',
    };
    // use a dynamic constructor approach
    Object.keys(keyValuePairs).forEach((key) => {
      checkType(keyValuePairs[key], expectedTypes[key]);
      this[key] = keyValuePairs[key];
    });
  }

  /**
   * Type checking function to validate data types
   * @param {string} key - The key name of the value being checked
   * @param {*} value - The value to check
   * @param {string} expectedType - The expected data type as a string
   */
  checkType(key, value, expectedType) {
    if (expectedType === 'number') {
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new TypeError(
          `Expected number for ${key}, but got ${typeof value}`
        );
      }
      if (!Number.isInteger(value)) {
        throw new TypeError(`Expected integer for ${key}, but got number`);
      }
    } else if (expectedType === 'boolean') {
      if (typeof value !== 'boolean') {
        throw new TypeError(
          `Expected boolean for ${key}, but got ${typeof value}`
        );
      }
    } else if (typeof value !== expectedType) {
      throw new TypeError(
        `Expected ${expectedType} for ${key}, but got ${typeof value}`
      );
    }
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
      `SELECT * FROM signature_infos WHERE sig_name = ?`,
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
      'SELECT * FROM signature_infos WHERE sig_name = ?',
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
    // console.log(dbResult);
    return dbResult;
  }

  static async searchcompounds(searcharg, limit, offset, dbconnection) {
    const searchSql =
      searcharg !== undefined && searcharg !== null
        ? searchArg.translateToSQL(searcharg, 'genetargets')
        : 'SELECT * FROM signature_infos';
    console.log(
      `SQL generated to search Compounds:\n${JSON.stringify(searchSql)}`
    );
    // Query the database
    const dbResult = await dbconnection.all(searchSql);
    // Done
    // console.log(dbResult);
    return dbResult;
  }

  static async searchUI(searcharg, limit, offset, dbconnection) {
    const searchSql =
      searcharg !== undefined && searcharg !== null
        ? searchArg.translateToSQL(searcharg, 'signature_infosUI')
        : 'SELECT * FROM signature_infos';
    console.log(
      `SQL generated to search Compounds:\n${JSON.stringify(searchSql)}`
    );
    // Query the database
    const dbResult = await dbconnection.all(searchSql);
    // Done
    // console.log(dbResult);
    return dbResult;
  }
}

module.exports = Signatureinfo;
