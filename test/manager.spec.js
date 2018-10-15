import test from 'ava';
import http from 'http';
import express from 'express';
import axios, { CancelToken } from 'axios';

import RequestManager from '../index';

const app = express();
app.use((req, res, next) => setTimeout(next, 1000));
app.use((req, res) => res.status(200).json({ success: true }));

const listen = () => new Promise((resolve) => {
  let server = http.createServer(app);
  let address = server.address();

  const callback = () => {
    const port = server.address().port;
    resolve(`http://127.0.0.1:${port}`);
  }

  if (!address) {
    server.listen(0, callback);
  } else {
    callback();
  }
});

test('should generate token', t => {
  const manager = new RequestManager();
  const token = manager.getNextToken('foo');

  t.true(token instanceof CancelToken);
  t.is(manager.axiosTokens.get('foo').token, token);
  t.true(typeof manager.axiosTokens.get('foo').cancel === 'function');
});

test('should cancel request', async t => {
  const manager = new RequestManager();
  const cancelToken = manager.getNextToken('foo');
  const host = await listen();

  const promise = axios.get(host, { cancelToken }).then(
    () => t.fail('Request should be canceled'),
    (e) => {
      t.true(axios.isCancel(e));
      t.is('Cancelation reason', e.message);
    }
  );
  manager.cancelAxios('foo', 'Cancelation reason');

  return promise.then(() => {
    t.false(manager.axiosTokens.has('foo'), 'Axios Token should be removed from the Manager');
  });
});

test('should cancel requests whit the same prefix', async t => {
  const manager = new RequestManager();
  const host = await listen();

  const fooPromises = Promise.all([1, 2, 3].map(i => {
    const cancelToken = manager.getNextToken(`foo/${i}`);
    return axios.get(host, { cancelToken }).then(
      () => t.fail(`Request should be canceled for token: 'foo/${i}'`),
      e => t.true(axios.isCancel(e))
    );
  }));
  const barPromises = Promise.all([1, 2, 3].map(i => {
    const cancelToken = manager.getNextToken(`bar/${i}`);
    return axios.get(host, { cancelToken }).then(
      () => t.pass(),
      () => t.fail(`Request should not fail for token: 'bar/${i}'`)
    );
  }));

  t.is(6, manager.axiosTokens.size, 'There should be exactly 6 Cancel Tokens in the Manager');
  manager.cancelAllRequestsWithPrefix('foo');

  return Promise.all([fooPromises, barPromises]).then(() => {
    t.is(3, manager.axiosTokens.size, 'All `foo` prefixed Cancel Tokens should be removed from the Manager');
  });
});

test('should cancel request and get a new token', async t => {
  const manager = new RequestManager();
  const cancelToken = manager.getNextToken('foo');
  const host = await listen();

  const promise = axios.get(host, { cancelToken }).then(
    () => t.fail('Request should be canceled'),
    e => t.true(axios.isCancel(e))
  );

  const token = manager.cancelAxiosAndGetNextToken('foo');
  t.not(token, cancelToken);

  return promise.then(() => {
    t.true(manager.axiosTokens.has('foo'), 'Axios Token should be present in the Manager');
  });
});

test('should read CSRF token from the Cookie', t => {
  global.document = { cookie: 'foo=bar; csrftoken=token; baz=false' };
  const manager = new RequestManager();

  t.deepEqual(manager.getCSRFHeader(), { 'X-CSRFToken': 'token' });
  t.deepEqual(manager.getCSRFHeader('missing'), { 'X-CSRFToken': null });
});
