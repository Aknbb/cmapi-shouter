import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import store from './app/store';
import {Provider} from 'react-redux';
import {ThemeProvider, createMuiTheme} from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

const theme = createMuiTheme({
    palette: {
        type: 'dark',
        primary: {
            main: '#30677d',
        },
        secondary: {
            main: '#7d0304',
        },
        background: {
            default: '#1f1f1f',
            paper: '#1f1f1f',
        },
        text: {
            secondary: 'rgba(255, 255, 255, 0.9)',
        },
    },
    overrides: {
        MuiFormControlLabel: {
            label: {
                fontSize: '0.8rem',
            },
            root: {
                marginRight: 4,
            },
        },
    },
});

ReactDOM.render(
    <Provider store={store}>
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <App/>
        </ThemeProvider>
    </Provider>,
    document.getElementById('root')
);
