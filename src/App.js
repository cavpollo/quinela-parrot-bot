'use strict'

const SlackBot = require('./SlackBot')
const Parser = require('./Parser')
const http = require('http')

const parrotMessages = ['Don\'t be sad if you are last. It just means you aren\'t winning.',
    'The best part about winning, is being able to identify the losers.',
    'Don\'t worry, the next round you\'ll do better... Who are we kidding, your bad choices got you where you are.',
    'If you don\t know who to pick, here is a tip: bet everything on Brasil, that way you can blame nostalgia for your bad choices.',
    'Let\'s us all thank Gus for making this Quinela possible. How else would we know how to squander our money?',
    'All the Quinela money is safely stored on a Cayman Island account. Untraceable. Nothing to worry about.',
    'Parrot Bot likes Germany. And Germany likes to work. So get back to work before I start tagging you on more Pull Requests!']

class App {
    static start() {
        const controller = new SlackBot().getController()

        controller.hears("scoreboard", ["direct_message", "direct_mention", "mention"], this.scoreboard)
    }

    static scoreboard(bot, message) {
        // if(message.length > 0) {
        //     const {labels} = new Parser(message.match[1]).parse()
        //
        //     console.log('Stuff for [Labels:' + labels.join(',') + ']!')
        // }

        let host = process.env.QUINELA_HOST
        let port = process.env.QUINELA_PORT
        let path = process.env.QUINELA_PATH
        let token = process.env.QUINELA_TOKEN

        var options = {
            host: host,
            port: port,
            path: path,
            headers: {
                'Authorization': token
            }
        }

        http.get(options, (resp) => {
            let data = ''

            resp.on('data', (chunk) => {
                data += chunk
            })

            resp.on('end', () => {
                let textMessage = ':party_parrot: :soccer: SCOREBOARD :soccer: :party_parrot:\n\n'

                let dataJson = JSON.parse(data)

                let players = dataJson.content

                let formattedPlayers = []
                for(let i = 0; i < players.length; i++) {
                    formattedPlayers.push(formatPlayer(players[i]))
                }

                textMessage += formattedPlayers.join('\n')

                textMessage += '\n\n:party_parrot: ' + getRandomMessage(parrotMessages)

                bot.reply({channel: message.channel}, {'text': textMessage})

                console.log('Done notifying')
            })

        }).on("error", (err) => {
            bot.reply({channel: message.channel}, {'text': 'Error, something went wrong and I don\'t know how to fix it... I\'m just a parrot :sad_parrot:'})

            console.error('Error: ' + err.message)
        })
    }
}

function formatPlayer(player) {
    return `${player.rank}. ${player.nombres}: ${player.puntos} points`
}

function getRandomMessage(messages){
    return messages[Math.floor(Math.random() * messages.length)]
}

module.exports = App
