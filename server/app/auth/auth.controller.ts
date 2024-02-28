import { Request, Response } from 'express';
import prisma from '../prisma_client.ts';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { env } from '../common/setupEnv.ts';

//Delete this line once you use the function
// @ts-ignore
async function doesUserExist(email: string): Promise<boolean> {
  /**
   * Check if user exists in the database
   * Potentially throws an error from Prisma
   * @param email string - email of the user
   */
  const user = await prisma.user.findFirst({
    where: {
      email: email,
    },
  });
  if (user) {
    return true;
  }
  return false;
}
// Delete this line once you use the function
// @ts-ignore
async function getUser(email: string) {
  /**
   * Get user from the database
   * Potentially throws an error from Prisma
   * @param email string - email of the user
   */
  const user = await prisma.user.findFirst({
    where: {
      email: email,
    },
  });
  return user;
}

//@ts-ignore
async function createUser(name: string, email: string, password: string) {
  /**
   * Create user in the database
   * Potentially throws an error from Prisma
   * @param name string - name of the user
   * @param email string - email of the user
   * @param password string - password of the
   */
  const saltRounds = 10; // You can adjust the number of salt rounds as needed
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const newUser = await prisma.user.create({
    data: {
      name: name,
      email: email,
      password: hashedPassword,
    },
  });
  return newUser;
}

export const signup = async (req: Request, res: Response) => {
  console.log(req.body);
  const { name, email, password } = req.body;

  try {
    const userExists = await doesUserExist(email);

    if (userExists) {
      res.status(409).send('Account already exists under that email. Try logging in.');
      return;
    }

    if (!email.includes('@')) {
      res.status(400).send('Must be a valid email address.');
      return;
    }

    if (!name || !email || !password) {
      res.status(400).send('Name, email, and password are required.');
      return;
    }

    const newUser = await createUser(name, email, password);

    if (typeof newUser !== 'object') {
      res.status(500).send('Unexpected response creating user. Please try again.');
      return;
    }

    if (newUser instanceof Error) {
      console.error('Prisma error:', newUser);
      res.status(500).send('Internal server error. Please try again.');
      return;
    }

    const newToken: string = await jwt.sign(
      {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        canPostEvents: newUser.canPostEvents,
        isAdmin: newUser.isAdmin,
      },
      env.JWT_TOKEN_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({ token: newToken, message: 'User created successfully' });
  } catch (error) {
    console.error('Prisma error:', error);
    return res.status(500).send('Internal server error. Please try again.');
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  // Check if email and password fields are filled.
  if (!email || !password) {
    return res.status(400).send('Email and password are required!');
  }
  // Check if valid email
  if (!email.includes('@')) {
    return res.status(400).send('Must be a valid email address.');
  }

  const userExists = await doesUserExist(email);
  if (userExists) {
    try {
      const user = await getUser(email);

      if (!user) {
        return res.status(401).send('User not found. Please sign up first.');
      }

      if (user.password) {
        const passwordMatches = await bcrypt.compare(password, user.password);
        if (passwordMatches) {
          const newToken: string = await jwt.sign(
            {
              id: user.id,
              name: user.name,
              email: user.email,
              canPostEvents: user.canPostEvents,
              isAdmin: user.isAdmin,
            },
            env.JWT_TOKEN_SECRET,
            { expiresIn: '1h' }
          );
          return res.status(200).json({ token: newToken, message: 'User login successful.' });
        } else {
          return res.status(401).send('Incorrect password.');
        }
      } else {
        return res.status(401).send('User password is not set. Please sign up first.');
      }
    } catch (error) {
      console.error('Prisma error:', error);
      return res.status(500).send('Internal server error. Please try again.');
    }
  } else {
    return res.status(401).send('User not found. Please sign up first');
  }
};

