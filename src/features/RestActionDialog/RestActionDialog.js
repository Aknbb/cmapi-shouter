import React from 'react';
import Dialog from '@material-ui/core/Dialog/Dialog';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import SendIcon from '@material-ui/icons/Send';
import CloseIcon from '@material-ui/icons/Close';
import Grid from '@material-ui/core/Grid';
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle';
import Slide from '@material-ui/core/Slide';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContentText from '@material-ui/core/DialogContentText';
import CircularProgress from '@material-ui/core/CircularProgress';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import Typography from '@material-ui/core/Typography';
import Fab from '@material-ui/core/Fab';
import axios from 'axios';
import Cookies from 'universal-cookie';
import {REST_URL} from '../MessageForms/MessageFormsSlice';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide key='restSlide' direction="up" ref={ref} {...props} />;
});

function RestActionDialog(props) {
    const {open, closeDialog, request} = props;
    const [showPassword, setShowPassword] = React.useState(false);
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [rememberMe, setRememberMe] = React.useState(false);
    const [pending, setPending] = React.useState(false);
    const [requestFinished, setRequestFinished] = React.useState(false);
    const [requestSuccess, setRequestSuccess] = React.useState(true);
    const [authFailed, setAuthFailed] = React.useState(false);
    const sendRequest = () => {
        let _username = username;
        let _password = password;
        setPending(true);
        const cookieUserPassword = new Cookies().get('rqstlgn');
        if (cookieUserPassword) {
            _username = cookieUserPassword.split(';')[0];
            _password = cookieUserPassword.split(';')[1];
        }
        if (request.type === 'upload') {
            axios.post(REST_URL + '/messages/addMessage', request.data, {
                auth: {
                    username: _username,
                    password: _password,
                },
            }).then((response) => {
                setPending(false);
                setRequestFinished(true);
                setRequestSuccess(true);
                if (rememberMe) {
                    new Cookies().set('rqstlgn', username + ';' + password, {path: '/', maxAge: 21600});
                }
            })
                .catch((error) => {
                    setPending(false);
                    if (error.response && error.response.status === 401) {
                        setAuthFailed(true);
                    } else {
                        setRequestFinished(true);
                        setRequestSuccess(false);
                    }
                });
        } else if (request.type === 'delete') {
            axios.delete(REST_URL + '/messages/' + request.data.channel + '/' + request.data.title, {
                auth: {
                    username: _username,
                    password: _password,
                },
            }).then((data) => {
                setPending(false);
                setRequestFinished(true);
                setRequestSuccess(true);
            })
                .catch((err) => {
                    setPending(false);
                    setRequestFinished(true);
                    setRequestSuccess(false);
                });
        } else {
            setPending(false);
        }
    };

    const handleClose = () => {
        setRememberMe(false);
        setUsername('');
        setPassword('');
        setPending(false);
        setRequestFinished(false);
        closeDialog();
    };

    const ConfirmQuestion = () => (
        <div style={{minHeight: 220}}>
            <DialogTitle style={{marginTop: 20}}>{'Confirmation'}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure want to continue?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    color="secondary"
                    size='medium'
                    onClick={() => closeDialog()}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    size='medium'
                    onClick={sendRequest}
                >
                    OK
                </Button>
            </DialogActions>
        </div>
    );

    const PendingScreen = () => (
        <Grid container
              justify="center"
              alignItems="center"
              style={{
                  minHeight: 220,
              }}
        >
            <CircularProgress/>
        </Grid>
    );

    const SuccessScreen = () => (
        <Grid container
              direction='column'
              style={{
                  minHeight: 220,
              }}
        >
            <Grid container
                  justify="center"
                  alignItems="center"
                  style={{
                      minHeight: 110,
                      backgroundColor: '#037133',
                  }}

            >
                <CheckCircleOutlineIcon style={{fontSize: '4.5rem'}}/>
            </Grid>
            <Grid container
                  align="center"
                  justify="center"
                  alignItems="center"
            >
                <Grid item xs={12}>
                    <Typography variant='h5' style={{userSelect: 'none'}}>
                        Great!
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant='subtitle1' style={{userSelect: 'none'}}>
                        Request is success.
                    </Typography>
                </Grid>
                <Grid item xs={12} style={{marginTop: 10}}>
                    <Fab color="primary"
                         variant="extended"
                         size='small'
                         onClick={() => {
                             handleClose();
                             window.location.reload();
                         }}
                    >
                        <CloseIcon fontSize='small'/>
                        <span style={{fontSize: '0.75rem', marginTop: 2}}>Close</span>
                    </Fab>
                </Grid>
            </Grid>
        </Grid>
    );

    const FailScreen = () => (
        <Grid container
              direction='column'
              style={{
                  minHeight: 220,
              }}
        >
            <Grid container
                  justify="center"
                  alignItems="center"
                  style={{
                      minHeight: 110,
                      backgroundColor: '#640a02',
                  }}

            >
                <HighlightOffIcon style={{fontSize: '4.5rem'}}/>
            </Grid>
            <Grid container
                  align="center"
                  justify="center"
                  alignItems="center"
            >
                <Grid item xs={12}>
                    <Typography variant='h5' style={{userSelect: 'none'}}>
                        Oh no!
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant='subtitle1' style={{userSelect: 'none'}}>
                        Request is failed.
                    </Typography>
                </Grid>
                <Grid item xs={12} style={{marginTop: 10}}>
                    <Fab color="primary"
                         variant="extended"
                         size='small'
                         onClick={handleClose}
                    >
                        <CloseIcon size='small'/>
                        <span style={{fontSize: '0.75rem', marginTop: 2}}>Close</span>
                    </Fab>
                </Grid>
            </Grid>
        </Grid>
    );

    return (
        <Dialog onClose={closeDialog}
                maxWidth="sm"
                TransitionComponent={Transition}
                keepMounted
                fullWidth
                key='restDialog'
                open={open}>
            {pending
                ?
                <PendingScreen/>
                :
                [
                    requestFinished
                        ?
                        [
                            requestSuccess
                                ?
                                <SuccessScreen/>
                                :
                                <FailScreen/>,
                        ]
                        :
                        [
                            new Cookies().get('rqstlgn')
                                ?
                                <ConfirmQuestion/>
                                :
                                // todo: move to another component, fix focus bug after move.
                                <DialogContent style={{minHeight: 220}}>
                                    <div
                                        style={{
                                            position: 'absolute',
                                            left: '50%',
                                            top: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            width: '85%',
                                        }}
                                    >
                                        <Grid container
                                              direction="column"
                                              justify="center"
                                              alignItems="center"
                                              spacing={3}
                                        >
                                            <Grid item style={{width: '100%'}}>
                                                <FormControl variant="outlined" style={{width: '100%'}}>
                                                    <InputLabel htmlFor="outlined-username">Username</InputLabel>
                                                    <OutlinedInput
                                                        id="outlined-username"
                                                        type={'text'}
                                                        error={authFailed}
                                                        value={username}
                                                        onChange={event => {
                                                            setUsername(event.target.value);
                                                            setAuthFailed(false);
                                                        }}
                                                        labelWidth={70}
                                                    />
                                                </FormControl>
                                            </Grid>
                                            <Grid item style={{width: '100%', marginTop: -10}}>
                                                <FormControl variant="outlined" style={{width: '100%'}}>
                                                    <InputLabel
                                                        htmlFor="outlined-adornment-password">Password</InputLabel>
                                                    <OutlinedInput
                                                        id="outlined-adornment-password"
                                                        type={showPassword ? 'text' : 'password'}
                                                        value={password}
                                                        error={authFailed}
                                                        onChange={event => {
                                                            setPassword(event.target.value);
                                                            setAuthFailed(false);
                                                        }}
                                                        endAdornment={
                                                            <InputAdornment position="end">
                                                                <IconButton
                                                                    aria-label="toggle password visibility"
                                                                    onClick={() => setShowPassword(!showPassword)}
                                                                    edge="end"
                                                                >
                                                                    {showPassword ? <Visibility/> : <VisibilityOff/>}
                                                                </IconButton>
                                                            </InputAdornment>
                                                        }
                                                        labelWidth={70}
                                                    />
                                                </FormControl>
                                            </Grid>
                                            <Grid container justify="space-between"
                                                  style={{paddingLeft: 12, paddingRight: 12}}>
                                                <Grid item>
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={rememberMe}
                                                                onChange={() => setRememberMe(!rememberMe)}
                                                                color="primary"
                                                            />
                                                        }
                                                        label="Remember me"
                                                        style={{userSelect: 'none'}}
                                                    />
                                                </Grid>
                                                {authFailed ? <Typography style={{
                                                    marginTop: 12,
                                                    marginRight: 10,
                                                    color: '#f44336',
                                                    userSelect: 'none',
                                                    fontSize: '0.8rem',
                                                }}>Authentication Failed</Typography> : undefined}
                                                <Grid item>
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        endIcon={<SendIcon/>}
                                                        style={{padding: 10}}
                                                        onClick={sendRequest}
                                                    >
                                                        Send
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </div>
                                </DialogContent>,
                        ],
                ]
            }
        </Dialog>
    );
}

export default RestActionDialog;
