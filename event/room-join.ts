import _ from 'lodash'
import { Contact, Room } from 'wechaty'
import { logger } from '../lib/logger'

const hello = (contact: Contact) => _.trim(`
欢迎新人入群, 请注意修改昵称 (eg. 山月-前端-北京)

---
由yancy自制机器人发送
`)

export const handleRoomJoin = (room: Room, inviteeList: Contact[], inviter: Contact) => {
  logger.info('', {
    label: 'event',
    room: room.payload,
    event: 'room-join'
  })
  // 如果被邀请进个人群，则打招呼
  if ([/* 个人群的群主 ID 列表 */].includes(room.owner()?.id)) {
    inviteeList.forEach(c => {
      room.say(hello(c), c)
    })
  }
}
