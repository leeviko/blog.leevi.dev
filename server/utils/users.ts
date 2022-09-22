import pool from "../config/db";
import { TUserResult } from "../routes/api/users";

export type TQueryResult = {
  ok: boolean;
  result: TUserResult | null;
};

export const getUserById = async (
  userId: string | undefined
): Promise<TQueryResult> => {
  const sql =
    "SELECT id, username, admin, description, created_at FROM users WHERE id = $1 LIMIT 1";
  const user = await pool.query(sql, [userId]);

  if (user.rowCount === 0) {
    return { ok: false, result: null };
  }
  const result = user.rows[0];

  return { ok: true, result };
};
