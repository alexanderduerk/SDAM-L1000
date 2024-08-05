/**
 * Datamodel defines all data for the pertubations table
 */
/**
 * Represents a pertubation with various attributes
 */
class Perturbagens {
  /**
   * Constructor for the cellinfos class
   * @param {HashMap} keyValuePairs - Attributes and their values
   */
  constructor(keyValuePairs) {
    this.pert_id = keyValuePairs.pert_id; // pertubations ID of a Pertubagens
    this.cmap_name = keyValuePairs.pert_id; // name of pertubagens cmap designated
    this.gene_target = keyValuePairs.gene_target; // The symbol of the gene that the compound targets
    this.moa = keyValuePairs.moa; // Curated phrase representing the compound's mechanism of action
    this.canonical_smiles = keyValuePairs.canonical_smiles; // Canonical SMILES structures
    this.inchi_key = keyValuePairs.inchi_key; // InChIKey - hashed version of the InChi identifier
    this.compound_aliases = keyValuePairs.compound_aliases; // Alternative name for the compound
  }
  /**
   * Write Function for inserting the instance into the db
   * @param {instance}
   */

  async createOne(dbconnection) {
    const sql = `INSERT INTO perturbagens (pert_id, cmap_name, gene_target, moa, canonical_smiles, inchi_key, compound_aliases) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    // Execute SQL statement with the instanced values
    const dbres = await dbconnection.run(
      sql,
      this.cmap_name,
      this.canonical_smiles,
      this.compound_aliases,
      this.gene_target,
      this.inchi_key,
      this.moa,
      this.pert_id
    );
    //return the newly inserted cell
    const newperdid = await dbconnection.get(
      `SELECT * FROM perturbagens WHERE pert_id = ?`,
      this.pert_id
    );
    return newperdid;
  }

  /**
   * Delete Function for the pert_id table
   * @param {dbconnection, pert_id}
   */
  // sql statement
  async deleteOne(dbconnection, pert_id) {
    const sql = `Delete FROM pert_id = ?`;
    const dbres = await dbconnection.run(pert_id);
    // return a console.log that the given pertubagens was deleted
    console.log(`Pertubagens with ${pert_id} was deleted`);
  }

  /**
   * Update/Patch Function for pert_id table
   * @param {dbconnection, pert_id, column, newvalue}
   */
  static async updateOne(dbconnection, pert_id, column, newvalue) {
    const sql = `Update pert_id SET ${column} = ? WHERE ${column} = ${pert_id}`;
    const dbres = await dbconnection.run(pert_id);
    // return a console.log that the given pertubagens was updated
    console.log(`Pertubagens with ${pert_id} was updated`);
  }

  /**
   * Get Function for pert_id
   * @param {dbconnection, pert_id}
   */
  async retrieveOne(dbconnection, pert_id) {
    const sql = `SELECT * FROM perturbagens WHERE pert_id = ?`;
    try {
      const perturbagen = await dbconnection.get(sql, [pert_id]);
      return perturbagen;
    } catch (err) {
      console.error(
        `Error retrieving pertubagens with pert_id ${pert_id}:`,
        err
      );
      throw err;
    }
  }
}

module.exports = Perturbagens;
