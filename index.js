const amqp = require('amqplib')
const { createClient }  = require('@supabase/supabase-js')
const AppSearchClient = require('@elastic/app-search-node')
const supabase = createClient("https://nibfetvyhnqcdshbbyvi.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYyMTM3NzE4OCwiZXhwIjoxOTM2OTUzMTg4fQ.B9YM6SiE70F5UCPVyRrmYIsCZwx6A5NbzV7ntlMFQlc")
const apiKey = 'private-had5b73uevhvz24efny3dyxq'
const baseUrlFn = () => 'https://enterprise-search-deployment-02d057.ent.sa-east-1.aws.found.io/api/as/v1/'
const client = new AppSearchClient(undefined, apiKey, baseUrlFn)

const main = async () => {
  const connection = await amqp.connect('amqp://rabbit')
  const channel = await connection.createChannel()
  const q = await channel.assertQueue("all", {deadLetterExchange: "amq.fanout"})
  await channel.assertQueue("backout")
  await channel.bindQueue("backout", "amq.fanout", "")
  supabase.from('question').on('*', payload => {
    const newObj = Object.fromEntries(
      Object.entries(payload.new).map(([k, v]) => [k == "idQuestao"? "id": k.toLowerCase(), v])
    )
    channel.sendToQueue(q.queue, Buffer.from(JSON.stringify(newObj)))
  }).subscribe()

  console.log("oi1")
  channel.prefetch(1)
  await channel.consume(q.queue, async msg => {
    if(msg != null){
      const resp = await client.indexDocuments('teste1', JSON.parse(msg.content.toString()))
      if(resp[0].errors.length != 0){
        console.log(resp[0].errors)
        channel.reject(msg, false)
      } else {
        channel.ack(msg)
      }
    }
  })
}

main()