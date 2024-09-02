import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { verifyJwt } from '../middlewares/verify-jwt'
import { prisma } from '../lib/prisma'

export async function deleteTask(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/task/:taskId',
    {
      schema: {
        headers: z.object({
          authorization: z
            .string()
            .regex(/^Bearer\s.+$/, 'Invalid authorization header format'),
        }),
        params: z.object({
          taskId: z.string().uuid(),
        }),
      },
      preHandler: verifyJwt,
    },
    async (request, reply) => {
      const { taskId } = request.params

      await prisma.task.delete({
        where: {
          id: taskId,
        },
      })

      return reply.status(204).send()
    },
  )
}
