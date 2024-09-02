import fastify from 'fastify'
import { env } from './env'
import { createUser } from './routes/create-user'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { authenticate } from './routes/authenticate'
import fastifyJwt from '@fastify/jwt'
import { createTask } from './routes/create-task'
import { deleteTask } from './routes/delete-task'
import { updateTask } from './routes/update-task'
import fastifyCors from '@fastify/cors'
import { getTask } from './routes/get-task'

const app = fastify()

app.register(fastifyCors, {
  origin: '*',
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(createUser)
app.register(authenticate)
app.register(createTask)
app.register(deleteTask)
app.register(updateTask)
app.register(getTask)

app
  .listen({
    host: '0.0.0.0',
    port: env.PORT,
  })
  .then(() => {
    console.log('🚀 HTPP Server Running!')
  })
