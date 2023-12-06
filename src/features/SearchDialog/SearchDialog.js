/* eslint-disable */
import React, {useState, useEffect, useRef} from 'react';
import {useDispatch} from 'react-redux';
import Dialog from '@material-ui/core/Dialog/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import {FixedSizeList} from 'react-window';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import AutoSizer from 'react-virtualized-auto-sizer';
import Highlighter from 'react-highlighter';
import useDoubleClick from 'use-double-click';
import {useSelector} from 'react-redux';
import {getMessageSearchList} from '../MessageForms/MessageFormsSlice';
import * as JsSearch from 'js-search';
import JSONEditor from '../JSONEditor/JSONEditor';
import SearchUtils from './SearchUtil';
import {onSearchResultSelected} from '../MessageForms/MessageFormsSlice';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

function SearchDialog(props) {
    const dispatch = useDispatch();
    const {handleClose, open} = props;
    const items = useSelector(getMessageSearchList);
    const downPress = SearchUtils.useKeyPress('ArrowDown');
    const upPress = SearchUtils.useKeyPress('ArrowUp');
    const enterPress = SearchUtils.useKeyPress('Enter');
    const [cursor, setCursor] = useState(0);
    const [hovered, setHovered] = useState(undefined);
    const [searchEngine, setSearchEngine] = useState(undefined);
    const [searchResult, setSearchResult] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [previewText, setPreviewText] = useState('');
    const [focusRange, setFocusRange] = useState(undefined);
    const [matchCaseOption, setMatchCaseOption] = useState(false);
    const [wordsOption, setWordsOption] = useState(false);

    useEffect(() => {
        if (items && items.length) {
            const newSearchEngine = new JsSearch.Search('id');
            newSearchEngine.searchIndex = new JsSearch.UnorderedSearchIndex();
            newSearchEngine.indexStrategy = new JsSearch.AllSubstringsIndexStrategy();
            newSearchEngine.addIndex('channel');
            newSearchEngine.addIndex('title');
            newSearchEngine.addIndex('labels');
            newSearchEngine.addIndex('message');
            newSearchEngine.addDocuments(items);
            setSearchEngine(newSearchEngine);
        }
    }, [items]);
    useEffect(() => {
        if (searchResult.length && downPress) {
            setCursor(prevState => prevState < searchResult.length - 1 ? prevState + 1 : prevState);
        }
    }, [downPress]);
    useEffect(() => {
        if (searchResult.length && upPress) {
            setCursor(prevState => (prevState > 0 ? prevState - 1 : prevState));
        }
    }, [upPress]);
    useEffect(() => {
        if (searchResult.length && open && enterPress) {
            dispatch(onSearchResultSelected(searchResult[cursor]));
            handleClose();
        }
    }, [cursor, enterPress]);
    useEffect(() => {
        if (searchResult.length && hovered) {
            setCursor(searchResult.findIndex(i => i.id === hovered.id));
        }
    }, [hovered]);

    useEffect(() => {
        if (searchResult.length && searchResult[cursor]) {
            const searchResultPayload = searchResult[cursor];
            setPreviewText(searchResultPayload.previewMessage);
            setFocusRange(searchResultPayload.range);
        }
    }, [cursor, searchResult]);

    useEffect(() => {
        if (searchResult.length) {
            setCursor(0);
        }
    }, [searchResult]);

    useEffect(() => {
        if (searchText.length) {
            triggerSearch();
        }
    }, [wordsOption, matchCaseOption]);

    const triggerSearch = (text = searchText) => {
        const searchDocuments = searchEngine.search(text);
        const searchResult = SearchUtils.getDetailedSearchResults(searchDocuments, text, matchCaseOption, wordsOption);
        setSearchResult(searchResult);
    };

    function RenderRow(props) {
        const {index, style} = props;
        const listRef = useRef();
        useDoubleClick({
            onSingleClick: e => {
                return setHovered(searchResult[index]);
            },
            onDoubleClick: e => {
                setHovered(searchResult[index]);
                dispatch(onSearchResultSelected(searchResult[index]));
                handleClose();
            },
            ref: listRef,
            latency: 150,
        });
        const row = searchResult[index];
        return (
            <ListItem dense
                      disableGutters
                      style={{...style, cursor: 'pointer'}}
                      key={index}
                      ref={listRef}
                      selected={index === cursor}
                      divider
            >
                <ListItemText style={{width: '60%'}}>
                    <Highlighter search={searchText}
                                 style={{userSelect: 'none'}}
                                 matchStyle={{backgroundColor: 'green'}}>
                        {row.searchResultText}
                    </Highlighter>
                </ListItemText>
                <ListItemText disableTypography style={{width: '40%'}}>
                    <Grid container
                          direction="column"
                          alignItems="center"
                          justify="center"
                          style={{float: 'right'}}
                    >
                        <Grid item>
                            <span style={{userSelect: 'none'}}>{row.channel}</span>
                        </Grid>
                        <Grid item>
                            <span style={{userSelect: 'none'}}>{row.title}</span>
                        </Grid>
                    </Grid>
                </ListItemText>
            </ListItem>
        );
    }

    const SearchItems = () => {
        return (<Grid item xs={12} style={{minHeight: 150, minWidth: 300}}>
            <AutoSizer>
                {({height, width}) => <FixedSizeList
                    height={height}
                    itemCount={searchResult.length}
                    itemSize={40}
                    width={width}
                    initialScrollOffset={cursor * 35}
                >
                    {RenderRow}
                </FixedSizeList>}
            </AutoSizer>
        </Grid>);
    };

    const noResult = !searchResult.length;
    return (
        <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" maxWidth="sm" fullWidth open={open}>
            <DialogTitle disableTypography onClose={handleClose}
                         style={{padding: '0px 6px 0px 12px', overflow: 'hidden'}}>
                <Grid container justify="space-between" alignItems="center">
                    <Grid item xs={5}>
                        <Typography style={{fontSize: '1.1rem', userSelect: 'none'}}>Find in messages</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <FormGroup row
                                   style={{justifyContent: 'flex-end'}}>
                            <FormControlLabel
                                control={<Checkbox checked={matchCaseOption}
                                                   color="primary"
                                                   name="checkedA"
                                                   onChange={() => setMatchCaseOption(!matchCaseOption)}
                                                   size="small"/>}
                                label="Math Case"
                                style={{marginRight: 12}}
                            />
                            <FormControlLabel
                                control={<Checkbox checked={wordsOption}
                                                   color="primary"
                                                   name="checkedA"
                                                   onChange={() => setWordsOption(!wordsOption)}
                                                   size="small"/>}
                                label="Words"
                            />
                        </FormGroup>
                    </Grid>
                    <Grid item xs={1}>
                        <IconButton onClick={handleClose}
                                    style={{marginBottom: 2, paddingLeft: 8}}

                        >
                            <CloseIcon/>
                        </IconButton>
                    </Grid>
                </Grid>
            </DialogTitle>
            <DialogContent dividers style={{paddingTop: 0, minHeight: 559}}>
                <Grid container
                      direction="row"
                      justify="center"
                      alignItems="center"
                >
                    <Grid item xs={12}
                          style={{marginBottom: 15}}>
                        <TextField id="standard-search"
                                   label="Search Text"
                                   type="search"
                                   fullWidth
                                   autoFocus
                                   value={searchText}
                                   onChange={(event) => {
                                       const searchText = event.target.value;
                                       setSearchText(searchText);
                                       triggerSearch(searchText);
                                   }}/>
                    </Grid>
                    {noResult ?
                        <Grid item>
                            <Typography style={{position: 'relative', top: '217px', userSelect: 'none'}}>
                                Nothing to show
                            </Typography>
                        </Grid>
                        :
                        <SearchItems/>
                    }
                </Grid>
                {noResult ?
                    undefined
                    :
                    <DialogContent dividers style={{marginTop: 30, marginLeft: -14, marginRight: -12}}>
                        <JSONEditor readOnly text={previewText} searchText={searchText} focusRange={focusRange}/>
                    </DialogContent>
                }
            </DialogContent>
        </Dialog>
    );
}

export default SearchDialog;
