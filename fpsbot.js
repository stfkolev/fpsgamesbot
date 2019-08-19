const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token } = require('./config/config.json');
const Canvas = require('canvas');

const client = new Discord.Client();

client.commands = new Discord.Collection();

/*! Cooldowns collection */
const cooldowns = new Discord.Collection();

const files = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for(const file of files) {
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log('fpsbot is ready');
});

/*! Handling messages */
client.on('message', message => {
    if(!message.content.startsWith(prefix) || message.author.bot)
        return;
    
        const args = message.content.slice(prefix.length).split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return;

        if (command.guildOnly && message.channel.type !== 'text')
            return message.reply(`I can't execute that command inside DMs!`);
        
        if (command.args && !args.length) {
            let reply = `You didn't provide any arguments, ${message.author}!`;
    
            if (command.usage) {
                reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
            }
    
            return message.channel.send(reply);
        }
    
        if (!cooldowns.has(command.name)) {
            cooldowns.set(command.name, new Discord.Collection());
        }
    
        const now = Date.now();
        const timestamps = cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || 3) * 1000;
    
        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
    
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.reply(`Please wait **${timeLeft.toFixed(1)}** more second(s) before reusing the **\`${command.name}\`** command.`);
            }
        }
    
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

        try {
            command.execute(message, args);
        } catch(error) {
            console.log(error);
            message.reply('There was an error trying to execute that command!');
        }
});

client.on('message', async message => {
	if (message.content === '!join') {
		client.emit('guildMemberAdd', message.member || await message.guild.fetchMember(message.author));
	}
});

const applyText = (canvas, text) => {
	const ctx = canvas.getContext('2d');
	let fontSize = 70;

	do {
		ctx.font = `${fontSize -= 10}px sans-serif`;
	} while (ctx.measureText(text).width > canvas.width - 300);

	return ctx.font;
};


/*! Handling server joins */
client.on('guildMemberAdd', async member => {
    const channel = member.guild.channels.find(ch => ch.name === 'joined');
    
    if (!channel) 
        return;

	const canvas = Canvas.createCanvas(700, 250);
	const ctx = canvas.getContext('2d');
    
    const background = await Canvas.loadImage('./assets/images/coding-language.jpg');
	ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

	ctx.strokeStyle = '#000';
	ctx.strokeRect(0, 0, canvas.width, canvas.height);

	ctx.font = '28px sans-serif';
	ctx.fillStyle = '#dcdde1';
	ctx.fillText('Welcome to the server,', canvas.width / 2.5, canvas.height / 3.5);

	ctx.font = applyText(canvas, `${member.displayName}!`);
	ctx.fillStyle = '#dcdde1';
	ctx.fillText(`${member.displayName}!`, canvas.width / 2.5, canvas.height / 1.8);

    let temp = await Canvas.loadImage('https://i.imgur.com/XCz0eVi.gif');

    ctx.drawImage(temp, 0, 0);

	ctx.beginPath();
	ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
	ctx.closePath();
	ctx.clip();

	const avatar = await Canvas.loadImage(member.user.displayAvatarURL);
	ctx.drawImage(avatar, 25, 25, 200, 200);

	const attachment = new Discord.Attachment(canvas.toBuffer(), 'welcome-image.png');

	channel.send(`Welcome to the server, ${member}!`, attachment);
});


client.login(token);