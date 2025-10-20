import bcrypt from 'bcryptjs';
import { getPool } from '../config/database.js';

export class UsersController {
  static async list(req, res) {
    try {
      const pool = getPool();
      const [rows] = await pool.execute('SELECT id, username, email, role, status, NULL as avatar FROM users ORDER BY created_at DESC');
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error('List users error:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
  }

  static async create(req, res) {
    try {
      const { username, email, password, role = 'staff', status = 'Active' } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: 'username, email, password are required' });
      }
      const pool = getPool();
      const hash = await bcrypt.hash(password, 10);
      await pool.execute(
        'INSERT INTO users (username, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)',
        [username, email, hash, role, status]
      );
      res.status(201).json({ success: true, message: 'User created' });
    } catch (err) {
      console.error('Create user error:', err);
      res.status(500).json({ success: false, message: 'Failed to create user' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { username, role, status } = req.body;
      const pool = getPool();
      const updates = [];
      const params = [];
      if (username !== undefined) { updates.push('username = ?'); params.push(username); }
      if (role !== undefined) { updates.push('role = ?'); params.push(role); }
      if (status !== undefined) { updates.push('status = ?'); params.push(status); }
      if (updates.length === 0) return res.status(400).json({ success: false, message: 'No fields to update' });
      params.push(id);
      await pool.execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
      res.json({ success: true, message: 'User updated' });
    } catch (err) {
      console.error('Update user error:', err);
      res.status(500).json({ success: false, message: 'Failed to update user' });
    }
  }
}
