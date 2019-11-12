import request = require('request');
import queryString = require('query-string');

import { EventEmitter } from 'events';

import { VKResponse, VKWallGetResponse } from '../../interfaces';
import utils = require('../utils');
import { db } from './../../server';

let API_GATEWAY = 'https://api.vk.com/method';

export = class VKParser {
    private readonly token: string;
    private readonly groupID: number;

    ee = new EventEmitter();

    private lastCheckTime = db.get('vk.lastCheckTime').value();

    private call(method: string, action: string, data: any) {
        return new Promise((resolve, reject) => {
            request(`${API_GATEWAY}/${method}.${action}?${queryString.stringify(data)}&v=5.103&access_token=${this.token}`, { json: true }, (err, res, body: VKResponse) => {
                if (err) reject(err);
                if (!body) reject(res.statusCode);
                if (body.error) reject(body.error);
                resolve(body.response);
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
                    let chectTime = utils.getTimestamp();
                    if (data.items.length > 0)
                        if (data.items[0].date > this.lastCheckTime) data.items.forEach((post, i, arr) => {
                            if (post.date > this.lastCheckTime)
                                this.ee.emit('newPost', post);
                            if (i == arr.length - 1) {
                                this.lastCheckTime = chectTime;
                                db.set('vk.lastCheckTime', chectTime).write();
                            }
                        });
                })
                .catch(err => this.ee.emit('error', err));
        }, 1000 * 5);
    }
}