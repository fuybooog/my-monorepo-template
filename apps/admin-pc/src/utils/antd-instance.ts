/* eslint-disable @typescript-eslint/no-explicit-any */
import type { MessageInstance } from 'antd/es/message/interface'
import type { ModalStaticFunctions } from 'antd/es/modal/confirm'
import type { NotificationInstance } from 'antd/es/notification/interface'
import { notification, message, Modal } from 'antd'

let messageInstance: MessageInstance | null = null
let notificationInstance: NotificationInstance | null = null
let modalInstance: Omit<ModalStaticFunctions, 'destroyAll'> | null = null

export const setAppInstances = (msg: MessageInstance, notif: NotificationInstance, modal: any) => {
  messageInstance = msg
  notificationInstance = notif
  modalInstance = modal
}

export const getMessage = () => {
  if (!messageInstance) {
    return message
  }
  return messageInstance
}

export const getModal = () => {
  if (!modalInstance) {
    return Modal
  }
  return modalInstance
}

export const getNotification = () => {
  if (!notificationInstance) {
    return notification
  }
  return notificationInstance
}
