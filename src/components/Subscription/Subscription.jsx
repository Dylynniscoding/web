import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import RaisedButton from 'material-ui/RaisedButton';
import constants from '../constants';
import { IconSteam } from '../Icons';

import { useStrings } from '../../hooks/useStrings.hook';

const stripePromise = process.env.REACT_APP_STRIPE_PUBLIC_KEY
  ? loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY)
  : null;

const PageContainer = styled.div`
  width: 80%;
  margin: 0 auto;

  @media only screen and (max-width: 768px) {
    width: 100%;
  }

  & li {
    list-style-type: initial;
  }

  h1,
  h2 {
    text-align: center;
  }

  & h2 {
    font-size: 1.17em;
  }
`;

const SubContainer = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
`;

const SubLeft = styled.div`
  margin: 8px;
`;

const SubRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const handleSubscribe = async (user) => {
  if (!stripePromise) {
    console.warn('Stripe integration is not configured, cannot subscribe');
    return;
  }
  const stripe = await stripePromise;
  const result = await stripe?.redirectToCheckout({
    lineItems: [
      {
        price:
          process.env.NODE_ENV === 'development'
            ? 'price_1LE6FHCHN72mG1oK4E4NdERI'
            : 'price_1LE5NqCHN72mG1oKg2Y9pqXb',
        quantity: 1,
      },
    ],
    mode: 'subscription',
    successUrl: `${process.env.REACT_APP_API_HOST}/api/subscribeSuccess`,
    cancelUrl: window.location.href,
    clientReferenceId: user.account_id,
  });
  // If `redirectToCheckout` fails due to a browser or network
  // error, display the localized error message to your customer
  // using `error.message`.
  if (result && result.error) {
    console.error(result.error.message);
  }
};

const Subsciption = ({ user, isSubscribed }) => {
  user = true;
  const strings = useStrings();
  const handleManage = useCallback(async () => {
    const res = await fetch(`${process.env.REACT_APP_API_HOST}/api/manageSub`, {
      credentials: 'include',
      method: 'POST',
    });

    const session = await res.json();

    window.location.assign(session.url);
  }, [isSubscribed]);

  return (
    <PageContainer>
      <h1>{strings.subscriptions_h1}</h1>
      <h2>{strings.subscriptions_h2}</h2>
      <p>{strings.subscriptions_body1}</p>
      <p>
        {strings.subscriptions_body2}{' '}
        <Link to="/request">{strings.subscriptions_request}</Link>.
      </p>
      <SubContainer>
        <SubLeft>
          <h3>{strings.subscriptions_h3}</h3>
          <ul>
            <li>{strings.subscriptions_li1}</li>
            <li>{strings.subscriptions_li2}</li>
            <li>{strings.subscriptions_li3}</li>
            <li>{strings.subscriptions_li4}</li>
            <li>{strings.subscriptions_li5}</li>
          </ul>
        </SubLeft>
        <SubRight>
          {user && isSubscribed ? (
            <>
              <h4>{strings.subscriptions_h4}</h4>
              <RaisedButton
                primary
                onClick={handleManage}
                label={strings.subscriptions_button_manage}
              />
            </>
          ) : user ? (
            <RaisedButton
              primary
              onClick={() => handleSubscribe(user)}
              label={strings.subscriptions_button_subscribe}
            />
          ) : (
            <RaisedButton
              primary
              href={`${process.env.REACT_APP_API_HOST}/login`}
              label={strings.subscriptions_button_login}
              icon={<IconSteam />}
            />
          )}
        </SubRight>
      </SubContainer>
    </PageContainer>
  );
};

const mapStateToProps = (state) => ({
  loading: state.app.match.loading,
  error: state.app.match.error,
  user: state.app.metadata.data.user,
  isSubscribed: state.app.metadata.data.isSubscribed,
  strings: state.app.strings,
});

export default connect(mapStateToProps)(Subsciption);
