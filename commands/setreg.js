const fs = require('fs');
const { MessageEmbed } = require('discord.js');
const config = require('../config.json');
const cmdConfig = require('../config2.json');

module.exports = {
  name: 'setreg',
  description: 'Set registration channel.',
  execute(message, args) {
    if (message.channel.id !== cmdConfig.cmdchannelsID) {
      const invalidChannelEmbed = new MessageEmbed()
        .setColor('#FF0000')
        .setDescription('Anda tidak dapat menggunakan `!setreg` command disini.');

      message.channel.send(invalidChannelEmbed);
      return;
    }

    if (!message.member.hasPermission('ADMINISTRATOR')) {
      const noPermissionEmbed = new MessageEmbed()
        .setColor('#FF0000')
        .setDescription('Anda tidak dapat menggunakan `!setreg` command karena tidak memiliki izin.');

      message.channel.send(noPermissionEmbed);
      return;
    }

    if (args.length === 0) {
      const missingChannelEmbed = new MessageEmbed()
        .setColor('#FF0000')
        .setDescription('Channel yang anda masukan tidak boleh kosong');

      message.channel.send(missingChannelEmbed);
      return;
    }

    const channelMention = args[0];
    const channelID = channelMention.replace(/[<#>]/g, '');

    const targetChannel = message.guild.channels.cache.get(channelID);
    if (!targetChannel) {
      const invalidChannelEmbed = new MessageEmbed()
        .setColor('#FF0000')
        .setDescription('Channel yang anda masukan tidak valid.');

      message.channel.send(invalidChannelEmbed);
      return;
    }

    cmdConfig.allowregchannelsID = channelID;

    fs.writeFile('./config2.json', JSON.stringify(cmdConfig, null, 2), (err) => {
      if (err) {
        console.error(err);
        const errorEmbed = new MessageEmbed()
          .setColor('#FF0000')
          .setDescription('Terjadi kesalahan saat mencoba menyimpan pengaturan channel.');

        message.channel.send(errorEmbed);
        return;
      }

      const successEmbed = new MessageEmbed()
        .setColor('#00FF00')
        .setDescription(`Pengaturan \`!register\` channel berhasil diubah ke ${targetChannel}.`);

      message.channel.send(successEmbed);
    });
  },
};
