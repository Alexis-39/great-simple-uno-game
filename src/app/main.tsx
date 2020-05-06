import React from 'react';
import DocumentTitle from 'react-document-title';
import {render} from 'react-dom';
import Tarot from '../views/Tarot';

render(
    <DocumentTitle title="UNO en ligne">
        <Tarot/>
    </DocumentTitle>
    , document.getElementById('content'));
