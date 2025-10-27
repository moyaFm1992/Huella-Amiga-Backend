const pool = require('../config/db');

/**
 * Data‑access layer for the `dogs` table.
 * Columns: id, description, photo_path, latitude, longitude, created_at
 */
const Dog = {
  /**
   * Persist a new dog record.
   * @param {Object} dogData – { description, photoPath, latitude, longitude }
   * @returns {Promise<Object>} Inserted row
   */
  async create(dogData) {
    const { description, photoPath, latitude, longitude } = dogData;



    const query = `
      INSERT INTO dogs (description, photo_path, latitude, longitude, created_at)
VALUES ($1, $2, $3, $4, now())
RETURNING *;
    `;
    const values = [description, photoPath, latitude, longitude];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  /**
   * Fetch all dogs ordered by newest first.
   */
  async getAll() {
    const query = `
      SELECT * FROM dogs
      WHERE status is null
      ORDER BY created_at DESC;
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  /**
   * Find dogs within `radiusKm` kilometers of the given coordinates using a simple Euclidean approximation.
   * @param {number} latitude
   * @param {number} longitude
   * @param {number} radiusKm
   */
  async getNearby(latitude, longitude, radiusKm) {
    const query = `
      SELECT *,
        SQRT(POWER(latitude - $1, 2) + POWER(longitude - $2, 2)) * 111.32 AS distance_km
      FROM dogs
      WHERE SQRT(POWER(latitude - $1, 2) + POWER(longitude - $2, 2)) * 111.32 <= $3
      ORDER BY distance_km;
    `;
    const { rows } = await pool.query(query, [latitude, longitude, radiusKm]);
    return rows;
  },

  /**
   * Retrieve a single dog by its primary key.
   */
  async getById(id) {
    const query = 'SELECT * FROM dogs WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },

  async getByDesc(text) {
    const query = 'SELECT * FROM dogs WHERE description ILIKE $1';
    const { rows } = await pool.query(query, [`%${text}%`]);
    return rows;
  },

  async activateDog(id) {
    const query = 'UPDATE dogs SET status = true WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

};

module.exports = Dog;
