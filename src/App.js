'use strict'

const SlackBot = require('./SlackBot')
const Parser = require('./Parser')

class App {
  static start() {
    const controller = new SlackBot().getController()

    controller.hears("ls (.+)", ["direct_message", "direct_mention", "mention"], this.ls)
  }

  static ls(bot, message) {
    const {organization, labels} = new Parser(message.match[1]).parse()

    console.log('Filtering requests for [Org:' + organization + '][Labels:' + labels.join(',') + ']!')
  }
}

module.exports = App
