import React from 'react';

export interface IChatProps {
    chat: string;
    onSubmit: (message: string) => void;
}

export default class Chat extends React.Component<IChatProps> {
    public state = {
        chatmessage: '',
    };

    public render() {
        return <form className="chat" onSubmit={e => {
            e.preventDefault();
            this.props.onSubmit(this.state.chatmessage);
            this.setState({chatmessage: ''});
        }}>
            <input type="text" value={this.state.chatmessage}
                   onChange={e => this.setState({chatmessage: e.target.value})}/><input type="submit" value="Envoi"/>
            <textarea value={this.props.chat} readOnly={true}/>
        </form>;
    }
}
