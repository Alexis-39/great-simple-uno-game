import emojiLib from 'emoji';
import React from 'react';

export interface IEmojiProps {
    emoji?: string;
}

export default class Emoji extends React.Component<IEmojiProps> {
    public render() {
        if (!this.props.emoji) {
            return <span/>;
        } else {
            return <span dangerouslySetInnerHTML={{__html: emojiLib.unifiedToHTML(this.props.emoji)}}></span>;
        }
    }
}
