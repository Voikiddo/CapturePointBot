const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, Partials, EmbedBuilder  } = require('discord.js');
require("dotenv").config()
const token = process.env.BOT_TOKEN

const { replyWeapon } = require("./commands/damage.js")
const { replyArmour } = require("./commands/armour.js")

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
                fullMessage = m.content.toLowerCase();
            })
            .catch(error => {
                console.log('Something went wrong when fetching the message: ', error);
            });
    } else {
        fullMessage = message.content.toLowerCase();
    }

    if (!fullMessage.startsWith("?")) return false;

    console.log(`${message.author.username}[@${message.author.id}] commanded: ${fullMessage}`)

    // cooldown handle
    
    if (fullMessage.startsWith("?attack")) return replyWeapon(message, fullMessage, client, WeaponDamages);
    if (fullMessage.startsWith("?weapon")) return replyWeapon(message, fullMessage, client, WeaponDamages);
    
    if (fullMessage.startsWith("?armor")) return replyArmour(message, fullMessage, client, WeaponDamages);
    if (fullMessage.startsWith("?armour")) return replyArmour(message, fullMessage, client, WeaponDamages);

    return message.reply('Command not found!').catch(error => {console.error(error.message)});
});

client.login(token);