import React, {useEffect, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import Grid from '@material-ui/core/Grid';
import Autocomplete from '@material-ui/lab/Autocomplete/Autocomplete';
import TextField from '@material-ui/core/TextField/TextField';
import Chip from '@material-ui/core/Chip';
import {
    updateTitles,
    updateLabels,
    getChannels,
    getTitles,
    getLabels,
    fetchMessages,
    getSelectedTitle,
    setSelectedTitle,
    setLabels,
    setSelectedChannel,
    getSelectedChannel,
    setSearchDialogOpen,
    getSearchDialogOpen,
} from './MessageFormsSlice';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchDialog from '../SearchDialog/SearchDialog';
import searchFile from '../../assets/searchFile.svg';

function MessageForms() {
    const channels = useSelector(getChannels);
    const titles = useSelector(getTitles);
    const labels = useSelector(getLabels);
    const selectedTitle = useSelector(getSelectedTitle);
    const selectedChannel = useSelector(getSelectedChannel);
    const open = useSelector(getSearchDialogOpen);
    const dispatch = useDispatch();
    const searchButtonRef = useRef(null);
    useEffect(() => {
        dispatch(fetchMessages());
        searchButtonRef.current.setAttribute('title', 'Find (Ctrl-Shift-F)');
    }, []);  // eslint-disable-line react-hooks/exhaustive-deps

    const handleClickOpen = () => {
        dispatch(setSearchDialogOpen(true));
    };
    const handleClose = () => {
        dispatch(setSearchDialogOpen(false));
    };

    return (
        <div>
            <Grid container spacing={1}>
                <Grid item xs={12} style={{marginTop: 6}}>
                    <Autocomplete
                        id="channel-input"
                        freeSolo
                        size="small"
                        options={channels}
                        inputValue={selectedChannel.inputValue}
                        onInputChange={(event, selectedChannel) => {
                            dispatch(updateTitles(selectedChannel));
                            dispatch(setSelectedTitle({value: null, inputValue: ''}));
                            dispatch(setSelectedChannel({value: selectedChannel, inputValue: selectedChannel}));
                        }}
                        renderInput={(params) => {
                            return (<div>
                                    <TextField {...params}
                                               label="Channel Name"
                                               margin="none"
                                               variant="outlined"
                                               required
                                               placeholder="Select/Write Channel Name"/>
                                    <InputAdornment position="end"
                                                    style={{position: 'relative', bottom: 20, float: 'right'}}>
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            ref={searchButtonRef}
                                            onClick={(event) => {
                                                handleClickOpen();
                                                event.stopPropagation();
                                            }}>
                                            <Icon>
                                                <img alt='' src={searchFile} height={20} width={20}
                                                     style={{filter: 'invert(1) sepia(1)'}}/>
                                            </Icon>
                                        </IconButton>
                                    </InputAdornment>
                                </div>
                            );
                        }}
                    />
                </Grid>
                <Grid item xs={6}>
                    <Autocomplete
                        id="title-input"
                        freeSolo
                        size="small"
                        options={titles}
                        inputValue={selectedTitle.inputValue}
                        onInputChange={(event, selectedTitle) => {
                            dispatch(setSelectedTitle({value: selectedTitle, inputValue: selectedTitle}));
                            dispatch(updateLabels(selectedTitle));
                        }}
                        renderInput={(params) => (
                            <TextField {...params} label="Message Title" margin="none" variant="outlined"
                                       placeholder="Select/Write Message Title"/>
                        )}

                    />
                </Grid>
                <Grid item xs={6}>
                    <Autocomplete
                        multiple
                        size="small"
                        id="labels-input"
                        limitTags={2}
                        freeSolo
                        autoSelect
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip variant="outlined" size="small" label={option} {...getTagProps({index})} />
                            ))
                        }
                        renderInput={(params) => (
                            <TextField {...params} label="Labels" variant="outlined" margin="none"/>
                        )}
                        onChange={(event, value) => {
                            dispatch(setLabels(value));
                        }}
                        options={labels}
                        value={labels}/>
                </Grid>
            </Grid>
            <SearchDialog open={open}
                          handleClose={handleClose}
            />
        </div>
    );
}

export default MessageForms;

