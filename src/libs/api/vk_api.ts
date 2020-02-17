import request = require('request');
import queryString = require('query-string');

import { EventEmitter } from 'events';

import { VKResponse, VKWallGetResponse } from '../../interfaces';
import { db } from '../../server';
import { getTimestamp } from '../utils';
import config = require('../../config');

let API_GATEWAY = 'https://api.vk.com/method';

export = class VKParser {
    private readonly token: string;
    private readonly groupID: number;

    ee = new EventEmitter();

    private lastCheckTime = db.get('vk.lastCheckTime').value();

    private call(method: string, action: string, data: any) {
        return new Promise((resolve, reject) => {
            request(`${API_GATEWAY}/${method}.${action}?${queryString.stringify(data)}&v=5.103&access_token=${this.token}`, { json: true }, (err, res, body: VKResponse) => {
                if (!res) reject('Не достучались до VK. Скорее-всего, Ваш провайдер их блокирует');
                if (err) reject(err);
                else if (!body) reject('Не достучались до VK. Скорее-всего, Ваш провайдер их блокирует');
                else if (body.error) reject(body.error);
                else resolve(body.response);
            });
        });
    }

    getPosts(values: {
        /** owner_id обязано быть отрицательным! */
        owner_id: number;
        count?: number;
        filter?: 'owner';
        extended?: 0 | 1;
        fields?: string;
    }) {
        return new Promise<VKWallGetResponse>((resolve, reject) => {
            this.call('wall', 'get', values)
                .then((data: VKWallGetResponse) => resolve(data))
                .catch(err => reject(err));
        });
    }

    constructor(values: { token: string, groupID: number }) {
        this.token = values.token;
        this.groupID = -Math.abs(values.groupID);

        setTimeout(() => {
            this.ee.emit('ready');
        }, 1000 * 2);

        setInterval(() => {
            this.getPosts({ owner_id: this.groupID })
                .then(data => {
          //console.log(`Get posts received data: ${JSON.stringify(data)}.`);
                    let checkTime = getTimestamp();
                    console.log(`Check Time: ${JSON.stringify(checkTime)} and items length is ${data.items.length} and last check time is: ${this.lastCheckTime}.`);
                    if (data.items.length > 0)
                        console.log('There are items.');
                        data.items.forEach((post, i, arr) => {
                          if (post.date > this.lastCheckTime){
                              console.log(`New post: ${JSON.stringify(post)}.`);
                                this.ee.emit('newPost', post);
          } else {
                              console.log(`Old post: ${JSON.stringify(post)}.`);
          }
                            if (i == arr.length - 1) {
                                this.lastCheckTime = checkTime;
                                db.set('vk.lastCheckTime', checkTime).write();
                            }
                        });
                })
                .catch(err => this.ee.emit('error', err));
        }, 1000 * 60 * config.VK_CHECK_RATE);
    }
}
