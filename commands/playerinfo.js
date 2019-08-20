const request           = require('request');
const { RichEmbed }     = require('discord.js');
const moment            = require('moment');

module.exports = {
    name: 'playerinfo',
    description: 'Gives information about FPS Games Dust2 Players',
    execute(message, args) {
        if(!args.length)
            return message.channel.send(`You didn't provide any arguments, ${message.author}!`)

        let name = args.slice(0).join('+');

        let url = 'https://fps-games.bg/playerapi.php?name=' + name;

        request({
            url: url,
            json: true
        }, function(error, response, body) {
            if(!error & response.statusCode === 200) {
            
                console.log(body);
                let firstJoin = moment(body['first_join']).fromNow();
                let lastJoin = moment(body['last_join']).fromNow();
                let intSeconds = parseInt(body['connection_time']);
                var connectionTime =  Math.floor(moment.duration(intSeconds,'seconds').asHours()) + ' hours, ' + moment.duration(intSeconds,'seconds').minutes() + ' minutes and ' + moment.duration(intSeconds,'seconds').seconds() + ' seconds';

                const playerInfoMessage = new RichEmbed()
                    .setColor(((1 << 24) * Math.random() | 0).toString(16))
                    .setTitle(`Information about ${body['name']}`)
                    
                    .addBlankField()
                    
                    .addField('Kills: ', body['kills'], true)
                    .addField('Assists: ', body['assists'], true)
                    .addField('Deaths: ', body['deaths'], true)

                    .addBlankField()

                    .addField('Headshots: ', body['hs'], true)
                    .addField('Skill: ', body['skill'], true)
                    
                    .addBlankField()
                    
                    .addField('Shots: ', body['shots'], true)
                    .addField('Hits: ', body['hits'], true)
                    .addField('Damage: ', body['dmg'], true)

                    .addBlankField()

                    .addField('Bombs Planted: ', body['bombplants'], true)
                    .addField('Bombs Defused: ', body['bombdefused'], true)

                    .addBlankField()

                    .addField('Rounds as T: ', `***${body['wint']}***  wins out of ***${body['roundt']}*** rounds`, true)
                    .addField('Rounds as CT: ', `***${body['winct']}***  wins out of ***${body['roundct']}*** rounds`, true)
                    
                    .addBlankField()

                    .addField('First Join: ', firstJoin, true)
                    .addField('Last Join: ', lastJoin, true)

                    .addBlankField()

                    .addField('Connections: ', body['connects'], true)
                    .addField('Total time played: ', `${connectionTime}`, true)

                    .addBlankField()
                    
                    .setTimestamp()
                    .setFooter('FPSBot by Evil');
                //console.log(body);
                message.channel.send(playerInfoMessage);
            }
        });
    },
};