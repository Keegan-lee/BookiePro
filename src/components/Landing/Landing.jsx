import React, { PureComponent } from 'react';
import PrivacyModal from '../Modal/PrivacyModal';
import HelpAndSupportModal from '../Modal/HelpAndSupportModal';
import { I18n } from 'react-redux-i18n';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { NavigateActions, AppActions } from '../../actions';
import logo from '../../assets/images/bookie_logo_signup.png';
import { AppBackgroundTypes } from '../../constants';
import LandingSteps from './LandingSteps';

class Landing extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      privacyModalVisible: false,
      helpAndSupportModalVisible: false
    }
    this.onLoginClick = this.onLoginClick.bind(this);
    this.onSignupClick = this.onSignupClick.bind(this);
    this.onPrivacyModalCancelClick = this.onPrivacyModalCancelClick.bind(this);
    this.onPrivacyPolicyClick = this.onPrivacyPolicyClick.bind(this);
    this.renderSteps = this.renderSteps.bind(this);
    this.onHelpAndSupportClick = this.onHelpAndSupportClick.bind(this);
    this.onHelpAndSupportCancelClick = this.onHelpAndSupportCancelClick.bind(this);
  }

  componentDidMount() {
    // Set app background to sports bg
    this.props.setAppBackground(AppBackgroundTypes.FIELD_BG);
  }

  componentWillUnmount() {
    // Reset app background to gradient
    this.props.setAppBackground(AppBackgroundTypes.GRADIENT_BG);
  }

  onLoginClick(event) {
    event.preventDefault();
    this.props.navigateTo('/login');
  }

  onSignupClick(event) {
    event.preventDefault();
    this.props.navigateTo('/signup');
  }

  onPrivacyPolicyClick(event) {
    event.preventDefault();
    this.setState( {
      privacyModalVisible: true
    })
  }

  onPrivacyModalCancelClick() {
    this.setState( {
      privacyModalVisible: false
    })
  }

  onHelpAndSupportClick(event) {
    event.preventDefault();
    this.setState( {
      helpAndSupportModalVisible: true
    });
  }

  onHelpAndSupportCancelClick() {
    this.setState( {
      helpAndSupportModalVisible: false
    });
  }

  renderSteps() {
    return (
      <div className='steps'>

      </div>
    )
  }

  render() {
    return(
      <div className='landing'>
        <div className='content'>
            <img className='logo' src={ logo } alt=''/>
            <div className='slogan'>
              { I18n.t('landing.slogan') }
            </div>
            <div className='intro'>
              { I18n.t('landing.intro') }
            </div>
            <button className='signup-button' onClick={ this.onSignupClick }>
                { I18n.t('landing.signup') }
            </button>
            <button className='login-button btn btn-regular' onClick={ this.onLoginClick }>
                { I18n.t('landing.login') }
            </button>
            <LandingSteps className='steps' />
        </div>
        <div className='footer'>
          <div className='links'>
            <a className='copyright'>{ I18n.t('landing.copyright') }</a>
            <span className='separator'> | </span>
            <a className='privacy-policy' onClick={ this.onPrivacyPolicyClick }>{ I18n.t('landing.privacy_policy') }</a>
            <span className='separator'> | </span>
            <a className='help-and-support' onClick={ this.onHelpAndSupportClick }>{ I18n.t('landing.help_and_support') }</a>
          </div>
        </div>
        <PrivacyModal
          visible={ this.state.privacyModalVisible }
          onCancelClick={ this.onPrivacyModalCancelClick }
        />
        <HelpAndSupportModal
          visible={ this.state.helpAndSupportModalVisible }
          onCancelClick={ this.onHelpAndSupportCancelClick }
        />
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    navigateTo: NavigateActions.navigateTo,
    setAppBackground: AppActions.setAppBackgroundAction,
  }, dispatch);
}
export default connect(null, mapDispatchToProps)(Landing);
