/*
 * Copyright (c) 2018, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { useOktaAuth } from '@okta/okta-react';
import React, { useState, useEffect } from 'react';
import { Button } from 'semantic-ui-react';
import Background from '../public/assets/landing.png';
import Cards from './cards';

const Home = () => {
  const { authState, oktaAuth } = useOktaAuth();
  const [userInfo, setUserInfo] = useState(null);

  const sectionStyle = {
    height: '100vh',
    marginLeft: '-15%',
    marginRight: '-15%',
    backgroundPosition: 'center',
    backgroundRepeat: 'noRepeat',
    backgroundSize: 'cover',
    backgroundImage: `url(${Background})`,
  };

  const buttonStyle = {
    marginTop: '31%',
    height: '80px',
    zIndex: '4',
    width: '300px',
    marginLeft: '27%',
    backgroundColor: 'rgba(52, 52, 52, 0.0)',
  };

  useEffect(() => {
    if (!authState.isAuthenticated) {
      // When user isn't authenticated, forget any user info
      setUserInfo(null);
    } else {
      oktaAuth.getUser().then((info) => {
        setUserInfo(info);
      });
    }
  }, [authState, oktaAuth]); // Update if authState changes

  const login = async () => {
    oktaAuth.signInWithRedirect();
  };

  if (authState.isPending) {
    return (
      <div>Loading...</div>
    );
  }

  return (
    <div>
      <div>
        { authState.isAuthenticated && !userInfo
        && <div>Loading user information...</div>}

        {authState.isAuthenticated && userInfo
        && (
        <div>
          <section>
            <div>
              Welcome back,&nbsp;
              {userInfo.name}
              !
            </div>
            <Cards />
          </section>
        </div>
        )}

        {!authState.isAuthenticated
        && (
          <div>
            <section style={sectionStyle}>
              <Button style={buttonStyle} onClick={login} />
            </section>
          </div>
        )}

      </div>
    </div>
  );
};
export default Home;
