import { Application } from 'express'
import { createServer, Server } from 'http'
import redis, { RedisClient } from 'redis'
import socketIo from 'socket.io'
import ioRedis from 'socket.io-redis'
// import l from './log'

interface SocketServerProps {
  express: {
    app: Application
    port: number
  }
  redis: {
    port?: number
    ip: string
    pass?: string
  }
}

interface SocketServerOutput {
  socketIo: SocketIO.Server
  expressApp: Application
}

/**
 * Singleton class
 * For socket.io and express, graphql e.t.c
 * Extending Redis database
 */
export class SocketServer {
  public static readonly PORT: number = 3000
  // tslint:disable-next-line:variable-name
  private static _instance: SocketServer
  private app: Application
  private server: Server
  private io: SocketIO.Server
  private connectedSocket: any
  private port: string | number
  private redisApp = redis.createClient

  private socketpub: RedisClient
  private socketsub: RedisClient

  public static get Instance() {
    // Do you need arguments? Make it a regular method instead.
    return this._instance || (this._instance = new this())
  }

  /**
   * Initialise SocketServer
   */
  public init({ express, redis }: SocketServerProps): SocketServerOutput {
    /** If already intialised */
    if (this.io) {
      return {
        socketIo: this.io,
        expressApp: this.app,
      }
    }

    const { app: expressApp, port: expressPort } = express
    const { ip: redisIp, port: redisPort = 6379, pass: redisPass = '' } = redis

    this.socketpub = this.redisApp(redisPort, redisIp, {
      auth_pass: redisPass,
      return_buffers: true,
    })

    this.socketsub = this.redisApp(redisPort, redisIp, {
      auth_pass: redisPass,
    })

    this.app = expressApp // set up express
    this.port = expressPort // App port

    this.server = createServer(this.app) // this.createServer();
    this.io = socketIo(this.server) // this.sockets();

    // Listen
    this.server.listen(this.port, () => {
      console.log('Running server on port %s', this.port)
    })

    // Redis adapter
    this.io.adapter(
      ioRedis({ pubClient: this.socketpub, subClient: this.socketsub }),
    )

    this.io.on('connect', (socket: any) => {
      console.log('Connected client on port %s.', this.port)

      this.connectedSocket = socket

      socket.on('disconnect', () => {
        console.log('Client disconnected')
      })
    })

    return {
      socketIo: this.io,
      expressApp: this.app,
    }
  }

  private constructor() {}

  /**
   * Get Express Application
   */
  public getApp(): Application {
    return this.app
  }

  /**
   * Get SocketIO.Server
   */
  public getIo(): SocketIO.Server {
    return this.io
  }

  /**
   * Get current connected SocketIO.Socket
   */
  public getSocket(): SocketIO.Socket {
    return this.connectedSocket
  }
}

export default SocketServer
