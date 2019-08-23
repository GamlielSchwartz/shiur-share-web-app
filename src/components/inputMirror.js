import React from 'react';

import { connect } from 'react-redux';

function InputMirror(props) {
    return (
        <div>
            <input value={props.inputValue} onChange={props.onInput}/>
            <p>{props.inputValue}</p>
        </div>
    );
}

function mapStateToProps(state){
    return {
        inputValue: state.inputValue,
    }
}

function mapDispatchToProps(dispatch){
    return {
        onInput: event => {
            const action = { type: 'INPUT_A_VALUE', inputValue: event.target.value}
            dispatch(action);
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(InputMirror);
