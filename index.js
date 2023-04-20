const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, Partials, EmbedBuilder  } = require('discord.js');
require("dotenv").config()
const token = process.env.BOT_TOKEN

const WeaponDamages = JSON.parse(fs.readFileSync('damage.json'))

const express = require("express");
const { log } = require('node:console');
const app = express();
const port = 8080;

app.get("/", function (req, res) {
  res.send("Bot currently running!");
});

app.listen(port, function () {
  console.log(`App listening on port ${port}!`);
});

const client = new Client({
	intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Message, Partials.Channel]
});

client.cooldowns = new Collection();

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.MessageCreate, async message => {
    let fullMessage
    if (message.partial) {
        await message.fetch()
            .then(m => {
                fullMessage = m.content;
            })
            .catch(error => {
                console.log('Something went wrong when fetching the message: ', error);
            });
    } else {
        fullMessage = message.content
    }

    if (!fullMessage.startsWith("?attack")) return false;

    console.log(`@${message.author.id} commanded: ${fullMessage}`);

    // cooldown handle

    const { cooldowns } = client;
    if (!cooldowns.has('attackQuery')) {
        cooldowns.set('attackQuery', new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get('attackQuery');
    const defaultCooldownDuration = 3;
    const cooldownAmount = defaultCooldownDuration * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const expiredTimestamp = Math.round(expirationTime / 1000);
            return message.reply(`Please wait, you are on a cooldown. You can send query again <t:${expiredTimestamp}:R>.`);
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    // actual command

    const commandContent = fullMessage.split(" ")
    if (!commandContent.length == 2) return false;
    const weaponName = commandContent[1]
    const weapon = WeaponDamages.find(w => w.name === weaponName);

    if (!weapon) {
        return message.reply('Weapon not found!');
    }

    const replyEmbed = new EmbedBuilder()
        .setTitle(`Weapon: ${weaponName}`)
        .addFields(
            {
                name: 'Damage done to each armor:',
                value: `leather > ${weapon.damage.leather} hp\n`
                     + `chain   > ${weapon.damage.chain} hp\n`
                     + `iron    > ${weapon.damage.iron} hp\n`
                     + `diamond > ${weapon.damage.diamond} hp\n`
            }
        )

    if (weapon.effects) {
        replyEmbed.addFields(
            {
                name: 'Additional Effect:',
                value: weapon.effects.join('\n')
            }
        )
    }

    return message.channel.send({embeds: [replyEmbed]});
});

client.login(token);