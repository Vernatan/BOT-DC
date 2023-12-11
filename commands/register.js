const config = require('../config.json');
const cmdConfig = require('../config2.json');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'register',
  description: 'Command registration system, on specific channels and adding tags on their first name.',
  execute(message, args) {
    if (!cmdConfig.allowregchannelsID) {
      const channelNotSetEmbed = new MessageEmbed()
        .setColor('#FF0000')
        .setDescription('Channels belum di set dengan `!setreg` command.');

      message.channel.send(channelNotSetEmbed);
      return;
    }

    if (message.member.roles.cache.some(role => role.id === config.adminrolesID) || message.member.permissions.has('ADMINISTRATOR')) {
      const adminNotAllowedEmbed = new MessageEmbed()
        .setColor('#FF0000')
        .setDescription('**Administrator** tidak dapat menggunakan `!register` commands.');

      message.channel.send(adminNotAllowedEmbed);
      return;
    }

    if (message.channel.id !== cmdConfig.allowregchannelsID) {
      const channelNotAllowedEmbed = new MessageEmbed()
        .setColor('#FF0000')
        .setDescription('Anda tidak dapat menggunakan `!register` commands disini.');

      message.channel.send(channelNotAllowedEmbed);
      return;
    }

    if (args.length === 0) {
      const missingNameEmbed = new MessageEmbed()
        .setColor('#FF0000')
        .setDescription('Nama yang anda masukan tidak boleh kosong. **Format**: `!register nama`');

      message.channel.send(missingNameEmbed);
      return;
    }

    if (message.member.roles.cache.some(role => role.id === config.addrolesID)) {
      const alreadyRegisteredEmbed = new MessageEmbed()
        .setColor('#FF0000')
        .setDescription('Anda tidak dapat menggunakan `!register` command lagi, karena sudah mendaftar.');

      message.channel.send(alreadyRegisteredEmbed);
      return;
    }

    const newName = config.NameTag + args.join(' ');

    if (newName.length > 32) {
      const nameTooLongEmbed = new MessageEmbed()
        .setColor('#FF0000')
        .setDescription('Nama yang anda masukan tidak boleh lebih dari `32` kata.');

      message.channel.send(nameTooLongEmbed);
      return;
    }

    message.member.setNickname(newName)
      .then(() => {
        const successEmbed = new MessageEmbed()
          .setColor('#00FF00')
          .setDescription(`Selamat ${message.author}, anda telah berhasil mendaftar dengan nama **${newName}**`);

        message.channel.send(successEmbed);

        const targetRole = message.guild.roles.cache.get(config.addrolesID);
        if (targetRole) {
          message.member.roles.add(targetRole)
            .then(() => {
              console.log(`Roles has been given to ${message.author.tag}`);
            })
            .catch((error) => {
              console.error(error);
              console.log(`Failed to assign role to ${message.author.tag}`);
            });
        } else {
          console.log('Target roles (ID) not found.');
        }

        const dmMessage = new MessageEmbed()
          .setAuthor(message.author.username, message.author.avatarURL())
          .setDescription(`Selamat datang di ${message.guild.name}! Terima kasih sudah bergabung di server kami, jika kamu memiliki pertanyaan terkait, bisa kamu langsung tanyakan. Jangan lupa untuk membaca ketentuan & peraturan yang ada agar menjadikan komunitas yang lebih baik, semoga betah ya bro/sis!`)
          .addFields(
            {
              name: "ID",
              value: message.author.id,
              inline: true
            },
            {
              name: "Name",
              value: newName,
              inline: true
            },
            {
              name: "Joined dates",
              value: message.member.joinedAt.toLocaleDateString(),
              inline: true
            }
          )
          .setImage("https://share.creavite.co/sw0Mavw2TiHpkxec.gif")
          .setColor("RANDOM")
          .setFooter(message.guild.name, message.guild.iconURL())
          .setTimestamp();

        message.author.send(dmMessage)
          .then(() => {
            console.log(`Direct Message sent to ${message.author.tag}`);
            const userData = {
              id: message.author.id,
              name: newName,
              joinedAt: message.member.joinedAt.toLocaleDateString(),
            };

            addToDatabase(userData);
          })
          .catch((error) => {
            console.error(error);
            console.log(`Failed to send Direct Message`);
          });
      })
      .catch((error) => {
        console.error(error);

        const errorEmbed = new MessageEmbed()
          .setColor('#FF0000')
          .setDescription('An error occurred while trying to register yourself.');

        message.channel.send(errorEmbed);
      });
  },
};

function addToDatabase(userData) {
  fs.readFile('./database.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    const database = JSON.parse(data);

    database.users.push(userData);

    fs.writeFile('./database.json', JSON.stringify(database, null, 2), (writeErr) => {
      if (writeErr) {
        console.error(writeErr);
      } else {
        console.log(`User data added to database.`);
      }
    });
  });
        }
