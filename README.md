Axios Request manager
=========================================================

[![Build Status](https://travis-ci.org/kayak/axios-request-manager.png?branch=master)](https://travis-ci.org/kayak/axios-request-manager)
[![Coverage Status](https://coveralls.io/repos/github/kayak/axios-request-manager/badge.svg?branch=master)](https://coveralls.io/github/kayak/axios-request-manager?branch=master)
[![David](https://img.shields.io/david/kayak/axios-request-manager.svg)](https://david-dm.org/kayak/axios-request-manager)
[![David](https://img.shields.io/david/dev/kayak/axios-request-manager.svg)](https://david-dm.org/kayak/axios-request-manager)


Manager that creates and stores Axios Cancel tokens. For more information on Axios Cancel tokens, please read the following [Axios documentation](https://github.com/axios/axios#cancellation)

## Installing

Using npm:

```bash
$ npm install axios-request-manager
```

## Examples

Create and cancel a single Axios request:

```js
import axios from 'axios';
import RequestManager from 'request-manager';

const manager = new RequestManager();
const cancelToken = manager.getNextToken('users');

axios.get('/api/users', { cancelToken });
manager.cancelAxios('users', 'User aborted the operation');
```

You can also group your requests and cancel them all in once using the cancel key prefix:

```js
import axios from 'axios';
import RequestManager from 'request-manager';

const manager = new RequestManager();
const getCancelToken = manager.getNextToken('users/get');
const putCancelToken = manager.getNextToken('users/put');

axios.get('/api/users', { cancelToken: getCancelToken });
axios.put('/api/users', { cancelToken: putCancelToken });

manager.cancelAllRequestsWithPrefix('users');
```

If you have an autosave feature on your forms you can cancel previous requests and execute a new ones like so:

```js
import axios from 'axios';
import RequestManager from 'request-manager';

const manager = new RequestManager();
const cancelToken = manager.cancelAxiosAndGetNextToken('form/save');

axios.get('/api/form', { cancelToken });
```

## License

Copyright 2016 KAYAK Germany, GmbH

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Crafted with ♥ in Berlin.