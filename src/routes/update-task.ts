import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { verifyJwt } from '../middlewares/verify-jwt'
import { prisma } from '../lib/prisma'

export async function updateTask(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().patch(
    '/task/:taskId',
    {
      schema: {
        headers: z.object({
          authorization: z
            .string()
            .regex(/^Bearer\s.+$/, 'Invalid authorization header format'),
        }),
        body: z.object({
          title: z.string().optional(),
          content: z.string().optional(),
          completed: z.boolean().optional(),
        }),
        params: z.object({
          taskId: z.string().uuid(),
        }),
      },
      preHandler: verifyJwt,
    },
    async (request, reply) => {
      const { content, title, completed } = request.body

      const { taskId } = request.params

      const task = await prisma.task.update({
        where: {
          id: taskId,
        },
        data: {
          title,
          content,
          completed,
        },
      })

      reply.send({ taskId: task.id })
    },
  )
}
