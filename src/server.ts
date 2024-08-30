import fastify from 'fastify'
import { env } from './env'
import cors from '@fastify/cors'
import { createUser } from './routes/create-user'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'

const app = fastify()

app.register(cors, {
  origin: '*',
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(createUser)

app
  .listen({
    host: '0.0.0.0',
    port: env.PORT,
  })
  .then(() => {
    console.log('🚀 HTPP Server Running!')
  })
