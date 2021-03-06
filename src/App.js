'use strict'

const SlackBot = require('./SlackBot')
const http = require('http')

const scoreMessages = ['Don\'t be sad if you are last. It just means you aren\'t winning.',
    'The best part about winning, is being able to identify the losers. Don\'t forget to point your finger at them.',
    '\\_/\\_/\\_/\\_/ < This is a graph sample of productivity around latin-american offices around the world.',
    'Don\'t worry, the next round you\'ll do better... Who are we kidding, your bad choices got you where you are.',
    '"Quiniela" is just a fancy-semi-legal term for playing lottery with money.',
    'If you win, what will you do with the price money? I would invest in a 3D printer to have a physical form at the office.',
    'If you don\'t know who to pick, here is a tip: bet everything on Brazil, that way you can blame nostalgia for your bad choices.',
    'Let\'s us all thank Gus for making this Quiniela possible. How else would we know how to squander our money?',
    'Trying to predict consistently the scores of soccer matches is futile. You\'ll have better luck predicting the weather.',
    'Every now and then, during Quiniela season, men all over the world get boost their ego by feeling they know what they are doing.',
    'All the Quiniela money is safely stored on a Cayman Island account. Untraceable. Nothing to worry about.',
    'Parrot Bot likes Germany. And Germany likes to work. So get back to work before I start tagging you on more Pull Requests!',
    'Remember to brag while you are winning. That winning streak won\'t last for long.',
    'You all aren\'t very different from the stock market people, except they play with somebody else\'s money.',
    'Don\'t get mad because you are not winning. Get mad because a virtual parrot is close to beating you.',
    'Can I become the new-magic-game-score-forecast-mascot, please? You can call me Parrot Paul.',
    'Don\'t be disappointed at the game results. Be disappointed at your score prediction skills.']

class App {
    static start() {
        const controller = new SlackBot().getController()

        controller.hears("scoreboard", ["direct_message", "direct_mention", "mention"], this.scoreboard)
        controller.hears("match:(\\d+)", ["direct_message", "direct_mention", "mention"], this.match)
        controller.hears("help:(\\d+)", ["direct_message", "direct_mention", "mention"], this.help)
    }

    static scoreboard(bot, message) {
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

                let lastScore = 0
                let lastPosition = 0
                let formattedPlayers = []
                for (let i = 0; i < players.length; i++) {
                    if(lastScore !== players[i].puntos) {
                        lastScore = players[i].puntos
                        lastPosition = players[i].rank
                    }
                    formattedPlayers.push(formatPlayer(lastPosition, players[i]))
                }

                textMessage += formattedPlayers.join('\n')

                textMessage += '\n\n:party_parrot: ' + getRandomMessage(scoreMessages)

                bot.reply({channel: message.channel}, {'text': textMessage})

                console.log('Done notifying')
            })

        }).on("error", (err) => {
            bot.reply({channel: message.channel}, {'text': 'Error, something went wrong and I don\'t know how to fix it... I\'m just a parrot :sad_parrot:'})
            console.error('Error: ' + err.message)
        })
    }

    static match(bot, message) {
        let match_id = message.match[1]

        let host = process.env.QUINELA_HOST
        let port = process.env.QUINELA_PORT
        let path = process.env.MATCH_PATH
        let token = process.env.QUINELA_TOKEN

        var options = {
            host: host,
            port: port,
            path: path.replace("%MATCH_ID%", match_id),
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
                let textMessage = ':party_parrot: :soccer: FORECASTS :soccer: :party_parrot:\n\n'

                let dataJson = JSON.parse(data)

                let forecasts = dataJson.content

                textMessage += `Match #${match_id}: *${forecasts[0].equipo1}* vs *${forecasts[0].equipo2}*\n`

                let formattedForecasts = []
                for (let i = 0; i < forecasts.length; i++) {
                    formattedForecasts.push(formatForecast(forecasts[i]))
                }

                textMessage += formattedForecasts.join('\n')

                textMessage += '\n\n:party_parrot: Good luck, you\'ll need it!'

                bot.reply({channel: message.channel}, {'text': textMessage})

                console.log('Done notifying')
            })

        }).on("error", (err) => {
            bot.reply({channel: message.channel}, {'text': 'Error, something went wrong and I don\'t know how to fix it... I\'m just a parrot :sad_parrot:'})

            console.error('Error: ' + err.message)
        })
    }

    static help(bot, message) {
        let match_id = message.match[1]

        let host = process.env.QUINELA_HOST
        let port = process.env.QUINELA_PORT
        let path = process.env.MATCH_PATH
        let token = process.env.QUINELA_TOKEN

        var options = {
            host: host,
            port: port,
            path: path.replace("%MATCH_ID%", match_id),
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
                let textMessage = ':party_parrot: :soccer: FORECAST HELP :soccer: :party_parrot:\n\n'

                let dataJson = JSON.parse(data)

                let forecasts = dataJson.content

                textMessage += `Match #${match_id}: *${forecasts[0].equipo1}* vs *${forecasts[0].equipo2}*\n\n`

                let score1 = getScore(String(random(match_id * 2)).charAt(7))
                let score2 = getScore(String(random(match_id * 2 - 1)).charAt(6))

                textMessage += `:party_parrot: You should bet on a *${score1}* - *${score2}*!!!`

                bot.reply({channel: message.channel}, {'text': textMessage})

                console.log('Done notifying')
            })

        }).on("error", (err) => {
            bot.reply({channel: message.channel}, {'text': 'Error, something went wrong and I don\'t know how to fix it... I\'m just a parrot :sad_parrot:'})

            console.error('Error: ' + err.message)
        })
    }
}

function formatPlayer(lastPosition, player) {
    return `${lastPosition}. ${player.nombres}: ${player.puntos} points`
}

function formatForecast(forecast) {
    return `${forecast.nombres}: ${forecast.goles_equipo1} - ${forecast.goles_equipo2}`
}

function getRandomMessage(messages) {
    return messages[Math.floor(Math.random() * messages.length)]
}

function random(seed) {
    return Math.sin(seed*13)
}

function getScore(value) {
    if (value < 3) {
        return 0
    }

    if (value < 6) {
        return 1
    }

    if (value < 9) {
        return 2
    }

    return 3
}

module.exports = App
