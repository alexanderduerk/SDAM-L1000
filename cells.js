const searchArg = require('./searchargs.js');
/**
 * Datamodel defines all data for the cellinfos table
 */
/**
 * Represents a cell line with various attributes.
 */
class CellInfos {
  /**
   * Constructor for the cellinfos class
   * @param {HashMap} keyValuePairs - Attributes and their values
   */
  constructor(keyValuePairs) {
    this.cell_iname = keyValuePairs.cell_iname; // Curated name for the cell line
    this.cellosaurus_id = keyValuePairs.cellosaurusId; // Cellosaurus identifier
    this.donor_age = keyValuePairs.donorAge; // Patient age at time of cell line derivatization
    this.donor_age_death = keyValuePairs.donorAgeDeath; // Patient age at time of death
    this.donor_disease_age_onset = keyValuePairs.donorDiseaseAgeOnset; // Patient age of disease onset
    this.doubling_time = keyValuePairs.doublingTime; // Doubling time in hours
    this.growth_medium = keyValuePairs.growthMedium; // Name of growth medium
    this.provider_catalog_id = keyValuePairs.providerCatalogId; // Catalog number from provider
    this.feature_id = keyValuePairs.featureId; // Feature identifier if used in PRISM
    this.cell_type = keyValuePairs.cellType; // High level descriptor of cell status
    this.donor_ethnicity = keyValuePairs.donorEthnicity; // Ethnicity of donor
    this.donor_sex = keyValuePairs.donorSex; // Gender of donor
    this.donor_tumor_phase = keyValuePairs.donorTumorPhase; // Whether it is primary or metastasis
    this.cell_lineage = keyValuePairs.cellLineage; // Lineage/tissue description
    this.primary_disease = keyValuePairs.primaryDisease; // Name of primary disease
    this.subtype = keyValuePairs.subtype; // Name of disease subtype
    this.provider_name = keyValuePairs.providerName; // Name of the provider
    this.growth_pattern = keyValuePairs.growthPattern; // Description of growth pattern
    this.ccle_name = keyValuePairs.ccleName; // CCLE identifier
    this.cell_alias = keyValuePairs.cellAlias; // Other names or identifiers for the cell line
  }
  /**
   * Write Function for inserting the instance into the db
   * @param {instance}
   */

  async createOne(dbconnection) {
    const sql =
      'INSERT INTO cellinfos (cell_iname, cellosaurus_id, donor_age, donor_age_death, donor_disease_age_onset, doubling_time, growth_medium, provider_catalog_id, feature_id, cell_type, donor_ethnicity, donor_sex, donor_tumor_phase, cell_lineage, primary_disease, subtype, provider_name, growth_pattern, ccle_name, cell_alias) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    // Execute SQL statement with the instanced values
    const dbres = await dbconnection.run(
      sql,
      this.cell_iname,
      this.cellosaurus_id,
      this.donor_age,
      this.donor_age_death,
      this.donor_disease_age_onset,
      this.doubling_time,
      this.growth_medium,
      this.provider_catalog_id,
      this.feature_id,
      this.cell_type,
      this.donor_ethnicity,
      this.donor_sex,
      this.donor_tumor_phase,
      this.cell_lineage,
      this.primary_disease,
      this.subtype,
      this.provider_name,
      this.growth_pattern,
      this.ccle_name,
      this.cell_alias
    );
    // return the newly inserted cell
    const newcell = await dbconnection.get(
      'SELECT * FROM cellinfos WHERE cell_iname = ?',
      this.cell_iname
    );
    return newcell;
  }

  /**
   * Delete Function for the cellinfos table
   * @param {dbconnection, celliname}
   */
  // sql statement
  async deleteOne(dbconnection, celliname) {
    const sql = 'DELETE FROM cellinfos WHERE cell_iname = ?';
    const dbres = await dbconnection.run(celliname);
    // return a console.log that the given cell was deleted
    console.log(`Cell with ${celliname} was deleted`);
  }

  /**
   * Update Function for the cellinfos table
   * @param {dbconnection, celliname, column, newvalue}
   */
  async updateOne(dbconnection, celliname, column, newvalue) {
    const sql = `UPDATE cellinfos SET ${column} = ? WHERE ${column} = ${celliname}`;
    const dbres = await dbconnection.run(newvalue);
    // return the newly updated Row
    const updatedCell = await dbconnection.get(
      'SELECT * FROM cellinfos WHERE cell_iname = ?',
      celliname
    );
    return updatedCell;
  }

  /**
   * Reads cellrecord from the database
   */
  static async search(searcharg, orderarg, paginationarg, dbconnection) {
    const searchSql =
      searcharg !== undefined && searcharg !== null
        ? searchArg.translateToSQL(searcharg, 'cellinfos')
        : 'SELECT * FROM cellinfos';
    console.log(
      `SQL generated to search Cellinfos:\n${JSON.stringify(searchSql)}`
    );

    // Query the database
    const dbResult = await dbconnection.all(searchSql);
    // Done
    return dbResult;
  }
}

module.exports = CellInfos;
