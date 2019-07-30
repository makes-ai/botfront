import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import FloatingIconButton from '../../nlu/common/FloatingIconButton';
import UtteranceInput from '../../utils/UtteranceInput';

const BotResponseContainer = (props) => {
    const {
        value, onDelete, onAbort, onChange, deletable,
    } = props;

    const [mode, setMode] = useState(value.text.trim() === '' ? 'edit' : 'view');
    const [input, setInput] = useState(value.text);

    useEffect(() => {
        setMode(value.text.trim() === '' ? 'edit' : 'view');
        setInput(value.text);
    }, [value]);

    const render = () => {
        if (mode === 'edit') {
            return (
                <UtteranceInput
                    placeholder='Bot says...'
                    fluid
                    value={input}
                    onChange={u => setInput(u)}
                    onValidate={() => {
                        if (input.trim() !== '') {
                            setMode('view');
                            onChange({ text: input });
                        }
                    }}
                />
            );
        }
        return (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events
            <div role='button' onClick={() => setMode('edit')} tabIndex={0}>
                {value.text}
            </div>
        );
    };

    return (
        <div className='utterance-container' mode={mode} agent='bot'>
            <div className='inner'>{render()}</div>
            {deletable && (
                <FloatingIconButton
                    icon='trash'
                    onClick={() => {
                        if (mode === 'edit') return onAbort();
                        return onDelete();
                    }}
                />
            )}
        </div>
    );
};

BotResponseContainer.propTypes = {
    deletable: PropTypes.bool,
    value: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onAbort: PropTypes.func.isRequired,
};

BotResponseContainer.defaultProps = {
    deletable: true,
};

export default BotResponseContainer;
