import  MyAccountWithdrawContainer  from './MyAccountWithdraw';
import React from 'react';

import { shallow , mount  }  from 'enzyme';
import sinon from 'sinon'

import { reducer as formReducer } from 'redux-form'
import { createStore, combineReducers } from 'redux'
import { Provider } from 'react-redux'

describe('<MyAccountWithdrawContainer />', () => {     
 let store;
        let onSave;
	    let withdrawWrapper;
    const props = {onSave,
      resetWithdrawLoadingStatus:()=>{}
    }
beforeEach(() => {
		store = createStore(combineReducers({ form: formReducer }))
		onSave = sinon.stub().returns(Promise.resolve())
		// With redux-form v5, we could do <ContactFormContainer store={store}/>.
		// However, with redux-form v6, the Field component we use is itself
		// connected to the redux store. Therefore, we must put the store into
		// context. To do that, we use <Provider/>.
		withdrawWrapper = mount(<Provider store={store}><MyAccountWithdrawContainer {...props}/></Provider>);
	});

  it('renders correctly', () => {
    const tree = shallow(<MyAccountWithdrawContainer />);
    expect(tree).toMatchSnapshot();
  });

  it('check if withdraw amount is not entered on blur',() => {
    const input = withdrawWrapper.find('input').first();         
    input.simulate('blur');    
    
    const firstNameHelpBlock = withdrawWrapper.find('.errorText');

    expect(firstNameHelpBlock.text()).toEqual('Enter Withdraw Amount');
  });

  // it('check if withdraw amount is entered on blur',() => {
  //   withdrawWrapper.find('input').first().value = '123';
  //   withdrawWrapper.find('input').first().simulate('change');

  //   withdrawWrapper.find('input').first().simulate('blur');
  //   console.log(withdrawWrapper.find('.errorText').at(0).text());

  //   expect(withdrawWrapper.find('.errorText').length).toBe(0);
  // });
});