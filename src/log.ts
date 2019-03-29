/**
 * Basic logger
 */
const pino = require('pino')

export const l = pino({
  name: process.env.APP_ID || 'server-log',
  level: process.env.LOG_LEVEL || 'debug',
})

export default l
