import React, {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import MessageForms from './features/MessageForms/MessageForms';
import {toogleSearhDialogOpen} from './features/MessageForms/MessageFormsSlice';
import Grid from '@material-ui/core/Grid';
import JSONEditorComponent from './features/JSONEditor/JSONEditor';
import BroadcastButton from './features/BroadcastButton/BroadcastButton';
import DialButton from './features/DialButton/DialButton';

function App() {
    const dispatch = useDispatch();
    useEffect(() => {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.code === 'KeyF') {
                dispatch(toogleSearhDialogOpen());
            }
        });
    }, []);  // eslint-disable-line react-hooks/exhaustive-deps
    return (
        <div style={{overflow: 'hidden'}}>
            <MessageForms/>
            <Grid container
                  direction="column"
                  justify="space-evenly">
                <Grid item>
                    <JSONEditorComponent/>
                </Grid>
                <Grid container style={{marginTop: 4, minHeight: 66}}>
                    <Grid item xs={3}>
                        <BroadcastButton/>
                    </Grid>
                    <Grid item xs={9}>
                        <DialButton/>
                    </Grid>
                </Grid>
            </Grid>
        </div>
    );
}

export default App;
