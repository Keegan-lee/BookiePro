import React, { Component } from 'react'
import TermsModal from '../Modal/TermsModal'
import { I18n, Translate } from 'react-redux-i18n';
class Landing extends Component{
  render(){
    return(
      <div className='splashComponent'>
        <div className='wrapper'>
          <div className='header padding-15 clearfix'>
            <a href='#login' className='btn btn-trans float-right'> {I18n.t('landing.login')} </a>
          </div>
          <div className='intro-banner pos-rel'>
            <div className='content pos-abs'>
              <p> {I18n.t('landing.slogan')} </p>
              <a href='#signup' className='btn btn-regular'> {I18n.t('landing.signup')} </a>
            </div>
          </div>
        </div>
        <div className='footer clearfix'>
          <a href>{I18n.t('landing.copyright')}</a>
          <span className='padding-lr-5'> | </span>
          <TermsModal title={ I18n.t('landing.terms') } parentClass='terms' buttonTitle={ I18n.t('landing.terms') } >
              <Translate value='terms_dialogue.content' dangerousHTML/>
          </TermsModal>
        </div>
      </div>
    )
  }
}

export default Landing;