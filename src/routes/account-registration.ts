import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { hash } from 'bcryptjs'

export async function accountRegistration(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/account-registration',
    {
      schema: {
        body: z.object({
          name: z.string(),
          email: z.string().email(),
          password: z
            .string()
            .min(8)
            .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
        }),
      },
    },
    async (request, reply) => {
      const { email, name, password } = request.body

      const password_hash = await hash(password, 6)

      const userWithSameEmail = await prisma.user.findUnique({
        where: {
          email,
        },
      })

      if (userWithSameEmail) {
        return reply.status(409).send({ response: 'email' })
      }

      await prisma.user.create({
        data: {
          name,
          email,
          password: password_hash,
        },
      })

      return reply.status(201).send()
    },
  )
}
