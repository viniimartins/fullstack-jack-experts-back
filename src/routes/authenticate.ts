import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { compare } from 'bcryptjs'

export async function authenticate(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/auth',
    {
      schema: {
        body: z.object({
          email: z.string().email(),
          password: z
            .string()
            .min(8)
            .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
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
        return reply.status(401).send({ error: 'Invalid email or password' })
      }

      const isPasswordValid = await compare(password, user.password)

      if (!isPasswordValid) {
        return reply.status(401).send({ error: 'Invalid email or password.' })
      }

      const token = app.jwt.sign(
        {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        {
          expiresIn: '1h',
        },
      )

      return reply.send({ token })
    },
  )
}
