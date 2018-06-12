'use strict'

const SlackBot = require('./SlackBot')
const Parser = require('./Parser')
const http = require('http')

class App {
    static start() {
        const controller = new SlackBot().getController()

        controller.hears("scoreboard (.*)", ["direct_message", "direct_mention", "mention"], this.scoreboard)
    }

    static scoreboard(bot, message) {
        const {labels} = new Parser(message.match[1]).parse()

        console.log('Stuff for [Labels:' + labels.join(',') + ']!')

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
                bot.reply({channel: message.channel}, {'text': 'JELLO'})

                console.log(data);

                console.log('Done notifying')
            })

        }).on("error", (err) => {
            bot.reply({channel: message.channel}, {'text': 'Error :sad_parrot:'})

            console.error('Error: ' + err.message)
        });
    }
}

module.exports = App
