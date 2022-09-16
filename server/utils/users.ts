import pool from "../config/db";

export type TQueryResult = {
  ok: boolean;
  result: null;
};

export const getUserById = async (userId: string | undefined) => {
  const sql = "SELECT id FROM users WHERE id = $1 LIMIT 1";
  const user = await pool.query(sql, [userId]);

  if (user.rowCount === 0) {
    return { ok: false, result: null };
  }
  const result = user.rows[0];

  return { ok: true, result };
};
