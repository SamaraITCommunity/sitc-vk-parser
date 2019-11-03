export interface VKResponse {
    error?: {
        error_msg: string;
        error_code: number;
        request_params: Array<{ key: string, value: string }>;
    },
    response?: any;
}

export interface VKWallGetResponse {
    count: number;
    items: Array<VKPost>;
}

export interface VKPost {
    id: number;
    from_id: number;
    owner_id: number;
    date: number;
    marked_as_ads: 0 | 1;
    post_type: 'post'
    text: string;
    can_pin: 0 | 1;
    attachments: Array<VKAttachment>;
}

export interface VKAttachment {
    type: 'podcast' | 'photo' | 'video' | 'audio' | 'doc' | 'graffiti' | 'link' | 'note' | 'app' | 'poll' | 'page' | 'album' | 'photos_list' | 'market' | 'market_album' | 'sticker' | 'pretty_cards' | 'event';
    [key: string]: any;
}

export interface VKPhoto extends VKAttachment {
    type: 'photo',
    photo: {
        id: number;
        album_id: number;
        owner_id: number;
        user_id: number;
        sizes: Array<{ type: string, url: string, width: number, height: number }>
        text: string;
        date: number;
        post_id: number;
        access_key: string;
    }
}

export interface VKAudio extends VKAttachment {
    type: 'audio',
    audio: {
        artist: string;
        id: number;
        owner_id: number;
        title: string;
        duration: number;
        access_key: string;
        ads: {
            content_id: string;
            duration: string;
            account_age_type: string;
            paid22: string;
        },
        is_licensed: boolean;
        track_code: string;
        url: string;
        date: number;
        album: {
            id: number;
            title: string;
            owner_id: number;
            access_key: string;
            thumb: {
                width: number;
                height: number;
                photo_34: string;
                photo_68: string;
                photo_135: string;
                photo_270: string;
                photo_300: string;
                photo_600: string;
            }
        },
        main_artists: [
            {
                name: string;
                is_followed: boolean;
                can_follow: boolean;
                domain: string;
                id: string;
            }
        ]
    }
}

export interface VKVideo extends VKAttachment {
    type: 'video';
    video: {
        first_frame?: Array<VKPhoto>;
        width?: 1920;
        height?: 1080;
        id: number;
        owner_id: number;
        title: string;
        duration: number;
        description: string;
        date: number;
        comments: number;
        views: number;
        local_views: number;
        image: VKPhoto;
        is_favorite: boolean;
        access_key: string;
        platform: 'YouTube' | '';
        can_edit: 0 | 1;
        can_add: 0 | 1;
        track_code: string;
        type: 'video';
    }
}

export interface VKDoc extends VKAttachment {
    type: 'doc';
    doc: {
        id: number;
        owner_id: number;
        title: string;
        size: number;
        ext: string;
        url: string;
        date: number;
        type: number;
        preview: { [key: string]: any; }
        is_licensed: 0 | 1;
        access_key: string;
    }
}

export interface VKPodcast extends VKAttachment {
    type: 'podcast';
    podcast: VKAudio['audio'];
}

export interface VKLink extends VKAttachment {
    type: 'link';
    link: {
        url: string;
        title: string;
        caption: string;
        description?: string;
        photo: VKPhoto['photo'];
        button: {
            title: string;
            action: {
                type: 'open_url' | '',
                url: string;
            }
        }
    }
}