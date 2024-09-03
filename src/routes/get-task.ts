import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { verifyJwt } from '../middlewares/verify-jwt'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function getTask(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/task',
    {
      schema: {
        headers: z.object({
          authorization: z
            .string()
            .regex(/^Bearer\s.+$/, 'Invalid authorization header format'),
        }),
      },
      preHandler: verifyJwt,
    },
    async (request, reply) => {
      const { id } = request.user

      const tasks = await prisma.task.findMany({
        where: {
          authorId: id,
        },
      })

      reply.send(tasks)
    },
  )
}
