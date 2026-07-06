import dayjs from 'dayjs'
export function commonTimeRender(value: string) {
  if (!value) {
    return ''
  }
  return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
}
