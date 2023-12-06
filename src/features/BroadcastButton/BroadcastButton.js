import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import EditorUtils from '../JSONEditor/EditorUtils';
import {useSelector} from 'react-redux';
import {getSelectedChannel} from '../MessageForms/MessageFormsSlice';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import Slide from '@material-ui/core/Slide/Slide';

const useStyles = makeStyles({
    button: {
        padding: '14px 14px',
        '&:active': {
            transform: 'translateY(3px)',
        },
    },
});

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function BroadcastButton() {
    const classes = useStyles();
    const channel = useSelector(getSelectedChannel).value;
    const [supportOwf, setSupportOwf] = useState(false);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const sendMessage = () => {
        try {
            if (supportOwf) {
                window.OWF.Eventing.publish(channel, EditorUtils.getMessageAsJson());
            } else {
                const messagePayload = {channel, message: {...EditorUtils.getMessageAsJson()}};
                if (window.parent) {
                    window.parent.postMessage(messagePayload, '*');
                }
                window.postMessage(messagePayload, '*');
            }
            setShowSnackbar(true);
        } catch (e) {
            console.log(e);
            setShowSnackbar(false);
        }
    };

    const handleClose = () => {
        setShowSnackbar(false);
    };

    useEffect(() => {
        window.OWF.ready(function () {
            setSupportOwf(true);
        });
    }, []);

    return (
        <div>
            <Button variant="contained"
                    color="primary"
                    className={classes.button}
                    disabled={!channel}
                    onClick={sendMessage}
            >
                Broadcast
            </Button>
            <Snackbar open={showSnackbar}
                      anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                      autoHideDuration={1000}
                      TransitionComponent={Transition}
                      disableWindowBlurListener
                      onClose={handleClose}>
                <Alert elevation={6} variant="filled"
                       onClose={handleClose}
                       severity="success"
                       style={{backgroundColor: '#037133'}}
                >
                    Broadcast success!
                </Alert>
            </Snackbar>
        </div>
    );
}

export default BroadcastButton;
