import session from "express-session";

declare module "express-session" {
  export interface SessionData {
    user?: {
      id: string;
      username: string;
      admin: boolean | null;
      created_at: Date;
    };
  }
}
