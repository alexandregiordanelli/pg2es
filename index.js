const amqp = require('amqplib');
const { createClient }  = require('@supabase/supabase-js');

const supabase = createClient("https://ggkolujyhxdkvzzlciri.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNzg0NDUzNiwiZXhwIjoxOTMzNDIwNTM2fQ.PlGQvJdggIOH8allQ3ARTnssK7kP0Rwat1UEtqbJIug")

const main = async () => {
  const connection = await amqp.connect('amqp://rabbit')
  const channel = await connection.createChannel()
  const q = await channel.assertQueue("all", {deadLetterExchange: "amq.fanout"})
  
  supabase.from('Question').on('*', payload => {
    channel.sendToQueue(q.queue, Buffer.from(JSON.stringify(payload)))
  }).subscribe()
}

main()