import { createSlice } from '@reduxjs/toolkit';
import EditorUtils from '../JSONEditor/EditorUtils';
import axios from 'axios';

export const messageFormSlice = createSlice({
  name: 'messageForms',
  initialState: {
    messages: {},
    channels: [],
    titles: [],
    labels: [],
    selectedTitle: { value: null, inputValue: '' },
    selectedChannel: { value: null, inputValue: '' },
    messageSearchList: [],
    searchDialogOpen: false,
  },
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload.messages;
    },
    setChannels: (state, action) => {
      state.channels = action.payload;
    },
    setSelectedChannel: (state, action) => {
      state.selectedChannel = action.payload;
    },
    setSelectedTitle: (state, action) => {
      state.selectedTitle = action.payload;
    },
    setTitles: (state, action) => {
      state.titles = action.payload;
      state.labels = [];
    },
    setLabels: (state, action) => {
      state.labels = action.payload;
    },
    setMessageSearchList: (state, action) => {
      state.messageSearchList = action.payload;
    },
    setSearchDialogOpen: (state, action) => {
      state.searchDialogOpen = action.payload;
    },
  },
});

export const { setMessages, setChannels, setTitles, setLabels, setSelectedChannel, setSelectedTitle, setMessageSearchList, setSearchDialogOpen } = messageFormSlice.actions;


export let REST_URL = '';

export const fetchMessages = () => dispatch => {
  fetch('config.json').then(response => response.json()).then(data => {
    REST_URL = data.REST_ENTRY_POINT;
    axios.get(REST_URL + '/messages').then((response) => {
      const data = response.data;
      dispatch(setMessages(data));
      dispatch(updateChannels(data));
      let id = 0;
      const messages = [];
      Object.keys(data.messages).forEach(channelName => {
        const channelMessages = data.messages[channelName];
        Object.keys(channelMessages).forEach(messageTitle => {
          const payload = channelMessages[messageTitle];
          messages.push({
            id,
            channel: channelName,
            title: messageTitle,
            labels: payload.labels,
            message: JSON.stringify(payload.message),
          });
          id++;
        });
      });
      dispatch(setMessageSearchList(messages));
    })
      .catch((error) => {
        console.log(error);
      });
  }).catch(e => console.log(e));
};

export const updateChannels = (messages) => dispatch => {
  const channels = Object.keys(messages.messages).sort((a, b) => a.localeCompare(b));
  const result = channels.length ? channels : [];
  dispatch(setChannels(result));
};

export const updateTitles = (channel) => (dispatch, getState) => {
  const messages = getMessages(getState());
  const channelPayload = messages[channel] || {};
  const titles = Object.keys(channelPayload).sort((a, b) => a.localeCompare(b));
  dispatch(setSelectedChannel(channel));
  dispatch(setTitles(titles));
};

export const updateLabels = (title) => (dispatch, getState) => {
  const state = getState();
  const messages = getMessages(state);
  const selectedChannel = getSelectedChannel(state).value;
  const payload = messages[selectedChannel] && messages[selectedChannel][title];
  if (payload) {
    const labels = payload.labels || [];
    dispatch(setLabels(labels));
    EditorUtils.setTextAsJson(payload.message);
  } else {
    dispatch(setLabels([]));
  }
};

export const onSearchResultSelected = (result) => (dispatch, getState) => {
  const state = getState();
  const channel = result.channel;
  const title = result.title;
  const labels = result.labels;
  dispatch(setSelectedChannel({ value: channel, inputValue: channel }));
  dispatch(setSelectedTitle({ value: title, inputValue: title }));
  dispatch(setLabels(labels));
  const messages = getMessages(state);
  const payload = messages[channel] && messages[channel][title];
  EditorUtils.setTextAsJson(payload.message);
};

export const toogleSearhDialogOpen = () => (dispatch, getState) => {
  const state = getSearchDialogOpen(getState());
  dispatch(setSearchDialogOpen(!state));
};

export const getMessages = state => state.messageForms.messages;
export const getChannels = state => state.messageForms.channels;
export const getSelectedChannel = state => state.messageForms.selectedChannel;
export const getSelectedTitle = state => state.messageForms.selectedTitle;
export const getTitles = state => state.messageForms.titles;
export const getLabels = state => state.messageForms.labels;
export const getMessageSearchList = state => state.messageForms.messageSearchList;
export const getSearchDialogOpen = state => state.messageForms.searchDialogOpen;

export default messageFormSlice.reducer;
