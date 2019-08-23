import { createStore } from 'redux';

const initialState = {
    count: 8,
    inputValue: '',
};

const reducer = (state = initialState, action) => {
    switch(action.type){
        case 'INCREMENT':
            return Object.assign({}, state, { count: state.count + 1 });
        case 'DECREMENT':
            return Object.assign({}, state, { count: state.count - 1 });
        case 'INPUT_A_VALUE':
                return Object.assign({}, state, { inputValue: action.inputValue});
        default: 
            return state;
    }
}

const store = createStore(reducer);

export default store;