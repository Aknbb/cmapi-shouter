import React from 'react';
import {useSelector} from 'react-redux';
import SpeedDial from '@material-ui/lab/SpeedDial/SpeedDial';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction/SpeedDialAction';
import DeleteForever from '@material-ui/icons/DeleteForever';
import SaveIcon from '@material-ui/icons/Save';
import Refresh from '@material-ui/icons/Refresh';
import GetApp from '@material-ui/icons/GetApp';
import LeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import {getLabels, getSelectedChannel, getSelectedTitle} from '../MessageForms/MessageFormsSlice';
import EditorUtils from '../JSONEditor/EditorUtils';
import RestActionDialog from '../RestActionDialog/RestActionDialog';

function DialButton() {
    const [open, setOpen] = React.useState(false);
    const [showDialog, setShowDialog] = React.useState(false);
    const [request, setRequest] = React.useState({data: {}, type: 'upload'});
    const channel = useSelector(getSelectedChannel).value;
    const title = useSelector(getSelectedTitle).value;
    const labels = useSelector(getLabels);

    const handleClose = () => {
        setOpen(false);
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const openDialog = () => {
        setShowDialog(true);
    };

    const closeDialog = () => {
        setShowDialog(false);
    };

    const downloadMessage = () => {
        const content = {
            channel,
            title,
            labels,
            message: EditorUtils.getMessageAsJson(),
        };
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(content, null, 2));
        const fileName = title ? channel + '-' + title : channel;
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute('href', dataStr);
        downloadAnchorNode.setAttribute('download', fileName + '.json');
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const uploadMessage = () => {
        const data = {
            channel,
            title,
            labels,
            message: EditorUtils.getMessageAsJson(),
        };
        setRequest({data, type: 'upload'});
        openDialog();
    };

    const deleteMessage = () => {
        const data = {
            channel,
            title,
        };
        setRequest({data, type: 'delete'});
        openDialog();
    };

    const refreshMessages = () => {
        window.location.reload();
    };

    const actions = [
        {
            icon: <SaveIcon/>,
            name: 'Save',
            disabled: (!channel || !Object.keys(EditorUtils.getMessageAsJson()).length || !title),
            onClick: uploadMessage,
        },
        {icon: <DeleteForever/>, name: 'Delete', disabled: (!channel || !title), onClick: deleteMessage},
        {
            icon: <GetApp/>,
            name: 'Download Message',
            disabled: (!channel || !Object.keys(EditorUtils.getMessageAsJson()).length),
            onClick: downloadMessage,
        },
        {icon: <Refresh/>, name: 'Refresh Messages', disabled: false, onClick: refreshMessages},
    ];

    return (
        <div>
            <SpeedDial
                ariaLabel="SpeedDial example"
                icon={<LeftIcon/>}
                onClose={handleClose}
                onOpen={handleOpen}
                open={open}
                direction="left"
            >
                {actions.map((action) => (
                    <SpeedDialAction
                        key={action.name}
                        icon={action.icon}
                        tooltipTitle={action.name}
                        FabProps={{disabled: action.disabled, onClick: action.onClick}}
                    />
                ))}
            </SpeedDial>
            <RestActionDialog open={showDialog} closeDialog={closeDialog} request={request}/>
        </div>
    );
}

export default DialButton;
