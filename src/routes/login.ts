import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { compare } from 'bcryptjs'
import { env } from '../env'
import jwt from 'jsonwebtoken'

export async function loginUser(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/login',
    {
      schema: {
        body: z.object({
          email: z.string().email(),
          password: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { email, password } = request.body

      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      })

      if (!user) {
        return reply.status(401).send({ error: 'Invalid email' })
      }

      const isPasswordValid = await compare(password, user.password)

      if (!isPasswordValid) {
        return reply.status(401).send({ error: 'Invalid password.' })
      }

      const token = jwt.sign(
        {
          email: user.email,
          name: user.name,
        },
        env.JWT_SECRET as string,
        {
          expiresIn: '1h',
        },
      )

      return reply.send({ token })
    },
  )
}
