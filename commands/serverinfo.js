const request           = require('request');
const { RichEmbed }     = require('discord.js');
const moment            = require('moment');

module.exports = {
    name: 'serverinfo',
    description: 'Gives information about FPS Games Server',
    execute(message, args) {
        if(!args.length)
            return message.channel.send(`You didn't provide any arguments, ${message.author}!`)

        let url = 'https://fps-games.bg/api.php?ip=' + args[0] + '&port=' + args[1];

        request({
            url: url,
            json: true
        }, function(error, response, body) {
            if(!error & response.statusCode === 200) {
                let splittedDate = body['server_regdata'].substr(0, body['server_regdata'].indexOf(':')).split('-');
                let registerDate = moment(
                    new Date(
                    
                        parseInt(splittedDate[2]),
                        parseInt(splittedDate[1]),
                        parseInt(splittedDate[0])
                    )
                ).fromNow();

                const serverInfoMessage = new RichEmbed()
                    .setColor(((1 << 24) * Math.random() | 0).toString(16))
                    .setTitle(body['server_name'])
                    .setDescription('[Connect now](https\://steam\://connect/' + body['server_ip'] + ':' + body['server_port'] + ' \'Connect now\')')

                    .setImage('https://image.gametracker.com/images/maps/160x120/cs/'+ body['server_map'] +'.jpg')
                    
                    .addBlankField()
                    
                    .addField('Current Rank: ', body['rank'], true)
                    .addField('Boost: ', 'Boosted by ' + body['boosted'] + ' for ' + body['boostfor'] + ' hour', true)
                    
                    .addBlankField()
                    
                    .addField('Best Rank: ', body['best_rank'], true)
                    .addField('Worst Rank: ', body['worst_rank'], true)
                    
                    .addBlankField()

                    .addField('Rank points: ', body['rank_pts'], true)
                    .addField('Registered: ', registerDate, true)
                    
                    .addBlankField()

                    .addField('Current map: ', body['server_map'], true)
                    .addField('Players: ', body['server_players'] + '/' + body['server_maxplayers'], true)

                    .addBlankField()
                    
                    .setTimestamp()
                    .setFooter('FPSBot by Evil');
                //console.log(body);
                message.channel.send(serverInfoMessage);
            }
        });
    },
};