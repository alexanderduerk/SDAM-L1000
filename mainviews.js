/**
 * Datamodel which defines main table on the server
 */

class Mainviews {
  /**
   *
   * @param {HashMap} keyValuePairs
   */

  constructor(keyValuePairs) {
    // creates the instance with the corresponding keys
    this.cell_iname = keyValuePairs.cell_iname;
    this.pert_id = keyValuePairs.pert_id;
    this.gene_symbol = keyValuePairs.gene_symbol;
    this.ss_ngene = keyValuePairs.ss_ngene;
  }

  async createOne(db_connection) {
    // Prepare the SQL statement:
    const sql =
      'INSERT INTO mainviews (cell_iname, pert_id, gene_symbol, ss_ngene) VALUES(?, ?, ?, ?)';
    // Execute the SQL statement with the argument values:
    const db_res = await db_connection.run(
      sql,
      this.cell_iname,
      this.pert_id,
      this.gene_symbol,
      this.ss_ngene
    );
    // Read out the just inserted new city record and return it:
    const new_pert = await db_connection.get(
      'SELECT * FROM mainviews WHERE pert_id = ?',
      this.pert_id
    );
    return new_pert;
  }

  /**
   * Reads a cell name and returns all data available from the database for the cell name
   *
   * @param {string} cell_iname
   * @param {object} db_connection
   *
   * @return {object}
   */
  async readBycellname(cell_iname, db_connection) {
    const sql =
      'SELECT cellname, pert_id, gene_symbol, ss_ngene FROM mainviews WHERE cell_iname = ?';
    const db_res = await db_connection.get(sql, cell_iname);
    console.log(db_res);
    return new Mainviews(db_res);
  }

  /**
   * Reads a perturbation ID and returns all data available from the database for the Perturburbagen
   *
   * @param {string} pert_id
   * @param {object} db_connection
   *
   * @return {object}
   */
  async readBypertId(pert_id, db_connection) {
    const sql =
      'SELECT cellname, pert_id, gene_symbol, ss_ngene FROM mainviews WHERE pert_id = ?';
    const db_res = await db_connection.get(sql, pert_id);
    console.log(db_res);
    return new Mainviews(db_res);
  }

  /**
   * Reads the gene symbol and returns all data available from the database for the gene symbol
   *
   * @param {string} gene_symbol
   * @param {object} db_connection
   *
   * @return {object}
   */
  async readBygenesymbol(gene_symbol, db_connection) {
    const sql =
      'SELECT cellname, pert_id, gene_symbol, ss_ngene FROM mainviews WHERE gene_symbol = ?';
    const db_res = await db_connection.get(sql, gene_symbol);
    console.log(db_res);
    return new Mainviews(db_res);
  }
}

module.exports = Mainviews;
