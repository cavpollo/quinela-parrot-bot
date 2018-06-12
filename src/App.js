'use strict'

const SlackBot = require('./SlackBot')
const Parser = require('./Parser')
const http = require('http')
const _ = require("lodash")

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
                let message = ':party_parrot: SCOREBOARD :party_parrot:\n\n'

                console.log('data.content')
                console.log(data.content)

                let playersFormatter = _(data.content).map(this.playerFormatter)

                console.log('playersFormatter')
                console.log(playersFormatter)

                message += playersFormatter.join('\n')

                message += '\n\nDon\'t be sad if you are last. It just means you aren\'t winning.'

                bot.reply({channel: message.channel}, {'text': message})

                console.log('Done notifying')
            })

        }).on("error", (err) => {
            bot.reply({channel: message.channel}, {'text': 'Error :sad_parrot:'})

            console.error('Error: ' + err.message)
        })
    }

    static playerFormatter(player) {
        console.log('player')
        console.log(player)
        return '' + player.rank + '. - ' + player.nombres + ' : ' + player.puntos;
    }
}

module.exports = App
