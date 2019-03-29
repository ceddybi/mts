import { SocketServer } from '../src'
import request from 'supertest';
import express from 'express';


const { expressApp: app } = SocketServer.Instance.init({
  express: {
    port: 3040,
    app: express()
  },
  redis: {
    ip: 'localhost'
  }
})

describe('GET /', function() {
  it('responds with json', function(done) {
    request(app)
      .get('/')
      // .set('Accept', 'application/json')
      // .expect('Content-Type', /json/)
      .expect(200, done);
  });
});