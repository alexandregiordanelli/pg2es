const amqp = require('amqplib');

const main = async () => {
  const connection = await amqp.connect('amqp://rabbit')
  const channel = await connection.createChannel()
  const q = await channel.assertQueue("all", {deadLetterExchange: "amq.fanout"})
  console.log("casa")
}

main()