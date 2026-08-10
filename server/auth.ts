import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes } from "crypto";
import { timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";
import MemoryStore from "memorystore";
import { verifyNeonJwt } from "./neon-auth";

declare global {
  namespace Express {
    interface User extends User {}
  }
}

interface PassportInfo {
  message?: string;
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const SessionStore = MemoryStore(session);

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "digital-presence-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 86400000,
      sameSite: "lax",
      httpOnly: true,
    },
    store: new SessionStore({ checkPeriod: 86400000 }),
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);

        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }

        if (user.password.includes(".")) {
          const isValid = await comparePasswords(password, user.password);
          if (!isValid) {
            return done(null, false, { message: "Invalid username or password" });
          }
        } else if (user.password !== password) {
          return done(null, false, { message: "Invalid username or password" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(new Error("User not found"));
      }
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/auth/neon/session", async (req, res, next) => {
    try {
      const authorization = req.headers.authorization;
      const token = authorization?.startsWith("Bearer ")
        ? authorization.slice("Bearer ".length)
        : null;

      if (!token) {
        return res.status(401).json({ message: "Neon Auth token required" });
      }

      const identity = await verifyNeonJwt(token);
      if (!identity.email) {
        return res.status(400).json({ message: "Authenticated Neon user has no email" });
      }

      let user = await storage.getUserByEmail(identity.email);
      if (!user) {
        const placeholderPassword = await hashPassword(randomBytes(32).toString("hex"));
        user = await storage.createUser({
          username: `neon_${identity.sub}`,
          email: identity.email,
          password: placeholderPassword,
          fullName: identity.name?.trim() || identity.email.split("@")[0],
          businessType: null,
          starName: null,
          region: null,
          subRegion: null,
          role: null,
          starColor: null,
          isGuidingStar: false,
          isAreaLeader: false,
          isVoter: false,
          invitedBy: null,
          characterEvaluation: null,
        });
      }

      req.login(user, (error) => {
        if (error) return next(error);
        const { password: _password, ...safeUser } = user;
        return res.status(200).json(safeUser);
      });
    } catch (error) {
      return res.status(401).json({
        message: error instanceof Error ? error.message : "Unable to verify Neon Auth session",
      });
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, email, password, ...rest } = req.body;

      const existingByUsername = await storage.getUserByUsername(username);
      if (existingByUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingByEmail = await storage.getUserByEmail(email);
      if (existingByEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        ...rest,
      });

      req.login(user, (err) => {
        if (err) return next(err);
        const { password: _password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate(
      "local",
      (err: Error | null, user: User | false, info: PassportInfo | undefined) => {
        if (err) return next(err);
        if (!user) {
          return res.status(401).json({ message: info?.message || "Authentication failed" });
        }

        req.login(user, (loginError) => {
          if (loginError) return next(loginError);
          const { password: _password, ...userWithoutPassword } = user;
          res.status(200).json(userWithoutPassword);
        });
      },
    )(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { password: _password, ...userWithoutPassword } = req.user as User;
    res.json(userWithoutPassword);
  });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}
