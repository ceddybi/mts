import redis, { RedisClient } from 'redis'
// import l from './log'

interface PresenceData {
  connectionId: string
  when: Date
  meta?: {
    [fieldName: string]: string
  }
}

export class Presence {
  private static _instance: Presence
  public client: RedisClient
  public clientSub: RedisClient
  public presenceKey: string = 'redis-presence'

  private constructor() {}

  public init(
    redisIP: string,
    redisPort: number,
    redisPassword: string,
    presenceKey: string,
  ) {
    this.client = redis.createClient(redisPort || 6379, redisIP, {
      auth_pass: redisPassword || '',
      return_buffers: true,
    })

    if (presenceKey) {
      this.presenceKey = presenceKey
    }

    // this.clientSub = redis.createClient(redisPort || 6379, redisIP, {
    //   auth_pass: redisPassword || '',
    //   return_buffers: true
    // });

    //  // Add redis adapter to socket.io Redis adapter
    //  // @ts-ignore
    //  io.adapter(ioRedis({ pubClient: this.client, subClient: this.clientSub }));
  }

  public static get Instance() {
    // Do you need arguments? Make it a regular method instead.
    return this._instance || (this._instance = new this())
  }

  /**
   * Insert data into redis
   * @param connectionId
   * @param meta
   */
  public upsert(connectionId: string, meta: string): Promise<string> {
    const data = JSON.stringify({
      meta,
      when: Date.now(),
    })

    return new Promise((resolve, reject) => {
      this.client.hset(this.presenceKey, connectionId, data, err => {
        if (err) {
          console.error('Failed to store presence in redis: ' + err)
          return reject(err)
        }
        console.log('Added ', connectionId)
        return resolve(connectionId)
      })
    })
  }

  /**
   * Update client data here
   * @param connectionId
   * @param meta
   */
  public async update(connectionId: string, meta: any): Promise<any> {
    return new Promise((res, rej) => {
      // Check if we already have this client
      this.client.hget(this.presenceKey, connectionId, (err, preza) => {
        if (err) {
          console.error('Nope we dont have this client', err)
          return rej('Nope we dont have this client')
        }

        const existing = preza ? JSON.parse(preza) : {}

        const data = JSON.stringify({
          meta: { ...existing.meta, ...meta },
          when: Date.now(),
        })

        this.client.hset(this.presenceKey, connectionId, data, err => {
          if (err) {
            console.error('Failed to store presence in redis: ' + err)
            return rej(new Error('Failed to store presence in redis: ' + err))
          }
          console.log('ID', connectionId)
          console.log('UPDATED WITH ', data)
          return res(connectionId)
        })
      })
    })
  }

  /**
   * Removes a presence in redis
   *
   * @param connectionId
   */
  public remove(connectionId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.client.hdel(this.presenceKey, connectionId, err => {
        if (err) {
          console.error('Failed to remove presence in redis: ' + err)
          return reject(err)
        }
        console.log('removed presence in redis: ' + connectionId)
        return resolve(connectionId)
      })
    })
  }

  public async get(connectionId: string): Promise<object> {
    if (!connectionId) {
      return Promise.reject(null)
    }

    return new Promise((res, rej) => {
      this.client.hget(this.presenceKey, connectionId, (err, data) => {
        if (err) {
          return rej(err)
        }
        try {
          res(JSON.parse(data))
        } catch (error) {
          console.log(error)
          rej(err)
        }
      })
    })
  }

  /**
   * list
   */
  public async list(): Promise<any> {
    const active: PresenceData[] = []
    const dead: PresenceData[] = []
    const now = Date.now()

    return new Promise(res => {
      this.client.hgetall(this.presenceKey, (err, presence: any) => {
        if (err) {
          console.log(
            'Failed to get presence from Redis, returning empty: ' + err,
          )
          return res([])
        }

        // tslint:disable-next-line:forin
        for (const connection in presence) {
          const details = JSON.parse(presence[connection])
          // details.connection = connection;
          if (now - details.when < 8000) {
            active.push(details)
          } else {
            dead.push(details)
          }
        }

        if (dead.length) {
          // self._clean(dead);
        }
        return res(active)
      })
    })
  }

  public async clean(toDelete: PresenceData[]): Promise<any> {
    console.log(`Cleaning ${toDelete.length} expired presences`)
    for (const presence of toDelete) {
      await this.remove(presence.connectionId)
    }
  }
}

export default Presence
