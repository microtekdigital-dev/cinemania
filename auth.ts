import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';

if (!process.env.AUTH_SECRET) {
  throw new Error('AUTH_SECRET no está definido en las variables de entorno');
}

// usuarios en memoria (reemplazar con DB en producción)
// hash generado con: node -e "require('bcryptjs').hashSync('tu_contraseña', 12)"
const users = [
  {
    id: '1',
    email: 'admin@cinemania.com',
    passwordHash: '$2b$12$ZyK2guTYO8V7xXDvN8hsCuIwHl9WROhKx8rt6jRcVwb2wE0HUykwS',
    name: 'Admin',
  },
];

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = z.object({
          email: z.string().email(),
          password: z.string().min(6),
        }).safeParse(credentials);

        if (!parsed.success) return null;

        const user = users.find(u => u.email === parsed.data.email);
        if (!user) return null;

        // bcrypt se importa dinámicamente para evitar conflictos con Edge Runtime
        const bcrypt = await import('bcryptjs');
        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        return valid ? { id: user.id, email: user.email, name: user.name } : null;
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
  secret: process.env.AUTH_SECRET,
});
