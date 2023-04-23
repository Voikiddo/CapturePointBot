const { EmbedBuilder } = require('discord.js')
const { cooldownHandle } = require('./cooldownHandle')

exports.replyWeapon = (message, fullMessage, client, WeaponDamages) => {
    // cooldown handle

    cooldownHandle(message, client, 'weapon')

    // actual command

    const commandContent = fullMessage.split(" ")
    if (!commandContent.length == 2) return false;
    const weaponName = commandContent[1]
    const weapon = WeaponDamages.find(w => w.name === weaponName);

    if (!weapon) {
        return message.reply('Weapon not found!').catch(error => {console.error(error.message)});
    }

    const replyEmbed = new EmbedBuilder()
        .setTitle(`Weapon - ${weaponName}`)
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

    return message.channel.send({embeds: [replyEmbed]}).catch(error => {console.error(error.message)});
}