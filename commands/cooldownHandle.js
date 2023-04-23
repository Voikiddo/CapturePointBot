const { Collection } = require('discord.js')

exports.cooldownHandle = (message, client, queryName) => {
    const { cooldowns } = client;
    if (!cooldowns.has(queryName)) {
        cooldowns.set(queryName, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(queryName);
    const defaultCooldownDuration = 3;
    const cooldownAmount = defaultCooldownDuration * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const expiredTimestamp = Math.round(expirationTime / 1000);
            return message.reply(`Please wait, you are on a cooldown. You can send query again <t:${expiredTimestamp}:R>.`).catch(error => {console.error(error.message)});
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

}