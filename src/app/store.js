import {configureStore} from '@reduxjs/toolkit';
import messageFormsReducer from '../features/MessageForms/MessageFormsSlice';

export default configureStore({
    reducer: {
        messageForms: messageFormsReducer,
    },
});
