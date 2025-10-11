import { getPool } from '../config/database.js';

export class Supplier {
  static async findAll() {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT * FROM suppliers ORDER BY name'
    );
    return rows;
  }

  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT * FROM suppliers WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async create(supplierData) {
    const pool = getPool();
    const {
      name,
      contact_person,
      email,
      phone,
      address
    } = supplierData;

    const [result] = await pool.execute(
      `INSERT INTO suppliers (name, contact_person, email, phone, address)
       VALUES (?, ?, ?, ?, ?)`,
      [name, contact_person, email, phone, address]
    );

    return result.insertId;
  }

  static async update(id, supplierData) {
    const pool = getPool();
    const {
      name,
      contact_person,
      email,
      phone,
      address
    } = supplierData;

    const [result] = await pool.execute(
      `UPDATE suppliers 
       SET name = ?, 
           contact_person = ?,
           email = ?,
           phone = ?,
           address = ?
       WHERE id = ?`,
      [name, contact_person, email, phone, address, id]
    );

    return result.affectedRows > 0;
  }

  static async delete(id) {
    const pool = getPool();
    const [result] = await pool.execute(
      'DELETE FROM suppliers WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}