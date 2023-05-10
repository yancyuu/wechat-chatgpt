import { Message, Sayable, FileBox} from 'wechaty'
import config from '../config'
import { reply } from '../lib/reply'
import { getImage } from '../lib/art'
import { cache } from '../lib/cache'
import * as state from '../lib/state'

type Route = {
  handle: ((text: string, msg: Message) => Sayable) | ((text: string, msg: Message) => Promise<Sayable>)
  keyword: string | RegExp
  filter?: (msg: Message) => boolean | Promise<boolean>
}

export const routes: Route[] = [
  {
    keyword: '/ping',
    handle() {
      return 'pong'
    },
  },
  {
    keyword: '/art',
    handle() {
      if (state.globalReplyState === 'text') {
        state.setGlobalReplyState('art')  
      } 
      return '已切换至画图模式'
    },
  },
  {
    keyword: '/text',
    handle() {
      if (state.globalReplyState === 'art') {
        state.setGlobalReplyState('text')
      }
      return '已切换至文本模式'
    },
  },
  {
    keyword: '',
    async handle(text, msg) {
      text = text
        .replace(new RegExp(`^${config.groupPrefix}`), '')
        .replace(new RegExp(`^${config.privatePrefix}`), '')
      const talker = msg.talker()
      const conversation = msg.conversation()
      const key = `Conversation:${conversation.id}:Message`
      const history: any = cache.get(key) || []
      let answer: string | undefined | FileBox;
      if (state.globalReplyState === 'text'){
        answer = await reply([
          ...history,
          {
            role: 'user',
            content: `${config.prompt}${text}`,
          },
        ])
        cache.set(key, [
          {
            role: 'user',
            content: `${config.prompt}${text}`
          },
          {
            role: 'assistant',
            content: answer
          }
      ])
      if (msg.room()) {
        const isLontText = text.length > 20
        answer = `@${talker.name()}  ${text.slice(0, 20)}${isLontText ? '...' : ''}
---------------------------------
${answer}`
      }
      }else{
        const { FileBox }  = require('file-box')
        const prompts = text.split(",")
        const base64Str = await getImage(prompts)
        answer = FileBox.fromBase64(base64Str);
      }
      return answer
    },
    async filter (msg) {
      const room = msg.room()
      if (room && config.enableGroup && msg.text().startsWith(config.groupPrefix)) {
        if (config.enableGroup === true) {
          return true
        }
        const topic = await room.topic()
        return config.enableGroup.test(topic)
      }
      if (!room && config.enablePrivate && msg.text().startsWith(config.privatePrefix)) {
        if (config.enablePrivate === true) {
          return true
        }
        return config.enablePrivate.test(msg.talker().name())
      }
      return false
    }
  },
]
