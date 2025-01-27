import React, { useRef } from 'react';

const ChoiceModal = ({
                         isVisible,
                         position,
                         options,
                         selectedOptions,
                         onToggleOption,
                         onClose,
                     }) => {
    const modalRef = useRef(null);

    if (!isVisible) {
        return null;
    }

    return (
        <div
            className="choice-modal"
            ref={modalRef}
            style={{
                top: position.top,
                left: position.left,
            }}
        >
            {Object.keys(options).map(optionKey => (
                <div
                    key={optionKey}
                    className="checkbox"
                    onClick={() => onToggleOption(optionKey)}
                >
                    <input
                        type="checkbox"
                        checked={selectedOptions.includes(optionKey)}
                    />
                    <p>{options[optionKey]}</p>
                </div>
            ))}
            <button onClick={onClose}>Закрыть</button>
        </div>
    );
};

export default ChoiceModal;
