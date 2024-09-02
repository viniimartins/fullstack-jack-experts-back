import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { verifyJwt } from '../middlewares/verify-jwt'
import { prisma } from '../lib/prisma'

export async function createTask(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/task',
    {
      schema: {
        headers: z.object({
          authorization: z
            .string()
            .regex(/^Bearer\s.+$/, 'Invalid authorization header format'),
        }),
        body: z.object({
          title: z.string().min(1, 'Title is required'),
          content: z.string().min(1, 'Content is required'),
        }),
      },
      preHandler: verifyJwt,
    },
    async (request, reply) => {
      const { email } = request.user

      const { title, content } = request.body

      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      })

      if (!user) {
        return reply.status(404).send({ message: 'User not found' })
      }

      const task = await prisma.task.create({
        data: {
          title,
          content,
          author: { connect: { id: user.id } },
        },
      })

      reply.send({ taskId: task.id })
    },
  )
}
