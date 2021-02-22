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

/* eslint-disable no-use-before-define */
import { useOktaAuth } from '@okta/okta-react';
import React, { useState, useEffect } from 'react';
import { Button, Header, Icon, Message, Table } from 'semantic-ui-react';

const Messages = () => {
  const { authState, oktaAuth } = useOktaAuth();
  const [users, setUsers] = useState(null); // setMessages
  const [userFetchFailed, setUserFetchFailed] = useState(false);
  // fetch messages
  useEffect(() => {
    if (authState.isAuthenticated) {
      const accessToken = oktaAuth.getAccessToken();
      oktaAuth.getUser().then((usr) => {
        const URL = `http://localhost:8000/api/messages?id=${usr.sub}`;
        fetch(URL, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
          .then((response) => {
            if (!response.ok) {
              return Promise.reject();
            }
            return response.json();
          })
          .then((data) => {
            const role = JSON.parse(data);
            if (role[0].type !== 'SUPER_ADMIN') throw 'User is not super admin' ; // eslint-disable-line
            /* eslint-disable no-console */
          })
          .then(() => {
            fetch('http://localhost:8000/api/list', {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            })
              .then((response) => {
                if (!response.ok) {
                  return Promise.reject();
                }
                return response.json();
              })
              .then((list) => {
                const newList = JSON.parse(list);
                let index = 0;
                const usersList = [];
                newList.forEach((user) => {
                  index += 1;
                  fetch(`http://localhost:8000/api/role?id=${user.id}`, {
                    headers: {
                      Authorization: `Bearer ${accessToken}`,
                    },
                  })
                    .then((respons) => {
                      if (!respons.ok) {
                        return Promise.reject();
                      }
                      return respons.json();
                    })
                    .then((admin) => {
                      const newAdmin = JSON.parse(admin);
                      let isAdmin = false;
                      if (newAdmin[0]) {
                        isAdmin = newAdmin[0].type === 'SUPER_ADMIN';
                      }
                      usersList.push({
                        isAdmin,
                        userid: user.id,
                        name: user.profile.firstName,
                        lastname: user.profile.lastName,
                        id: `msag-${Math.random() * index}`,
                      });
                    });
                });
                setUsers(usersList);
                setUserFetchFailed(false);
              });
          })
          .catch((err) => {
            setUserFetchFailed(true);
            /* eslint-disable no-console */
            console.error(err);
          });
      });
    }
  }, [authState]);

  const possibleErrors = [
    'You have successfully authenticated',
    'You are an Admin',
    'You are not assigned to the application',
  ];

  function assignRole(id) {
    if (authState.isAuthenticated) {
      const accessToken = oktaAuth.getAccessToken();
      const URL = `http://localhost:8000/api/assignrole?id=${id}`;
      fetch(URL, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((respons) => {
          if (!respons.ok) {
            return Promise.reject();
          }
          return respons.json();
        })
        .then((data) => {
          console.log(data);
        });
    }
  }

  return (
    <div>
      <Header as="h1">
        <Icon name="mail outline" />
        My Users
      </Header>
      {userFetchFailed && <Message error header="Failed to fetch this page.  Please verify the following:" list={possibleErrors} />}
      {!users && !userFetchFailed && <p>Fetching Users..</p>}
      {users
      && (
      <div>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>LastName</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr id={user.id} key={user.id}>
                <td>{user.name}</td>
                <td>{user.lastname}</td>
                <td>
                  { user.isAdmin ? <Button color="grey"> User is Admin </Button> : <Button color="blue" onClick={() => assignRole(user.userid)}>Assign Admin </Button> }

                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      )}
    </div>
  );
};

export default Messages;
