require('dotenv/config');
const amqp = require('amqplib');
const { postTwitter, postLinkedIn } = require('../posts/services');
const fs = require('fs');

const QUEUE_NAME = process.env.QUEUE_NAME || '';
const RABBITMQURL = process.env.RABBITMQ_URL || '';

module.exports.connectQueue= async() => {
  try {
      const connection = await amqp.connect(RABBITMQURL);
      const channel = await connection.createChannel();
      await channel.assertQueue(QUEUE_NAME, {
          durable: true 
      });
      return channel;
  } catch (error) {
      console.error('Error connecting to RabbitMQ:', error);
      throw error;
  }
}

module.exports.startWorker = async() => {
    try {
        const connection = await amqp.connect(RABBITMQURL);
        const channel = await connection.createChannel();
        
        await channel.assertQueue(QUEUE_NAME, {
            durable: true
        });

        channel.prefetch(1); 

        console.log('Worker started, waiting for messages...');

        channel.consume(QUEUE_NAME, async (msg) => {
            try {
                const message = JSON.parse(msg.content.toString());
                const now = Date.now();
                const scheduledTime = message.scheduledTime;
                if (scheduledTime > now) {
                    channel.nack(msg, false, true);
                    return;
                }
                if (message.postToTwitter === 'true' && message.user.twitter) {
                    const { token, tokenSecret } = message.user.twitter;
                    await writeTweet(
                        { token, tokenSecret },
                        message.content,
                        message.mediaPath ? { path: message.mediaPath } : null
                    );
                }
                if (message.postToLinkedIn === 'true' && message.user.linkedin) {
                    const tags = message.tags ? JSON.parse(message.tags) : [];
                    await postLinkedIn(
                        {
                            linkedinAccessToken: message.user.linkedin.linkedinAccessToken,
                            linkedinId: message.user.linkedin.linkedinId
                        },
                        message.content,
                        message.title,
                        tags,
                        message.mediaPath ? { path: message.mediaPath } : null,
                        message.contentFormat,
                        message.publishStatus === 'draft'
                    );
                }
                if (message.mediaPath && fs.existsSync(message.mediaPath)) {
                    fs.unlinkSync(message.mediaPath);
                }
                channel.ack(msg);
                console.log('Scheduled post processed successfully');

            } catch (error) {
                console.error('Error processing scheduled post:', error);
                channel.nack(msg, false, true);
            }
        });

    } catch (error) {
        console.error('Worker error:', error);
        setTimeout(startWorker, 5000); 
    }
}


