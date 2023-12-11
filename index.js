const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');
const config2 = require('./config2.json');
const dotenv = require('dotenv');
dotenv.config();
const fs = require('fs');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const { prefix } = config;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('public'));

client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setActivity('Security Protection', { type: 'PLAYING' });

app.get('/', (req, res) => {
  const botName = client.user.tag; 
  const botAvatarUrl = client.user.displayAvatarURL(); 
  const htmlFilePath = path.join(__dirname, 'public', 'web.html');

  fs.readFile(htmlFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }

    const modifiedHtml = data
      .replace('${botName}', botName)
      .replace('${botAvatarUrl}', botAvatarUrl);

    res.send(modifiedHtml);
  });
});

  const PORT = 3000;
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

client.on('message', (message) => {
  if (message.author.bot || !message.content.startsWith(prefix)) {
    return;
  }

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  if (!client.commands.has(commandName)) {
    return;
  }

  const command = client.commands.get(commandName);

  try {
    command.execute(message, args, config);
  } catch (error) {
    console.error(error);
    console.log('An error occurred while trying to run the command.');
  }
});

client.login(process.env.BOT_TOKEN);
