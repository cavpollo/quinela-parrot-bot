'use strict'

const SlackBot = require('./SlackBot')
const Parser = require('./Parser')

class App {
  static start() {
    const controller = new SlackBot().getController()

    controller.hears("scoreboard (.+)", ["direct_message", "direct_mention", "mention"], this.scoreboard)
  }

  static scoreboard(bot, message) {
    const {labels} = new Parser(message.match[1]).parse()

    console.log('Stuff for [Labels:' + labels.join(',') + ']!')
  }
}

module.exports = App
