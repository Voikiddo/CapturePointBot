const { EmbedBuilder } = require('discord.js')
const { cooldownHandle } = require('./cooldownHandle')

exports.replyArmour = (message, fullMessage, client, WeaponDamages) => {

    // cooldown handle

    cooldownHandle(message, client, 'armour')

    // find armour

    const commandContent = fullMessage.split(" ")
    if (commandContent.length < 2) return false;
    const armourName = commandContent[1]
    const armour = Object.keys(WeaponDamages[0].damage).find(w => w === armourName);

    if (!armour) {
        return message.reply('Armour not found!').catch(error => {console.error(error.message)});
    }

    // reply with embed

    let replyContent = ''
    for (let weapon of WeaponDamages) {
         replyContent = replyContent + `${weapon.name} > ${weapon.damage[armour]} hp\n`
    }

    const replyEmbed = new EmbedBuilder()
        .setTitle(`Armour - ${armourName}`)
        .addFields(
            {
                name: 'Damage done by each weapon:',
                value: replyContent
            }
        )
        .setFooter({text: 'Check individual weapons to see if they have special effects!'})

    if (armour.effects) {
        replyEmbed.addFields(
            {
                name: 'Additional Effect:',
                value: armour.effects.join('\n')
            }
        )
    }

    return message.channel.send({embeds: [replyEmbed]}).catch(error => {console.error(error.message)});
}